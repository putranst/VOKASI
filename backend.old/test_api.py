import requests
import json

print("=== TESTING API ENDPOINTS ===\n")

BASE_URL = "http://localhost:8000"

# Test 1: Login as Mats
print("1. Testing Login...")
try:
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": "mats@uid.or.id", "password": "test"}
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        user_data = response.json()
        print(f"   User Data: {json.dumps(user_data, indent=2)}")
    else:
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"   Exception: {e}")

print()

# Test 2: Get all courses
print("2. Testing GET /api/v1/courses...")
try:
    response = requests.get(f"{BASE_URL}/api/v1/courses")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        courses = response.json()
        print(f"   Total Courses: {len(courses)}")
        mats_courses = [c for c in courses if c.get('instructor') == 'Mats Hanson']
        print(f"   Mats Hanson Courses: {len(mats_courses)}")
        for c in mats_courses:
            print(f"      - ID: {c['id']}, Title: {c['title']}")
    else:
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"   Exception: {e}")

print()

# Test 3: Create course (AI Course Generation simulation)
print("3. Testing POST /api/v1/courses (AI Course Generation)...")
course_data = {
    "title": "Test AI Generated Course",
    "instructor": "Mats Hanson",
    "org": "UID",
    "image": "https://example.com/image.jpg",
    "tag": "AI",
    "level": "Intermediate",
    "description": "Test course",
    "duration": "4 weeks",
    "institution_id": 5
}
try:
    response = requests.post(
        f"{BASE_URL}/api/v1/courses",
        json=course_data
    )
    print(f"   Status: {response.status_code}")
    if response.status_code in [200, 201]:
        created_course = response.json()
        print(f"   Created Course ID: {created_course.get('id')}")
    else:
        print(f"   Error Response: {response.text}")
        print(f"   Request Data: {json.dumps(course_data, indent=2)}")
except Exception as e:
    print(f"   Exception: {e}")

print()

# Test 4: Get projects for Mats' courses
print("4. Testing GET /api/v1/courses/{id}/projects...")
for course_id in [4, 5]:  # IDs from debug script
    try:
        response = requests.get(f"{BASE_URL}/api/v1/courses/{course_id}/projects")
        print(f"   Course {course_id} Status: {response.status_code}")
        if response.status_code == 200:
            projects = response.json()
            print(f"   Projects: {len(projects)}")
            for p in projects:
                print(f"      - {p.get('title')} (Phase: {p.get('current_phase')})")
    except Exception as e:
        print(f"   Exception: {e}")

print("\n=== TEST COMPLETE ===")
