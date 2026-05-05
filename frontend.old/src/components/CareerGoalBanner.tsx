'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CareerGoalBannerProps {
    onSetGoal: () => void;
}

export const CareerGoalBanner: React.FC<CareerGoalBannerProps> = ({ onSetGoal }) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100 mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🤓</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-sm sm:text-base">
                        <span className="font-semibold text-gray-900">Need help?</span> Tell me a little about yourself so I can make the best recommendations.
                    </p>
                </div>
                <button
                    onClick={onSetGoal}
                    className="flex-shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    Set your goal
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default CareerGoalBanner;
