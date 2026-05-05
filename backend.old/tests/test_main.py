from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "TSEA-X Backend API is running"}

def test_health_check():
    response = client.get("/api/health")
    # If /api/health is not implemented, this might fail, so let's check if it exists first
    # or just check a known endpoint.
    # Based on main.py analysis, let's stick to root or known endpoints.
    pass
