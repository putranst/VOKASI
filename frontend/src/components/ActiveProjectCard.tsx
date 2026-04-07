'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Clock, Target, ChevronRight, Sparkles, CheckCircle2, Circle, Loader2, BookOpen } from 'lucide-react';

interface ActiveProjectProps {
    courseId: number;
    courseTitle: string;
    courseImage: string;
    instructor: string;
    progress: number;
    currentPhase: 'immerse' | 'realize' | 'iterate' | 'scale' | 'completed';
    sfiaLevel: number;
    targetSfiaLevel: number;
    estimatedCompletion: string;
    totalModules: number;
    completedModules: number;
    lastActivity?: string;
}

const PHASE_INDEX: Record<string, number> = {
    'immerse': 0,
    'realize': 1,
    'iterate': 2,
    'scale': 3,
    'completed': 4,
};

const PHASE_DETAILS = [
    { id: 'immerse', label: 'Immerse', subtitle: 'Observe authentic problems', color: 'from-teal-500 to-cyan-500' },
    { id: 'realize', label: 'Realize', subtitle: 'Map O/P and SFIA gaps', color: 'from-blue-500 to-indigo-500' },
    { id: 'iterate', label: 'Iterate', subtitle: 'Build-Measure-Learn cycles', color: 'from-purple-500 to-violet-500' },
    { id: 'scale', label: 'Scale', subtitle: 'Institutional handoff', color: 'from-amber-500 to-orange-500' },
];

export function ActiveProjectCard({
    courseId,
    courseTitle,
    courseImage,
    instructor,
    progress,
    currentPhase,
    sfiaLevel,
    targetSfiaLevel,
    estimatedCompletion,
    totalModules,
    completedModules,
    lastActivity,
}: ActiveProjectProps) {
    const currentPhaseIndex = PHASE_INDEX[currentPhase] ?? 0;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <Target className="text-white" size={16} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">Your Active Project</h3>
                        {lastActivity && (
                            <p className="text-slate-400 text-xs">Last activity: {lastActivity}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
                    <span className="text-amber-400 text-sm font-bold">{progress}%</span>
                    <span className="text-slate-400 text-xs">complete</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                {/* Left: Course Card */}
                <div className="p-6">
                    <div className="flex gap-4">
                        {/* Course Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <img
                                src={courseImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'}
                                alt={courseTitle}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-lg leading-tight mb-1 line-clamp-2">
                                {courseTitle}
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">{instructor}</p>

                            {/* Module Progress */}
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">{completedModules}</span> of {totalModules} modules completed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: IRIS Progress */}
                <div className="p-6">
                    {/* Phase Timeline */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            {PHASE_DETAILS.map((phase, idx) => {
                                const isCompleted = idx < currentPhaseIndex;
                                const isCurrent = idx === currentPhaseIndex;
                                const isPending = idx > currentPhaseIndex;

                                return (
                                    <div key={phase.id} className="flex flex-col items-center flex-1">
                                        {/* Node */}
                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                            ? `bg-gradient-to-r ${phase.color} text-white shadow-md`
                                            : isCurrent
                                                ? `bg-gradient-to-r ${phase.color} text-white shadow-lg ring-4 ring-offset-2 ring-${phase.color.split('-')[1]}-200`
                                                : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {isCompleted ? (
                                                <CheckCircle2 size={18} />
                                            ) : isCurrent ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Circle size={18} />
                                            )}
                                        </div>

                                        {/* Label */}
                                        <span className={`text-xs font-semibold mt-2 ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {phase.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Connecting Line */}
                        <div className="relative -mt-[52px] mx-5 mb-8">
                            <div className="h-1 bg-gray-100 rounded-full">
                                <div
                                    className="h-full bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-full transition-all duration-700"
                                    style={{ width: `${(currentPhaseIndex / 3) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">Current Phase</p>
                            <p className="font-bold text-gray-900 capitalize">{currentPhase}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">SFIA Level</p>
                            <p className="font-bold text-gray-900">{sfiaLevel} → {targetSfiaLevel}</p>
                        </div>
                    </div>

                    {/* CTA */}
                    {/* CTA */}
                    <div className="flex flex-col gap-3">
                        {/* Synchronous Path */}
                        <Link
                            href={`/courses/${courseId}/${currentPhase}`}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl
                                     hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm
                                     flex items-center justify-center gap-2 text-sm"
                        >
                            <Play size={16} />
                            Synchronous Project ({currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)})
                            <ChevronRight size={16} />
                        </Link>

                        {/* Asynchronous Path */}
                        <Link
                            href={`/courses/${courseId}/learn`}
                            className="w-full py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200
                                     hover:bg-gray-50 transition-all shadow-sm
                                     flex items-center justify-center gap-2 text-sm"
                        >
                            <BookOpen size={16} />
                            Asynchronous Learning (Modules)
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActiveProjectCard;
