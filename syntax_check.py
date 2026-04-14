try:
    from backend.routers import ai
    print("Syntax OK")
except Exception as e:
    print(f"Syntax Error: {e}")
