import sqlite3
import os

# Path to db
db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'sql_app.db')
print(f"Connecting to {db_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

tables = ['project_charters', 'design_blueprints']
columns = ['created_at', 'updated_at']

for table in tables:
    for col in columns:
        try:
            c.execute(f"ALTER TABLE {table} ADD COLUMN {col} DATETIME")
            print(f"Added {col} to {table}")
        except sqlite3.OperationalError as e:
            print(f"Column {col} already exists in {table} or error: {e}")

conn.commit()
conn.close()
