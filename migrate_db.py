
import sqlite3
import os

DB_FILE = os.path.join("backend", "sql_app_v3.db")

def migrate():
    print(f"Target DB: {os.path.abspath(DB_FILE)}")
    if not os.path.exists(DB_FILE):
        print(f"Database file not found at {DB_FILE}")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    columns_to_add = [
        ("iteration_number", "INTEGER DEFAULT 1"),
        ("hypothesis", "TEXT"),
        ("learnings", "TEXT"),
        ("next_hypothesis", "TEXT"),
        ("ai_feedback", "TEXT")
    ]
    
    print(f"Migrating {DB_FILE}...")
    
    for col_name, col_type in columns_to_add:
        try:
            print(f"Adding column {col_name}...")
            cursor.execute(f"ALTER TABLE implementations ADD COLUMN {col_name} {col_type}")
            print(f"Success.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print(f"Column {col_name} already exists. Skipping.")
            else:
                print(f"Error adding {col_name}: {e}")
                
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
