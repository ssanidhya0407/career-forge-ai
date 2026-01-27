from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.graphics.shapes import Drawing, Rect, Circle, String
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
from typing import Optional

# Brand Colors
PRIMARY_COLOR = colors.HexColor('#6366f1')  # Indigo
SECONDARY_COLOR = colors.HexColor('#4338ca')
BG_COLOR = colors.HexColor('#f8fafc')
TEXT_COLOR = colors.HexColor('#1e293b')
MUTED_COLOR = colors.HexColor('#64748b')

def header(canvas, doc):
    canvas.saveState()
    # Header Background
    canvas.setFillColor(PRIMARY_COLOR)
    canvas.rect(0, 10*inch, 8.5*inch, 1*inch, fill=1, stroke=0)
    
    # Title
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 24)
    canvas.drawString(0.5*inch, 10.4*inch, "CareerForge.ai")
    
    # Subtitle
    canvas.setFont("Helvetica", 12)
    canvas.drawString(0.5*inch, 10.2*inch, "AI-Powered Interview Coach Report")
    
    # Footer
    canvas.setFillColor(MUTED_COLOR)
    canvas.setFont("Helvetica", 9)
    canvas.drawCentredString(4.25*inch, 0.5*inch, f"Generated on {datetime.now().strftime('%B %d, %Y')} | CareerForge.ai")
    
    canvas.restoreState()

def generate_score_badge(score: int) -> Drawing:
    d = Drawing(100, 100)
    d.add(Circle(50, 50, 40, fillColor=None, strokeColor=PRIMARY_COLOR, strokeWidth=4))
    
    if score >= 70:
        color = colors.green
    elif score >= 50:
        color = colors.orange
    else:
        color = colors.red
        
    s = String(50, 45, str(score), textAnchor='middle')
    s.fontName = 'Helvetica-Bold'
    s.fontSize = 24
    s.fillColor = color
    d.add(s)
    
    lbl = String(50, 25, "/100", textAnchor='middle')
    lbl.fontName = 'Helvetica'
    lbl.fontSize = 10
    lbl.fillColor = colors.grey
    d.add(lbl)
    
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
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        topMargin=1.5*inch,
        bottomMargin=1*inch,
        leftMargin=0.8*inch,
        rightMargin=0.8*inch
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    h1 = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=18, textColor=PRIMARY_COLOR, spaceAfter=12, fontName='Helvetica-Bold')
    h2 = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=14, textColor=SECONDARY_COLOR, spaceAfter=10, fontName='Helvetica-Bold')
    normal = ParagraphStyle('Body', parent=styles['Normal'], fontSize=11, leading=15, textColor=TEXT_COLOR)
    
    story = []
    
    # Meta Info Table
    meta_data = [
        [f"Role: {role}", f"Experience: {experience_level}"],
        [f"Date: {datetime.now().strftime('%Y-%m-%d')}", f"Session ID: {session_id[:8]}"]
    ]
    meta_table = Table(meta_data, colWidths=[3.5*inch, 3.4*inch])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0,0), (-1,-1), MUTED_COLOR),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 20))

    # Overall Score Section
    story.append(Paragraph("Overall Performance", h1))
    
    # We use a table to put Score Circle next to Summary
    # Left: Score, Right: Summary
    
    # Generate Score Drawing
    score_draw = generate_score_badge(score)
    
    summary_text = Paragraph(f"<b>Executive Summary:</b><br/>{summary}", normal)
    
    # Layout Table
    layout_data = [[score_draw, summary_text]]
    layout_table = Table(layout_data, colWidths=[2*inch, 4.9*inch])
    layout_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (0,0), (0,0), 'CENTER'),
    ]))
    story.append(layout_table)
    story.append(Spacer(1, 30))
    
    # Category Scores (if present)
    if any([communication_score, technical_score, problem_solving_score, culture_fit_score]):
        story.append(Paragraph("Category Breakdown", h2))
        
        # Helper to colour score
        def score_cell(val):
            c = colors.green if val >= 70 else (colors.orange if val >= 50 else colors.red)
            return Paragraph(f"<font color={c}>{val}/100</font>", normal)

        cat_data = [
            ["Communication", score_cell(communication_score), "Problem Solving", score_cell(problem_solving_score)],
            ["Technical", score_cell(technical_score), "Culture Fit", score_cell(culture_fit_score)]
        ]
        
        cat_table = Table(cat_data, colWidths=[2*inch, 1.4*inch, 2*inch, 1.4*inch])
        cat_table.setStyle(TableStyle([
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'), # Labels
            ('FONTNAME', (2,0), (2,-1), 'Helvetica-Bold'), # Labels
            ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
            ('PADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(cat_table)
        story.append(Spacer(1, 20))

    # Strengths & Improvements
    story.append(Paragraph("Detailed Feedback", h1))
    
    col1 = [Paragraph("<b>Key Strengths</b>", h2)] + [Paragraph(f"<font color='green'>✓</font> {s}", normal) for s in strengths]
    col2 = [Paragraph("<b>Areas for Improvement</b>", h2)] + [Paragraph(f"<font color='orange'>•</font> {i}", normal) for i in improvements]
    
    # Balance columns if lists are different lengths
    max_len = max(len(col1), len(col2))
    col1 += [String(0,0,"")] * (max_len - len(col1))
    col2 += [String(0,0,"")] * (max_len - len(col2))
    
    # Side by side is tricky with Paragraphs in Table.
    # We'll just stack them for robust layout.
    
    story.append(Paragraph("Key Strengths", h2))
    for s in strengths:
        story.append(Paragraph(f"<font color='green'>✓</font> {s}", normal))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Areas for Improvement", h2))
    for i in improvements:
        story.append(Paragraph(f"<font color='#f59e0b'>•</font> {i}", normal))
    story.append(Spacer(1, 20))
    
    if improvement_tips:
         story.append(Paragraph("Recommended Actions", h2))
         for idx, tip in enumerate(improvement_tips, 1):
             story.append(Paragraph(f"{idx}. {tip}", normal))
         story.append(Spacer(1, 20))

    # Voice Metrics
    if voice_metrics:
        story.append(PageBreak())
        story.append(Paragraph("Voice & Speech Analysis", h1))
        
        vm_data = [
            ["Metric", "Value", "Assessment"],
            ["Pace", voice_metrics.get("pace_rating", "-"), "Targets 130-150 wpm"],
            ["WPM", f"{voice_metrics.get('words_per_minute', 0)}", "-"],
            ["Filler Words", f"{voice_metrics.get('filler_word_count', 0)}", "um, uh, like"],
            ["Confidence", f"{voice_metrics.get('confidence_score', 0)}/100", "Tone analysis"],
        ]
        vm_table = Table(vm_data, colWidths=[2*inch, 2*inch, 3*inch])
        vm_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(vm_table)
        story.append(Spacer(1, 20))

    # Transcript
    if transcript:
        story.append(Paragraph("Interview Transcript", h1))
        for msg in transcript:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            
            # Colour code roles
            if role == "model":
                p = Paragraph(f"<b>Interviewer:</b> {content}", normal)
            else:
                p = Paragraph(f"<b>You:</b> <font color='#4a5568'>{content}</font>", normal)
                
            story.append(p)
            story.append(Spacer(1, 8))

    # Build
    doc.build(story, onFirstPage=header, onLaterPages=header)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes
