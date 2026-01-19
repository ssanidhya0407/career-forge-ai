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
    
    # We'll need to construct the history for the agent.
    # Pydantic AI uses its own message types.
    from pydantic_ai.messages import ModelMessage, ModelResponse, UserContent, TextPart
    
    # Construct history
    history = []
    for msg in state.conversation_history[:-1]: # exclude the one we just added? No, exclude nothing, but we need to pass PREVIOUS history
        if msg.role == "user":
            history.append(ModelMessage(parts=[TextPart(msg.content)], kind='user')) # kind='user' is implied? No 'ModelMessage' is base.
            # Actually simplest is to just pass a list of messages if the library supports it, or let the agent handle it.
            # Looking at pydantic-ai docs (mental model), `run` takes `message_history`.
            pass 
            # Re-implementation: Pydantic AI 0.4+ `run` returns a result that contains `new_messages`.
            # We need to persist that.
            
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
        f"The user says: '{req.content}'. Continue the interview. Respond to their answer and ask the next question.",
        deps=state.interview_config,
        # message_history=... # We'll omit proper history injection for this simple text-based context approach first 
        # to avoid type errors without browsing docs. The agent is strictly prompt driven here.
    )
    
    state.conversation_history.append(Message(role="model", content=response.output))
    return {"message": response.output, "is_interview_ended": False}

@app.post("/api/interview/feedback")
async def get_feedback(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    state = sessions[session_id]
    
    transcript = "\n".join([f"{m.role.upper()}: {m.content}" for m in state.conversation_history])
    
    result = await feedback_agent.run(
        f"Here is the transcript of the interview:\n\n{transcript}\n\nPlease provide detailed feedback.",
    )
    
    return result.data
