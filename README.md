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

## Deployment Guide

### 1. Git Push
Ensure all your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deploy"
git push origin master
```

### 2. Frontend Deployment (Vercel)
1. Go to [Vercel](https://vercel.com) -> **Add New** -> **Project**.
2. Import your `career-forge-ai` repository.
3. **Framework Preset**: Next.js (Auto-detected).
4. **Root Directory**: `frontend`. (Click "Edit" next to Root Directory and select `frontend`).
5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.up.railway.app` (You will get this AFTER deploying the backend).
6. Click **Deploy**.

### 3. Backend Deployment (Railway)
1. Go to [Railway](https://railway.app) -> **New Project** -> **Deploy from GitHub repo**.
2. Select your repository.
3. Go to **Settings** -> **Root Directory** -> set to `/backend`.
4. Go to **Variables** and add these:
   - `MISTRAL_API_KEY`: `fyba...` (Your key)
   - `PORT`: `8000`
5. Railway will automatically detect the `Procfile` and deploy.
6. Copy the **Public Domain** and update the frontend's variable in Vercel.

## Local Development
### Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## License
MIT
