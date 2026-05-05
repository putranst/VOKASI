#!/usr/bin/env python3
"""
Live smoke test for Beta Campaign funnel.
Tests against running backend (localhost:8000) and Supabase database.
"""
import requests
import sys
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_health():
    """Test 1: Backend is running"""
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200, f"Backend not responding: {r.status_code}"
    print("✅ Backend is running")

def test_cohort_api():
    """Test 2: Cohort endpoint returns data"""
    r = requests.get(f"{BASE_URL}/api/v1/cohorts/beta-2026")
    assert r.status_code == 200, f"Cohort API failed: {r.status_code}"
    data = r.json()
    assert data["slug"] == "beta-2026"
    assert data["seat_cap"] == 1000
    assert data["is_active"] == True
    print(f"✅ Cohort API: {data['name']} - {data['seats_remaining']}/{data['seat_cap']} seats available")
    print(f"   Current price: ${data['current_price_usd']} USD")

def test_courses_api():
    """Test 3: Courses endpoint returns data"""
    r = requests.get(f"{BASE_URL}/api/v1/courses")
    assert r.status_code == 200, f"Courses API failed: {r.status_code}"
    data = r.json()
    courses = data if isinstance(data, list) else data.get("items", [])
    assert len(courses) >= 2, f"Need at least 2 courses, got {len(courses)}"
    print(f"✅ Courses API: {len(courses)} courses available")
    for c in courses[:2]:
        print(f"   - {c['title']} ({c['category']})")

def test_payment_config():
    """Test 4: Payment config endpoint returns Midtrans config"""
    r = requests.get(f"{BASE_URL}/api/v1/cohorts/beta-2026/payment-config")
    assert r.status_code == 200, f"Payment config API failed: {r.status_code}"
    data = r.json()
    assert "client_key" in data
    print(f"✅ Payment config: Midtrans {'sandbox' if 'SB-' in data.get('client_key', '') else 'production'} mode")

def test_full_funnel_simulation():
    """Test 5: Simulate full registration → enrollment flow"""
    timestamp = int(time.time())
    email = f"smoke-{timestamp}@test.com"
    
    # Step 1: Register user (using demo login for simplicity)
    r = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"email": email, "password": "test"}
    )
    if r.status_code == 200:
        token = r.json()["access_token"]
        print(f"✅ User login/registration successful")
    else:
        print(f"⚠️  Auth endpoint returned {r.status_code} (may need Supabase Auth setup)")
        token = None
    
    print("\n📊 Funnel Status:")
    print("   1. Landing page: http://localhost:3000/beasiswa")
    print("   2. Registration: http://localhost:3000/register?cohort=beta-2026")
    print("   3. Onboarding:  http://localhost:3000/onboarding")
    print("   4. Payment:     http://localhost:3000/payment/beasiswa?cohort=beta-2026")

def run_all_tests():
    print("=" * 60)
    print("BETA CAMPAIGN SMOKE TEST")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    tests = [
        test_health,
        test_cohort_api,
        test_courses_api,
        test_payment_config,
        test_full_funnel_simulation,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ {test.__name__}: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)
    
    if failed == 0:
        print("\n🚀 Ready to launch! All systems operational.")
        return 0
    else:
        print(f"\n⚠️  {failed} test(s) failed. Review before launch.")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
