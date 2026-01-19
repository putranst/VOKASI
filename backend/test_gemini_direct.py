"""Quick test of Gemini Vision PDF parsing"""
import asyncio
import base64
import os
import sys
sys.path.insert(0, '.')

async def test_gemini_vision():
    from services import openai_service
    
    print("Available clients:", list(openai_service.clients.keys()))
    
    # Read a small portion of the PDF
    pdf_path = r"C:\Users\PT\Desktop\TSEA-X\PAPERS\NUSA_Framework_Academic_Paper.md.pdf"
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
    
    pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")
    print(f"PDF size: {len(pdf_bytes)} bytes")
    
    # Test the parse function directly
    print("\nCalling parse_materials_multimodal...")
    try:
        result = await openai_service.parse_materials_multimodal(
            file_base64=pdf_base64,
            file_name="test.pdf",
            mime_type="application/pdf"
        )
        print("Result:", result.get("success"), result.get("provider"))
        if result.get("data"):
            print("Title:", result["data"].get("title"))
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_gemini_vision())
