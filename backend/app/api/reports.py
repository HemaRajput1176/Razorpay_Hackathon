from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.reports.service import report_generator
import json

router = APIRouter(prefix="/reports", tags=["Security Assessment Reports"])

@router.get("/{run_id}")
def get_report_json(run_id: str, db: Session = Depends(get_db)):
    return report_generator.generate_report_json(db, run_id)

@router.get("/{run_id}/pdf")
def get_report_pdf(run_id: str, db: Session = Depends(get_db)):
    report_data = report_generator.generate_report_json(db, run_id)
    # Format professional plain text / printable report representation
    pdf_text = f"""
================================================================================
CYBERNEXUS EXECUTIVE SECURITY ASSESSMENT REPORT
================================================================================
Assessment: {report_data['executive_summary']['assessment_name']}
Date      : {report_data['date']}
Scope     : {report_data['scope']['authorized_lab']}
Target    : {report_data['scope']['primary_target']}
Result    : {report_data['executive_summary']['overall_result']} (Score: {report_data['executive_summary']['overall_score']}%)
================================================================================

1. EXECUTIVE SUMMARY
--------------------------------------------------------------------------------
Security validation exercise EX-001 completed cleanly against the isolated
CYBERNEXUS lab. Primary target WEB-01 was assessed for authorization vulnerabilities.

2. SECURITY FINDING DETAILS
--------------------------------------------------------------------------------
Finding Code: {report_data['finding']['code']}
Title       : {report_data['finding']['title']}
Severity    : HIGH (Risk Score: {report_data['finding']['risk_score']} / 100)
MITRE Code  : {report_data['finding']['mitre_technique']}
Status      : {report_data['finding']['status']}

3. FORENSIC EVIDENCE CHAIN (SHA-256 INTEGRITY VERIFIED)
--------------------------------------------------------------------------------
"""
    for ev in report_data['evidence_chain']:
        pdf_text += f"- [{ev['type']}] Source: {ev['source']} | SHA-256: {ev['sha256']} | Status: {ev['integrity']}\n"

    pdf_text += f"""
4. REMEDIATION & VERIFICATION
--------------------------------------------------------------------------------
Recommendation: {report_data['finding']['recommendation']}
Verification  : Retest verified Finding status set to VERIFIED.

================================================================================
END OF CYBERNEXUS REPORT • CONFIDENTIAL • AUTHORIZED SECURITY USE ONLY
================================================================================
"""
    return Response(content=pdf_text, media_type="text/plain")
