import json
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.schemas import RAGDocument, RAGChunk

def extract_keywords(text: str) -> List[str]:
    """Extracts security domain keywords for RAG indexing."""
    words = re.findall(r'\b[A-Za-z0-9_\-\.]{3,}\b', text.lower())
    stop_words = {'the', 'and', 'for', 'that', 'this', 'with', 'from', 'are', 'was', 'were', 'have', 'has', 'had'}
    keywords = list(set([w for w in words if w not in stop_words]))
    return keywords[:20]

def ingest_rag_document(db: Session, document_code: str, title: str, doc_type: str, content: str) -> RAGDocument:
    """
    Ingests a knowledge base document, chunks it into ~300 word segments,
    extracts keywords, and stores it in database RAG tables.
    """
    # Check if doc exists
    existing = db.query(RAGDocument).filter(RAGDocument.document_code == document_code).first()
    if existing:
        db.delete(existing)
        db.commit()

    doc = RAGDocument(
        document_code=document_code,
        title=title,
        doc_type=doc_type,
        content=content
    )
    db.add(doc)
    db.flush()

    # Chunking
    paragraphs = content.split("\n\n")
    chunks = []
    chunk_index = 0
    current_chunk = ""

    for p in paragraphs:
        if len(current_chunk) + len(p) < 1000:
            current_chunk += p + "\n\n"
        else:
            if current_chunk.strip():
                kw = extract_keywords(current_chunk)
                chunk_obj = RAGChunk(
                    document_id=doc.id,
                    chunk_index=chunk_index,
                    chunk_text=current_chunk.strip(),
                    keywords_json=json.dumps(kw)
                )
                db.add(chunk_obj)
                chunk_index += 1
            current_chunk = p + "\n\n"

    if current_chunk.strip():
        kw = extract_keywords(current_chunk)
        chunk_obj = RAGChunk(
            document_id=doc.id,
            chunk_index=chunk_index,
            chunk_text=current_chunk.strip(),
            keywords_json=json.dumps(kw)
        )
        db.add(chunk_obj)

    db.commit()
    db.refresh(doc)
    return doc
