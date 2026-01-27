import re
from typing import Optional
from pydantic import BaseModel


class VoiceMetrics(BaseModel):
    words_per_minute: float = 0.0
    filler_word_count: int = 0
    filler_words_list: list[str] = []
    total_words: int = 0
    estimated_duration_seconds: float = 0.0
    confidence_score: float = 0.0
    clarity_score: float = 0.0
    pace_rating: str = "Normal"
    feedback: list[str] = []


FILLER_WORDS = [
    "um", "uh", "uhh", "umm", "er", "err", "ah", "ahh",
    "like", "you know", "basically", "actually", "literally",
    "so", "well", "i mean", "kind of", "sort of", "right",
    "okay so", "yeah so", "i guess", "i think like"
]


def analyze_speech(transcript: str, duration_seconds: Optional[float] = None) -> VoiceMetrics:
    if not transcript:
        return VoiceMetrics()
    
    words = transcript.lower().split()
    total_words = len(words)
    
    if duration_seconds is None:
        avg_wpm = 150
        duration_seconds = (total_words / avg_wpm) * 60
    
    words_per_minute = (total_words / duration_seconds) * 60 if duration_seconds > 0 else 0
    
    filler_count = 0
    found_fillers = []
    text_lower = transcript.lower()
    
    for filler in FILLER_WORDS:
        count = len(re.findall(r'\b' + re.escape(filler) + r'\b', text_lower))
        if count > 0:
            filler_count += count
            found_fillers.extend([filler] * count)
    
    filler_ratio = filler_count / total_words if total_words > 0 else 0
    
    if filler_ratio < 0.02:
        clarity_score = 95
    elif filler_ratio < 0.05:
        clarity_score = 80
    elif filler_ratio < 0.10:
        clarity_score = 60
    else:
        clarity_score = 40
    
    if words_per_minute < 100:
        pace_rating = "Too Slow"
        pace_feedback = "Try to speak a bit faster to maintain engagement."
    elif words_per_minute < 130:
        pace_rating = "Slightly Slow"
        pace_feedback = "Your pace is good but could be slightly faster."
    elif words_per_minute < 170:
        pace_rating = "Normal"
        pace_feedback = "Great speaking pace!"
    elif words_per_minute < 200:
        pace_rating = "Slightly Fast"
        pace_feedback = "Consider slowing down slightly for clarity."
    else:
        pace_rating = "Too Fast"
        pace_feedback = "Slow down to ensure your points are understood."
    
    confidence_indicators = [
        "i believe", "i am confident", "definitely", "certainly", 
        "absolutely", "i know", "i have experience", "i successfully"
    ]
    uncertainty_indicators = [
        "i think maybe", "i'm not sure", "i don't know", "perhaps",
        "possibly", "might be", "could be", "i guess"
    ]
    
    confidence_count = sum(1 for phrase in confidence_indicators if phrase in text_lower)
    uncertainty_count = sum(1 for phrase in uncertainty_indicators if phrase in text_lower)
    
    base_confidence = 70
    confidence_score = min(100, max(0, base_confidence + (confidence_count * 5) - (uncertainty_count * 10) - (filler_ratio * 100)))
    
    feedback = [pace_feedback]
    
    if filler_count > 5:
        top_fillers = list(set(found_fillers))[:3]
        feedback.append(f"Try to reduce filler words like: {', '.join(top_fillers)}")
    
    if uncertainty_count > 3:
        feedback.append("Use more confident language. Replace 'I think' with 'I believe' or 'I know'.")
    
    if total_words < 50:
        feedback.append("Your responses are quite short. Try to elaborate more with examples.")
    
    return VoiceMetrics(
        words_per_minute=round(words_per_minute, 1),
        filler_word_count=filler_count,
        filler_words_list=found_fillers[:10],
        total_words=total_words,
        estimated_duration_seconds=round(duration_seconds, 1),
        confidence_score=round(confidence_score, 1),
        clarity_score=round(clarity_score, 1),
        pace_rating=pace_rating,
        feedback=feedback
    )


def analyze_all_responses(messages: list[dict]) -> VoiceMetrics:
    user_text = " ".join([m["content"] for m in messages if m.get("role") == "user"])
    return analyze_speech(user_text)
