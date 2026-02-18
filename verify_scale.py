
import requests
import json
import random

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print("Testing Scale Phase Endpoint...")
    
    course_id = 1
    # Assuming user_id=1 exists
    user_id = 1
    
    # 1. Get Project
    print(f"GET /projects?user_id={user_id}")
    try:
        res = requests.get(f"{BASE_URL}/api/v1/courses/{course_id}/projects?user_id={user_id}")
        if res.status_code != 200:
            print(f"Failed to get projects: {res.status_code} {res.text}")
            return
            
        projects = res.json()
        if not projects:
            print("No projects found for verification. Creating a dummy one requires existing implementation...")
            # We assume a project exists from previous "Iterate" testing.
            # If not, we might need to rely on manual verification.
            print("SKIPPING: No project found to scale.")
            return
            
        project = projects[0]
        print(f"Using Project ID: {project['id']}")
        
        # 2. Submit Scale Artifact
        scale_data = {
            "deployment_url": f"https://vercel.com/deploy/{random.randint(1000,9999)}",
            "deployment_platform": "vercel",
            "institutional_handoff": "Docs are in /docs folder",
            "stakeholder_training": "Held a workshop on Monday",
            "impact_metrics": {"users": 100, "uptime": "99.9%"},
            "sfia_evidence": {"level": "4", "skill": "PROG"}
        }
        
        url = f"{BASE_URL}/api/v1/projects/{course_id}/scale?user_id={user_id}"
        print(f"POST {url}")
        
        # Try finding the right project ID logic in main.py... it uses course_id and user_id to find project.
        res = requests.post(url, json=scale_data)
        
        if res.status_code == 200:
            print("SUCCESS: Scale data submitted.")
            print(json.dumps(res.json(), indent=2))
        else:
            print(f"FAILED: {res.status_code}")
            print(res.text)
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    run_test()
