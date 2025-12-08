import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_ai_grading():
    print("Testing AI Grading Agent...")
    
    # 0. Create a course
    print("\n[0] Creating test course...")
    course_data = {
        "title": "AI Grading Test Course",
        "instructor": "Test Instructor",
        "org": "Test Org",
        "image": "https://example.com/image.png",
        "level": "Beginner",
        "description": "Test Course",
        "duration": "1 week"
    }
    course_id = 9 # Default fallback
    try:
        print("Sending course creation request...")
        resp = requests.post(f"{BASE_URL}/courses", json=course_data, timeout=30)
        if resp.status_code in [200, 201]:
            course = resp.json()
            course_id = course['id']
            print(f"[SUCCESS] Course created: ID {course_id}")
        else:
            print(f"[WARNING] Failed to create course: {resp.text}. Using default ID 9.")
    except Exception as e:
        print(f"[WARNING] Error creating course: {e}. Using default ID 9.")

    # 1. Enroll in course (creates project)
    print("\n[1] Enrolling in course...")
    enrollment_data = {
        "user_id": 1,
        "course_id": course_id
    }
    try:
        print("Sending enrollment request...")
        resp = requests.post(f"{BASE_URL}/enrollments", json=enrollment_data, timeout=30)
        if resp.status_code in [200, 201]:
            print(f"[SUCCESS] Enrolled successfully")
        elif resp.status_code == 400 and "already enrolled" in resp.text:
             print(f"[WARNING] Already enrolled")
        else:
            print(f"[ERROR] Failed to enroll: {resp.text}")
            return
    except Exception as e:
        print(f"[ERROR] Error enrolling: {e}")
        return

    # 2. Get Project ID
    print("\n[2] Fetching project ID...")
    try:
        print("Sending get projects request...")
        resp = requests.get(f"{BASE_URL}/users/1/projects", timeout=30)
        if resp.status_code == 200:
            projects = resp.json()
            # Find project for our course
            project = next((p for p in projects if p['course_id'] == course_id), None)
            if project:
                project_id = project['id']
                print(f"[SUCCESS] Found project: ID {project_id}")
            else:
                print(f"[ERROR] Project not found for course {course_id}")
                return
        else:
            print(f"[ERROR] Failed to fetch projects: {resp.text}")
            return
    except Exception as e:
        print(f"[ERROR] Error fetching projects: {e}")
        return

    # 2. Submit a charter (Conceive phase)
    print("\n[3] Submitting charter...")
    charter_data = {
        "problem_statement": "Small businesses struggle to adopt AI due to lack of technical expertise.",
        "success_metrics": "Adoption rate of 20% within 6 months.",
        "target_outcome": "A user-friendly AI agent platform.",
        "constraints": "Low budget, no coding required for end users.",
        "stakeholders": "SME owners, employees, customers."
    }
    try:
        print(f"Sending charter submission request for project {project_id}...")
        resp = requests.post(f"{BASE_URL}/projects/{project_id}/charter", json=charter_data, timeout=30)
        if resp.status_code in [200, 201]:
            print(f"[SUCCESS] Charter submitted")
        else:
            print(f"[ERROR] Failed to submit charter: {resp.text}")
            return
    except Exception as e:
        print(f"[ERROR] Error submitting charter: {e}")
        return

    # 3. Request AI Grading
    print("\n[4] Requesting AI Grade...")
    try:
        print("Sending grading request...")
        resp = requests.post(f"{BASE_URL}/projects/{project_id}/grade", timeout=30) # Longer timeout for AI
        if resp.status_code == 200:
            feedback = resp.json()
            print(f"[SUCCESS] Grading successful!")
            print(json.dumps(feedback, indent=2))
            
            # Verify structure
            required_keys = ["grade", "score", "feedback", "strengths", "weaknesses"]
            if all(key in feedback for key in required_keys):
                print("[SUCCESS] Response structure valid")
            else:
                print(f"[ERROR] Invalid response structure. Missing keys: {[k for k in required_keys if k not in feedback]}")
        else:
            print(f"[ERROR] Grading failed: {resp.text}")
    except Exception as e:
        print(f"[ERROR] Error requesting grade: {e}")

    print("\n[INFO] Test Complete")

if __name__ == "__main__":
    test_ai_grading()
