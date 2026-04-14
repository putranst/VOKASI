"""
Script to add grading queue endpoint to main.py
"""

# Read main.py
with open('backend/main.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line after "return result" around line 547
insert_index = None
for i, line in enumerate(lines):
    if i >= 545 and i <= 550:
        if 'return result' in line:
            # Find the next blank line after this
            for j in range(i+1, min(i+5, len(lines))):
                if lines[j].strip() == '':
                    insert_index = j + 1
                    break
            if insert_index:
                break

if not insert_index:
    print("Could not find insertion point")
    exit(1)

print(f"Found insertion point at line {insert_index}")

# Prepare the code to insert
grading_endpoint_code = '''
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

'''

# Insert the code
lines.insert(insert_index, grading_endpoint_code)

# Write back
with open('backend/main.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f"Successfully added grading queue endpoint at line {insert_index}")
