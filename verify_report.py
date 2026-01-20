import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print(f"Testing against {BASE_URL}...")
    
    # 1. Start Session
    print("\n[1] Starting Interview...")
    start_payload = {
        "config": {
            "role": "Junior Python Developer",
            "experience_level": "Junior",
            "topic": "Basic Syntax"
        }
    }
    try:
        res = requests.post(f"{BASE_URL}/api/interview/start", json=start_payload)
        res.raise_for_status()
        data = res.json()
        session_id = data["session_id"]
        print(f"✅ Session Started. ID: {session_id}")
    except Exception as e:
        print(f"❌ Start Failed: {e}")
        return

    # 2. Chat (Simulate User Answer)
    print("\n[2] Sending Chat Response...")
    chat_payload = {
        "session_id": session_id,
        "content": "I like Python because it has clean syntax and a large ecosystem of libraries like pandas and numpy."
    }
    try:
        res = requests.post(f"{BASE_URL}/api/interview/chat", json=chat_payload)
        res.raise_for_status()
        print(f"✅ Chat Response Received: {res.json()['message'][:50]}...")
    except Exception as e:
        print(f"❌ Chat Failed: {e}")
        return

    # 3. Get Feedback (Report)
    print("\n[3] Requesting Feedback (Report)...")
    feedback_payload = {"session_id": session_id}
    try:
        res = requests.post(f"{BASE_URL}/api/interview/feedback", json=feedback_payload)
        res.raise_for_status()
        report = res.json()
        
        print("\n✅ Report Generated Successfully!")
        print("------------------------------------------------")
        print(f"Score: {report.get('score')}/100")
        print(f"Summary: {report.get('summary')}")
        print("------------------------------------------------")
        
    except Exception as e:
        print(f"❌ Feedback Failed: {e}")
        print(f"Response Text: {res.text if 'res' in locals() else 'N/A'}")

if __name__ == "__main__":
    run_test()
