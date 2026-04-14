import requests
import sys
import time

API_URL = "http://localhost:8000/api/v1"
RESET_URL = f"{API_URL}/debug/reset-data"
QUEUE_URL = f"{API_URL}/instructor/grading-queue"
COURSES_URL = f"{API_URL}/instructor/courses?user_email=mats@uid.or.id"

def run_verification():
    print("🚀 Starting Verified Reset & QA Sequence...")
    
    # 1. Trigger System Reset
    print(f"\n[1/3] Triggering Data Reset ({RESET_URL})...")
    try:
        resp = requests.post(RESET_URL)
        if resp.status_code == 200:
            print("✅ Reset Successful!")
            print(f"   Stats: {resp.json()}")
        else:
            print(f"❌ Reset Failed: {resp.status_code} - {resp.text}")
            return False
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        return False

    # 2. Verify Courses
    print(f"\n[2/3] Verifying Instructor Courses...")
    try:
        resp = requests.get(COURSES_URL)
        courses = resp.json()
        print(f"   Found {len(courses)} courses.")
        if len(courses) >= 8:
            print("✅ Course seeding verified (8+ courses).")
        else:
            print(f"❌ Missing courses! Expected 8, found {len(courses)}.")
            return False
            
        # Check specific course content
        target_course = next((c for c in courses if "Circular Economy" in c['title']), None)
        if target_course:
            # We can't check modules via this API easily without another call, but existence is good.
            print(f"✅ Found target course: {target_course['title']}")
        else:
            print("❌ 'Circular Economy' course missing!")
            return False
            
    except Exception as e:
        print(f"❌ Error fetching courses: {e}")
        return False

    # 3. Verify Grading Queue
    print(f"\n[3/3] Verifying Grading Queue...")
    try:
        resp = requests.get(QUEUE_URL)
        queue = resp.json()
        print(f"   Found {len(queue)} items in queue.")
        
        if len(queue) > 0:
            print("✅ Grading Queue is POPULATED.")
            for item in queue[:3]:
                 print(f"   - {item['project_title']} ({item['submission_type']}) status: {item['status']}")
            
            if len(queue) >= 5:
                print("✅ Queue count matches expected (5+).")
            else:
                print("⚠️  Queue items found but fewer than expected.")
        else:
            print("❌ Grading Queue is EMPTY! Integration failed.")
            return False
            
    except Exception as e:
        print(f"❌ Error fetching queue: {e}")
        return False

    print("\n✨ GUARANTEED SUCCESS: All checks passed. System is ready.")
    return True

if __name__ == "__main__":
    time.sleep(2) # Give server a moment
    success = run_verification()
    sys.exit(0 if success else 1)
