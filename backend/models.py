from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class InterviewConfig(BaseModel):
    role: str = Field(..., description="The job role being interviewed for, e.g. 'Senior Python Developer'")
    experience_level: Literal["Junior", "Mid-Level", "Senior", "Lead"] = "Mid-Level"
    topic: Optional[str] = Field(None, description="Specific topic to focus on, e.g. 'System Design' or 'Behavioral'")

class Message(BaseModel):
    role: Literal["user", "model", "system"]
    content: str

class InterviewState(BaseModel):
    conversation_history: List[Message] = []
    interview_config: InterviewConfig
    question_count: int = 0
    max_questions: int = 5
    is_completed: bool = False

class UserResponse(BaseModel):
    session_id: str
    content: str

class AgentResponse(BaseModel):
    content: str
    is_interview_ended: bool = False
    
class FeedbackStructure(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Overall performance score 0-100")
    summary: str = Field(..., description="Detailed executive summary of the interview performance")
    strengths: List[str] = Field(..., description="List of candidates strengths")
    improvements: List[str] = Field(..., description="List of areas for improvement")
