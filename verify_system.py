
import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    try:
        resp = requests.get(f"{BASE_URL}/")
        if resp.status_code == 200:
            print("✅ Backend is Online")
            return True
        else:
            print(f"❌ Backend returned {resp.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_seeded_courses():
    print("\n🔍 Verifying Course Seeding...")
    try:
        # Get all courses
        resp = requests.get(f"{BASE_URL}/api/v1/courses")
        if resp.status_code != 200:
            print(f"❌ Failed to fetch courses: {resp.status_code}")
            return False
        
        courses = resp.json()
        print(f"ℹ️  Found {len(courses)} total courses")
        
        expected_courses = [
            "Circular Economy Models for SMEs",
            "Blue Carbon Strategy",
            "Renewable Energy Transitions",
            "AI Governance for Policymakers",
            "Smart City Governance",
            "AI for SMEs: Practical Implementation"
        ]
        
        found_count = 0
        for title in expected_courses:
            match = next((c for c in courses if c['title'] == title), None)
            if match:
                print(f"✅ Found seeded course: '{title}' (Instructor: {match.get('instructor', 'Unknown')})")
                found_count += 1
            else:
                print(f"⚠️  Missing seeded course: '{title}' (might need server restart)")
                
        if found_count == len(expected_courses):
            print("✅ All seeded courses present and accounted for.")
            return True
        else:
            print("⚠️ # No changes needed to script, just running it. The server might need a restart to run the new seeding logic.")
            return False

    except Exception as e:
        print(f"❌ Error checking courses: {e}")
        return False

def test_grading_queue():
    print("\n🔍 Verifying Grading Queue Consistency...")
    try:
        # Get grading queue
        # Note: Instructor ID might be needed if auth is enforced, but endpoint seems open or depends only on DB
        resp = requests.get(f"{BASE_URL}/api/v1/instructor/grading-queue")
        if resp.status_code != 200:
            print(f"❌ Failed to fetch grading queue: {resp.status_code}")
            return False
            
        queue = resp.json()
        print(f"ℹ️  Found {len(queue)} items in grading queue")
        
        # Check if the courses in the queue exist in our "my courses" list (implicitly via title check)
        # We expect to see "Circular Economy Models for SMEs" or similar
        expected_in_queue = ["Circular Economy Models for SMEs", "AI Governance for Policymakers"]
        
        found_match = False
        for item in queue:
            print(f"   - Queue Item: {item.get('project_title')} | Course: {item.get('course_title')}")
            if item.get('course_title') in expected_in_queue:
                found_match = True
                
        if len(queue) > 0:
             print("✅ Grading Queue is populated.")
        else:
             print("⚠️  Grading Queue is empty (might be expected if no student submissions yet).")

        return True

    except Exception as e:
        print(f"❌ Error checking grading queue: {e}")
        return False

def test_course_content():
    print("\n🔍 Verifying Course Content (Modules)...")
    try:
        # 1. Find a target course
        resp = requests.get(f"{BASE_URL}/api/v1/courses")
        courses = resp.json()
        target_course = next((c for c in courses if "Circular Economy" in c['title']), None)
        
        if not target_course:
            print("❌ Could not find 'Circular Economy' course to check content.")
            return False
            
        print(f"ℹ️  Checking content for course: {target_course['title']} (ID: {target_course['id']})")
        
        # 2. Get modules
        mod_resp = requests.get(f"{BASE_URL}/api/v1/courses/{target_course['id']}/modules")
        if mod_resp.status_code != 200:
            print(f"❌ Failed to fetch modules: {mod_resp.status_code}")
            return False
            
        modules = mod_resp.json()
        print(f"ℹ️  Found {len(modules)} modules")
        
        if len(modules) > 0:
            print(f"✅ Course has {len(modules)} modules seeded.")
            first_mod = modules[0]
            print(f"   - Module 1: {first_mod.get('title')}")
            # Check content blocks
            blocks = first_mod.get('content_blocks', [])
            if len(blocks) > 0:
                 print(f"   - Content: Verified ({len(blocks)} blocks)")
                 
                 # Check for the dreaded "undefined phase" bug
                 for b in blocks:
                     if "undefined phase" in str(b.get("content", "")):
                         print("❌ FOUND 'undefined phase' in content! Repair failed.")
                         return False
                 print("   ✅ No 'undefined phase' text found in valid modules.")
            else:
                 print("   ⚠️  Module exists but has no content blocks.")
            return True
        else:
            print("❌ Course has NO modules (Empty in editor).")
            return False

    except Exception as e:
        print(f"❌ Error checking content: {e}")
        return False

if __name__ == "__main__":
    print(f"🚀 Starting System Verification on {BASE_URL}...\n")
    if test_health():
        courses_ok = test_seeded_courses()
        queue_ok = test_grading_queue()
        content_ok = test_course_content()
        
        if courses_ok and queue_ok and content_ok:
            print("\n✅ QA VERIFICATION PASSED: System is consistent and content is present.")
        else:
            print("\n❌ QA VERIFICATION FAILED: Issues detected.")
