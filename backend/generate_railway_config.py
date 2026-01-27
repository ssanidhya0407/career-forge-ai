import json
import os
from dotenv import dotenv_values

def generate():
    env_path = "backend/.env"
    creds_path = "backend/serviceAccountKey.json"
    
    output = {
        "PORT": "8000"
    }
    
    # Read .env
    env_vars = {}
    if os.path.exists(env_path):
        env_vars = dotenv_values(env_path)
    
    # Read Creds
    if os.path.exists(creds_path):
        with open(creds_path) as f:
            try:
                data = json.load(f)
                output["FIREBASE_CREDENTIALS_JSON"] = json.dumps(data) # Double stringify for Env Var? No, just stringify dict.
                # json.dump outputs a JSON string. Railway Raw Editor expects KV pairs or JSON object?
                # Railway JSON Editor expects key: value. Value must be string.
                # Use json.dumps to make sure it's a valid JSON string 
            except Exception as e:
                print(f"Error reading {creds_path}: {e}")
    else:
        print(f"Warning: {creds_path} not found")

    # Keys to transfer
    keys = ["GEMINI_API_KEY", "DATABASE_URL", "MISTRAL_API_KEY", "OPENROUTER_API_KEY", "GOOGLE_GENAI_API_KEY"]
    for k in keys:
        val = env_vars.get(k) or os.environ.get(k)
        if val:
            output[k] = val
            
    # Normalize Google Key if GEMINI exists but GOOGLE_GENAI doesn't
    if "GEMINI_API_KEY" in output and "GOOGLE_GENAI_API_KEY" not in output:
        output["GOOGLE_GENAI_API_KEY"] = output["GEMINI_API_KEY"]
    
    # Write output
    with open("railway_vars.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print(f"Success! Generated railway_vars.json with {len(output)} keys.")

if __name__ == "__main__":
    generate()
