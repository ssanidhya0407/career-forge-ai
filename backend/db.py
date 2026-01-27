import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

db = None
bucket = None

async def init_db():
    global db, bucket
    try:
        if os.path.exists("serviceAccountKey.json"):
            cred = credentials.Certificate("serviceAccountKey.json")
        elif os.environ.get("FIREBASE_CREDENTIALS_JSON"):
            import json
            cred_dict = json.loads(os.environ.get("FIREBASE_CREDENTIALS_JSON"))
            cred = credentials.Certificate(cred_dict)
        else:
            print("❌ No serviceAccountKey.json or FIREBASE_CREDENTIALS_JSON found.")
            return

        project_id = cred.project_id if hasattr(cred, 'project_id') else None
        # Fallback if project_id isn't directly accessible in some SDK versions, 
        # though credentials.Certificate usually handles it. 
        # For 'service_account', project_id is in the json.
        
        firebase_admin.initialize_app(cred, {
            'storageBucket': f"{project_id}.appspot.com"
        })
        db = firestore.client()
        bucket = storage.bucket()
        print("🔥 Firebase Firestore and Storage initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {e}")

def get_db():
    return db

def get_bucket():
    return bucket
