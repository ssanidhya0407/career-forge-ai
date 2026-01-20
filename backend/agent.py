import os
from dotenv import load_dotenv
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel
from models import InterviewConfig, FeedbackStructure

load_dotenv()

# Configure for OpenRouter
# OpenRouter uses the OpenAI client format.
# We set the environment variables which pydantic-ai/openai will pick up.
os.environ["OPENAI_BASE_URL"] = "https://openrouter.ai/api/v1"
os.environ["OPENAI_API_KEY"] = os.getenv("OPENROUTER_API_KEY", "")

# Using Gemini 2.0 Flash (Free) for better tool support and speed
model = OpenAIModel('google/gemini-2.0-flash-exp:free')

system_prompt = """
You are an expert AI Interview Coach named 'CareerForge'.
Your goal is to conduct a realistic, professional job interview for the user based on their chosen role and experience level.

Protocol:
1. Act exactly like a hiring manager. Be professional, slightly challenging but fair.
2. Ask ONE question at a time.
3. Wait for the user to answer.
4. If the user asks for help/hints, provide a small nudge but stick to the interview persona.
5. If the user's answer is too brief, probe deeper.
6. Track the number of questions. After 5 questions (or if the user says "End Interview"), conclude the interview.
7. Upon conclusion, generate detailed feedback.

Do NOT break character during the interview phase.
"""

# We will use two agents: one for the interview flow, one for feedback generation.
# Actually, one agent with dynamic system prompting or context is cleaner.

interview_agent = Agent(
    model,
    system_prompt=system_prompt,
    deps_type=InterviewConfig,
    retries=2
)

@interview_agent.system_prompt
def add_context(ctx: RunContext[InterviewConfig]):
    return f"You are interviewing a candidate for a {ctx.deps.experience_level} {ctx.deps.role} position. Focus on {ctx.deps.topic or 'general competency'}."

feedback_agent = Agent(
    model,
    output_type=FeedbackStructure,
    system_prompt="You are an expert interview evaluator. Analyze the transcript provided and generate structured feedback."
)
