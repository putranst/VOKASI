"""
Test script for the Grading Agent endpoints
Tests both charter and implementation grading
"""

import asyncio
import httpx

BASE_URL = "http://localhost:8000"

async def test_charter_grading():
    """Test charter grading endpoint"""
    print("\\n=== Testing Charter Grading ===\\n")
    
    async with httpx.AsyncClient() as client:
        # Test with project ID 1 (should have a charter)
        response = await client.post(
            f"{BASE_URL}/api/v1/grading/charter",
            json={"project_id": 1}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Charter Grading Successful!\\n")
            print(f"Grade: {result['grade']} ({result['percentage']}%)")
            print(f"Score: {result['total_score']}/{result['max_score']}\\n")
            print(f"Overall Feedback: {result['overall_feedback']}\\n")
            print("Individual Scores:")
            for criterion, score in result['scores'].items():
                feedback = result['feedback'][criterion]
                max_score = result['rubric'][criterion]
                print(f"  • {criterion}: {score}/{max_score}")
                print(f"    → {feedback}")
            return True
        else:
            print(f"❌ Charter grading failed: {response.status_code}")
            print(response.text)
            return False

async def test_implementation_grading():
    """Test implementation grading endpoint"""
    print("\\n\\n=== Testing Implementation Grading ===\\n")
    
    async with httpx.AsyncClient() as client:
        # Test with project ID 1 (should have implementation)
        response = await client.post(
            f"{BASE_URL}/api/v1/grading/implementation",
            json={"project_id": 1}
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Implementation Grading Successful!\\n")
            print(f"Grade: {result['grade']} ({result['percentage']}%)")
            print(f"Score: {result['total_score']}/{result['max_score']}\\n")
            print(f"Overall Feedback: {result['overall_feedback']}\\n")
            print("Individual Scores:")
            for criterion, score in result['scores'].items():
                feedback = result['feedback'][criterion]
                max_score = result['rubric'][criterion]
                print(f"  • {criterion}: {score}/{max_score}")
                print(f"    → {feedback}")
            return True
        else:
            print(f"❌ Implementation grading failed: {response.status_code}")
            print(response.text)
            return False

async def main():
    print("="*60)
    print("GRADING AGENT TEST SUITE")
    print("="*60)
    
    # Test charter grading
    charter_success = await test_charter_grading()
    
    # Test implementation grading
    impl_success = await test_implementation_grading()
    
    print("\\n" + "="*60)
    if charter_success and impl_success:
        print("✅ ALL TESTS PASSED!")
    else:
        print("❌ SOME TESTS FAILED")
    print("="*60 + "\\n")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\\nTest interrupted by user")
    except Exception as e:
        print(f"\\n❌ Error: {e}")
