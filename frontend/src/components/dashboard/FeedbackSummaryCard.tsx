import React from 'react';
import { Award, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FeedbackSummaryProps {
    courseId: number;
    grade: string;
    score: number;
    strengths: string[];
    weaknesses: string[];
}

export const FeedbackSummaryCard: React.FC<FeedbackSummaryProps> = ({
    courseId,
    grade,
    score,
    strengths,
    weaknesses
}) => {
    // Determine color based on grade
    const getGradeColor = (g: string) => {
        if (g.startsWith('A')) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (g.startsWith('B')) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (g.startsWith('C')) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    const colorClass = getGradeColor(grade);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
            {/* Background Decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 ${colorClass.split(' ')[1].replace('bg-', 'bg-')}`}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-gray-900 font-bold text-lg mb-1">Recent AI Feedback</h3>
                        <p className="text-gray-500 text-xs">Based on your latest 'Iterate' submission</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black border ${colorClass}`}>
                        {grade}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1">
                            <Zap size={12} className="text-amber-500" /> Top Strength
                        </div>
                        <p className="text-gray-900 text-sm font-medium line-clamp-2 leading-tight">
                            {strengths[0] || "Solid implementation"}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1">
                            <AlertCircle size={12} className="text-blue-500" /> Focus Area
                        </div>
                        <p className="text-gray-900 text-sm font-medium line-clamp-2 leading-tight">
                            {weaknesses[0] || "Refining user flow"}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/courses/${courseId}/iterate`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                >
                    View Full Analysis <ArrowRight size={14} />
                </Link>
            </div>
        </div>
    );
};
