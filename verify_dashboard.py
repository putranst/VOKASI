
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print("Testing Student Dashboard Integration...")
    
    user_id = 1
    
    # 1. Get Dashboard Data
    url = f"{BASE_URL}/api/v1/student/dashboard?user_id={user_id}"
    print(f"GET {url}")
    
    try:
        res = requests.get(url)
        if res.status_code != 200:
            print(f"Failed to get dashboard: {res.status_code} {res.text}")
            return
            
        data = res.json()
        projects = data.get('iris_projects', [])
        
        print(f"Found {len(projects)} active projects.")
        
        for p in projects:
            print(f"Project [{p['project_title']}] Phase: {p.get('current_phase')}")
            
            # Check for AI Feedback
            if 'ai_feedback' in p:
                feedback = p['ai_feedback']
                print(f"  [SUCCESS] AI Feedback Found:")
                print(f"    Grade: {feedback.get('grade')}")
                print(f"    Score: {feedback.get('score')}")
            else:
                print(f"  [INFO] No AI Feedback found (might not be graded yet)")

            # Check for Scale Completion (Mock logic check)
            if p.get('current_phase') == 'completed' or p.get('current_phase') == 'scale':
                 print(f"  [SUCCESS] Scale Phase Active/Completed.")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    run_test()
