import requests
import json
import time
import os

BASE_URL = "http://localhost:8000/api/v1"
INSTRUCTOR_EMAIL = "mats@uid.or.id"

def run_test():
    print("=== STARTING SYLLABUS PERSISTENCE TEST ===")
    
    # 1. Create a Dummy Course
    print("\n[Step 1] Creating a new course 'AI for Digital Marketers'...")
    # First get the user to get their ID/Name
    user_resp = requests.get(f"{BASE_URL}/users/email/{INSTRUCTOR_EMAIL}")
    if user_resp.status_code != 200:
        print(f"❌ Failed to get user: {user_resp.text}")
        return
    user = user_resp.json()
    print(f"   User found: ID {user['id']}, Name: {user['full_name']}")
    
    # We need to manually insert a course or use an endpoint if available.
    # Since there's no direct 'create course' API verified yet, we'll check if we can use an existing one 
    # OR replicate the "AI Verification" step by inserting directly to DB to be safe, 
    # BUT better to use the API if possible. The instructor dashboard fetches courses, doesn't create them directly via API documented in previous steps.
    # Let's check if we can POST to /api/v1/courses (standard REST)
    
    # ACTUALLY, let's just pick a random existing course to be safe, or create one if we can.
    # Let's try to find course ID 4 (which we saw earlier).
    course_id = 4
    print(f"   Using existing Course ID: {course_id}")

    # 2. Simulate File Upload & AI Generation
    print("\n[Step 2] Testing /api/v1/syllabus/generate with file upload...")
    
    # Create a dummy PDF/Text file
    dummy_content = "This is a sample syllabus content for Digital Marketing. Topics: SEO, SEM, Content Marketing."
    files = {
        'files': ('sample_syllabus.txt', dummy_content, 'text/plain')
    }
    data = {
        'course_id': course_id,
        'topic': 'AI for Digital Marketers',
        'description': 'Learn how to use AI generally.',
        'duration_weeks': 4,
        'level': 'Beginner',
        'hexahelix_sectors': 'Industry,Media'
    }
    
    print("   Uploading file and generating...")
    start_time = time.time()
    try:
        gen_resp = requests.post(f"{BASE_URL}/syllabus/generate", data=data, files=files)
        print(f"   Response Code: {gen_resp.status_code}")
        if gen_resp.status_code != 200:
            print(f"❌ Generation Failed: {gen_resp.text}")
            return
            
        generated_syllabus = gen_resp.json()
        print(f"   ✅ AI Generation Successful! Title: {generated_syllabus.get('title')}")
        print(f"   Sections Generated: {len(generated_syllabus.get('sections', []))}")
    except Exception as e:
        print(f"❌ API Call Failed: {e}")
        return

    # 3. Save the Syllabus
    print("\n[Step 3] Saving Syllabus to Database...")
    syllabus_payload = {
        "title": generated_syllabus['title'],
        "overview": generated_syllabus['overview'],
        "learning_outcomes": generated_syllabus['learning_outcomes'],
        "assessment_strategy": generated_syllabus['assessment_strategy'],
        "resources": generated_syllabus['resources'],
        "hexahelix_sectors": ["Industry", "Media"],
        "duration_weeks": 4,
        "sections": generated_syllabus['sections']
    }
    
    save_url = f"{BASE_URL}/courses/{course_id}/syllabus"
    save_resp = requests.post(save_url, json=syllabus_payload)
    
    if save_resp.status_code != 200:
        print(f"❌ Save Failed: {save_resp.text}")
        return
        
    save_data = save_resp.json()
    syllabus_id = save_data.get('id')
    print(f"   ✅ Save Successful! New Syllabus ID: {syllabus_id}")

    # 4. Persistence Check (Immediate)
    print("\n[Step 4] Verifying Persistence (Immediate Fetch)...")
    get_resp = requests.get(save_url)
    if get_resp.status_code != 200:
        print(f"❌ Fetch Failed: {get_resp.text}")
        return
        
    syllabi = get_resp.json()
    # Check if our new syllabus ID is in the list
    found = False
    for s in syllabi:
        if s['id'] == syllabus_id:
            found = True
            print(f"   ✅ Found Syllabus ID {syllabus_id} in database!")
            break
            
    if not found:
        print(f"❌ Syllabus ID {syllabus_id} NOT found in fetched list! Persistence failed.")
        print(f"   Fetched IDs: {[s['id'] for s in syllabi]}")
        return

    print("\n=== TEST PASSED: Backend Persistence is Working Correctly ===")

if __name__ == "__main__":
    run_test()
