from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database.session import engine, Base, SessionLocal
from app.models.schemas import Asset, User
from app.labs.service import lab_service
from app.exercises.service import exercise_service
from app.assessment.service import assessment_service
from app.api import (
    health, auth, dashboard, soc, terminal, labs, websockets, exercises,
    incidents, findings, reports, assessments, threat_hunting, investigations, detection_rules, nexus, purple, risk_intel
)

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PRODUCT_NAME,
    version="8.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(soc.router, prefix=settings.API_V1_STR)
app.include_router(terminal.router, prefix=settings.API_V1_STR)
app.include_router(labs.router, prefix=settings.API_V1_STR)
app.include_router(websockets.router, prefix=settings.API_V1_STR)
app.include_router(exercises.router, prefix=settings.API_V1_STR)
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(findings.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(assessments.router, prefix=settings.API_V1_STR)
app.include_router(threat_hunting.router, prefix=settings.API_V1_STR)
app.include_router(investigations.router, prefix=settings.API_V1_STR)
app.include_router(detection_rules.router, prefix=settings.API_V1_STR)
app.include_router(nexus.router)
app.include_router(purple.router)
app.include_router(risk_intel.router)

@app.on_event("startup")
def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed default assets if empty
        if db.query(Asset).count() == 0:
            assets = [
                Asset(name="API-01", type="SERVER/API", ip_address="10.240.0.11", status="WARNING", environment="PRODUCTION", criticality="CRITICAL"),
                Asset(name="WEB-01", type="WEB APP", ip_address="10.240.0.10", status="ONLINE", environment="PRODUCTION", criticality="HIGH"),
                Asset(name="DB-01", type="DATABASE", ip_address="10.240.0.12", status="ONLINE", environment="PRODUCTION", criticality="CRITICAL"),
                Asset(name="LINUX-01", type="HOST", ip_address="10.240.0.23", status="COMPROMISED", environment="STAGING", criticality="HIGH"),
                Asset(name="CONTAINER-01", type="DOCKER POD", ip_address="10.240.0.30", status="ONLINE", environment="PRODUCTION", criticality="MEDIUM")
            ]
            db.add_all(assets)
            db.commit()
            
        # Seed default user if empty
        if db.query(User).count() == 0:
            user = User(
                username="analyst01",
                email="analyst@cybernexus.com",
                hashed_password="pbkdf2:sha256:default_hash",
                full_name="Analyst 01",
                role="CHIEF SECURITY ANALYST",
                organization="NEXORA ENTERPRISE LAB"
            )
            db.add(user)
            db.commit()

        # Seed Cyber Range Lab definition
        lab_service.seed_nexora_lab_if_missing(db)

        # Seed Default Security Exercise EX-001
        exercise_service.seed_default_exercise_if_missing(db)

        # Seed Default Security Assessment
        assessment_service.seed_default_assessment_if_missing(db)

    except Exception as e:
        print(f"[CYBERNEXUS SEED WARNING] {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "product": settings.PRODUCT_NAME,
        "status": "ONLINE",
        "milestone": "MILESTONE 8 - CONTINUOUS CYBER RISK INTELLIGENCE ENGINE",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }




