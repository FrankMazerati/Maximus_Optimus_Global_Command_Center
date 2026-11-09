"""Generate the real document library that the platform connector workspace browses.

Every file written here is a genuine DOCX / XLSX / PPTX / PDF / PNG / CSV / JSON / TXT file,
so the connector previews parse and render actual document content instead of mock markup.

Run with: python3 scripts/generate-sample-documents.py
"""

from __future__ import annotations

import csv
import json
import os
from datetime import datetime, timedelta, timezone

from docx import Document
from docx.shared import Pt
from openpyxl import Workbook
from openpyxl.styles import Font
from PIL import Image, ImageDraw
from pptx import Presentation
from pptx.util import Inches, Pt as PPt
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "documents")
os.makedirs(OUT, exist_ok=True)

BASE = datetime(2026, 11, 4, 14, 20, tzinfo=timezone.utc)


def iso(days_ago: float, hours: float = 0) -> str:
    stamp = BASE - timedelta(days=days_ago, hours=hours)
    return stamp.replace(microsecond=0).isoformat().replace("+00:00", "Z")


def write_docx() -> None:
    doc = Document()
    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(11)
    doc.add_heading("Q4 Infrastructure Refresh Proposal", level=0)
    doc.add_paragraph(
        "Prepared for the Global Infrastructure Review Board by the Northstar Delivery Team. "
        "This proposal covers the Floor 42 network refresh, edge firewall replacement, and the "
        "VPN concentrator migration planned for Q4 2026."
    )
    doc.add_heading("1. Executive Summary", level=1)
    doc.add_paragraph(
        "The Floor 42 access layer has reached end of support. Forty-two access switches and two "
        "distribution chassis are outside the vendor maintenance window. Incident INC-9842 is the "
        "most recent symptom: a site-to-site VPN tunnel drops when the aggregation link renegotiates."
    )
    doc.add_heading("2. Recommended Scope", level=1)
    for line in [
        "Replace 42 access switches with the approved reference design.",
        "Migrate the VPN concentrator from the legacy cluster to the supported platform.",
        "Introduce redundant aggregation links between Floor 42 and the core.",
        "Retire the temporary remediation documented in the VPN Connectivity Runbook.",
    ]:
        doc.add_paragraph(line, style="List Bullet")
    doc.add_heading("3. Commercials", level=1)
    table = doc.add_table(rows=1, cols=3)
    table.style = "Light Grid Accent 1"
    header = table.rows[0].cells
    header[0].text = "Line item"
    header[1].text = "Quantity"
    header[2].text = "Cost (USD)"
    for row in [
        ("Access switch, 48-port PoE", "42", "184,800"),
        ("VPN concentrator pair", "2", "96,400"),
        ("Aggregation optics", "24", "31,200"),
        ("Professional services", "1", "58,000"),
    ]:
        cells = table.add_row().cells
        for index, value in enumerate(row):
            cells[index].text = value
    doc.add_paragraph(
        "Total required investment: USD 370,400. The figure reconciles to the FY26 Budget Forecast "
        "workbook, Infrastructure capital line, Q4 column."
    )
    doc.add_heading("4. Risk if deferred", level=1)
    doc.add_paragraph(
        "Deferral keeps Floor 42 outside vendor support for a second quarter and leaves incident "
        "INC-9842 dependent on a manual workaround. Estimated exposure is 6 to 9 hours of degraded "
        "service per month during peak trading windows."
    )
    doc.save(os.path.join(OUT, "Q4-Infrastructure-Proposal.docx"))


def write_xlsx() -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Summary"
    bold = Font(bold=True)
    ws.append(["FY26 Budget Forecast", None, None, None, None])
    ws["A1"].font = Font(bold=True, size=14)
    ws.append([])
    ws.append(["Cost centre", "Q1", "Q2", "Q3", "Q4"])
    for cell in ws[3]:
        cell.font = bold
    rows = [
        ["Infrastructure", 210000, 184000, 240500, 370400],
        ["Security operations", 96000, 101500, 88000, 121000],
        ["Workplace services", 142000, 138500, 151000, 149500],
        ["Licensing", 305000, 305000, 312500, 318000],
        ["Contingency", 40000, 0, 0, 65000],
    ]
    for row in rows:
        ws.append(row)
    ws.append([])
    ws.append(["Total", "=SUM(B4:B8)", "=SUM(C4:C8)", "=SUM(D4:D8)", "=SUM(E4:E8)"])
    for cell in ws["A10:E10"][0]:
        cell.font = bold
    ws.column_dimensions["A"].width = 24
    for column in "BCDE":
        ws.column_dimensions[column].width = 14

    detail = wb.create_sheet("Infrastructure detail")
    detail.append(["Item", "Vendor", "Q4 plan", "Committed"])
    for cell in detail[1]:
        cell.font = bold
    for row in [
        ("Access switches (42)", "Northbridge Networks", 184800, "No"),
        ("VPN concentrator pair", "Northbridge Networks", 96400, "Yes"),
        ("Aggregation optics", "Optical Systems", 31200, "No"),
        ("Professional services", "IntelliStack Delivery", 58000, "Yes"),
    ]:
        detail.append(row)
    detail.column_dimensions["A"].width = 26
    detail.column_dimensions["B"].width = 24

    variance = wb.create_sheet("Variance")
    variance.append(["Quarter", "Forecast", "Actual", "Variance"])
    for cell in variance[1]:
        cell.font = bold
    for row in [
        ("Q1", 793000, 781400, -11600),
        ("Q2", 729000, 742900, 13900),
        ("Q3", 792000, 768300, -23700),
        ("Q4", 1023900, None, None),
    ]:
        variance.append(row)
    variance.column_dimensions["A"].width = 12
    for column in "BCD":
        variance.column_dimensions[column].width = 14

    wb.save(os.path.join(OUT, "FY26-Budget-Forecast.xlsx"))


def write_pptx() -> None:
    prs = Presentation()
    slides = [
        (
            "Network Refresh Briefing",
            "Floor 42 access layer and VPN concentrator migration\nGlobal Infrastructure Review · November 2026",
        ),
        (
            "Why now",
            "Vendor support ended 30 September 2026\nINC-9842 is the third tunnel drop this quarter\nManual workaround is not sustainable through Q4 peak",
        ),
        (
            "Target design",
            "42 access switches on the approved reference design\nDual aggregation links into the core pair\nVPN concentrator pair in active/standby\nZero single points of failure below the core",
        ),
        (
            "Delivery plan",
            "Week 1: stage and validate the reference build\nWeek 2: migrate Floor 42 in four maintenance windows\nWeek 3: cut over the VPN concentrators\nWeek 4: decommission legacy hardware and update the runbook",
        ),
        (
            "Decision requested",
            "Approve USD 370,400 from the Infrastructure Q4 line\nConfirm maintenance windows with Trading Operations\nAssign a named delivery lead before 14 November 2026",
        ),
    ]
    layout = prs.slide_layouts[1]
    for index, (title, body) in enumerate(slides):
        slide = prs.slides.add_slide(layout)
        slide.shapes.title.text = title
        frame = slide.placeholders[1].text_frame
        lines = body.split("\n")
        frame.text = lines[0]
        frame.paragraphs[0].font.size = PPt(18)
        for line in lines[1:]:
            paragraph = frame.add_paragraph()
            paragraph.text = line
            paragraph.font.size = PPt(18)
        slide.notes_slide.notes_text_frame.text = f"Speaker note for slide {index + 1}: keep to two minutes."
    prs.save(os.path.join(OUT, "Network-Refresh-Briefing.pptx"))


def write_pdf() -> None:
    path = os.path.join(OUT, "VPN-Connectivity-Runbook.pdf")
    pdf = canvas.Canvas(path, pagesize=letter)
    width, height = letter

    def page_one() -> None:
        pdf.setFont("Helvetica-Bold", 18)
        pdf.drawString(72, height - 90, "VPN Connectivity Runbook")
        pdf.setFont("Helvetica", 11)
        pdf.drawString(72, height - 112, "Incident class: INC-9842 · Site-to-site tunnel instability")
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(72, height - 150, "1. Confirm the reported symptom")
        pdf.setFont("Helvetica", 10.5)
        lines = [
            "Ask the requester which service is unreachable and since when.",
            "Record the affected device, user, floor and local time.",
            "Check the tunnel state on the concentrator: expected value is QM_IDLE or ESTABLISHED.",
            "Do not reset the tunnel until the current state has been captured.",
        ]
        y = height - 172
        for line in lines:
            pdf.drawString(84, y, f"- {line}")
            y -= 16
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(72, y - 18, "2. Verify connectivity")
        pdf.setFont("Helvetica", 10.5)
        y -= 40
        for line in [
            "Ping the aggregation gateway from the Floor 42 edge switch.",
            "Trace the path to the remote peer and confirm the hop where latency spikes.",
            "Compare interface error counters before and after the test.",
        ]:
            pdf.drawString(84, y, f"- {line}")
            y -= 16
        pdf.setFont("Helvetica-Oblique", 9)
        pdf.drawString(72, 90, "IntelliStack Systems · Internal use only · Page 1 of 2")
        pdf.showPage()

    def page_two() -> None:
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(72, height - 90, "3. Apply the approved remediation")
        pdf.setFont("Helvetica", 10.5)
        y = height - 112
        for line in [
            "Renegotiate the tunnel during the approved maintenance window.",
            "Pin the IKE identity to the primary peer only while the aggregation link is unstable.",
            "Confirm the session table repopulates and the trading feed reconnects.",
            "Capture the before and after output as evidence on the ticket.",
        ]:
            pdf.drawString(84, y, f"- {line}")
            y -= 16
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(72, y - 18, "4. Verify restoration and document")
        pdf.setFont("Helvetica", 10.5)
        y -= 40
        for line in [
            "Requester confirms the service is working.",
            "Record root cause, work performed and verification in the resolution notes.",
            "Attach the captured evidence and the change record reference.",
            "Link this runbook article to the mission trail.",
        ]:
            pdf.drawString(84, y, f"- {line}")
            y -= 16
        pdf.setFont("Helvetica", 10)
        pdf.drawString(72, 120, "Escalate to Network Operations if the tunnel drops twice in one maintenance window.")
        pdf.setFont("Helvetica-Oblique", 9)
        pdf.drawString(72, 90, "IntelliStack Systems · Internal use only · Page 2 of 2")
        pdf.showPage()

    page_one()
    page_two()
    pdf.save()


def write_png() -> None:
    width, height = 1400, 900
    image = Image.new("RGB", (width, height), "#eef6ff")
    draw = ImageDraw.Draw(image)
    draw.rectangle([0, 0, width, 88], fill="#1f5f9e")
    draw.text((40, 34), "FLOOR 42 NETWORK TOPOLOGY", fill="white")

    def node(box, label, fill):
        draw.rounded_rectangle(box, radius=14, fill=fill, outline="#2f6fae", width=3)
        x0, y0, x1, y1 = box
        draw.text(((x0 + x1) / 2 - len(label) * 3, (y0 + y1) / 2 - 6), label, fill="#12395f")

    node((520, 130, 880, 210), "CORE PAIR", "#cfe6ff")
    node((160, 330, 460, 410), "AGGREGATION A", "#dbeafe")
    node((940, 330, 1240, 410), "AGGREGATION B", "#dbeafe")
    node((520, 330, 880, 410), "DISTRIBUTION CHASSIS", "#e8f2ff")
    draw.line([(700, 210), (700, 330)], fill="#2f6fae", width=5)
    draw.line([(700, 300), (310, 300), (310, 330)], fill="#2f6fae", width=5)
    draw.line([(700, 300), (1090, 300), (1090, 330)], fill="#2f6fae", width=5)
    draw.line([(310, 410), (310, 520), (1090, 520), (1090, 410)], fill="#2f6fae", width=3)

    for index in range(6):
        x = 120 + index * 205
        node((x, 560, x + 165, 630), f"ACCESS {index + 1}", "#ffffff")
        draw.line([(700, 410), (700, 480), (x + 82, 480), (x + 82, 560)], fill="#6ba3d6", width=2)

    node((470, 700, 940, 780), "VPN CONCENTRATOR PAIR (ACTIVE / STANDBY)", "#d7f5e3")
    draw.line([(700, 630), (700, 700)], fill="#2f6fae", width=4)
    draw.text((40, 840), "INC-9842 · aggregation link renegotiation identified as trigger · 42 access switches end of support", fill="#3d6489")
    image.save(os.path.join(OUT, "Floor42-Network-Topology.png"))


def write_csv() -> None:
    path = os.path.join(OUT, "Asset-Inventory-Q4.csv")
    with open(path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["asset_id", "type", "model", "assigned_to", "location", "status", "warranty_end"])
        rows = [
            ("LT-3217", "Laptop", "ThinkPad X1 Carbon", "Ava Chen", "Chicago / 42", "Deployed", "2027-04-30"),
            ("DT-2104", "Desktop", "OptiPlex 7010", "Unassigned", "Chicago / 42", "In stock", "2026-12-15"),
            ("MD-1486", "Mobile", "iPhone 15", "Priya Nair", "Singapore", "Deployed", "2027-09-01"),
            ("SV-1685", "Server", "PowerEdge R760", "Infrastructure", "Chicago / DC1", "Maintenance", "2029-01-31"),
            ("SW-4412", "Switch", "Northbridge 48P", "Network Ops", "Chicago / 42", "End of support", "2026-09-30"),
            ("SW-4413", "Switch", "Northbridge 48P", "Network Ops", "Chicago / 42", "End of support", "2026-09-30"),
            ("FW-0091", "Firewall", "EdgeGuard 3200", "Security Ops", "Chicago / DC1", "Active", "2028-06-30"),
            ("AP-7720", "Access point", "AirLink 6E", "Workplace", "Chicago / 42", "Active", "2028-02-28"),
        ]
        writer.writerows(rows)


def write_text_files() -> None:
    policy = """CHANGE MANAGEMENT POLICY
IntelliStack Systems · Global Platform Operations · Version 4.2

1. Scope
This policy governs every change to production infrastructure, platform services and
customer-facing integrations operated by IntelliStack Systems.

2. Change classes
Standard  Pre-approved, low risk, repeatable, documented in the change catalogue.
Normal    Requires approval by the service owner and the change advisory board.
Emergency Requires incident commander approval and retrospective review within 5 days.

3. Required records
Every change must record: requester, service, risk assessment, implementation plan,
verification steps, rollback plan, maintenance window and approver.

4. Approval authority
Normal changes require a Level 2 approval. Emergency changes require a Level 3 approval
and must be linked to an incident. Approval must be recorded before implementation.
"""
    with open(os.path.join(OUT, "Change-Management-Policy.txt"), "w", encoding="utf-8") as handle:
        handle.write(policy)

    sla = {
        "extract": "SLA compliance extract",
        "period": "2026-10-01 to 2026-10-31",
        "generatedAt": iso(4),
        "targets": {"P1": "4h response / 8h resolution", "P2": "8h / 24h", "P3": "24h / 72h", "P4": "48h / 5d"},
        "results": [
            {"priority": "P1", "tickets": 34, "met": 33, "breached": 1, "compliance": 0.971},
            {"priority": "P2", "tickets": 128, "met": 126, "breached": 2, "compliance": 0.984},
            {"priority": "P3", "tickets": 412, "met": 407, "breached": 5, "compliance": 0.988},
            {"priority": "P4", "tickets": 273, "met": 271, "breached": 2, "compliance": 0.993},
        ],
        "notes": "Breaches are linked to change records and reviewed weekly by the service owner.",
    }
    with open(os.path.join(OUT, "SLA-Compliance-Extract.json"), "w", encoding="utf-8") as handle:
        json.dump(sla, handle, indent=2)


def main() -> None:
    write_docx()
    write_xlsx()
    write_pptx()
    write_pdf()
    write_png()
    write_csv()
    write_text_files()

    manifest = []
    for name in sorted(os.listdir(OUT)):
        if name == "manifest.json":
            continue
        path = os.path.join(OUT, name)
        manifest.append(
            {
                "fileName": name,
                "bytes": os.path.getsize(path),
            }
        )
    with open(os.path.join(OUT, "generated-files.json"), "w", encoding="utf-8") as handle:
        json.dump({"generatedAt": iso(0), "files": manifest}, handle, indent=2)
    print("Generated", len(manifest), "documents in", OUT)
    for item in manifest:
        print(f"  {item['fileName']:36} {item['bytes']:>9,} bytes")


if __name__ == "__main__":
    main()
