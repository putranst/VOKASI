import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_code_persistence():
    print("Testing Code Persistence API...")
    
    # 1. Create a dummy project (or use existing one)
    # For simplicity, we'll try to use project ID 1 (assuming it exists)
    project_id = 1
    
    # 2. Save code snapshot
    print(f"\n[1] Saving code snapshot for project {project_id}...")
    save_payload = {
        "project_id": project_id,
        "code": "print('Hello, World! Version 1')",
        "language": "python",
        "auto_saved": False
    }
    
    try:
        response = requests.post(f"{BASE_URL}/projects/{project_id}/save-code", json=save_payload)
        if response.status_code == 200:
            print("✅ Save successful")
            data = response.json()
            print(f"   Snapshot ID: {data.get('id')}")
            print(f"   Timestamp: {data.get('timestamp')}")
        else:
            print(f"❌ Save failed: {response.status_code} - {response.text}")
            return
            
        # 3. Save another version
        print(f"\n[2] Saving second version...")
        save_payload["code"] = "print('Hello, World! Version 2')"
        response = requests.post(f"{BASE_URL}/projects/{project_id}/save-code", json=save_payload)
        if response.status_code == 200:
            print("✅ Save successful")
        else:
            print(f"❌ Save failed: {response.text}")
            
        # 4. Get snapshots history
        print(f"\n[3] Fetching snapshot history...")
        response = requests.get(f"{BASE_URL}/projects/{project_id}/snapshots")
        if response.status_code == 200:
            snapshots = response.json()
            print(f"✅ Fetched {len(snapshots)} snapshots")
            for s in snapshots[:3]: # Show top 3
                print(f"   - ID: {s['id']}, Time: {s['timestamp']}, Code: {s['code'][:20]}...")
                
            # Verify order (should be descending)
            if len(snapshots) >= 2:
                if snapshots[0]['id'] > snapshots[1]['id']:
                    print("✅ Ordering is correct (newest first)")
                else:
                    print("❌ Ordering is incorrect")
        else:
            print(f"❌ Fetch failed: {response.text}")
            
        # 5. Verify latest code in Implementation (optional, requires fetching project or implementation)
        # We'll skip this for now as we verified the snapshot creation
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_code_persistence()
