import fitz
import re
from typing import Optional
from pydantic import BaseModel


class ResumeData(BaseModel):
    raw_text: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: list[str] = []
    experience: list[dict] = []
    education: list[dict] = []
    projects: list[dict] = []
    summary: Optional[str] = None


def extract_email(text: str) -> Optional[str]:
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(email_pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    phone_patterns = [
        r'\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}',
        r'\+91[-.\s]?[0-9]{10}',
        r'[0-9]{10}'
    ]
    for pattern in phone_patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0)
    return None


def extract_skills(text: str) -> list[str]:
    skill_keywords = [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php',
        'react', 'vue', 'angular', 'next.js', 'node.js', 'express', 'django', 'flask', 'fastapi',
        'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
        'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
        'git', 'github', 'gitlab', 'agile', 'scrum', 'jira',
        'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
        'data analysis', 'pandas', 'numpy', 'scikit-learn', 'tableau', 'power bi',
        'html', 'css', 'sass', 'tailwind', 'bootstrap', 'figma', 'adobe xd',
        'rest api', 'graphql', 'microservices', 'system design', 'oop', 'design patterns',
        'leadership', 'communication', 'problem solving', 'teamwork', 'project management'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in skill_keywords:
        if skill in text_lower:
            found_skills.append(skill.title() if len(skill) > 3 else skill.upper())
    
    return list(set(found_skills))


def extract_sections(text: str) -> dict:
    sections = {
        'experience': [],
        'education': [],
        'projects': []
    }
    
    experience_patterns = [
        r'(?:experience|work\s*history|employment)[\s\S]*?(?=education|projects|skills|$)',
    ]
    
    education_patterns = [
        r'(?:education|academic|qualifications)[\s\S]*?(?=experience|projects|skills|$)',
    ]
    
    project_patterns = [
        r'(?:projects|portfolio)[\s\S]*?(?=experience|education|skills|$)',
    ]
    
    return sections


def parse_resume(pdf_content: bytes) -> ResumeData:
    doc = fitz.open(stream=pdf_content, filetype="pdf")
    
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    
    doc.close()
    
    lines = full_text.strip().split('\n')
    name = lines[0].strip() if lines else None
    
    if name and (len(name) > 50 or '@' in name or any(char.isdigit() for char in name)):
        name = None
    
    resume_data = ResumeData(
        raw_text=full_text,
        name=name,
        email=extract_email(full_text),
        phone=extract_phone(full_text),
        skills=extract_skills(full_text),
        summary=full_text[:500] if len(full_text) > 500 else full_text
    )
    
    return resume_data


def generate_resume_context(resume_data: ResumeData) -> str:
    context_parts = []
    
    if resume_data.name:
        context_parts.append(f"Candidate Name: {resume_data.name}")
    
    if resume_data.skills:
        context_parts.append(f"Skills: {', '.join(resume_data.skills[:15])}")
    
    if resume_data.summary:
        context_parts.append(f"Background Summary: {resume_data.summary[:300]}")
    
    return "\n".join(context_parts)
