'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Circle, ArrowRight, Sparkles, Target, BookOpen, Zap, Scale } from 'lucide-react';

interface IRISProject {
    project_id: number;
    course_id: number;
    project_title: string;
    current_phase: 'immerse' | 'realize' | 'iterate' | 'scale' | 'completed';
    completion_percentage: number;
    sfia_target_level?: number;
}

interface IRISProgressTrackerProps {
    projects: IRISProject[];
}

const IRIS_PHASES = [
    { id: 'immerse', label: 'Immerse', icon: BookOpen, color: 'blue', description: 'Observe authentic problems' },
    { id: 'realize', label: 'Realize', icon: Target, color: 'purple', description: 'Map Q/P and SFIA gaps' },
    { id: 'iterate', label: 'Iterate', icon: Zap, color: 'green', description: 'Build-Measure-Learn cycles' },
    { id: 'scale', label: 'Scale', icon: Scale, color: 'orange', description: 'Institutional handoff' },
];

const getPhaseIndex = (phase: string): number => {
    const phases = ['immerse', 'realize', 'iterate', 'scale', 'completed'];
    return phases.indexOf(phase);
};

export function IRISProgressTracker({ projects }: IRISProgressTrackerProps) {
    if (!projects || projects.length === 0) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Sparkles className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Start Your IRIS Journey</h3>
                        <p className="text-sm text-gray-500">Begin a project to track your learning progress</p>
                    </div>
                </div>
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                    Explore Courses <ArrowRight size={14} />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">IRIS Project Progress</h3>
                <span className="text-sm text-gray-500">{projects.length} Active Project{projects.length !== 1 ? 's' : ''}</span>
            </div>

            {projects.map((project) => {
                const currentPhaseIndex = getPhaseIndex(project.current_phase);

                return (
                    <div key={project.project_id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        {/* Project Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h4 className="font-bold text-gray-900">{project.project_title}</h4>
                                <p className="text-sm text-gray-500">
                                    {project.current_phase === 'completed'
                                        ? '✅ Completed'
                                        : `Currently in ${project.current_phase.charAt(0).toUpperCase() + project.current_phase.slice(1)} phase`
                                    }
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-blue-600">{project.completion_percentage}%</div>
                                {project.sfia_target_level && (
                                    <div className="text-xs text-gray-500">SFIA Level {project.sfia_target_level}</div>
                                )}
                            </div>
                        </div>

                        {/* IRIS Phase Progress */}
                        <div className="relative">
                            {/* Progress Line */}
                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                            <div
                                className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 z-0 transition-all duration-500"
                                style={{ width: `${Math.min((currentPhaseIndex / 3) * 100, 100)}%` }}
                            />

                            {/* Phase Circles */}
                            <div className="relative z-10 flex justify-between">
                                {IRIS_PHASES.map((phase, index) => {
                                    const isCompleted = currentPhaseIndex > index || project.current_phase === 'completed';
                                    const isCurrent = currentPhaseIndex === index && project.current_phase !== 'completed';
                                    const PhaseIcon = phase.icon;

                                    return (
                                        <div key={phase.id} className="flex flex-col items-center">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                                    ? 'bg-green-500 text-white'
                                                    : isCurrent
                                                        ? `bg-${phase.color}-500 text-white ring-4 ring-${phase.color}-100`
                                                        : 'bg-gray-100 text-gray-400'
                                                    }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle size={20} />
                                                ) : (
                                                    <PhaseIcon size={18} />
                                                )}
                                            </div>
                                            <span className={`mt-2 text-xs font-bold ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                                                }`}>
                                                {phase.label}
                                            </span>
                                            <span className="text-[10px] text-gray-400 text-center max-w-[80px] hidden sm:block">
                                                {phase.description}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Continue Button */}
                        {project.current_phase !== 'completed' && (
                            <Link
                                href={`/courses/${project.course_id}/${project.current_phase}`}
                                className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                            >
                                Continue {project.current_phase.charAt(0).toUpperCase() + project.current_phase.slice(1)} Phase
                                <ArrowRight size={16} />
                            </Link>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
