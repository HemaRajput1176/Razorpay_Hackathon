import json
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.schemas import RAGDocument, RAGChunk

def search_rag_chunks(db: Session, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Searches RAG chunks for query terms, scoring by term overlap.
    """
    query_terms = set(query.lower().split())
    all_chunks = db.query(RAGChunk).all()

    scored_chunks = []
    for chunk in all_chunks:
        text_lower = chunk.chunk_text.lower()
        score = sum(1 for term in query_terms if term in text_lower)
        if score > 0:
            doc = db.query(RAGDocument).filter(RAGDocument.id == chunk.document_id).first()
            scored_chunks.append({
                "chunk_id": chunk.id,
                "document_code": doc.document_code if doc else "DOC-000",
                "document_title": doc.title if doc else "Security Knowledgebase",
                "doc_type": doc.doc_type if doc else "THREAT_INTEL",
                "chunk_text": chunk.chunk_text,
                "score": score
            })

    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]
