import os
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.mistral import MistralModel
from models import InterviewConfig

load_dotenv()

# Native Mistral AI Model
model = MistralModel('open-mistral-7b')

system_prompt = """
You are an expert AI Interview Coach named 'CareerForge'.
Your goal is to conduct a realistic, professional job interview for the user based on their chosen role and experience level.

Protocol:
1. You are the INTERVIEWER. The user is the CANDIDATE.
2. Ask EXACTLY ONE question at a time.
3. STOP immediately after asking the question.
4. NEVER simulate, hallucinate, or autocomplete the candidate's answer.
5. Wait for the real user to respond.
6. If the user asks for help, provide a hint but simply re-ask the question or move on.
7. Track the number of questions. After 5 questions (or if the user says "End Interview"), conclude.
8. Upon conclusion, generate detailed feedback.

Do NOT break character.
Do NOT output "System Note" or instructions to yourself.
Do NOT autocomplete the user's response.
Do NOT talk about what you are going to do next. Just do it.
"""

interview_agent = Agent(
    model,
    system_prompt=system_prompt,
    deps_type=InterviewConfig,
    retries=2
)

@interview_agent.system_prompt
def add_context(ctx: RunContext[InterviewConfig]):
    return f"You are interviewing a candidate for a {ctx.deps.experience_level} {ctx.deps.role} position. Focus on {ctx.deps.topic or 'general competency'}."

# Feedback Generation Agent
feedback_agent = Agent(
    model,
    system_prompt="""You are an expert interview evaluator. 
    Analyze the transcript provided and generate a detailed report in STRICT JSON format.
    The JSON must exactly match this structure:
    {
        "score": (integer 0-100),
        "summary": (string, detailed executive summary),
        "strengths": (list of strings),
        "improvements": (list of strings)
    }
    Do not output markdown code blocks. Just the raw JSON string."""
)
