"""
Quick verification of grading queue fixes
"""
import requests
import json

print("=" * 70)
print("GRADING QUEUE VERIFICATION")
print("=" * 70)

# Test backend endpoint
try:
    response = requests.get('http://localhost:8000/api/v1/instructor/grading-queue')
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Backend Endpoint: WORKING")
        print(f"   Status Code: {response.status_code}")
        print(f"   Total Items: {len(data)}")
        
        # Count by type
        charters = sum(1 for item in data if item['submission_type'] == 'Charter')
        blueprints = sum(1 for item in data if item['submission_type'] == 'Blueprint')
        implementations = sum(1 for item in data if item['submission_type'] == 'Implementation')
        
        print(f"\n   Breakdown:")
        print(f"   - Charters: {charters}")
        print(f"   - Blueprints: {blueprints}")
        print(f"   - Implementations: {implementations}")
        
        # Count by status
        pending = sum(1 for item in data if item['status'] == 'Pending')
        graded = sum(1 for item in data if item['status'] == 'Graded')
        
        print(f"\n   Status:")
        print(f"   - Pending: {pending}")
        print(f"   - Graded: {graded}")
        
        # Show first 3 items
        print(f"\n   Sample Submissions:")
        for i, item in enumerate(data[:3], 1):
            print(f"   {i}. {item['student_name']} - {item['submission_type']}")
            print(f"      Course: {item['course_title']}")
            print(f"      Status: {item['status']}")
            print()
    else:
        print(f"\n❌ Backend Endpoint: FAILED")
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print(f"\n❌ Backend Endpoint: CONNECTION ERROR")
    print(f"   Make sure the backend server is running on http://localhost:8000")
except Exception as e:
    print(f"\n❌ Backend Endpoint: ERROR")
    print(f"   Error: {str(e)}")

print("\n" + "=" * 70)
print("NEXT STEPS:")
print("=" * 70)
print("1. Clear browser cache")
print("2. Login as Prof. Mats (mats@uid.or.id / test)")
print("3. Navigate to http://localhost:3000/instructor/grading")
print("4. Verify grading queue displays correctly")
print("=" * 70)
