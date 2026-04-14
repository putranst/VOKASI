---
description: Stop all running TSEA-X servers
---

# Stop Server Workflow

This workflow stops both the frontend and backend servers for the TSEA-X application.

## Steps

// turbo
1. Stop all Node.js processes (Frontend):
```bash
taskkill /F /IM node.exe
```

// turbo
2. Stop all Python processes (Backend):
```bash
taskkill /F /IM python.exe
```

## Alternative: Manual Stop

You can also manually close the terminal windows running the servers, or press `Ctrl+C` in each terminal.

## Verify Servers Stopped

Check that ports are no longer in use:
```bash
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

If these commands return nothing, the servers have been stopped successfully.
