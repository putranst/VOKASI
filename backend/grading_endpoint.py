"""
Grading Queue Endpoint - Add this to main.py after line 547
"""

# ===== INSTRUCTOR GRADING QUEUE =====

@app.get("/api/v1/instructor/grading-queue")
def get_grading_queue(
    instructor_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get all pending submissions for an instructor's courses.
    Returns charters, blueprints, and implementations that need grading.
    """
    grading_items = []
    
    # Get all projects with submissions
    projects = db.query(models.CDIOProject).all()
    
    for project in projects:
        # Get student info
        student = db.query(models.User).filter(models.User.id == project.user_id).first()
        if not student:
            continue
            
        # Get course info
        course = db.query(models.Course).filter(models.Course.id == project.course_id).first()
        if not course:
            continue
        
        # If instructor_id is provided, filter by instructor's courses
        if instructor_id and course.instructor_id != instructor_id:
            continue
        
        # Check for charter submission
        if project.charter:
            grading_items.append({
                "id": project.charter.id,
                "project_id": project.id,
                "student_name": student.full_name,
                "project_title": project.title,
                "submission_type": "Charter",
                "course_title": course.title,
                "submitted_at": project.charter.created_at.strftime("%Y-%m-%d %H:%M") if project.charter.created_at else "N/A",
                "status": "Pending"
            })
        
        # Check for blueprint submission
        if project.blueprint:
            grading_items.append({
                "id": project.blueprint.id,
                "project_id": project.id,
                "student_name": student.full_name,
                "project_title": project.title,
                "submission_type": "Blueprint",
                "course_title": course.title,
                "submitted_at": project.blueprint.created_at.strftime("%Y-%m-%d %H:%M") if project.blueprint.created_at else "N/A",
                "status": "Pending"
            })
        
        # Check for implementation submission
        if project.implementation:
            # Check if already graded (has AI feedback)
            status = "Graded" if project.implementation.ai_feedback else "Pending"
            grading_items.append({
                "id": project.implementation.id,
                "project_id": project.id,
                "student_name": student.full_name,
                "project_title": project.title,
                "submission_type": "Implementation",
                "course_title": course.title,
                "submitted_at": project.implementation.created_at.strftime("%Y-%m-%d %H:%M") if project.implementation.created_at else "N/A",
                "status": status
            })
    
    # Sort by submitted_at (most recent first)
    grading_items.sort(key=lambda x: x["submitted_at"], reverse=True)
    
    return grading_items
