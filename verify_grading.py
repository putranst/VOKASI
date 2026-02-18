
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print("1. Testing Submit Iteration Endpoint...")
    
    # Data for a mock iteration submission
    submission_data = {
        "iteration_number": 1,
        "hypothesis": "Test Hypothesis for Grading",
        "prototype_url": "http://github.com/test/repo",
        "code_snapshot": "print('Hello World')",
        "learnings": "We learned that testing is important.",
        "next_hypothesis": "Next we will test the grading.",
        "user_id": 1  # Assuming user ID 1 exists (usually admin/student)
    }
    
    # We need a valid course ID. Assuming 1 exists based on seed data context usually present.
    course_id = 1
    
    try:
        print("0. Checking Project Status...")
        proj_url = f"{BASE_URL}/api/v1/projects/1"
        proj_res = requests.get(proj_url)
        if proj_res.status_code == 200:
             print("SUCCESS: Project found.")
             print("Implementation Data:", json.dumps(proj_res.json().get("implementation"), indent=2))
        else:
             print(f"WARNING: Project GET failed {proj_res.status_code}")

        url = f"{BASE_URL}/api/v1/projects/{course_id}/iteration"
        print(f"POST {url}")
        response = requests.post(url, json=submission_data)
        
        if response.status_code != 200:
            print(f"FAILED: Status {response.status_code}")
            print(response.text)
            return
            
        iteration = response.json()
        iteration_id = iteration.get("id")
        print(f"SUCCESS: Iteration submitted. ID: {iteration_id}")
        
        print("\n2. Testing Grading Endpoint...")
        if not iteration_id:
            print("FAILED: No iteration ID returned.")
            return

        grade_url = f"{BASE_URL}/api/v1/ai/grade-iteration/{iteration_id}"
        print(f"POST {grade_url}")
        
        # This might take a few seconds as it calls AI (or mock if env vars missing)
        grade_response = requests.post(grade_url)
        
        if grade_response.status_code != 200:
            print(f"FAILED: Status {grade_response.status_code}")
            print(grade_response.text)
            return
            
        feedback = grade_response.json()
        print("SUCCESS: Grading Complete!")
        print(json.dumps(feedback, indent=2))
        
        # Verify structure
        required_keys = ["grade", "score", "feedback", "strengths", "weaknesses"]
        missing = [k for k in required_keys if k not in feedback]
        if missing:
            print(f"WARNING: Missing keys in feedback: {missing}")
        else:
            print("Structure verified.")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    run_test()
