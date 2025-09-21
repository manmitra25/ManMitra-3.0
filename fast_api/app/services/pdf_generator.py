# services/pdf_generator.py
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
import asyncio
from typing import List

# create a PDF in-memory containing chart images (png bytes) and textual summary
async def generate_pdf_report(title: str, charts: dict, insights: List[str], details_text: str = "") -> bytes:
    # run blocking reportlab in thread
    return await asyncio.to_thread(_generate_pdf_sync, title, charts, insights, details_text)

def _generate_pdf_sync(title: str, charts: dict, insights: List[str], details_text: str) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    width, height = letter

    # Title
    c.setFont("Helvetica-Bold", 18)
    c.drawString(40, height - 60, title)

    # Insights
    c.setFont("Helvetica", 11)
    y = height - 90
    c.drawString(40, y, "Insights:")
    y -= 20
    for insight in insights:
        c.drawString(60, y, f"- {insight}")
        y -= 16
        if y < 120:
            c.showPage()
            y = height - 60

    # Add charts
    for name, png_bytes in charts.items():
        if y < 220:  # new page if not enough space
            c.showPage()
            y = height - 60
        # create temporary buffer
        img_buf = io.BytesIO(png_bytes)
        # draw image with width 480 keeping aspect ratio
        img_width = 480
        img_height = 240
        c.drawImage(img_buf, 60, y - img_height, width=img_width, height=img_height)
        y -= img_height + 20

    # Add details text last
    if details_text:
        if y < 120:
            c.showPage()
            y = height - 60
        c.setFont("Helvetica", 10)
        text_obj = c.beginText(40, y)
        for line in details_text.splitlines():
            text_obj.textLine(line)
        c.drawText(text_obj)

    c.save()
    buf.seek(0)
    return buf.read()
