from __future__ import annotations

import json
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "content.json"
OUTPUT_PATH = ROOT / "public" / "downloads" / "planeon-enterprise-mas-blueprint.pdf"
LOGO_PATH = ROOT / "public" / "brand" / "planeon-logo.png"

PAPER = colors.HexColor("#F5F7FB")
INK = colors.HexColor("#0A1020")
MUTED = colors.HexColor("#333B4D")
FAINT = colors.HexColor("#5A6577")
LINE = colors.HexColor("#CBD1DC")
PLANE_COLORS = {
    "runtime": colors.HexColor("#3A6FF7"),
    "knowledge": colors.HexColor("#22C7A9"),
    "execution": colors.HexColor("#2F5FE0"),
    "trust": colors.HexColor("#0E9B81"),
}


def ascii_text(value: str) -> str:
    replacements = {
        "\u2014": " - ", "\u2013": "-", "\u2011": "-", "\u2018": "'", "\u2019": "'",
        "\u201c": '"', "\u201d": '"', "\u2192": "->", "\u00b7": " / ", "\u2248": "about ",
        "\u00d7": "x", "\u2265": ">=", "\u2264": "<=", "\u2026": "...", "\u00a0": " ",
    }
    for source, target in replacements.items():
        value = value.replace(source, target)
    return re.sub(r"[^\x09\x0A\x0D\x20-\x7E]", "", value)


def safe(value: str) -> str:
    return ascii_text(value).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverKicker", fontName="Helvetica-Bold", fontSize=7.5, leading=10, tracking=1.4, textColor=MUTED, spaceAfter=16))
styles.add(ParagraphStyle(name="CoverTitle", fontName="Helvetica-Bold", fontSize=43, leading=45, textColor=INK, spaceAfter=18))
styles.add(ParagraphStyle(name="CoverDeck", fontName="Helvetica", fontSize=15, leading=21, textColor=MUTED, spaceAfter=28))
styles.add(ParagraphStyle(name="SectionKicker", fontName="Helvetica-Bold", fontSize=7, leading=9, tracking=1.2, textColor=MUTED, spaceAfter=10))
styles.add(ParagraphStyle(name="SectionTitle", fontName="Helvetica-Bold", fontSize=28, leading=31, textColor=INK, spaceAfter=12))
styles.add(ParagraphStyle(name="HarnessTitle", fontName="Helvetica-Bold", fontSize=18, leading=21, textColor=INK, spaceAfter=8))
styles.add(ParagraphStyle(name="BodyPlaneon", fontName="Helvetica", fontSize=9.5, leading=14, textColor=MUTED, spaceAfter=9))
styles.add(ParagraphStyle(name="BodyStrong", fontName="Helvetica-Bold", fontSize=9.2, leading=13, textColor=INK, spaceAfter=6))
styles.add(ParagraphStyle(name="Mini", fontName="Helvetica", fontSize=7.3, leading=10.5, textColor=MUTED))
styles.add(ParagraphStyle(name="Mono", fontName="Courier-Bold", fontSize=7, leading=9, textColor=FAINT, tracking=0.8))
styles.add(ParagraphStyle(name="Quote", fontName="Helvetica-Bold", fontSize=20, leading=25, textColor=INK, spaceBefore=8, spaceAfter=16))
styles.add(ParagraphStyle(name="CenterMono", fontName="Courier-Bold", fontSize=7, leading=9, textColor=INK, alignment=TA_CENTER))


class PlaneMarker(Flowable):
    def __init__(self, number: int, color: colors.Color, size: float = 12 * mm):
        super().__init__()
        self.number = number
        self.color = color
        self.width = size
        self.height = size

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(0.8)
        self.canv.circle(self.width / 2, self.height / 2, self.width / 2 - 0.5, stroke=1, fill=0)
        self.canv.setFillColor(self.color)
        self.canv.setFont("Courier-Bold", 7.5)
        self.canv.drawCentredString(self.width / 2, self.height / 2 - 2.6, f"{self.number:02d}")


def page_chrome(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, height - 14 * mm, width - doc.rightMargin, height - 14 * mm)
    canvas.drawImage(ImageReader(str(LOGO_PATH)), doc.leftMargin, height - 11.5 * mm, width=31 * mm, height=8.15 * mm, preserveAspectRatio=True, mask="auto")
    canvas.setFillColor(FAINT)
    canvas.setFont("Courier", 6.5)
    canvas.drawRightString(width - doc.rightMargin, height - 10 * mm, "THE ENTERPRISE MAS BLUEPRINT")
    canvas.line(doc.leftMargin, 13 * mm, width - doc.rightMargin, 13 * mm)
    canvas.drawString(doc.leftMargin, 8 * mm, "LAST REVIEWED 01 SEP 2026")
    canvas.drawRightString(width - doc.rightMargin, 8 * mm, f"{doc.page:02d}")
    canvas.restoreState()


def cover_chrome(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.drawImage(ImageReader(str(LOGO_PATH)), 20 * mm, height - 24 * mm, width=43 * mm, height=11.3 * mm, preserveAspectRatio=True, mask="auto")
    cx, cy = width * 0.72, height * 0.72
    radii = [18, 31, 44, 57]
    for radius, color in zip(radii, PLANE_COLORS.values()):
        canvas.setStrokeColor(color)
        canvas.setLineWidth(0.8)
        canvas.circle(cx, cy, radius * mm, stroke=1, fill=0)
    canvas.setFillColor(INK)
    canvas.circle(cx, cy, 5 * mm, stroke=0, fill=1)
    canvas.setFillColor(FAINT)
    canvas.setFont("Courier", 6.5)
    canvas.drawString(20 * mm, 14 * mm, "FIELD NOTE 01 / ARCHITECTURE")
    canvas.drawRightString(width - 20 * mm, 14 * mm, "PLANEON.AI")
    canvas.restoreState()


def section_heading(kicker: str, title: str):
    return [Paragraph(safe(kicker), styles["SectionKicker"]), Paragraph(safe(title), styles["SectionTitle"])]


def bullets(items: list[str], color=INK):
    rows = []
    for item in items:
        rows.append([Paragraph("+", ParagraphStyle("bulletMark", parent=styles["Mono"], textColor=color)), Paragraph(safe(item), styles["BodyPlaneon"])])
    table = Table(rows, colWidths=[7 * mm, 151 * mm])
    table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, -1), 0.3, LINE), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4)]))
    return table


def build_pdf():
    data = json.loads(DATA_PATH.read_text())
    harnesses = sorted(data["harnesses"].values(), key=lambda item: item["n"])
    doc = SimpleDocTemplate(str(OUTPUT_PATH), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=22 * mm, bottomMargin=20 * mm, title="The Enterprise Multi-Agent Systems Blueprint", author="Planeon")
    story = []

    story.extend([Spacer(1, 98 * mm), Paragraph("PLANEON FIELD NOTE / 01", styles["CoverKicker"]), Paragraph("The enterprise multi-agent systems blueprint.", styles["CoverTitle"]), Paragraph("Sixteen boundaries that turn a capable model into a system an enterprise can operate, govern, and trust.", styles["CoverDeck"]), Paragraph("Vendor-neutral architecture / 16 harnesses / 43 exchanges / 4 build phases", styles["Mono"]), PageBreak()])

    story.extend(section_heading("01 / THESIS", "The model is necessary. It is not the system."))
    story.append(Paragraph("A production agent is a chain of identity, interpretation, retrieval, reasoning, authority, action, memory, evidence, and feedback. Most failures arrive in the joins: a missing workload identity, a retry without idempotency, retrieved text treated as instruction, or a release gate that consumes opinion instead of evidence.", styles["BodyPlaneon"]))
    story.append(Paragraph("The blueprint makes those joins explicit. It does not prescribe one platform or vendor. It names the jobs that fail differently, change at different speeds, or answer to different owners.", styles["BodyPlaneon"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("Only two of forty-three exchanges in the reference task touch the model core. Everything else establishes identity, context, authority, safety, continuity, cost, and accountability.", styles["Quote"]))
    story.append(PageBreak())

    story.extend(section_heading("02 / FOUR CONCERNS", "Group by concern, not hierarchy."))
    descriptions = {"runtime": "Where it runs, how models are served, and how requests enter and leave.", "knowledge": "What the system knows, may retrieve, and earns the right to remember.", "execution": "How work is planned, continued, standardised, isolated, and completed.", "trust": "Who or what is permitted, how evidence is gathered, and how change is governed."}
    plane_rows = []
    for plane_id, plane in data["planes"].items():
        plane_rows.append([Paragraph(safe(plane["label"]), ParagraphStyle("planeLabel", parent=styles["BodyStrong"], textColor=PLANE_COLORS[plane_id])), Paragraph(safe(descriptions[plane_id]), styles["BodyPlaneon"])])
    plane_table = Table(plane_rows, colWidths=[48 * mm, 110 * mm])
    plane_table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEABOVE", (0, 0), (-1, -1), 0.7, LINE), ("BOTTOMPADDING", (0, 0), (-1, -1), 12), ("TOPPADDING", (0, 0), (-1, -1), 12), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
    story.append(plane_table)
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("The rings in the composition diagram are groupings of concern. They do not imply containment, priority, or dependency.", styles["Mini"]))
    story.append(PageBreak())

    story.extend(section_heading("03 / SIXTEEN HARNESSES", "Every boundary needs an owner and proof."))
    story.append(Paragraph("Each profile below comes directly from the website data source. Tool and standards lists are intentionally omitted from this concise edition because they are the most perishable part of the landscape.", styles["BodyPlaneon"]))
    for index, harness in enumerate(harnesses):
        color = PLANE_COLORS[harness["plane"]]
        marker = PlaneMarker(harness["n"], color)
        header = Table([[marker, Paragraph(safe(harness["name"]), ParagraphStyle("hTitle", parent=styles["HarnessTitle"], textColor=INK)), Paragraph(f"PHASE {harness['phase']}", ParagraphStyle("hPhase", parent=styles["Mono"], alignment=TA_LEFT, textColor=color))]], colWidths=[15 * mm, 118 * mm, 25 * mm])
        header.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 4)]))
        block = [Spacer(1, 3 * mm), header, Spacer(1, 3 * mm), Paragraph(safe(harness["mandate"]), styles["BodyPlaneon"]), Paragraph("ACCOUNTABLE OWNER", ParagraphStyle("ownerK", parent=styles["Mono"], textColor=color)), Paragraph(safe(harness["deptAcc"]), styles["BodyStrong"]), Paragraph("WHAT DONE LOOKS LIKE", ParagraphStyle("doneK", parent=styles["Mono"], textColor=color)), Paragraph(safe(harness["phaseNote"]), styles["BodyPlaneon"]), Paragraph("SIGNALS", ParagraphStyle("sigK", parent=styles["Mono"], textColor=color)), bullets(harness["signals"][:3], color)]
        story.append(KeepTogether(block))
        if index in {3, 7, 11, 15}:
            story.append(PageBreak())

    story.extend(section_heading("04 / ONE TASK END TO END", "Forty-three exchanges, four operating phases."))
    phase_ranges = {"PH1": (1, 5), "PH2": (6, 32), "PH3": (33, 37), "PH4": (38, 43)}
    for phase_id, phase in data["sequence"]["phases"].items():
        start, end = phase_ranges[phase_id]
        story.append(Paragraph(f"{safe(phase_id)} / {safe(phase['name'])} / STEPS {start}-{end}", ParagraphStyle("phaseHead", parent=styles["SectionKicker"], textColor=PLANE_COLORS[phase["plane"]], spaceBefore=10)))
        story.append(Paragraph(safe(phase["what"]), styles["BodyPlaneon"]))
        step_rows = []
        for number in range(start, end + 1):
            key = f"m{number}"
            meta = data["sequence"]["messageMeta"][key]
            step_rows.append([Paragraph(f"{number:02d}", styles["CenterMono"]), Paragraph(safe(meta["from"]), styles["Mono"]), Paragraph("->", styles["CenterMono"]), Paragraph(safe(meta["to"]), styles["Mono"]), Paragraph(safe(meta["label"]), styles["Mini"])])
        table = Table(step_rows, colWidths=[9 * mm, 17 * mm, 8 * mm, 17 * mm, 107 * mm], repeatRows=0)
        table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("LINEBELOW", (0, 0), (-1, -1), 0.3, LINE), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4), ("LEFTPADDING", (0, 0), (-1, -1), 2), ("RIGHTPADDING", (0, 0), (-1, -1), 2)]))
        story.append(table)
    story.append(PageBreak())

    story.extend(section_heading("05 / BUILD ORDER", "Start with what must be true before autonomy."))
    for phase in data["buildPhases"]:
        matching = [item for item in harnesses if item["phase"] == phase["id"]]
        rows = [[Paragraph(f"0{phase['id']}", ParagraphStyle("phaseNum", parent=styles["SectionTitle"], textColor=PLANE_COLORS["runtime"])), Paragraph(f"<b>{safe(phase['name'])}</b><br/>{safe(phase['blurb'])}<br/><font color='#333B4D'>{safe(' / '.join(item['name'] for item in matching))}</font>", styles["BodyPlaneon"])]]
        table = Table(rows, colWidths=[23 * mm, 135 * mm])
        table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEABOVE", (0, 0), (-1, -1), 0.7, LINE), ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10), ("LEFTPADDING", (0, 0), (-1, -1), 0)]))
        story.append(table)
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("Each phase is complete when its controls can produce evidence under failure - not when the happy-path demo runs once.", styles["Quote"]))
    story.append(PageBreak())

    story.extend(section_heading("06 / PROVENANCE AND LIMITS", "Use the framework critically."))
    story.append(Paragraph(safe(data["_provenance"]), styles["BodyPlaneon"]))
    story.append(Paragraph("Enterprise ownership models and build phases are architectural recommendations, not research findings. Tier badges reproduce the source deck's MVP-versus-full split; Phase 0-3 is a separate sequencing model. Tool lists and version-specific standards claims require a current review before adoption.", styles["BodyPlaneon"]))
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("RESEARCH SNAPSHOT", styles["SectionKicker"]))
    story.append(bullets(["Gravitee, State of AI Agent Security Report 2026 - deployed-agent monitoring and security survey.", "Cloud Security Alliance, AI Agent Identity and Visibility Crisis, 2026 - agent versus human activity visibility.", "Anthropic Engineering, How we built our multi-agent research system, 2025 - token-use and performance observations."], PLANE_COLORS["trust"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("planeon.ai", ParagraphStyle("end", parent=styles["CoverTitle"], fontSize=22, leading=26)))

    doc.build(story, onFirstPage=cover_chrome, onLaterPages=page_chrome)


if __name__ == "__main__":
    build_pdf()
