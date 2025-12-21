'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Eye, Brain, RefreshCw, TrendingUp, CheckCircle, ArrowLeft, Home } from 'lucide-react';

interface IRISStepperProps {
    courseId: number;
    currentPhase?: 'immerse' | 'realize' | 'iterate' | 'scale';
    completedPhases?: string[];
    sprintDay?: number; // Day 1-28 of the NUSA Sprint
}

const phases = [
    {
        id: 'immerse',
        label: 'Immerse',
        icon: Eye,
        description: 'Days 1-5',
        fullDescription: 'Live in authentic problem context',
        dayRange: [1, 5]
    },
    {
        id: 'realize',
        label: 'Realize',
        icon: Brain,
        description: 'Days 5-10',
        fullDescription: 'Gap analysis & SFIA mapping',
        dayRange: [5, 10]
    },
    {
        id: 'iterate',
        label: 'Iterate',
        icon: RefreshCw,
        description: 'Days 10-25',
        fullDescription: 'Build-Measure-Learn cycles',
        dayRange: [10, 25]
    },
    {
        id: 'scale',
        label: 'Scale',
        icon: TrendingUp,
        description: 'Days 25-28+',
        fullDescription: 'Institutional deployment',
        dayRange: [25, 28]
    },
];

// Legacy CDIO to IRIS mapping for backward compatibility
const cdioToIrisMap: Record<string, string> = {
    'conceive': 'immerse',
    'design': 'realize',
    'implement': 'iterate',
    'operate': 'scale',
    // Legacy IRIS names
    'immersion': 'immerse',
    'reflection': 'realize',
    'iteration': 'iterate'
};

export default function IRISStepper({ courseId, currentPhase, completedPhases = [], sprintDay }: IRISStepperProps) {
    const pathname = usePathname();

    // Auto-detect current phase from pathname, supporting both old CDIO and new IRIS routes
    const detectPhaseFromPath = () => {
        if (currentPhase) return currentPhase;

        // Check for IRIS phase names first
        const irisPhase = phases.find(p => pathname?.includes(p.id));
        if (irisPhase) return irisPhase.id;

        // Check for legacy CDIO phase names and map to IRIS
        const cdioPhases = ['conceive', 'design', 'implement', 'operate'];
        const cdioPhase = cdioPhases.find(p => pathname?.includes(p));
        if (cdioPhase) return cdioToIrisMap[cdioPhase];

        return 'immerse';
    };

    const activePhase = detectPhaseFromPath();

    // Convert any CDIO phase names in completedPhases to IRIS names
    const normalizedCompletedPhases = completedPhases.map(p => cdioToIrisMap[p] || p);

    const getPhaseStatus = (phaseId: string) => {
        if (normalizedCompletedPhases.includes(phaseId)) return 'completed';
        if (phaseId === activePhase) return 'current';
        return 'upcoming';
    };

    const isCurrentDay = (phase: typeof phases[0]) => {
        if (!sprintDay) return false;
        return sprintDay >= phase.dayRange[0] && sprintDay <= phase.dayRange[1];
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        IRIS Cycle • NUSA Framework
                    </h3>
                    {sprintDay && (
                        <p className="text-xs text-primary mt-1">
                            Sprint Day {sprintDay} of 28
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/courses/${courseId}/learn`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Back to Course
                    </Link>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                        <Home size={14} />
                        Dashboard
                    </Link>
                </div>
            </div>

            <div className="flex items-center justify-between">
                {phases.map((phase, index) => {
                    const status = getPhaseStatus(phase.id);
                    const Icon = phase.icon;
                    const isLast = index === phases.length - 1;
                    const isCurrent = isCurrentDay(phase);

                    return (
                        <React.Fragment key={phase.id}>
                            <Link
                                href={`/courses/${courseId}/${phase.id}`}
                                className={`flex flex-col items-center group transition-all ${status === 'current' ? 'scale-105' : 'hover:scale-105'
                                    }`}
                            >
                                <div
                                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${status === 'completed'
                                        ? 'bg-green-100 text-green-600'
                                        : status === 'current'
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'completed' ? (
                                        <CheckCircle size={24} />
                                    ) : (
                                        <Icon size={24} />
                                    )}
                                    {/* Sprint day indicator */}
                                    {isCurrent && sprintDay && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                            {sprintDay}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={`mt-2 text-sm font-bold ${status === 'current'
                                        ? 'text-primary'
                                        : status === 'completed'
                                            ? 'text-green-600'
                                            : 'text-gray-400'
                                        }`}
                                >
                                    {phase.label}
                                </span>
                                <span className="text-xs text-gray-500 hidden sm:block">{phase.description}</span>
                            </Link>

                            {/* Connector line */}
                            {!isLast && (
                                <div
                                    className={`flex-1 h-1 mx-2 rounded ${normalizedCompletedPhases.includes(phase.id)
                                        ? 'bg-green-400'
                                        : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* SFIA Target Level Indicator (optional enhancement) */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">
                    Target: <span className="font-bold text-primary">SFIA Level 3</span> (Proficient)
                </span>
                <span className="text-gray-400">
                    Aligned with ISO/IEC 17024
                </span>
            </div>
        </div>
    );
}

// Export legacy component name for backward compatibility
export { IRISStepper as CDIOStepper };
