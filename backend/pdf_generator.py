from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics.charts.piecharts import Pie
from io import BytesIO
from datetime import datetime
from typing import Optional


def generate_score_bar(score: int, width: float = 200, height: float = 20) -> Drawing:
    d = Drawing(width, height)
    
    d.add(Rect(0, 0, width, height, fillColor=colors.lightgrey, strokeColor=None))
    
    fill_width = (score / 100) * width
    if score >= 70:
        fill_color = colors.green
    elif score >= 50:
        fill_color = colors.orange
    else:
        fill_color = colors.red
    
    d.add(Rect(0, 0, fill_width, height, fillColor=fill_color, strokeColor=None))
    
    return d


def generate_pdf_report(
    session_id: str,
    role: str,
    experience_level: str,
    score: int,
    summary: str,
    strengths: list[str],
    improvements: list[str],
    communication_score: int = 0,
    technical_score: int = 0,
    problem_solving_score: int = 0,
    culture_fit_score: int = 0,
    improvement_tips: list[str] = None,
    transcript: list[dict] = None,
    voice_metrics: dict = None
) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=20,
        textColor=colors.HexColor('#1a1a2e')
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=10,
        textColor=colors.HexColor('#4a4a6a')
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=8,
        leading=14
    )
    
    story = []
    
    story.append(Paragraph("CareerForge.ai", title_style))
    story.append(Paragraph("Interview Performance Report", heading_style))
    story.append(Spacer(1, 10))
    
    today = datetime.now().strftime("%B %d, %Y")
    meta_data = [
        ["Date:", today],
        ["Position:", role],
        ["Level:", experience_level],
        ["Session ID:", session_id[:8] + "..."]
    ]
    meta_table = Table(meta_data, colWidths=[1.5*inch, 4*inch])
    meta_table.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.grey),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))
    
    story.append(Paragraph("Overall Score", heading_style))
    score_text = f"<font size=36><b>{score}</b></font><font size=14>/100</font>"
    story.append(Paragraph(score_text, body_style))
    story.append(Spacer(1, 20))
    
    if any([communication_score, technical_score, problem_solving_score, culture_fit_score]):
        story.append(Paragraph("Category Breakdown", heading_style))
        category_data = [
            ["Category", "Score"],
            ["Communication", f"{communication_score}/100"],
            ["Technical Knowledge", f"{technical_score}/100"],
            ["Problem Solving", f"{problem_solving_score}/100"],
            ["Culture Fit", f"{culture_fit_score}/100"],
        ]
        cat_table = Table(category_data, colWidths=[2.5*inch, 1.5*inch])
        cat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a4a6a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(cat_table)
        story.append(Spacer(1, 20))
    
    story.append(Paragraph("Executive Summary", heading_style))
    story.append(Paragraph(summary, body_style))
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Key Strengths", heading_style))
    for strength in strengths:
        story.append(Paragraph(f"✓ {strength}", body_style))
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Areas for Improvement", heading_style))
    for improvement in improvements:
        story.append(Paragraph(f"• {improvement}", body_style))
    story.append(Spacer(1, 15))
    
    if improvement_tips:
        story.append(Paragraph("Recommended Next Steps", heading_style))
        for i, tip in enumerate(improvement_tips, 1):
            story.append(Paragraph(f"{i}. {tip}", body_style))
        story.append(Spacer(1, 15))
    
    if voice_metrics:
        story.append(Paragraph("Speaking Analysis", heading_style))
        voice_data = [
            ["Metric", "Value"],
            ["Speaking Pace", voice_metrics.get("pace_rating", "N/A")],
            ["Words per Minute", str(voice_metrics.get("words_per_minute", 0))],
            ["Filler Words", str(voice_metrics.get("filler_word_count", 0))],
            ["Confidence Score", f"{voice_metrics.get('confidence_score', 0)}/100"],
        ]
        voice_table = Table(voice_data, colWidths=[2.5*inch, 1.5*inch])
        voice_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4a4a6a')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(voice_table)
        story.append(Spacer(1, 15))
    
    if transcript:
        story.append(Paragraph("Interview Transcript", heading_style))
        for msg in transcript:
            role_label = "Interviewer" if msg.get("role") == "model" else "You"
            content = msg.get("content", "")[:300]
            if len(msg.get("content", "")) > 300:
                content += "..."
            story.append(Paragraph(f"<b>{role_label}:</b> {content}", body_style))
            story.append(Spacer(1, 5))
    
    story.append(Spacer(1, 30))
    footer = Paragraph(
        "<font size=8 color='grey'>Generated by CareerForge.ai | Your AI Interview Coach</font>",
        body_style
    )
    story.append(footer)
    
    doc.build(story)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
