from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import uuid

from .db.session import get_db, engine, Base
from .db.models import MasterCitizen, DepartmentLink
from .core.resolver import EntityResolver

# Initialize Database
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Maharashtra MDM Service", version="2.0.0")
resolver = EntityResolver()

# --- Models ---
class CitizenRecord(BaseModel):
    dept_id: str
    record_id: str
    name: str
    dob: str
    address: str
    phone: Optional[str] = None

class ResolveRequest(BaseModel):
    name: str
    dob: str
    address: str
    phone: Optional[str] = None

class ResolveResponse(BaseModel):
    master_id: str
    confidence: float
    status: str # AUTO_LINKED, MANUAL_REVIEW, NEW_IDENTITY

# --- Endpoints ---
@app.post("/mdm/resolve", response_model=ResolveResponse)
async def resolve(req: ResolveRequest, db: Session = Depends(get_db)):
    # 1. Candidate Selection (Blocking)
    # In a real system with millions, we would use ElasticSearch or Postgres pg_trgm for candidate selection
    candidates = db.query(MasterCitizen).filter(
        (MasterCitizen.dob == req.dob) | (MasterCitizen.phone == req.phone)
    ).all()
    
    best_score = 0.0
    best_citizen = None
    
    for citizen in candidates:
        score = resolver.calculate_total_score(req, citizen)
        if score > best_score:
            best_score = score
            best_citizen = citizen
            
    # 2. Decision Logic
    if best_score >= 0.90:
        # Auto-link
        if not best_citizen:
            # Create new master if no candidate matched high enough
            new_id = f"MC-{uuid.uuid4().hex[:6].upper()}"
            new_citizen = MasterCitizen(
                master_id=new_id, name=req.name, dob=req.dob, address=req.address, phone=req.phone
            )
            db.add(new_citizen)
            db.commit()
            best_citizen = new_citizen
            
        return ResolveResponse(master_id=best_citizen.master_id, confidence=best_score, status="AUTO_LINKED")
        
    elif best_score >= 0.70:
        return ResolveResponse(
            master_id=best_citizen.master_id if best_citizen else "PENDING", 
            confidence=best_score, 
            status="MANUAL_REVIEW"
        )
    else:
        # Create new identity
        new_id = f"MC-{uuid.uuid4().hex[:6].upper()}"
        new_citizen = MasterCitizen(
            master_id=new_id, name=req.name, dob=req.dob, address=req.address, phone=req.phone
        )
        db.add(new_citizen)
        db.commit()
        return ResolveResponse(master_id=new_id, confidence=0.0, status="NEW_IDENTITY")

@app.get("/mdm/master/{master_id}")
async def get_master(master_id: str, db: Session = Depends(get_db)):
    citizen = db.query(MasterCitizen).filter(MasterCitizen.master_id == master_id).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Master Citizen not found")
    return {
        "master_id": citizen.master_id, 
        "profile": {
            "name": citizen.name, "dob": citizen.dob, "address": citizen.address, "phone": citizen.phone
        }
    }

@app.get("/mdm/stats")
async def get_stats(db: Session = Depends(get_db)):
    return {
        "total_master_records": db.query(MasterCitizen).count(),
        "total_links": db.query(DepartmentLink).count()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
