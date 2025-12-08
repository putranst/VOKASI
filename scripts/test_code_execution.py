import requests
import json

def test_code_execution():
    url = "http://localhost:8000/api/v1/code/execute"
    
    # Test Case 1: Simple Print
    payload1 = {
        "code": "print('Hello from TSEA-X Reality Engine!')",
        "language": "python"
    }
    
    try:
        print("Testing simple print...")
        response = requests.post(url, json=payload1)
        if response.status_code == 200:
            result = response.json()
            print(f"Full Result: {result}")
            print(f"Success: {result['success']}")
            print(f"Output: {result['output']}")
            if result['output'].strip() == "Hello from TSEA-X Reality Engine!":
                print("✅ Test 1 Passed")
            else:
                print("❌ Test 1 Failed: Unexpected output")
        else:
            print(f"❌ Test 1 Failed: Status {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Test 1 Error: {e}")

    print("-" * 30)

    # Test Case 2: Error Handling
    payload2 = {
        "code": "print(1/0)",
        "language": "python"
    }
    
    try:
        print("Testing error handling...")
        response = requests.post(url, json=payload2)
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result['success']}")
            print(f"Error: {result['error']}")
            if not result['success'] and "ZeroDivisionError" in result['error']:
                print("✅ Test 2 Passed")
            else:
                print("❌ Test 2 Failed: Error not caught correctly")
        else:
            print(f"❌ Test 2 Failed: Status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Test 2 Error: {e}")

if __name__ == "__main__":
    test_code_execution()
