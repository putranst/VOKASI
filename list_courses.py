import requests
import json

try:
    response = requests.get('http://localhost:8000/api/v1/courses')
    response.raise_for_status()
    courses = response.json()
    
    print(f"Found {len(courses)} courses:")
    print("-" * 50)
    for course in courses:
        print(f"ID: {course.get('id')} - Title: {course.get('title')}")
    print("-" * 50)
    
except Exception as e:
    print(f"Error fetching courses: {e}")
