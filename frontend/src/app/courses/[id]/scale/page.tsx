'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import IRISStepper from '@/components/ui/IRISStepper';
import { useAuth } from '@/lib/AuthContext';
import { EnhancedSocraticTutor } from '@/components/EnhancedSocraticTutor';
import { Rocket, Target, Users, BookOpen, Send, CheckCircle, Award, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ScalePage() {
    const params = useParams();
    const courseId = Number(params.id);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        deployment_url: '',
        deployment_platform: 'vercel',
        institutional_handoff: '',
        stakeholder_training: '',
        impact_metrics: '', // Simple string for now, could be key-value pairs
        sfia_evidence: ''
    });

    const triggerConfetti = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/projects/${courseId}/scale?user_id=${user?.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    impact_metrics: { summary: formData.impact_metrics }, // Wrap for JSON field
                    sfia_evidence: { evidence: formData.sfia_evidence }
                })
            });

            if (response.ok) {
                setSubmitted(true);
                triggerConfetti();
            }
        } catch (error) {
            console.error('Failed to submit scale artifact:', error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <IRISStepper courseId={courseId} currentPhase="scale" completedPhases={['immerse', 'realize', 'iterate', 'scale']} />

                    <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-indigo-100 mt-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Award className="w-12 h-12 text-indigo-600" />
                        </div>

                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
                            Congratulations, Graduate!
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            You have successfully completed the full innovation cycle and delivered real value.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
                                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Impact Verified</span>
                                <span className="font-semibold text-gray-900">Institutional Deployment Active</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-left">
                                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Credential Earned</span>
                                <span className="font-semibold text-gray-900">Certified Innovation Practitioner</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                View Your Credential Wallet
                            </button>
                            <a href="/dashboard" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                                Return to Dashboard
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <Rocket size={28} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Scale & Operate</h1>
                                    <p className="text-gray-500">Final Phase: Institutional Integration</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Deployment Info */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <ExternalLink size={20} className="text-indigo-500" />
                                        Live Deployment
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                                            <select
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                value={formData.deployment_platform}
                                                onChange={(e) => setFormData(prev => ({ ...prev, deployment_platform: e.target.value }))}
                                            >
                                                <option value="vercel">Vercel</option>
                                                <option value="aws">AWS</option>
                                                <option value="gcp">Google Cloud</option>
                                                <option value="azure">Azure</option>
                                                <option value="on-prem">On-Premise / Institutional Server</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
                                            <input
                                                type="url"
                                                required
                                                placeholder="https://..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                value={formData.deployment_url}
                                                onChange={(e) => setFormData(prev => ({ ...prev, deployment_url: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Institutional Handoff */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <BookOpen size={20} className="text-indigo-500" />
                                        Institutional Handoff Plan
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Documentation & Maintenance Strategy</label>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="How will the institution maintain this solution? Who are the owners?"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                value={formData.institutional_handoff}
                                                onChange={(e) => setFormData(prev => ({ ...prev, institutional_handoff: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stakeholder Training</label>
                                            <textarea
                                                required
                                                rows={3}
                                                placeholder="What training have you provided to the users/administrators?"
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                value={formData.stakeholder_training}
                                                onChange={(e) => setFormData(prev => ({ ...prev, stakeholder_training: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* Impact */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Target size={20} className="text-indigo-500" />
                                        Impact & Competency
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantifiable Impact Metrics</label>
                                            <textarea
                                                required
                                                rows={3}
                                                placeholder="e.g., Saved 20 hours/week, Reduced error rate by 15%..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                value={formData.impact_metrics}
                                                onChange={(e) => setFormData(prev => ({ ...prev, impact_metrics: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">SFIA Competency Evidence</label>
                                            <textarea
                                                rows={3}
                                                placeholder="Briefly describe how this project demonstrates SFIA Level 3/4 skills..."
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                                value={formData.sfia_evidence}
                                                onChange={(e) => setFormData(prev => ({ ...prev, sfia_evidence: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : (
                                        <>
                                            <Rocket size={20} />
                                            Launch Scaling Plan & Graduate
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <EnhancedSocraticTutor
                            courseId={String(courseId)}
                            phase="scale"
                            context={{
                                deploymentPlatform: formData.deployment_platform,
                                impactMetrics: formData.impact_metrics
                            }}
                            userRole="student"
                            className="h-[600px]"
                        />

                        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Users size={20} className="text-indigo-300" />
                                Stakeholder Checklist
                            </h3>
                            <ul className="space-y-3 text-sm text-indigo-100">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                    Identify key decision makers
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                    Prepare technical documentation
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                    Schedule handover meeting
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                    Define support SLA
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
