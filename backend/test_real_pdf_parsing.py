"""
Test Smart Course Creation with Real PDF
Tests the Gemini Vision material parsing with actual PDF bytes.
"""
import asyncio
import base64
import httpx
import os
import sys

# Configuration
BACKEND_URL = "http://localhost:8000"
PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "PAPERS", "NUSA_Framework_Academic_Paper.md.pdf")

async def test_real_pdf_parsing():
    """Test the smart-create/parse endpoint with real PDF bytes"""
    
    print("=" * 60)
    print("Smart Course Creation - Real PDF Test")
    print("=" * 60)
    
    # Check if PDF exists
    if not os.path.exists(PDF_PATH):
        print("[X] PDF not found: " + PDF_PATH)
        # Try alternative path
        alt_path = "c:/Users/PT/Desktop/TSEA-X/PAPERS/NUSA_Framework_Academic_Paper.md.pdf"
        if os.path.exists(alt_path):
            pdf_path = alt_path
            print("[OK] Using alternative path: " + pdf_path)
        else:
            print("[X] No PDF found. Please provide a valid path.")
            return
    else:
        pdf_path = PDF_PATH
    
    # Read and encode the PDF
    print("\n[PDF] Reading: " + pdf_path)
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    
    pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
    print("   Size: {:,} bytes".format(len(pdf_bytes)))
    print("   Base64 length: {:,} chars".format(len(pdf_base64)))
    
    # Prepare request
    payload = {
        "file_base64": pdf_base64,
        "file_name": os.path.basename(pdf_path),
        "mime_type": "application/pdf"
    }
    
    # Send to backend
    print("\n[SEND] Sending to " + BACKEND_URL + "/api/v1/courses/smart-create/parse...")
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/api/v1/courses/smart-create/parse",
                json=payload
            )
            
            print("   Status: " + str(response.status_code))
            
            if response.status_code == 200:
                result = response.json()
                print("\n[SUCCESS]")
                print("   Provider: " + result.get('provider', 'unknown'))
                
                if result.get("success") and result.get("data"):
                    data = result["data"]
                    print("\n[PARSED CONTENT]")
                    print("   Title: " + data.get('title', 'N/A'))
                    print("   Summary: " + data.get('summary', 'N/A')[:200] + "...")
                    print("   Difficulty: " + data.get('difficulty_level', 'N/A'))
                    print("   Duration: " + data.get('estimated_duration', 'N/A'))
                    print("   Target: " + data.get('target_audience', 'N/A'))
                    
                    print("\n[MAIN TOPICS]")
                    for i, topic in enumerate(data.get("main_topics", [])[:5], 1):
                        print("   {}. {}: {}...".format(i, topic.get('name', 'N/A'), topic.get('description', '')[:60]))
                    
                    print("\n[LEARNING OBJECTIVES]")
                    for i, obj in enumerate(data.get("learning_objectives", [])[:5], 1):
                        print("   {}. {}...".format(i, obj[:80]))
                    
                    # Check if it's mock or real
                    if result.get("provider") == "mock":
                        print("\n[NOTE] Using MOCK data (AI providers may not have parsed the file)")
                    else:
                        print("\n[REAL AI] Parsing completed with " + result.get('provider') + "!")
                    
                    return result
                else:
                    print("[X] Parsing failed: " + result.get('error', 'Unknown error'))
            else:
                print("[X] Error: " + response.text)
                
        except Exception as e:
            print("[X] Request failed: " + str(e))
            import traceback
            traceback.print_exc()

async def test_teaching_agenda(parsed_content: dict):
    """Test teaching agenda generation with parsed content"""
    
    print("\n" + "=" * 60)
    print("Teaching Agenda Generation Test")
    print("=" * 60)
    
    if not parsed_content or not parsed_content.get("data"):
        print("[X] No parsed content to use")
        return
    
    payload = {
        "parsed_content": parsed_content["data"],
        "target_audience": "Intermediate",
        "duration_weeks": 4
    }
    
    print("\n[SEND] Sending to " + BACKEND_URL + "/api/v1/courses/smart-create/agenda...")
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                f"{BACKEND_URL}/api/v1/courses/smart-create/agenda",
                json=payload
            )
            
            print("   Status: " + str(response.status_code))
            
            if response.status_code == 200:
                result = response.json()
                print("\n[SUCCESS]")
                print("   Provider: " + result.get('provider', 'unknown'))
                
                if result.get("success") and result.get("agenda"):
                    agenda = result["agenda"]
                    print("\n[TEACHING AGENDA]")
                    print("   Course: " + agenda.get('course_title', 'N/A'))
                    print("   Tagline: " + agenda.get('tagline', 'N/A'))
                    print("   Modules: " + str(len(agenda.get('modules', []))))
                    
                    # Count teaching actions
                    total_actions = sum(
                        len(m.get("teaching_actions", []))
                        for m in agenda.get("modules", [])
                    )
                    print("   Total Actions: " + str(total_actions))
                    
                    print("\n[MODULES]")
                    for m in agenda.get("modules", []):
                        print("   Week {}: {} ({})".format(m.get('week'), m.get('title'), m.get('phase', '').upper()))
                        for a in m.get("teaching_actions", [])[:3]:
                            print("      - [{}] {} ({} min)".format(a.get('type'), a.get('title'), a.get('duration_minutes')))
                    
                    return result
                else:
                    print("[X] Generation failed: " + result.get('error', 'Unknown error'))
            else:
                print("[X] Error: " + response.text)
                
        except Exception as e:
            print("[X] Request failed: " + str(e))

async def main():
    # Test PDF parsing
    parsed = await test_real_pdf_parsing()
    
    # Test agenda generation if parsing succeeded
    if parsed:
        await test_teaching_agenda(parsed)
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
