import re
from typing import Optional
from pydantic import BaseModel


class ParsedJobDescription(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    requirements: list[str] = []
    responsibilities: list[str] = []
    skills: list[str] = []
    experience_level: Optional[str] = None
    summary: str = ""


def extract_skills_from_jd(text: str) -> list[str]:
    skill_keywords = [
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
        'react', 'vue', 'angular', 'next.js', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring',
        'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra',
        'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd', 'github actions',
        'git', 'agile', 'scrum', 'jira', 'confluence',
        'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch', 'scikit-learn',
        'data analysis', 'pandas', 'numpy', 'tableau', 'power bi', 'spark', 'hadoop',
        'rest api', 'graphql', 'microservices', 'system design', 'distributed systems',
        'leadership', 'communication', 'problem solving', 'teamwork', 'project management'
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in skill_keywords:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill.title() if len(skill) > 3 else skill.upper())
    
    return list(set(found_skills))


def extract_experience_level(text: str) -> Optional[str]:
    text_lower = text.lower()
    
    if any(phrase in text_lower for phrase in ['10+ years', '10 years', 'senior', 'lead', 'principal', 'staff']):
        return "Senior"
    elif any(phrase in text_lower for phrase in ['5+ years', '5 years', '6 years', '7 years', 'mid-level', 'mid level']):
        return "Mid-Level"
    elif any(phrase in text_lower for phrase in ['2+ years', '3+ years', '2 years', '3 years', 'junior']):
        return "Junior"
    elif any(phrase in text_lower for phrase in ['entry level', 'entry-level', '0-2 years', 'intern', 'graduate', 'fresher']):
        return "Intern"
    
    return "Mid-Level"


def extract_list_items(text: str, section_headers: list[str]) -> list[str]:
    items = []
    
    for header in section_headers:
        pattern = rf'{header}[:\s]*\n?((?:[-•*]\s*.+\n?)+)'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            section_text = match.group(1)
            bullet_items = re.findall(r'[-•*]\s*(.+)', section_text)
            items.extend([item.strip() for item in bullet_items if len(item.strip()) > 10])
    
    return items[:10]


def parse_job_description(jd_text: str) -> ParsedJobDescription:
    if not jd_text or len(jd_text.strip()) < 50:
        return ParsedJobDescription(summary="Job description too short to parse.")
    
    lines = jd_text.strip().split('\n')
    title = None
    for line in lines[:5]:
        clean_line = line.strip()
        if 10 < len(clean_line) < 100 and not clean_line.startswith(('•', '-', '*')):
            title = clean_line
            break
    
    requirements = extract_list_items(jd_text, ['requirements', 'qualifications', 'what you need', 'must have'])
    responsibilities = extract_list_items(jd_text, ['responsibilities', 'what you\'ll do', 'duties', 'role'])
    skills = extract_skills_from_jd(jd_text)
    experience_level = extract_experience_level(jd_text)
    
    summary = jd_text[:500] if len(jd_text) > 500 else jd_text
    
    return ParsedJobDescription(
        title=title,
        requirements=requirements,
        responsibilities=responsibilities,
        skills=skills,
        experience_level=experience_level,
        summary=summary
    )


def generate_jd_context(parsed_jd: ParsedJobDescription) -> str:
    context_parts = []
    
    if parsed_jd.title:
        context_parts.append(f"Position: {parsed_jd.title}")
    
    if parsed_jd.skills:
        context_parts.append(f"Required Skills: {', '.join(parsed_jd.skills[:10])}")
    
    if parsed_jd.requirements:
        context_parts.append(f"Key Requirements: {'; '.join(parsed_jd.requirements[:5])}")
    
    if parsed_jd.responsibilities:
        context_parts.append(f"Responsibilities: {'; '.join(parsed_jd.responsibilities[:5])}")
    
    return "\n".join(context_parts)
