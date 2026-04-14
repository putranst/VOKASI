from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from services.seeding_service import init_sample_data
import sql_models as models

router = APIRouter(
    prefix="/api/v1/debug",
    tags=["Debug & Maintenance"]
)

@router.post("/reset-data")
def reset_system_data(db: Session = Depends(get_db)):
    """
    NUCLEAR OPTION: Wipes most data and resets to pristine sample state.
    Used for reliable demo resets and automated testing.
    """
    try:
        init_sample_data(db, force=True)
        
        # Return stats
        stats = {
            "projects": db.query(models.CDIOProject).count(),
            "courses": db.query(models.Course).count(),
            "modules": db.query(models.CourseModule).count(),
            "status": "System Reset Successful"
        }
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Reset failed: {str(e)}"
        )
