import requests
import json

BASE_URL = "http://localhost:8000"
COURSE_ID = 1
USER_ID = 1  # Alice or whoever

def trigger_enrollment():
    url = f"{BASE_URL}/api/v1/enrollments"
    payload = {
        "user_id": USER_ID,
        "course_id": COURSE_ID
    }
    print(f"Sending POST to {url} with {payload}")
    try:
        response = requests.post(url, json=payload)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_enrollment()
