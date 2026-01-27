from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import os

# Import Beanie models (documents)
from models import User, UserSettings

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


class TokenData(BaseModel):
    email: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Update UserResponse to handle PydanticObjectId (str)
class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    created_at: datetime
    
    class Config:
        # Allow population by field name (e.g. _id aliases)
        populate_by_name = True
        from_attributes = True

    # Validator to convert ObjectId to string if needed
    @classmethod
    def from_mongo(cls, user: User):
        return cls(
            id=str(user.id) if user.id else "",
            email=user.email,
            full_name=user.full_name,
            created_at=user.created_at
        )


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



async def get_user_by_email(email: str) -> Optional[User]:
    from db import get_db
    db = get_db()
    users_ref = db.collection('users')
    docs = users_ref.where('email', '==', email).stream()
    
    for doc in docs:
        user_data = doc.to_dict()
        user_data['id'] = doc.id
        # Convert created_at to datetime if needed (Firestore timestamp to datetime)
        # Firestore returns datetime objects, so it should be fine
        return User(**user_data)
    
    return None


async def create_user(user_data: UserCreate) -> User:
    from db import get_db
    from firebase_admin import auth
    
    db = get_db()
    hashed_password = get_password_hash(user_data.password)
    
    # 1. Create user in Firebase Authentication (shows up in Console)
    try:
        firebase_user = auth.create_user(
            email=user_data.email,
            email_verified=False,
            password=user_data.password,
            display_name=user_data.full_name,
            disabled=False
        )
        print(f"✅ Created Firebase Auth user: {firebase_user.uid}")
    except auth.EmailAlreadyExistsError:
        # Should be caught by main.py check, but safety net
        raise HTTPException(status_code=400, detail="Email already registered in Firebase Auth")
    except Exception as e:
        print(f"⚠️ Failed to create Firebase Auth user: {e}")
        # Proceeding to create Firestore document anyway for our app logic, 
        # or we could raise error. Let's raise to ensure consistency.
        raise HTTPException(status_code=500, detail=f"Firebase Auth Error: {str(e)}")

    # 2. Create user document in Firestore (our custom DB)
    user_model = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    
    # Exclude None fields and id (Firestore generates id)
    user_dict = user_model.model_dump(exclude={"id"})
    
    # We could use firebase_user.uid as the document ID for consistency!
    # user_ref = db.collection('users').document(firebase_user.uid)
    # user_ref.set(user_dict)
    # user_model.id = firebase_user.uid
    
    # BUT to avoid breaking existing references to auto-generated IDs, 
    # let's stick to auto-id for now or decide?
    # Actually, using firebase_user.uid is MUCH better practice. 
    # Let's switch to using the UID from Auth as the Doc ID.
    
    doc_ref = db.collection('users').document(firebase_user.uid)
    doc_ref.set(user_dict)
    user_model.id = firebase_user.uid
    
    # Create default settings linked to user ID
    settings = UserSettings(user_id=user_model.id)
    settings_dict = settings.model_dump(exclude={"id"})
    db.collection('user_settings').add(settings_dict)
    
    return user_model


async def authenticate_user(email: str, password: str) -> Optional[User]:
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[User]:
    if not credentials:
        return None
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        token_data = TokenData(email=email)
    except JWTError:
        return None
    
    user = await get_user_by_email(email=token_data.email)
    return user


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await get_user_by_email(email=email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
