import os
import asyncio
from dotenv import load_dotenv
from agent import interview_agent
from models import InterviewConfig

load_dotenv()

async def main():
    print(f"API Key present: {'GEMINI_API_KEY' in os.environ}")
    print("Testing agent...")
    try:
        config = InterviewConfig(role="Software Engineer", experience_level="Junior")
        result = await interview_agent.run("Hello", deps=config)
        print("Result Object:", result)
        print("Result Dir:", dir(result))
        # print("Success:", result.data)
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
