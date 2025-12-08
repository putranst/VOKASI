# Phase 4: Reality Engine (Cloud IDE) - Implementation Guide

## Overview
The **Reality Engine** is a browser-based Cloud IDE that allows students to write, run, and verify code directly within the TSEA-X platform. It powers the **Implement** phase of the CDIO framework.

## Architecture

### Frontend
- **Component**: `CloudIDE` (`frontend/src/components/CloudIDE.tsx`)
- **Library**: `@monaco-editor/react` (VS Code for browser)
- **Features**:
  - Syntax highlighting (Python default)
  - Dark mode (`vs-dark`)
  - "Run Code" button
  - "Submit" button
  - Terminal output display
  - Error highlighting

### Backend
- **Service**: `CodeExecutionService` (`backend/services/code_execution_service.py`)
- **Endpoint**: `POST /api/v1/code/execute`
- **Execution Model**:
  - Writes code to temporary file
  - Executes via `subprocess.run` (isolated process)
  - Captures `stdout` and `stderr`
  - Enforces 5-second timeout
  - Returns structured JSON response

## API Specification

### Execute Code
**Endpoint**: `POST /api/v1/code/execute`

**Request**:
```json
{
  "code": "print('Hello World')",
  "language": "python",
  "project_id": 123  // Optional
}
```

**Response (Success)**:
```json
{
  "success": true,
  "output": "Hello World",
  "error": null
}
```

**Response (Runtime Error)**:
```json
{
  "success": false,
  "output": "Partial output...",
  "error": "Traceback (most recent call last)...\nZeroDivisionError: division by zero"
}
```

## Usage Flow

1. **Student** navigates to **Implement** phase of a project.
2. **Student** writes Python code in the embedded editor.
3. **Student** clicks "Run Code".
4. **Frontend** sends code to `/api/v1/code/execute`.
5. **Backend** executes code safely and returns output.
6. **Frontend** displays output in the "Terminal" pane.
7. **Student** iterates until code works.
8. **Student** clicks "Submit" to complete the phase.

## Security Considerations (MVP)
- **Timeout**: Execution limited to 5 seconds to prevent infinite loops.
- **Isolation**: Runs in separate process (future: Docker container).
- **Input Validation**: Basic language check.

## Future Enhancements
- [ ] Docker containerization for full isolation.
- [ ] Support for multiple files/modules.
- [ ] Support for JavaScript/Node.js.
- [ ] Real-time collaboration (WebSocket).
- [ ] File system persistence.
