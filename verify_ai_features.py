import requests
import json
import sys
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_companion_chat():
    print("\n--- Testing AI Companion Chat ---")
    url = f"{BASE_URL}/ai/companion-chat"
    payload = {
        "user_message": "Hello, I need help with my project.",
        "current_page": "/dashboard",
        "user_context": {"role": "student"},
        "conversation_history": []
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

def test_socratic_chat():
    print("\n--- Testing Socratic Tutor ---")
    url = f"{BASE_URL}/ai/socratic-chat"
    payload = {
        "project_id": 1, # Assuming project 1 exists, otherwise we might need to mock or create one.
        # Ideally we fetch a project first, but let's try with 1.
        "user_message": "How do I start designing the architecture?",
        "conversation_history": [],
        "design_context": {},
        "phase": "design"
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

def test_code_execution():
    print("\n--- Testing Code Execution (Python) ---")
    url = f"{BASE_URL}/code/execute"
    payload = {
        "code": "print('Hello from Verification Script')",
        "language": "python"
    }
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False

def main():
    print("Starting AI Features Verification...")
    
    # Check if server is running
    try:
        requests.get("http://localhost:8000/", timeout=2)
    except:
        print("Backend server seems to be offline. Starting it...")
        # We assume the user or agent will start it.
        # But for this script, we just fail if not running.
        print("!! User Warning: Please ensure backend is running !!")
        return

    c_ok = test_companion_chat()
    s_ok = test_socratic_chat()
    e_ok = test_code_execution()
    
    if c_ok and s_ok and e_ok:
        print("\n✅ All AI features verified successfully!")
    else:
        print("\n❌ Some AI features failed verification.")

if __name__ == "__main__":
    main()
