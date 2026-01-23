from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
from typing import Dict
from models import InterviewConfig, InterviewState, UserResponse, AgentResponse, Message
from agent import interview_agent, feedback_agent

app = FastAPI(title="CareerForge AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
sessions: Dict[str, InterviewState] = {}

class StartSessionRequest(BaseModel):
    config: InterviewConfig

@app.post("/api/interview/start")
async def start_interview(req: StartSessionRequest):
    session_id = str(uuid.uuid4())
    state = InterviewState(interview_config=req.config)
    sessions[session_id] = state
    
    # Start the conversation
    # We trigger the agent with a "start" signal
    response = await interview_agent.run(
        "Please start the interview by introducing yourself and asking the first question.",
        deps=state.interview_config
    )
    
    state.conversation_history.append(Message(role="model", content=response.output))
    
    return {"session_id": session_id, "message": response.output}

@app.post("/api/interview/chat")
async def chat(req: UserResponse):
    if req.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
        
    state = sessions[req.session_id]
    if state.is_completed:
        return {"message": "Interview completed", "is_interview_ended": True}
        
    # Append user message
    state.conversation_history.append(Message(role="user", content=req.content))
    state.question_count += 1
    
    # Feed conversation context to the prompt
    transcript = "\n".join([f"{m.role}: {m.content}" for m in state.conversation_history])
    
    if state.question_count >= state.max_questions:
        # Time to wrap up
        response = await interview_agent.run(
            f"User response: {req.content}. \n\n(System Note: This is question {state.question_count}/{state.max_questions}. If this was the last answer, thank the candidate and say 'Interview Concluded'.)",
            deps=state.interview_config
        )
        state.is_completed = True
        state.conversation_history.append(Message(role="model", content=response.output))
        return {"message": response.output, "is_interview_ended": True}

    response = await interview_agent.run(
        f"The user says: '{req.content}'",
        deps=state.interview_config,
    )
    
    state.conversation_history.append(Message(role="model", content=response.output))
    return {"message": response.output, "is_interview_ended": False}

class FeedbackRequest(BaseModel):
    session_id: str

@app.post("/api/interview/feedback")
async def get_feedback(req: FeedbackRequest):
    session_id = req.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    state = sessions[session_id]
    
    # Prepare transcript
    transcript = "\n".join([f"{m.role.upper()}: {m.content}" for m in state.conversation_history])
    
    # Check if user actually participated (naive check)
    user_word_count = sum(len(m.content.split()) for m in state.conversation_history if m.role == "user")
    
    if user_word_count < 10:
        return {
            "score": 10,
            "summary": "The interview was too short or lacked candidate participation to provide a meaningful score.",
            "strengths": ["Attendance"],
            "improvements": ["Please answer the questions provided.", "Provide more detailed responses."]
        }

    # Get feedback (Prompt-based JSON)
    result = await feedback_agent.run(
        f"Here is the interview transcript:\\n{transcript}"
    )
    
    # Manual JSON parsing
    import json
    try:
        content = result.output
        
        # Clean potential markdown fences
        clean_json = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)
        return data
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        return {
            "score": 50,
            "summary": "Could not parse detailed feedback. However, the interview is complete.",
            "strengths": ["Completed the interview"],
            "improvements": ["System error in report generation"]
        }
