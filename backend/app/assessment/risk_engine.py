from typing import Dict, Any

CRITICALITY_MULTIPLIERS = {
    "CRITICAL": 1.2,
    "HIGH": 1.0,
    "MEDIUM": 0.8,
    "LOW": 0.6
}

EXPOSURE_MULTIPLIERS = {
    "EXTERNAL_AUTHORIZED": 1.0,
    "INTERNAL_LAB": 0.85
}

CONFIDENCE_MULTIPLIERS = {
    "CONFIRMED": 1.0,
    "HIGH": 0.9,
    "HEURISTIC": 0.75
}

def calculate_risk_score(
    cvss_score: float,
    asset_criticality: str = "HIGH",
    mode: str = "INTERNAL_LAB",
    confidence: str = "CONFIRMED"
) -> int:
    """
    Multi-factor risk score calculation engine.
    Calculates normalized risk score between 0 and 100 based on technical severity,
    asset criticality, network exposure factor, and evidence confidence.
    """
    raw_risk = max(0.0, min(10.0, float(cvss_score))) * 10.0
    criticality_mult = CRITICALITY_MULTIPLIERS.get(asset_criticality.upper(), 1.0)
    exposure_mult = EXPOSURE_MULTIPLIERS.get(mode.upper(), 0.85)
    confidence_mult = CONFIDENCE_MULTIPLIERS.get(confidence.upper(), 1.0)

    calculated = raw_risk * criticality_mult * exposure_mult * confidence_mult
    return max(0, min(100, int(round(calculated))))

def map_severity_to_cvss(severity: str) -> float:
    """
    Maps text severity level to standard baseline CVSS v3.1 score.
    """
    sev_upper = severity.upper()
    if sev_upper == "CRITICAL":
        return 9.5
    elif sev_upper == "HIGH":
        return 7.5
    elif sev_upper == "MEDIUM":
        return 5.3
    elif sev_upper == "LOW":
        return 3.1
    return 0.0
