import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_instructor_dashboard():
    print("Testing Instructor Dashboard API...")
    
    try:
        # 1. Fetch grading queue
        print(f"\n[1] Fetching grading queue...")
        response = requests.get(f"{BASE_URL}/instructor/grading-queue")
        
        if response.status_code == 200:
            queue = response.json()
            print(f"✅ Fetch successful. Found {len(queue)} items.")
            
            if len(queue) > 0:
                item = queue[0]
                print("   Sample item:")
                print(f"   - ID: {item.get('id')}")
                print(f"   - Student: {item.get('student_name')}")
                print(f"   - Project: {item.get('project_title')}")
                print(f"   - Status: {item.get('status')}")
                
                # Verify keys match frontend expectation
                expected_keys = ['id', 'project_id', 'student_name', 'project_title', 'submission_type', 'course_title', 'submitted_at', 'status']
                missing_keys = [k for k in expected_keys if k not in item]
                
                if not missing_keys:
                    print("✅ Data structure matches frontend expectations")
                else:
                    print(f"❌ Missing keys: {missing_keys}")
            else:
                print("⚠️ Queue is empty (might be expected if no pending projects)")
        else:
            print(f"❌ Fetch failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_instructor_dashboard()
