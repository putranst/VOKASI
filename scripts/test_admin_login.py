import requests
import json

url = "http://localhost:8000/api/v1/auth/login"
payload = {
    "email": "putra@tsea.asia",
    "password": "1010"
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
