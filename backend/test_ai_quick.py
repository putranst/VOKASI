"""Quick AI Integration Test"""
import os
import asyncio
import base64
import json
from dotenv import load_dotenv

load_dotenv()

async def test_ai_logic():
    from services.openai_service import test_ai_connection, parse_course_material, generate_course_structure
    
    print("\n" + "="*60)
    print("AI LOGIC VERIFICATION")
    print("="*60)
    
    # 1. Connection
    print("\n1. Testing AI Connection...")
    res = await test_ai_connection()
    print(f"Connection Result: {res}")
    
    # 2. Parse Material (Mock Text)
    print("\n2. Testing Parse Material (Gemini/OpenRouter)...")
    mock_text = "Title: Introduction to AI\nSummary: A basic course on AI.\nTopics: Machine Learning, Neural Networks."
    mock_base64 = base64.b64encode(mock_text.encode('utf-8')).decode('utf-8')
    
    parse_res = await parse_course_material(mock_base64, "test.txt", "text/plain")
    print(f"Parse Result Success: {parse_res.get('success')}")
    if parse_res.get('success'):
        print(f"Parsed Data: {json.dumps(parse_res.get('data'), indent=2)[:500]}...")
    else:
        print(f"Parse Error: {parse_res.get('error')}")

    # 3. Generate Agenda
    print("\n3. Testing Agenda Generation...")
    agenda_res = await generate_course_structure(
        topic="Artificial Intelligence",
        target_audience="Beginner",
        material_content="Focus on ML and NN."
    )
    print(f"Agenda Title: {agenda_res.get('title')}")
    print(f"Modules Count: {len(agenda_res.get('modules', []))}")
    if agenda_res.get('modules'):
        print(f"First Module: {agenda_res['modules'][0]['title']}")

if __name__ == "__main__":
    asyncio.run(test_ai_logic())
