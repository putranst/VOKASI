'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import IRISStepper from '@/components/ui/IRISStepper';
import { useAuth } from '@/lib/AuthContext';
import { useEnrollmentGuard } from '@/hooks/useEnrollmentGuard';
import { useIrisProject } from '@/hooks/useIrisProject';
import { EnhancedSocraticTutor } from '@/components/EnhancedSocraticTutor';
import { Eye, Users, Building2, Target, FileText, Sparkles, Send, CheckCircle, HelpCircle, Brain } from 'lucide-react';

export default function ImmersePage() {
    const params = useParams();
    const courseId = Number(params.id);
    const { user } = useAuth();
    const { checking } = useEnrollmentGuard(courseId);
    const { project, loading: projectLoading, error: projectError } = useIrisProject(courseId);

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        problem_context: '',
        stakeholder_map: '',
        empathy_notes: '',
        institutional_anchor: '',
        sfia_targets: [] as string[]
    });

    // SFIA competency options for AI domain
    const sfiaOptions = [
        { code: 'DATM', name: 'Data Management', description: 'Managing data assets' },
        { code: 'DTAN', name: 'Data Analysis', description: 'Analyzing and interpreting data' },
        { code: 'MLAI', name: 'Machine Learning/AI', description: 'Developing ML/AI solutions' },
        { code: 'PROG', name: 'Programming', description: 'Software development' },
        { code: 'BUAN', name: 'Business Analysis', description: 'Analyzing business needs' },
        { code: 'DESN', name: 'Design', description: 'Solution design' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!project) { setError('Project not initialised. Please refresh.'); setLoading(false); return; }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/iris/immersion?project_id=${project.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    observation_notes: formData.problem_context,
                    problem_context: formData.problem_context,
                    stakeholder_interviews: formData.stakeholder_map ? [formData.stakeholder_map] : [],
                    target_sfia_level: 3,
                    empathy_notes: formData.empathy_notes,
                    institutional_anchor: formData.institutional_anchor,
                    sfia_targets: formData.sfia_targets,
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

    const toggleSfiaTarget = (code: string) => {
        setFormData(prev => ({
            ...prev,
            sfia_targets: prev.sfia_targets.includes(code)
                ? prev.sfia_targets.filter(c => c !== code)
                : [...prev.sfia_targets, code]
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
                    <IRISStepper courseId={courseId} currentPhase="immerse" completedPhases={['immerse']} />

                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Immerse Phase Complete!</h2>
                        <p className="text-gray-600 mb-6">
                            You've successfully documented your problem context. You're ready for the Realize phase.
                        </p>
                        <a
                            href={`/courses/${courseId}/realize`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            Continue to Realize →
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <IRISStepper courseId={courseId} currentPhase="immerse" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Eye size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Immerse Phase</h1>
                                    <p className="text-gray-500 text-sm">Days 1-5: Live in authentic problem context</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                                <h3 className="font-bold text-blue-900 mb-2">IRIS Cycle Guidance</h3>
                                <p className="text-sm text-blue-800">
                                    In the Immerse phase, you observe and document the real problem context.
                                    Spend time in the actual environment—a government office, SME, or institution—to
                                    understand who is affected and what challenges they face.
                                </p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-2">
                                    <p className="text-sm font-bold text-red-700">⚠ {error}</p>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Problem Context */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <FileText size={16} />
                                        Problem Context *
                                    </label>
                                    <textarea
                                        required
                                        minLength={50}
                                        rows={5}
                                        placeholder="Describe the problem you observed in the authentic context. What did you see? What processes are struggling? What pain points exist?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.problem_context}
                                        onChange={(e) => setFormData(prev => ({ ...prev, problem_context: e.target.value }))}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Minimum 50 characters</p>
                                </div>

                                {/* Institutional Anchor */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Building2 size={16} />
                                        Institutional Anchor
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Dinas Pendidikan Kota Bandung, UMKM Batik Cirebon"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.institutional_anchor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, institutional_anchor: e.target.value }))}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">The government office, SME, or institution hosting your problem</p>
                                </div>

                                {/* Stakeholder Map */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Users size={16} />
                                        Stakeholder Map
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Who is affected by this problem? Who are the decision-makers? Who will use the solution?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.stakeholder_map}
                                        onChange={(e) => setFormData(prev => ({ ...prev, stakeholder_map: e.target.value }))}
                                    />
                                </div>

                                {/* Empathy Notes */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Sparkles size={16} />
                                        Empathy Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="What surprised you? What emotions did you observe? What workarounds are people using?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.empathy_notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, empathy_notes: e.target.value }))}
                                    />
                                </div>

                                {/* SFIA Target Competencies */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Target size={16} />
                                        Target SFIA Competencies
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">Select the skills you'll develop through this project</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sfiaOptions.map(skill => (
                                            <button
                                                key={skill.code}
                                                type="button"
                                                onClick={() => toggleSfiaTarget(skill.code)}
                                                className={`p-3 rounded-xl border text-left transition-all ${formData.sfia_targets.includes(skill.code)
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="font-bold text-sm">{skill.code}</div>
                                                <div className="text-xs text-gray-500">{skill.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || formData.problem_context.length < 50}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : (
                                        <>
                                            <Send size={18} />
                                            Complete Immerse Phase
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
                            phase="immerse"
                            context={{
                                problemContext: formData.problem_context,
                                stakeholders: formData.stakeholder_map,
                                institution: formData.institutional_anchor
                            }}
                            userRole="student"
                            className="h-[500px]"
                        />

                        {/* NUSA Framework Info */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                            <h3 className="font-bold mb-2">NUSA Framework</h3>
                            <p className="text-sm text-blue-100 mb-4">
                                National Upskilling Structure for Applied AI learning
                            </p>
                            <div className="text-xs text-blue-200 space-y-1">
                                <div>🎯 Target: SFIA Level 3 (Proficient)</div>
                                <div>📍 Regional implementation ready</div>
                                <div>👥 Practice-oriented learner pathway</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
