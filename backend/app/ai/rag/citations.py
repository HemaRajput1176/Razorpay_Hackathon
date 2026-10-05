import re
from typing import List, Dict, Any

CITATION_REGEX = r'\[(EVT|ALRT|INC|FND|EX|ASM|DOC|HYP|REC|AP|ACT)-[A-Za-z0-9_\-]+\]'

def extract_citations(text: str) -> List[str]:
    """
    Extracts all evidence citation codes like [EVT-102], [ALRT-SOC-8F92], [INC-0001], [FND-001].
    """
    if not text:
        return []
    matches = re.findall(CITATION_REGEX, text)
    full_citations = re.findall(r'\[[A-Za-z0-9_\-]+\]', text)
    return list(set(full_citations))

def validate_claim_citations(claim_text: str, available_evidence_codes: List[str]) -> Dict[str, Any]:
    """
    Verifies that claims in AI generated text explicitly cite available DB evidence codes.
    Calculates groundedness score (0 - 100%).
    """
    found_citations = extract_citations(claim_text)
    if not available_evidence_codes:
        return {"is_grounded": True, "precision": 100.0, "hallucinated_citations": []}

    valid_citations = [c for c in found_citations if any(code in c for code in available_evidence_codes)]
    hallucinated = [c for c in found_citations if c not in valid_citations]

    precision = (len(valid_citations) / len(found_citations) * 100.0) if found_citations else 100.0
    return {
        "is_grounded": len(hallucinated) == 0,
        "precision": precision,
        "valid_citations": valid_citations,
        "hallucinated_citations": hallucinated
    }
