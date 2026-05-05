'use client';

import React from 'react';
import { Flame, Calendar, Trophy, Zap } from 'lucide-react';

interface LearningStreakProps {
    currentStreak: number;
    longestStreak: number;
    thisWeek: boolean[];  // Array of 7 booleans for each day
    totalXp?: number;
}

export function LearningStreak({
    currentStreak = 0,
    longestStreak = 0,
    thisWeek = [false, false, false, false, false, false, false],
    totalXp = 0
}: LearningStreakProps) {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay();
    const todayIndex = today === 0 ? 6 : today - 1; // Adjust for Monday start

    return (
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
            {/* Streak Counter */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStreak > 0
                            ? 'bg-gradient-to-br from-orange-500 to-red-500 animate-pulse'
                            : 'bg-gray-200'
                        }`}>
                        <Flame className={currentStreak > 0 ? 'text-white' : 'text-gray-400'} size={24} />
                    </div>
                    <div>
                        <div className="text-3xl font-black text-gray-900">{currentStreak}</div>
                        <div className="text-sm text-gray-500">day streak</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Trophy size={14} className="text-yellow-500" />
                        Best: {longestStreak} days
                    </div>
                    {totalXp > 0 && (
                        <div className="flex items-center gap-1 text-sm text-purple-600 font-bold mt-1">
                            <Zap size={14} />
                            {totalXp.toLocaleString()} XP
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Progress */}
            <div className="flex items-center justify-between gap-2">
                {days.map((day, index) => {
                    const isCompleted = thisWeek[index];
                    const isToday = index === todayIndex;

                    return (
                        <div key={index} className="flex flex-col items-center gap-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isCompleted
                                        ? 'bg-orange-500 text-white'
                                        : isToday
                                            ? 'bg-white border-2 border-orange-500 text-orange-500'
                                            : 'bg-white border border-gray-200 text-gray-400'
                                    }`}
                            >
                                {isCompleted ? '✓' : day}
                            </div>
                            {isToday && (
                                <div className="w-1 h-1 bg-orange-500 rounded-full" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Motivation Message */}
            <div className="mt-4 text-center">
                {currentStreak === 0 ? (
                    <p className="text-sm text-gray-600">Start learning today to begin your streak! 🚀</p>
                ) : currentStreak < 7 ? (
                    <p className="text-sm text-gray-600">Keep it up! {7 - currentStreak} more days for a weekly streak! 🔥</p>
                ) : currentStreak < 30 ? (
                    <p className="text-sm text-gray-600">Amazing! You're on fire! Keep the momentum going! 🌟</p>
                ) : (
                    <p className="text-sm text-gray-600">Incredible dedication! You're a learning champion! 🏆</p>
                )}
            </div>
        </div>
    );
}
