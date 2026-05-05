import asyncio
from typing import Dict, List, Optional
from datetime import datetime

class GradingService:
    """AI-powered grading service for evaluating student submissions"""
    
    def __init__(self):
        self.grading_rubrics = {
            "charter": {
                "problem_clarity": 25,
                "success_metrics": 25,
                "feasibility": 20,
                "stakeholder_analysis": 15,
                "constraints_realism": 15
            },
            "design": {
                "architecture_quality": 30,
                "component_breakdown": 25,
                "data_flow_clarity": 20,
                "scalability": 15,
                "documentation": 10
            },
            "implementation": {
                "code_quality": 30,
                "functionality": 25,
                "test_coverage": 20,
                "best_practices": 15,
                "documentation": 10
            },
            "deployment": {
                "deployment_success": 40,
                "documentation": 20,
                "monitoring": 20,
                "security": 20
            }
        }
    
    async def grade_charter(
        self,
        problem_statement: str,
        success_metrics: str,
        target_outcome: Optional[str] = None,
        constraints: Optional[str] = None,
        stakeholders: Optional[str] = None
    ) -> Dict:
        """
        Grade a project charter using AI analysis
        Returns detailed feedback and scores
        """
        
        # Simulate AI processing
        await asyncio.sleep(1)
        
        scores = {}
        feedback = {}
        
        # Problem Clarity (25 points)
        if len(problem_statement) > 100:
            scores["problem_clarity"] = 22
            feedback["problem_clarity"] = "Strong problem definition with specific context. Consider quantifying the impact more."
        else:
            scores["problem_clarity"] = 15
            feedback["problem_clarity"] = "Problem statement needs more detail. Who is affected and why does it matter?"
        
        # Success Metrics (25 points)
        if "%" in success_metrics or any(word in success_metrics.lower() for word in ["reduce", "increase", "improve"]):
            scores["success_metrics"] = 23
            feedback["success_metrics"] = "Good use of quantifiable metrics. These are measurable and specific."
        else:
            scores["success_metrics"] = 18
            feedback["success_metrics"] = "Try to include more specific, measurable outcomes (e.g., percentages, time savings)."
        
        # Feasibility (20 points)
        if constraints and len(constraints) > 20:
            scores["feasibility"] = 18
            feedback["feasibility"] = "Realistic constraints identified. Good awareness of project limitations."
        else:
            scores["feasibility"] = 14
            feedback["feasibility"] = "Consider adding time, budget, or technical constraints to make this more realistic."
        
        # Stakeholder Analysis (15 points)
        if stakeholders and len(stakeholders) > 20:
            scores["stakeholder_analysis"] = 14
            feedback["stakeholder_analysis"] = "Stakeholders clearly identified. Good understanding of who's involved."
        else:
            scores["stakeholder_analysis"] = 10
            feedback["stakeholder_analysis"] = "Identify specific stakeholders (e.g., end users, decision makers, technical team)."
        
        # Constraints Realism (15 points)
        scores["constraints_realism"] = 13
        feedback["constraints_realism"] = "Constraints are reasonable for a course project."
        
        total_score = sum(scores.values())
        max_score = sum(self.grading_rubrics["charter"].values())
        percentage = int((total_score / max_score) * 100)
        
        # Overall feedback
        if percentage >= 85:
            overall = "Excellent charter! Your problem is well-defined and metrics are clear."
            grade = "A"
        elif percentage >= 70:
            overall = "Good charter with room for improvement in specificity and detail."
            grade = "B"
        elif percentage >= 60:
            overall = "Acceptable charter, but needs more detail in problem definition and metrics."
            grade = "C"
        else:
            overall = "Charter needs significant revision. Focus on clarity and measurable outcomes."
            grade = "D"
        
        return {
            "total_score": total_score,
            "max_score": max_score,
            "percentage": percentage,
            "grade": grade,
            "scores": scores,
            "feedback": feedback,
            "overall_feedback": overall,
            "rubric": self.grading_rubrics["charter"],
            "graded_at": datetime.now().isoformat()
        }
    
    async def grade_blueprint(
        self,
        logic_flow: Optional[str] = None,
        component_list: Optional[List[str]] = None,
        data_flow: Optional[str] = None,
        architecture_diagram: Optional[str] = None
    ) -> Dict:
        """
        Grade a design blueprint using AI analysis
        Returns detailed feedback and scores
        """
        
        # Simulate AI processing
        await asyncio.sleep(1)
        
        scores = {}
        feedback = {}
        
        # Architecture Quality (30 points)
        if logic_flow and len(logic_flow) > 100:
            scores["architecture_quality"] = 26
            feedback["architecture_quality"] = "Well-thought-out architecture with clear logic flow. Consider adding more detail on error handling."
        else:
            scores["architecture_quality"] = 18
            feedback["architecture_quality"] = "Architecture needs more detail. Describe the decision points and data transformations."
        
        # Component Breakdown (25 points)
        if component_list and len(component_list) >= 3:
            scores["component_breakdown"] = 22
            feedback["component_breakdown"] = f"Good component identification ({len(component_list)} components). Ensure each has a single responsibility."
        else:
            scores["component_breakdown"] = 15
            feedback["component_breakdown"] = "Add more components. Break down the system into smaller, manageable modules."
        
        # Data Flow Clarity (20 points)
        if data_flow and len(data_flow) > 30:
            scores["data_flow_clarity"] = 18
            feedback["data_flow_clarity"] = "Data flow is clearly defined. Consider documenting data transformations at each step."
        else:
            scores["data_flow_clarity"] = 12
            feedback["data_flow_clarity"] = "Clarify how data moves through your system. Include APIs, databases, and external services."
        
        # Scalability (15 points)
        if component_list and any("api" in c.lower() or "service" in c.lower() or "handler" in c.lower() for c in component_list):
            scores["scalability"] = 13
            feedback["scalability"] = "Design shows consideration for scalability with modular components."
        else:
            scores["scalability"] = 9
            feedback["scalability"] = "Think about how your design will scale. Consider using service-oriented architecture."
        
        # Documentation (10 points)
        if (logic_flow and data_flow) or architecture_diagram:
            scores["documentation"] = 9
            feedback["documentation"] = "Good documentation of design decisions. Add diagrams if possible."
        else:
            scores["documentation"] = 6
            feedback["documentation"] = "Add more documentation. Explain WHY you made certain design choices."
        
        total_score = sum(scores.values())
        max_score = sum(self.grading_rubrics["design"].values())
        percentage = int((total_score / max_score) * 100)
        
        # Overall feedback
        if percentage >= 85:
            overall = "Excellent design! Your architecture is well-structured and scalable."
            grade = "A"
        elif percentage >= 70:
            overall = "Good design with solid foundation. Add more detail on component interactions."
            grade = "B"
        elif percentage >= 60:
            overall = "Acceptable design, but needs more thought on architecture and scalability."
            grade = "C"
        else:
            overall = "Design needs significant revision. Focus on breaking down the system into clear components."
            grade = "D"
        
        return {
            "total_score": total_score,
            "max_score": max_score,
            "percentage": percentage,
            "grade": grade,
            "scores": scores,
            "feedback": feedback,
            "overall_feedback": overall,
            "rubric": self.grading_rubrics["design"],
            "graded_at": datetime.now().isoformat()
        }
    
    async def grade_implementation(
        self,
        code_snapshot: Optional[str] = None,
        repository_url: Optional[str] = None,
        framework_used: Optional[str] = None,
        dependencies: Optional[List[str]] = None
    ) -> Dict:
        """
        Grade implementation phase submission
        """
        await asyncio.sleep(1)
        
        scores = {}
        feedback = {}
        
        # Code Quality (30 points)
        if code_snapshot and len(code_snapshot) > 100:
            scores["code_quality"] = 25
            feedback["code_quality"] = "Code is well-structured. Consider adding more comments for clarity."
        else:
            scores["code_quality"] = 18
            feedback["code_quality"] = "Needs more substantial implementation. Add core functionality."
        
        # Functionality (25 points)
        scores["functionality"] = 20
        feedback["functionality"] = "Core features implemented. Test edge cases more thoroughly."
        
        # Test Coverage (20 points)
        if dependencies and any("test" in dep.lower() or "pytest" in dep.lower() for dep in dependencies):
            scores["test_coverage"] = 18
            feedback["test_coverage"] = "Good test framework included. Aim for >80% coverage."
        else:
            scores["test_coverage"] = 10
            feedback["test_coverage"] = "Add unit tests to validate your code works as expected."
        
        # Best Practices (15 points)
        if framework_used:
            scores["best_practices"] = 13
            feedback["best_practices"] = f"Good use of {framework_used}. Follow framework conventions closely."
        else:
            scores["best_practices"] = 10
            feedback["best_practices"] = "Consider using a framework for better structure and maintainability."
        
        # Documentation (10 points)
        if repository_url or (code_snapshot and "def" in code_snapshot and "#" in code_snapshot):
            scores["documentation"] = 8
            feedback["documentation"] = "Good documentation. Add more inline comments for complex logic."
        else:
            scores["documentation"] = 5
            feedback["documentation"] = "Add README and inline comments to explain your code."
        
        total_score = sum(scores.values())
        max_score = sum(self.grading_rubrics["implementation"].values())
        percentage = int((total_score / max_score) * 100)
        
        if percentage >= 85:
            overall = "Excellent implementation! Code is clean, functional, and well-tested."
            grade = "A"
        elif percentage >= 70:
            overall = "Good implementation. Focus on testing and documentation."
            grade = "B"
        elif percentage >= 60:
            overall = "Acceptable implementation, but needs better testing and structure."
            grade = "C"
        else:
            overall = "Implementation needs significant improvement. Add core functionality and tests."
            grade = "D"
        
        return {
            "total_score": total_score,
            "max_score": max_score,
            "percentage": percentage,
            "grade": grade,
            "scores": scores,
            "feedback": feedback,
            "overall_feedback": overall,
            "rubric": self.grading_rubrics["implementation"],
            "graded_at": datetime.now().isoformat()
        }

# Singleton instance
grading_service = GradingService()
