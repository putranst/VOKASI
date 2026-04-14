
import React from 'react';
import { CheckCircle, AlertCircle, Award, TrendingUp, AlertTriangle } from 'lucide-react';

interface GradingFeedbackProps {
    feedback: {
        grade: string;
        score: number;
        feedback: string;
        strengths: string[];
        weaknesses: string[];
    };
    isLoading?: boolean;
}

export function GradingFeedback({ feedback, isLoading }: GradingFeedbackProps) {
    if (isLoading) {
        return (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-20 bg-gray-100 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
        );
    }

    if (!feedback) return null;

    const getGradeColor = (grade: string) => {
        const g = grade.toUpperCase();
        if (g.startsWith('A')) return 'text-green-600 bg-green-50 border-green-200';
        if (g.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-200';
        if (g.startsWith('C')) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const gradeColorClass = getGradeColor(feedback.grade);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-md">
            <div className="flex border-b border-gray-100">
                {/* Score Column */}
                <div className={`flex-shrink-0 w-32 flex flex-col items-center justify-center p-6 border-r border-gray-100 ${gradeColorClass}`}>
                    <div className="text-4xl font-black tracking-tight">{feedback.grade}</div>
                    <div className="text-sm font-bold opacity-80 mt-1">{feedback.score}/100</div>
                    <div className="mt-2 text-xs font-semibold px-2 py-1 bg-white/50 rounded-full">
                        AI Evaluated
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow p-6">
                    <div className="mb-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2 pl-4">
                            <Award size={18} className="text-primary" />
                            Instructor Feedback
                        </h4>
                        <p className="text-gray-600 p-4 bg-gray-50 rounded-lg text-sm leading-relaxed border border-gray-100">
                            {feedback.feedback}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Strengths */}
                        <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                            <h5 className="font-bold text-green-800 text-sm mb-3 flex items-center gap-2">
                                <TrendingUp size={16} />
                                Strengths
                            </h5>
                            <ul className="space-y-2">
                                {feedback.strengths.map((str, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
                                        <span>{str}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                            <h5 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                Areas for Improvement
                            </h5>
                            <ul className="space-y-2">
                                {feedback.weaknesses.map((wk, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <AlertCircle size={14} className="text-amber-500 mt-1 flex-shrink-0" />
                                        <span>{wk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
