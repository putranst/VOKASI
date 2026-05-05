from database import SessionLocal
from sql_models import User

def list_users():
    db = SessionLocal()
    users = db.query(User).all()
    with open("user_id_result.txt", "w") as f:
        f.write(f"Total Users: {len(users)}\n")
        
        target = "student@tsea.asia"
        found = False
        for u in users:
            if u.email == target:
                f.write(f"CHECK_RESULT: FOUND_ID: {u.id}, Email: {u.email}\n")
                found = True
        if not found:
            f.write(f"CHECK_RESULT: NOT FOUND\n")
            # Print first few to debug
            for u in users[:5]:
                f.write(f"Sample: ID: {u.id}, Email: {u.email}\n")
    db.close()

if __name__ == "__main__":
    list_users()
