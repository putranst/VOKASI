import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_charter_suggestions():
    print("\nTesting Charter Suggestions...")
    payload = {
        "problem_statement": "Small business owners receive 50+ sales inquiries daily but only 10% convert into actual clients because they lack budget. Business owners waste 3 hours/day on low-value leads instead of serving paying customers.",
        "success_metrics": "Reduce time spent on unqualified leads by 80%, automatically filter leads based on budget.",
        "course_id": 9,
        "target_outcome": "AI-powered lead qualification agent"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ai/charter-suggestions", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"Suggested Tools: {data.get('suggested_tools')}")
            print(f"Reasoning: {data.get('reasoning')}")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_socratic_chat():
    print("\nTesting Socratic Chat...")
    payload = {
        "project_id": 1,
        "user_message": "Should I use regex to extract the budget?",
        "conversation_history": [],
        "design_context": {
            "logic_flow": "User sends message -> Extract budget",
            "components": ["WhatsApp Handler"],
            "data_flow": "WhatsApp -> Backend"
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ai/socratic-chat", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"AI Response: {data.get('ai_response')}")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("Starting AI API Verification...")
    charter_success = test_charter_suggestions()
    socratic_success = test_socratic_chat()
    
    if charter_success and socratic_success:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed.")
        sys.exit(1)
