# CareerForge.ai

**CareerForge.ai** is an intelligent AI Interview Coach that helps users practice for job interviews with a realistic AI agent.

## Features
- **Role-Specific Interviews**: Configure the agent for any job role (e.g., Software Engineer, Product Manager).
- **Interactive Chat**: Real-time conversation with an AI hiring manager.
- **Performance Analysis**: Detailed feedback on strengths, weaknesses, and an overall score.

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Shadcn UI, Framer Motion.
- **Backend**: FastAPI, Pydantic AI, Python 3.11.
- **AI Model**: Google Gemini 2.0 Flash (via Pydantic AI).

## setup

### Backend
1. Navigate to `backend/`.
2. Create a virtual environment: `python -m venv venv`
3. Activate: `source venv/bin/activate`
4. Install: `pip install -r requirements.txt` (Run `pip freeze > requirements.txt` to generate).
5. Set `GEMINI_API_KEY` in `.env`.
6. Run: `uvicorn main:app --reload`

### Frontend
1. Navigate to `frontend/`.
2. Install: `npm install`
3. Run: `npm run dev`

## License
MIT
