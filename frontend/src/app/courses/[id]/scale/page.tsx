'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import IRISStepper from '@/components/ui/IRISStepper';
import { useAuth } from '@/lib/AuthContext';
import { TrendingUp, Building2, Users, BarChart3, Award, Send, CheckCircle, ExternalLink } from 'lucide-react';


export default function ScalePage() {
    const params = useParams();
    const courseId = Number(params.id);
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        deployment_url: '',
        deployment_platform: '',
        institutional_handoff: '',
        stakeholder_training: '',
        impact_metrics: {} as Record<string, string>,
        sfia_evidence: {} as Record<string, string>
    });

    const impactMetrics = [
        { key: 'users_trained', label: 'Users Trained', placeholder: 'e.g., 15 staff members' },
        { key: 'processes_improved', label: 'Processes Improved', placeholder: 'e.g., 3 workflows automated' },
        { key: 'time_saved', label: 'Time Saved', placeholder: 'e.g., 10 hours/week' },
        { key: 'other', label: 'Other Impact', placeholder: 'Any other measurable impact' },
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

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/projects/${courseId}/scale`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    user_id: user?.id
                })
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Failed to submit scale:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateImpactMetric = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            impact_metrics: { ...prev.impact_metrics, [key]: value }
        }));
    };

    const updateSfiaEvidence = (code: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            sfia_evidence: { ...prev.sfia_evidence, [code]: value }
        }));
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <IRISStepper courseId={courseId} currentPhase="scale" completedPhases={['immerse', 'realize', 'iterate', 'scale']} />

                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-12 text-center text-white shadow-xl">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">🎉 IRIS Cycle Complete!</h2>
                        <p className="text-green-100 mb-2">
                            Congratulations! You've completed all 4 phases of the IRIS Cycle.
                        </p>
                        <p className="text-green-100 mb-8">
                            Your "Nusantara AI Fellow" credential is being processed.
                        </p>

                        <div className="bg-white/10 rounded-xl p-6 mb-8 text-left">
                            <h3 className="font-bold mb-4 text-center">SFIA Competency Achievement</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">L3</div>
                                    <div className="text-sm text-green-200">Proficient</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">4</div>
                                    <div className="text-sm text-green-200">Skills Demonstrated</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/dashboard"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-bold hover:bg-green-50 transition-colors"
                            >
                                View Dashboard
                            </a>
                            <a
                                href="/verify"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-400 transition-colors"
                            >
                                <ExternalLink size={18} />
                                View Credential
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <IRISStepper courseId={courseId} currentPhase="scale" completedPhases={['immerse', 'realize', 'iterate']} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Scale Phase</h1>
                                    <p className="text-gray-500 text-sm">Days 25-28+: Institutional deployment & credential</p>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                                <h3 className="font-bold text-green-900 mb-2">IRIS Cycle Guidance</h3>
                                <p className="text-sm text-green-800">
                                    In the Scale phase, you deploy your solution to the institution and train stakeholders.
                                    Document the impact, provide evidence of your SFIA competencies, and prepare for certification.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Deployment URL */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <ExternalLink size={16} />
                                        Deployment URL *
                                    </label>
                                    <input
                                        required
                                        type="url"
                                        placeholder="https://your-deployed-solution.com"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.deployment_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, deployment_url: e.target.value }))}
                                    />
                                </div>

                                {/* Deployment Platform */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        Platform
                                    </label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.deployment_platform}
                                        onChange={(e) => setFormData(prev => ({ ...prev, deployment_platform: e.target.value }))}
                                    >
                                        <option value="">Select platform...</option>
                                        <option value="vercel">Vercel</option>
                                        <option value="railway">Railway</option>
                                        <option value="heroku">Heroku</option>
                                        <option value="aws">AWS</option>
                                        <option value="gcp">Google Cloud</option>
                                        <option value="azure">Azure</option>
                                        <option value="self-hosted">Self-hosted</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Institutional Handoff */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Building2 size={16} />
                                        Institutional Handoff Documentation
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="How will the institution maintain and operate this solution? What documentation have you provided?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.institutional_handoff}
                                        onChange={(e) => setFormData(prev => ({ ...prev, institutional_handoff: e.target.value }))}
                                    />
                                </div>

                                {/* Stakeholder Training */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Users size={16} />
                                        Stakeholder Training Provided
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="What training did you provide to end users? How many people were trained?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.stakeholder_training}
                                        onChange={(e) => setFormData(prev => ({ ...prev, stakeholder_training: e.target.value }))}
                                    />
                                </div>

                                {/* Impact Metrics */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <BarChart3 size={16} />
                                        Impact Metrics
                                    </label>
                                    <div className="space-y-3">
                                        {impactMetrics.map(metric => (
                                            <div key={metric.key} className="flex items-center gap-3">
                                                <div className="w-32 text-sm text-gray-600">{metric.label}</div>
                                                <input
                                                    type="text"
                                                    placeholder={metric.placeholder}
                                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                    value={formData.impact_metrics[metric.key] || ''}
                                                    onChange={(e) => updateImpactMetric(metric.key, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SFIA Evidence */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Award size={16} />
                                        SFIA Competency Evidence
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">Describe how you demonstrated each competency</p>
                                    <div className="space-y-3">
                                        {sfiaSkills.map(skill => (
                                            <div key={skill.code} className="p-3 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-bold text-sm">{skill.code}</span>
                                                    <span className="text-xs text-gray-500">{skill.name}</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder={`Evidence for ${skill.code}...`}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                                    value={formData.sfia_evidence[skill.code] || ''}
                                                    onChange={(e) => updateSfiaEvidence(skill.code, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !formData.deployment_url}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {loading ? 'Submitting...' : (
                                        <>
                                            <Award size={18} />
                                            Complete IRIS Cycle & Claim Credential
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* IRIS Guidance */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Guiding Questions</h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    How did you hand off the solution?
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    What training did you provide?
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600">•</span>
                                    What measurable impact achieved?
                                </li>
                            </ul>
                        </div>

                        {/* Credential Preview */}
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                            <h3 className="font-bold mb-2">🏆 Your Credential</h3>
                            <div className="text-sm text-amber-100 mb-4">
                                Nusantara AI Fellow
                            </div>
                            <div className="text-xs text-amber-200 space-y-1">
                                <div>✓ SFIA-aligned competencies</div>
                                <div>✓ ISO 17024 certification path</div>
                                <div>✓ Blockchain-verified</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
