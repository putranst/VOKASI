'use client';

import { X, Award, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface GradingResult {
    grade: string;
    percentage: number;
    total_score: number;
    max_score: number;
    overall_feedback: string;
    scores: Record<string, number>;
    feedback: Record<string, string>;
    rubric: Record<string, number>;
}

interface GradingResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: GradingResult | null;
    title: string;
}

export default function GradingResultsModal({ isOpen, onClose, result, title }: GradingResultsModalProps) {
    if (!isOpen || !result) return null;

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return 'from-green-500 to-emerald-600';
            case 'B': return 'from-blue-500 to-cyan-600';
            case 'C': return 'from-yellow-500 to-orange-600';
            case 'D': return 'from-red-500 to-pink-600';
            default: return 'from-gray-500 to-slate-600';
        }
    };

    const getGradeIcon = (grade: string) => {
        if (grade === 'A' || grade === 'B') return CheckCircle;
        return AlertCircle;
    };

    const GradeIcon = getGradeIcon(result.grade);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`relative p-8 bg-gradient-to-r ${getGradeColor(result.grade)} text-white rounded-t-3xl`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Award className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{title}</h2>
                            <p className="text-white/80 text-sm">AI-Powered Evaluation</p>
                        </div>
                    </div>

                    {/* Grade Display */}
                    <div className="flex items-end gap-6">
                        <div className="flex items-baseline gap-2">
                            <div className="text-7xl font-black">{result.grade}</div>
                            <div className="text-3xl font-bold pb-2">{result.percentage}%</div>
                        </div>
                        <div className="pb-2">
                            <div className="text-white/80 text-sm">Score</div>
                            <div className="text-xl font-bold">{result.total_score} / {result.max_score}</div>
                        </div>
                    </div>
                </div>

                {/* Overall Feedback */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex items-start gap-3">
                        <GradeIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${result.grade === 'A' || result.grade === 'B' ? 'text-green-600' : 'text-orange-600'
                            }`} />
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Overall Feedback</h3>
                            <p className="text-gray-700 leading-relaxed">{result.overall_feedback}</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Rubric */}
                <div className="p-8">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Detailed Breakdown
                    </h3>

                    <div className="space-y-6">
                        {Object.entries(result.scores).map(([criterion, score]) => {
                            const maxScore = result.rubric[criterion];
                            const percentage = Math.round((score / maxScore) * 100);
                            const feedback = result.feedback[criterion];

                            return (
                                <div key={criterion} className="space-y-2">
                                    {/* Criterion Header */}
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-gray-900 capitalize">
                                            {criterion.replace(/_/g, ' ')}
                                        </h4>
                                        <span className="text-sm font-bold text-gray-700">
                                            {score} / {maxScore} pts
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${percentage >= 80 ? 'bg-green-500' :
                                                    percentage >= 60 ? 'bg-blue-500' :
                                                        percentage >= 40 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    {/* Feedback */}
                                    <p className="text-sm text-gray-600 leading-relaxed pl-4 border-l-2 border-gray-200">
                                        {feedback}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 rounded-b-3xl flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        ⚡ Powered by AI • Evaluated using industry-standard rubrics
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
