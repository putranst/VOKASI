'use client';

import React from 'react';

interface WeeklyGoalRingProps {
    current: number;
    goal: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    showPercentage?: boolean;
}

export function WeeklyGoalRing({
    current,
    goal,
    label = 'Weekly Goal',
    size = 'md',
    showPercentage = true
}: WeeklyGoalRingProps) {
    const percentage = Math.min(100, Math.round((current / goal) * 100));
    const circumference = 2 * Math.PI * 40; // radius = 40
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const sizeConfig = {
        sm: { container: 'w-20 h-20', text: 'text-lg', label: 'text-[10px]' },
        md: { container: 'w-28 h-28', text: 'text-2xl', label: 'text-xs' },
        lg: { container: 'w-36 h-36', text: 'text-3xl', label: 'text-sm' }
    };

    const config = sizeConfig[size];
    const isComplete = percentage >= 100;

    return (
        <div className={`relative ${config.container} flex items-center justify-center`}>
            {/* Background ring */}
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-100"
                />
                {/* Progress ring */}
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700 ease-out"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={isComplete ? '#10b981' : '#6366f1'} />
                        <stop offset="100%" stopColor={isComplete ? '#34d399' : '#8b5cf6'} />
                    </linearGradient>
                </defs>
            </svg>

            {/* Center content */}
            <div className="text-center z-10">
                {showPercentage ? (
                    <>
                        <span className={`${config.text} font-black ${isComplete ? 'text-emerald-600' : 'text-gray-900'}`}>
                            {percentage}%
                        </span>
                        <p className={`${config.label} text-gray-500 font-medium mt-0.5`}>
                            {isComplete ? '🎉 Done!' : label}
                        </p>
                    </>
                ) : (
                    <>
                        <span className={`${config.text} font-black text-gray-900`}>
                            {current}/{goal}
                        </span>
                        <p className={`${config.label} text-gray-500 font-medium mt-0.5`}>
                            {label}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default WeeklyGoalRing;
