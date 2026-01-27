import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

db = None
bucket = None

async def init_db():
    global db, bucket
    try:
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred, {
            'storageBucket': f"{cred.project_id}.appspot.com"
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
