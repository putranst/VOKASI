#!/bin/bash
set -e

# Auto-terminate timer: 2 hours max
AUTO_KILL_SECONDS=7200
WORK_DIR="/sandbox/workspace"

mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

echo "[sandbox] Session starting in $WORK_DIR"
echo "[sandbox] Auto-terminating in $((AUTO_KILL_SECONDS/3600)) hours"

# Background timer to kill the session
(sleep $AUTO_KILL_SECONDS && echo "[sandbox] Time limit reached. Terminating." && kill -9 1) &
KILL_PID=$!

# Trap to clean up on early exit
trap "kill $KILL_PID 2>/dev/null; echo '[sandbox] Session ended'" EXIT INT TERM

# Wait for any process in the container (keeps container alive)
wait
