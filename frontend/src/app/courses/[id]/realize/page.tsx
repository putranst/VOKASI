'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import IRISStepper from '@/components/ui/IRISStepper';
import { useAuth } from '@/lib/AuthContext';
import { useEnrollmentGuard } from '@/hooks/useEnrollmentGuard';
import { useIrisProject } from '@/hooks/useIrisProject';
import { EnhancedSocraticTutor } from '@/components/EnhancedSocraticTutor';
import { Brain, Target, BookOpen, MessageSquare, PenTool, Send, CheckCircle, HelpCircle } from 'lucide-react';


export default function RealizePage() {
    const params = useParams();
    const courseId = Number(params.id);
    const { user } = useAuth();
    const { checking } = useEnrollmentGuard(courseId);
    const { project, loading: projectLoading } = useIrisProject(courseId);

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        gap_analysis: '',
        learning_plan: '',
        question_log: ['', '', ''],
        sfia_assessment: {} as Record<string, string>,
        architecture_sketch: null as any
    });

    // SFIA self-assessment options
    const sfiaLevels = [
        { value: 'L1', label: 'L1 - Awareness', description: 'Basic awareness' },
        { value: 'L2', label: 'L2 - Working', description: 'Can apply with guidance' },
        { value: 'L3', label: 'L3 - Proficient', description: 'Applies reliably' },
        { value: 'L4', label: 'L4 - Expert', description: 'Designs approaches' },
    ];

    const sfiaSkills = [
        { code: 'DATM', name: 'Data Management' },
        { code: 'DTAN', name: 'Data Analysis' },
        { code: 'MLAI', name: 'Machine Learning/AI' },
        { code: 'PROG', name: 'Programming' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!project) { setError('Project not initialised. Please refresh.'); setLoading(false); return; }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/iris/reflection?project_id=${project.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    q_what_i_know: formData.question_log.filter(q => q.trim()),
                    p_what_i_need: formData.learning_plan ? [formData.learning_plan] : [],
                    sfia_current_level: 1,
                    sfia_target_level: 3,
                    skill_gaps: [formData.gap_analysis],
                    learning_resources: [],
                    sfia_assessment: formData.sfia_assessment,
                    user_id: user?.id
                })
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.detail || `Server error (${response.status}). Please try again.`);
            }
        } catch (err) {
            setError('Network error — please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateQuestion = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            question_log: prev.question_log.map((q, i) => i === index ? value : q)
        }));
    };

    const updateSfiaLevel = (code: string, level: string) => {
        setFormData(prev => ({
            ...prev,
            sfia_assessment: { ...prev.sfia_assessment, [code]: level }
        }));
    };

    if (checking || projectLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <IRISStepper courseId={courseId} currentPhase="realize" completedPhases={['immerse', 'realize']} />

                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Realize Phase Complete!</h2>
                        <p className="text-gray-600 mb-6">
                            You've identified your gaps and mapped your SFIA competencies. Time to iterate!
                        </p>
                        <a
                            href={`/courses/${courseId}/iterate`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            Continue to Iterate →
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <IRISStepper courseId={courseId} currentPhase="realize" completedPhases={['immerse']} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Brain size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Realize Phase</h1>
                                    <p className="text-gray-500 text-sm">Days 5-10: Gap analysis & SFIA mapping</p>
                                </div>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8">
                                <h3 className="font-bold text-purple-900 mb-2">IRIS Cycle Guidance</h3>
                                <p className="text-sm text-purple-800">
                                    In the Realize phase, you analyze your knowledge gaps and map them against SFIA
                                    competency descriptors. Ask yourself: What do I already know (Q)? What do I need
                                    to learn (P)? Use the Socratic Tutor to explore these questions.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                    <p className="text-sm font-bold text-red-700">⚠ {error}</p>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Gap Analysis */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Target size={16} />
                                        Gap Analysis *
                                    </label>
                                    <textarea
                                        required
                                        minLength={50}
                                        rows={5}
                                        placeholder="Based on your immersion observations, what knowledge/skill gaps exist? What do you need to learn to solve this problem?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.gap_analysis}
                                        onChange={(e) => setFormData(prev => ({ ...prev, gap_analysis: e.target.value }))}
                                    />
                                </div>

                                {/* SFIA Self-Assessment */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <PenTool size={16} />
                                        SFIA Self-Assessment
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">Rate your current level for each relevant skill</p>
                                    <div className="space-y-3">
                                        {sfiaSkills.map(skill => (
                                            <div key={skill.code} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                                <div className="w-24">
                                                    <div className="font-bold text-sm">{skill.code}</div>
                                                    <div className="text-xs text-gray-500">{skill.name}</div>
                                                </div>
                                                <div className="flex-1 flex gap-2">
                                                    {sfiaLevels.map(level => (
                                                        <button
                                                            key={level.value}
                                                            type="button"
                                                            onClick={() => updateSfiaLevel(skill.code, level.value)}
                                                            className={`flex-1 py-2 px-2 text-xs rounded-lg border transition-all ${formData.sfia_assessment[skill.code] === level.value
                                                                ? 'border-primary bg-primary text-white'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            {level.value}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Question Log */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <MessageSquare size={16} />
                                        Key Questions (Socratic Reflection)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">Document 3 key questions that emerged from your reflection</p>
                                    <div className="space-y-2">
                                        {formData.question_log.map((q, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                placeholder={`Question ${i + 1}...`}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={q}
                                                onChange={(e) => updateQuestion(i, e.target.value)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Learning Plan */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <BookOpen size={16} />
                                        Learning Plan
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="What programmed knowledge (P) will you need? What resources, materials, or training will help you bridge the gap?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.learning_plan}
                                        onChange={(e) => setFormData(prev => ({ ...prev, learning_plan: e.target.value }))}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || formData.gap_analysis.length < 50}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : (
                                        <>
                                            <Send size={18} />
                                            Complete Realize Phase
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Enhanced Socratic Tutor */}
                        <EnhancedSocraticTutor
                            courseId={String(courseId)}
                            phase="realize"
                            context={{
                                gapAnalysis: formData.gap_analysis,
                                learningPlan: formData.learning_plan,
                                sfiaAssessment: formData.sfia_assessment
                            }}
                            userRole="student"
                            className="h-[500px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
