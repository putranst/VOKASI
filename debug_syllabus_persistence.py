import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

print("=== SYLLABUS PERSISTENCE DIAGNOSTIC ===\n")

# Step 1: Check what's in the database for Course 8 (Blockchain Identity Passport)
print("[1] Fetching existing syllabi for Course 8...")
resp = requests.get(f"{BASE_URL}/courses/8/syllabus")
if resp.status_code == 200:
    syllabi = resp.json()
    print(f"   Found {len(syllabi)} syllabus(i)")
    for i, syl in enumerate(syllabi):
        print(f"\n   Syllabus {i+1}:")
        print(f"   - ID: {syl.get('id')}")
        print(f"   - Title: {syl.get('title', 'MISSING')[:80]}")
        print(f"   - Overview: {syl.get('overview', 'MISSING')[:80]}")
        print(f"   - Learning Outcomes: {syl.get('learning_outcomes', [])}")
        print(f"   - Sections: {len(syl.get('sections', []))} sections")
        print(f"   - Duration: {syl.get('duration_weeks')} weeks")
else:
    print(f"   ERROR: {resp.status_code} - {resp.text}")

# Step 2: Generate a NEW syllabus with AI
print("\n[2] Generating NEW syllabus with AI...")
files = {'files': ('marketing.txt', 'Advanced digital marketing strategies using AI tools.', 'text/plain')}
data = {
    'course_id': 8,
    'topic': 'AI for Digital Marketers - TEST',
    'description': 'Learn AI-powered marketing',
    'duration_weeks': 4,
    'level': 'Intermediate',
    'hexahelix_sectors': 'Industry,Media'
}
gen_resp = requests.post(f"{BASE_URL}/syllabus/generate", data=data, files=files)
if gen_resp.status_code == 200:
    generated = gen_resp.json()
    print(f"   ✅ Generated! Title: {generated.get('title')}")
    print(f"   Overview (first 100 chars): {generated.get('overview', '')[:100]}")
    print(f"   Learning Outcomes: {len(generated.get('learning_outcomes', []))}")
    print(f"   Sections: {len(generated.get('sections', []))}")
else:
    print(f"   ❌ Generation failed: {gen_resp.text}")
    generated = None

# Step 3: Save the generated syllabus
if generated:
    print("\n[3] Saving generated syllabus to database...")
    save_payload = {
        "title": generated['title'],
        "overview": generated['overview'],
        "learning_outcomes": generated['learning_outcomes'],
        "assessment_strategy": generated.get('assessment_strategy', {}),
        "resources": generated.get('resources', []),
        "hexahelix_sectors": ["Industry", "Media"],
        "duration_weeks": 4,
        "sections": generated['sections']
    }
    
    save_resp = requests.post(f"{BASE_URL}/courses/8/syllabus", json=save_payload)
    if save_resp.status_code == 200:
        saved_data = save_resp.json()
        new_id = saved_data.get('id')
        print(f"   ✅ Saved! New ID: {new_id}")
        
        # Step 4: IMMEDIATELY fetch it back
        print(f"\n[4] IMMEDIATELY fetching syllabus ID {new_id} back...")
        verify_resp = requests.get(f"{BASE_URL}/courses/8/syllabus")
        if verify_resp.status_code == 200:
            verify_syllabi = verify_resp.json()
            found = None
            for s in verify_syllabi:
                if s['id'] == new_id:
                    found = s
                    break
            
            if found:
                print(f"   ✅ Found syllabus ID {new_id}!")
                print(f"   - Title: {found.get('title')}")
                print(f"   - Overview (first 100): {found.get('overview', '')[:100]}")
                print(f"   - Learning Outcomes: {found.get('learning_outcomes', [])}")
                print(f"   - Sections: {len(found.get('sections', []))}")
                
                # Compare
                print(f"\n[5] COMPARISON:")
                title_match = found.get('title') == save_payload['title']
                overview_match = found.get('overview') == save_payload['overview']
                outcomes_match = found.get('learning_outcomes') == save_payload['learning_outcomes']
                sections_match = len(found.get('sections', [])) == len(save_payload['sections'])
                
                print(f"   Title Match: {'✅' if title_match else '❌'}")
                print(f"   Overview Match: {'✅' if overview_match else '❌'}")
                print(f"   Outcomes Match: {'✅' if outcomes_match else '❌'}")
                print(f"   Sections Count Match: {'✅' if sections_match else '❌'}")
                
                if all([title_match, overview_match, outcomes_match, sections_match]):
                    print(f"\n=== ✅ PERSISTENCE TEST PASSED ===")
                else:
                    print(f"\n=== ❌ PERSISTENCE TEST FAILED - Data Mismatch ===")
            else:
                print(f"   ❌ Syllabus ID {new_id} NOT found after save!")
        else:
            print(f"   ❌ Fetch failed: {verify_resp.text}")
    else:
        print(f"   ❌ Save failed: {save_resp.text}")
