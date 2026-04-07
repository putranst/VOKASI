
import sqlite3
import os

DB_FILE = os.path.join("backend", "sql_app_v3.db")

def migrate():
    if not os.path.exists(DB_FILE):
        print(f"DB not found at {DB_FILE}")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    columns = [
        ("institutional_handoff", "TEXT"),
        ("stakeholder_training", "TEXT"),
        ("impact_metrics", "JSON"),
        ("sfia_evidence", "JSON")
    ]
    
    print(f"Migrating {DB_FILE} 'deployments' table...")
    
    for col, dtype in columns:
        try:
            cursor.execute(f"ALTER TABLE deployments ADD COLUMN {col} {dtype}")
            print(f"Added {col}")
        except Exception as e:
            print(f"Skipping {col}: {e}")
            
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
