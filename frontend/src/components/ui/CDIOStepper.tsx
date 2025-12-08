'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lightbulb, PenTool, Code, Rocket, CheckCircle, ArrowLeft, Home } from 'lucide-react';

interface CDIOStepperProps {
    courseId: number;
    currentPhase?: 'conceive' | 'design' | 'implement' | 'operate';
    completedPhases?: string[];
}

const phases = [
    { id: 'conceive', label: 'Conceive', icon: Lightbulb, description: 'Define the problem' },
    { id: 'design', label: 'Design', icon: PenTool, description: 'Plan the solution' },
    { id: 'implement', label: 'Implement', icon: Code, description: 'Build the solution' },
    { id: 'operate', label: 'Operate', icon: Rocket, description: 'Deploy & iterate' },
];

export default function CDIOStepper({ courseId, currentPhase, completedPhases = [] }: CDIOStepperProps) {
    const pathname = usePathname();

    // Auto-detect current phase from pathname if not provided
    const activePhase = currentPhase || phases.find(p => pathname?.includes(p.id))?.id || 'conceive';

    const getPhaseStatus = (phaseId: string) => {
        if (completedPhases.includes(phaseId)) return 'completed';
        if (phaseId === activePhase) return 'current';
        return 'upcoming';
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">CDIO Project Phases</h3>
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

                    return (
                        <React.Fragment key={phase.id}>
                            <Link
                                href={`/courses/${courseId}/${phase.id}`}
                                className={`flex flex-col items-center group transition-all ${status === 'current' ? 'scale-105' : 'hover:scale-105'
                                    }`}
                            >
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${status === 'completed'
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
                                    className={`flex-1 h-1 mx-2 rounded ${completedPhases.includes(phase.id)
                                        ? 'bg-green-400'
                                        : 'bg-gray-200'
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
