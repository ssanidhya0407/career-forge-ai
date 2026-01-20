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

# In-memory session store (simplify for MVP)
sessions: Dict[str, InterviewState] = {}

class StartSessionRequest(BaseModel):
    config: InterviewConfig

@app.post("/api/interview/start")
async def start_interview(req: StartSessionRequest):
    session_id = str(uuid.uuid4())
    state = InterviewState(interview_config=req.config)
    sessions[session_id] = state
    
    # Start the conversation with an initial greeting/question from the agent
    # We trigger the agent with a "start" signal
    response = await interview_agent.run(
        "Please start the interview by introducing yourself and asking the first question.",
        deps=state.interview_config
    )
    
    state.conversation_history.append(Message(role="model", content=response.output))
    
    return {"session_id": session_id, "message": response.output} # response.data is str

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
    
    # Generate Agent Response
    # We pass the history context implicitly or explicitly. 
    # Pydantic AI manages history if we use the same `result` object, but here we are stateless between requests in the agent object itself, 
    # so we need to pass history. 
    # Pydantic AI's `run` takes `message_history`.
    
    # Convert our history to Pydantic AI format if needed, or just pass the strict list.
    # Pydantic AI `run` accepts `message_history` argument.
    
    # Construct history
    # Simply appending the new user message to state history is enough, 
    # we will pass the full transcript in the prompt to ensure context.
    pass
            
    # Correction: For this MVP, let's just append the conversation as text to the prompt if we don't have perfect history reconstruction type mapping handy,
    # OR better: use the `message_history` argument correctly.
    # We will skip complex history reconstruction and just push the prompt with context for now, 
    # OR better: accumulate messages in the `Result` object if we could keep it in memory.
    # Since we use a simple dict, we can try to store the `agent_state` if possible.
    
    # Simpler approach for MVP: Feed the last few turns or full transcript as context in the prompt.
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
    
    transcript = "\n".join([f"{m.role.upper()}: {m.content}" for m in state.conversation_history])
    # Get feedback (Prompt-based JSON)
    result = await feedback_agent.run(
        f"Here is the interview transcript:\\n{transcript}"
    )
    
    # Manual JSON parsing since we disabled tool-based structural output
    import json
    try:
        # Access the raw string output from the agent
        content = result.output
        
        # Clean potential markdown fences if present
        clean_json = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)
        return data
    except Exception as e:
        print(f"JSON Parsing Error: {e}. Content: {result.output}")
        # Fallback
        # Fallback
        return {
            "score": 50,
            "summary": "Could not parse detailed feedback. However, the interview is complete.",
            "strengths": ["Completed the interview"],
            "improvements": ["System error in report generation"]
        }
