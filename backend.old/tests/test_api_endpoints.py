import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_courses():
    response = client.get("/api/v1/courses")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_institutions():
    response = client.get("/api/v1/institutions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
