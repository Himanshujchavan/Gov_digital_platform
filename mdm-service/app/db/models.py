from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from .session import Base
import datetime

class MasterCitizen(Base):
    __tablename__ = "master_citizens"
    master_id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    dob = Column(String, index=True)
    address = Column(String)
    phone = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class DepartmentLink(Base):
    __tablename__ = "department_links"
    id = Column(String, primary_key=True)
    master_id = Column(String, ForeignKey("master_citizens.master_id"), index=True)
    dept_id = Column(String, index=True)
    record_id = Column(String, index=True)
    confidence_score = Column(Float)
    linked_at = Column(DateTime, default=datetime.datetime.utcnow)
