"""
Implementation Service Layer for TSEA-X CDIO Framework

Handles:
1. Storing implementation artifacts (code)
2. Mock execution of student code
3. Future: Integration with real containerized runtime
"""

from typing import Dict, List, Optional
from datetime import datetime
import re

class ImplementationService:
    def __init__(self):
        pass

    async def run_code_mock(self, code: str, language: str = "python") -> Dict:
        """
        Mock execution of student code.
        In a real system, this would send code to a secure sandbox (e.g., Docker/Firecracker).
        """
        
        # Simulate processing delay
        import asyncio
        await asyncio.sleep(1.5)
        
        # Basic syntax check simulation
        if "syntax error" in code.lower():
            return {
                "status": "error",
                "output": "SyntaxError: invalid syntax",
                "exit_code": 1
            }
            
        # Check for print statements to simulate output
        output_lines = []
        for line in code.split('\n'):
            if line.strip().startswith('print('):
                # Extract content between parens (very basic regex)
                match = re.search(r'print\((.*?)\)', line)
                if match:
                    content = match.group(1).strip('"\'')
                    output_lines.append(content)
        
        output = "\n".join(output_lines)
        if not output and len(code.strip()) > 0:
            output = "(Code executed successfully, no output)"
            
        return {
            "status": "success",
            "output": output,
            "exit_code": 0
        }

    def validate_submission(self, code: str) -> Dict:
        """
        Validate code before submission (Linting/Security checks)
        """
        issues = []
        
        # Mock security check
        forbidden_imports = ["os", "subprocess", "sys"]
        for imp in forbidden_imports:
            if f"import {imp}" in code or f"from {imp}" in code:
                issues.append(f"Security Warning: Usage of '{imp}' is restricted in the sandbox.")
                
        return {
            "passed": len(issues) == 0,
            "issues": issues
        }

# Singleton instance
implementation_service = ImplementationService()
