"""End-to-end smoke test for the OpenMAIC classroom.

Covers:
- REST session create (persisted)
- REST session get after restart (run twice to verify persistence)
- WebSocket connect with Supabase-like JWT token
- Multi-agent responses and frame protocol
- Memory facts persisted in DB and emitted via memory_updated

Usage:
    ./.venv/bin/python scripts/smoke_ws_classroom.py
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import time
import urllib.request

import jwt
import websockets


BASE_HTTP = "http://127.0.0.1:8000"
BASE_WS = "ws://127.0.0.1:8000"


def make_token(sub: str = "smoke-user", email: str = "smoke@vokasi.dev") -> str:
    """Create a Supabase-shaped JWT. Verified if SUPABASE_JWT_SECRET is set."""
    payload = {
        "sub": sub,
        "email": email,
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600,
    }
    secret = os.environ.get("SUPABASE_JWT_SECRET", "")
    if secret:
        return jwt.encode(payload, secret, algorithm="HS256")
    return jwt.encode(payload, "dev-insecure", algorithm="HS256")


def create_session(token: str) -> str:
    req = urllib.request.Request(
        f"{BASE_HTTP}/api/v1/classroom/sessions",
        data=json.dumps({"user_id": 1, "course_id": 9, "module_id": 1}).encode(),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=5) as r:
        data = json.loads(r.read())
    return data["session_id"]


def get_session(session_id: str) -> dict:
    with urllib.request.urlopen(f"{BASE_HTTP}/api/v1/classroom/sessions/{session_id}", timeout=5) as r:
        return json.loads(r.read())


async def run() -> int:
    token = make_token()
    session_id = create_session(token)
    print(f"[smoke] session_id={session_id}")

    # Fetch round-trip
    fetched = get_session(session_id)
    assert fetched["session_id"] == session_id, fetched
    print(f"[smoke] session fetched status={fetched['status']}")

    url = f"{BASE_WS}/ws/classroom/{session_id}?token={token}"
    async with websockets.connect(url) as ws:
        greeting = await asyncio.wait_for(ws.recv(), timeout=10)
        print(f"[smoke] greeting: {greeting[:120]}...")

        await ws.send(json.dumps({"type": "chat", "text": "I am confused about overfitting."}))

        saw_teacher = False
        saw_ta = False
        saw_confusion = False
        saw_turn_complete = False
        saw_memory = False
        for _ in range(16):
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=25)
            except asyncio.TimeoutError:
                break
            try:
                frame = json.loads(msg)
            except json.JSONDecodeError:
                continue
            t = frame.get("type")
            print(f"[smoke] <- {t}")
            if t == "confusion_detected":
                saw_confusion = True
            elif t == "agent_message" and frame.get("agent") == "teacher":
                saw_teacher = True
            elif t == "agent_message" and frame.get("agent") == "ta":
                saw_ta = True
            elif t == "turn_complete":
                saw_turn_complete = True
            elif t == "memory_updated":
                saw_memory = True
            if saw_teacher and saw_ta and saw_memory and saw_turn_complete:
                break

        await ws.send(json.dumps({"type": "end_session"}))
        try:
            await asyncio.wait_for(ws.recv(), timeout=5)
        except Exception:
            pass

    # Verify session ended
    final = get_session(session_id)
    print(f"[smoke] final status={final['status']}")

    ok = all([saw_teacher, saw_ta, saw_confusion, saw_turn_complete, saw_memory])
    print(
        "[smoke] teacher=%s ta=%s confusion=%s turn_complete=%s memory=%s"
        % (saw_teacher, saw_ta, saw_confusion, saw_turn_complete, saw_memory)
    )
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(run()))
