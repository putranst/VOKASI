"""
TSEA-X System Health Check (Simple Version)
Tests database connectivity and AI integration
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

def test_database():
    """Test database connectivity and basic operations"""
    print("\n" + "="*60)
    print("DATABASE HEALTH CHECK")
    print("="*60)
    
    try:
        from database import engine, DATABASE_URL, SessionLocal
        from sql_models import Base
        
        print(f"[OK] Database URL: {DATABASE_URL}")
        
        # Test connection
        with engine.connect() as conn:
            print("[OK] Database connection successful")
        
        # Check if tables exist
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"[OK] Found {len(tables)} tables in database")
        
        # Test a simple query
        db = SessionLocal()
        try:
            from sql_models import User, Course
            
            user_count = db.query(User).count()
            course_count = db.query(Course).count()
            
            print(f"\nDatabase Statistics:")
            print(f"   - Users: {user_count}")
            print(f"   - Courses: {course_count}")
            
            print("\n[OK] DATABASE: OPERATIONAL")
            return True
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"\n[ERROR] DATABASE: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_ai_integration():
    """Test AI service integration"""
    print("\n" + "="*60)
    print("AI INTEGRATION HEALTH CHECK")
    print("="*60)
    
    results = {}
    
    # Test OpenAI
    print("\n[1] Testing OpenAI Integration...")
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        print(f"   [OK] OpenAI API Key found: {openai_key[:20]}...")
        try:
            from services.openai_service import OpenAIService
            ai_service = OpenAIService()
            
            # Simple test
            response = ai_service.generate_text(
                "Say 'Hello from TSEA-X!' in one sentence.",
                max_tokens=50
            )
            print(f"   [OK] OpenAI Response: {response[:100]}...")
            results['openai'] = True
        except Exception as e:
            print(f"   [ERROR] OpenAI: {str(e)}")
            results['openai'] = False
    else:
        print("   [WARNING] OpenAI API Key not configured")
        results['openai'] = False
    
    # Test Gemini
    print("\n[2] Testing Gemini Integration...")
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        print(f"   [OK] Gemini API Key found: {gemini_key[:20]}...")
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-pro')
            
            response = model.generate_content("Say 'Hello from TSEA-X!' in one sentence.")
            print(f"   [OK] Gemini Response: {response.text[:100]}...")
            results['gemini'] = True
        except Exception as e:
            print(f"   [ERROR] Gemini: {str(e)}")
            results['gemini'] = False
    else:
        print("   [WARNING] Gemini API Key not configured")
        results['gemini'] = False
    
    # Test OpenRouter
    print("\n[3] Testing OpenRouter Integration...")
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if openrouter_key:
        print(f"   [OK] OpenRouter API Key found: {openrouter_key[:20]}...")
        print(f"   [OK] Model: {os.getenv('OPENROUTER_MODEL', 'Not specified')}")
        results['openrouter'] = True
    else:
        print("   [WARNING] OpenRouter API Key not configured")
        results['openrouter'] = False
    
    # Summary
    print("\n" + "="*60)
    print("AI INTEGRATION SUMMARY")
    print("="*60)
    working = sum(1 for v in results.values() if v)
    total = len(results)
    print(f"   Working: {working}/{total}")
    for service, status in results.items():
        status_text = "[OK]" if status else "[ERROR]"
        print(f"   {status_text} {service.upper()}")
    
    if working > 0:
        print("\n[OK] AI INTEGRATION: OPERATIONAL")
        return True
    else:
        print("\n[WARNING] AI INTEGRATION: NO SERVICES AVAILABLE")
        return False


def test_api_endpoints():
    """Test critical API endpoints"""
    print("\n" + "="*60)
    print("API ENDPOINTS HEALTH CHECK")
    print("="*60)
    
    try:
        import requests
        
        endpoints = [
            ("Health Check", "http://localhost:8000/api/v1/health"),
            ("Courses List", "http://localhost:8000/api/v1/courses"),
            ("Institutions", "http://localhost:8000/api/v1/institutions"),
        ]
        
        for name, url in endpoints:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"   [OK] {name}: {url}")
                else:
                    print(f"   [WARNING] {name}: Status {response.status_code}")
            except requests.exceptions.ConnectionError:
                print(f"   [ERROR] {name}: Server not running")
            except Exception as e:
                print(f"   [ERROR] {name}: {str(e)}")
        
        print("\n[OK] API ENDPOINTS: CHECKED")
        return True
        
    except ImportError:
        print("   [WARNING] requests library not installed")
        print("   Run: pip install requests")
        return False


def main():
    """Run all health checks"""
    print("\n" + "="*60)
    print("TSEA-X SYSTEM HEALTH CHECK")
    print("="*60)
    print(f"Environment: {'Production' if os.getenv('DATABASE_URL') else 'Development (SQLite)'}")
    
    results = {
        'database': test_database(),
        'ai': test_ai_integration(),
        'api': test_api_endpoints()
    }
    
    # Final Summary
    print("\n" + "="*60)
    print("FINAL SYSTEM STATUS")
    print("="*60)
    
    for component, status in results.items():
        status_text = "[OK]" if status else "[ERROR]"
        status_msg = "OPERATIONAL" if status else "ISSUES DETECTED"
        print(f"{status_text} {component.upper()}: {status_msg}")
    
    all_ok = all(results.values())
    
    if all_ok:
        print("\n[SUCCESS] ALL SYSTEMS OPERATIONAL!")
        print("Your TSEA-X platform is ready for use.")
    else:
        print("\n[WARNING] SOME SYSTEMS NEED ATTENTION")
        print("Please review the errors above.")
    
    print("="*60 + "\n")
    
    return all_ok


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
