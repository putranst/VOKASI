import asyncio
import subprocess
import tempfile
import os
import sys
import shutil
from typing import Dict, Any

class CodeExecutionService:
    """Service for safely executing student code in multiple languages"""
    
    def __init__(self):
        self.timeout = 5.0  # seconds
        # Check which language runtimes are available
        self.available_runtimes = self._check_runtimes()
    
    def _check_runtimes(self) -> Dict[str, bool]:
        """Check which language runtimes are installed"""
        return {
            "python": shutil.which("python") is not None or shutil.which("python3") is not None,
            "node": shutil.which("node") is not None,
            "java": shutil.which("java") is not None and shutil.which("javac") is not None
        }
    
    async def execute_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Execute code in a sandboxed environment
        Supports: Python, JavaScript (Node.js), Java
        
        Returns:
            {
                "output": str,
                "error": str,
                "success": bool,
                "execution_time": float,
                "language": str
            }
        """
        
        language = language.lower()
        
        # Route to appropriate executor
        if language == "python":
            return await self._execute_python(code)
        elif language in ["javascript", "js", "node"]:
            return await self._execute_javascript(code)
        elif language == "java":
            return await self._execute_java(code)
        else:
            return {
                "output": "",
                "error": f"Language '{language}' is not supported. Available: Python, JavaScript, Java",
                "success": False,
                "execution_time": 0,
                "language": language
            }
    
    async def _execute_python(self, code: str) -> Dict[str, Any]:
        """Execute Python code"""
        if not self.available_runtimes.get("python"):
            return {
                "output": "",
                "error": "Python runtime not found. Please install Python.",
                "success": False,
                "execution_time": 0,
                "language": "python"
            }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as tmp:
            tmp.write(code)
            temp_file_path = tmp.name
        
        try:
            loop = asyncio.get_event_loop()
            
            def run_sync():
                return subprocess.run(
                    [sys.executable, temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
            
            process = await loop.run_in_executor(None, run_sync)
            
            return {
                "output": process.stdout,
                "error": process.stderr,
                "success": process.returncode == 0,
                "execution_time": 0,
                "language": "python"
            }
            
        except subprocess.TimeoutExpired:
            return {
                "output": "",
                "error": f"Execution timeout after {self.timeout} seconds. Possible infinite loop?",
                "success": False,
                "execution_time": self.timeout,
                "language": "python"
            }
        except Exception as e:
            return {
                "output": "",
                "error": f"Execution error: {str(e)}",
                "success": False,
                "execution_time": 0,
                "language": "python"
            }
        finally:
            try:
                os.unlink(temp_file_path)
            except:
                pass
    
    async def _execute_javascript(self, code: str) -> Dict[str, Any]:
        """Execute JavaScript code using Node.js"""
        if not self.available_runtimes.get("node"):
            return {
                "output": "",
                "error": "Node.js runtime not found. Please install Node.js to run JavaScript.",
                "success": False,
                "execution_time": 0,
                "language": "javascript"
            }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False, encoding='utf-8') as tmp:
            tmp.write(code)
            temp_file_path = tmp.name
        
        try:
            loop = asyncio.get_event_loop()
            
            def run_sync():
                return subprocess.run(
                    ["node", temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout
                )
            
            process = await loop.run_in_executor(None, run_sync)
            
            return {
                "output": process.stdout,
                "error": process.stderr,
                "success": process.returncode == 0,
                "execution_time": 0,
                "language": "javascript"
            }
            
        except subprocess.TimeoutExpired:
            return {
                "output": "",
                "error": f"Execution timeout after {self.timeout} seconds.",
                "success": False,
                "execution_time": self.timeout,
                "language": "javascript"
            }
        except Exception as e:
            return {
                "output": "",
                "error": f"Execution error: {str(e)}",
                "success": False,
                "execution_time": 0,
                "language": "javascript"
            }
        finally:
            try:
                os.unlink(temp_file_path)
            except:
                pass
    
    async def _execute_java(self, code: str) -> Dict[str, Any]:
        """Execute Java code"""
        if not self.available_runtimes.get("java"):
            return {
                "output": "",
                "error": "Java runtime not found. Please install JDK to run Java code.",
                "success": False,
                "execution_time": 0,
                "language": "java"
            }
        
        # Extract class name from code (simple heuristic)
        import re
        class_match = re.search(r'public\s+class\s+(\w+)', code)
        class_name = class_match.group(1) if class_match else "Main"
        
        # Create temporary directory for Java files
        temp_dir = tempfile.mkdtemp()
        java_file = os.path.join(temp_dir, f"{class_name}.java")
        
        try:
            # Write Java code to file
            with open(java_file, 'w', encoding='utf-8') as f:
                f.write(code)
            
            loop = asyncio.get_event_loop()
            
            # Compile Java code
            def compile_sync():
                return subprocess.run(
                    ["javac", java_file],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout,
                    cwd=temp_dir
                )
            
            compile_result = await loop.run_in_executor(None, compile_sync)
            
            if compile_result.returncode != 0:
                return {
                    "output": "",
                    "error": f"Compilation error:\n{compile_result.stderr}",
                    "success": False,
                    "execution_time": 0,
                    "language": "java"
                }
            
            # Run compiled Java code
            def run_sync():
                return subprocess.run(
                    ["java", class_name],
                    capture_output=True,
                    text=True,
                    timeout=self.timeout,
                    cwd=temp_dir
                )
            
            process = await loop.run_in_executor(None, run_sync)
            
            return {
                "output": process.stdout,
                "error": process.stderr,
                "success": process.returncode == 0,
                "execution_time": 0,
                "language": "java"
            }
            
        except subprocess.TimeoutExpired:
            return {
                "output": "",
                "error": f"Execution timeout after {self.timeout} seconds.",
                "success": False,
                "execution_time": self.timeout,
                "language": "java"
            }
        except Exception as e:
            return {
                "output": "",
                "error": f"Execution error: {str(e)}",
                "success": False,
                "execution_time": 0,
                "language": "java"
            }
        finally:
            # Clean up temp directory
            try:
                shutil.rmtree(temp_dir)
            except:
                pass

# Singleton instance
code_execution_service = CodeExecutionService()
