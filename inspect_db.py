
import sqlite3
import os

DB_FILE = os.path.join("backend", "sql_app_v3.db")

def inspect():
    if not os.path.exists(DB_FILE):
        print(f"Database file not found at {DB_FILE}")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    print(f"Inspecting {DB_FILE} 'implementations' table...")
    try:
        cursor.execute("PRAGMA table_info(implementations)")
        columns = cursor.fetchall()
        for col in columns:
            print(f"- {col[1]} ({col[2]})")
            
        required = ["iteration_number", "hypothesis", "learnings", "next_hypothesis", "ai_feedback"]
        existing = [c[1] for c in columns]
        
        missing = [max_col for max_col in required if max_col not in existing]
        if missing:
            print(f"\nMISSING COLUMNS: {missing}")
        else:
            print("\nAll required columns present.")
            
    except Exception as e:
        print(f"Error: {e}")
        
    conn.close()

if __name__ == "__main__":
    inspect()
