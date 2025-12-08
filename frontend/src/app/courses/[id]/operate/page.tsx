'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Rocket, Globe, Server, FileText, CheckCircle2, ArrowLeft, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { useSocraticPage } from '@/contexts/SocraticContext';
import CDIOStepper from '@/components/ui/CDIOStepper';

export default function OperatePage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = params.id as string;
    const projectId = searchParams.get('project');

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form state
    const [deploymentUrl, setDeploymentUrl] = useState('');
    const [platform, setPlatform] = useState('Vercel');
    const [readme, setReadme] = useState('');
    const [sbtData, setSbtData] = useState<{ token_id: string, explorer_url: string } | null>(null);

    // Register with Socratic context for AI Companion integration
    useSocraticPage(
        projectId || '',
        'operate',
        { deploymentUrl, platform, readme }
    );

    const handleDeploy = async () => {
        if (!projectId) return;

        setSubmitting(true);

        try {
            // 1. Submit deployment via backend API
            const deployResponse = await fetch(`http://localhost:8000/api/v1/deployments?project_id=${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deployment_url: deploymentUrl,
                    deployment_platform: platform,
                    readme: readme
                })
            });

            if (!deployResponse.ok) {
                throw new Error('Failed to submit deployment');
            }

            // 2. Request Credential Issuance (Backend)
            const credResponse = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/issue-credential`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (credResponse.ok) {
                const credData = await credResponse.json();

                // Set mock SBT data for display
                setSbtData({
                    token_id: credData.credential?.id?.toString() || "101",
                    explorer_url: credData.credential?.blockchain_tx_hash || "https://polygonscan.com"
                });

                setSuccess(true);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } else {
                alert('Deployment saved, but credential issuance failed.');
            }
        } catch (error) {
            console.error('Deployment submission failed:', error);
            alert('Failed to submit deployment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleBackToImplement = () => {
        router.push(`/courses/${courseId}/implement?project=${projectId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Rocket className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Operate Phase</h1>
                            <p className="text-sm text-gray-600">Deploy and maintain your solution</p>
                        </div>
                    </div>

                    {/* CDIO Progress Bar */}
                    <div className="mt-6 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-medium">
                        <span className="text-primary">Conceive</span>
                        <span className="text-blue-600">Design</span>
                        <span className="text-green-600">Implement</span>
                        <span className="text-orange-600">Operate</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* CDIO Stepper Navigation */}
                <CDIOStepper courseId={parseInt(courseId)} currentPhase="operate" />

                {success ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-12 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Project Completed & Verified!</h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                            Congratulations! You have successfully navigated the entire CDIO lifecycle. Your project is live.
                        </p>

                        {/* SBT Credential Card */}
                        {sbtData && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-6 mb-8 max-w-md mx-auto text-left relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Award className="w-24 h-24 text-purple-600" />
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Award className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-purple-900">Soulbound Token Minted</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-purple-700">Token ID:</span>
                                        <span className="font-mono font-bold text-purple-900">#{sbtData.token_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-purple-700">Status:</span>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Verified On-Chain
                                        </span>
                                    </div>
                                    <div className="pt-2 mt-2 border-t border-purple-200">
                                        <a
                                            href={sbtData.explorer_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 text-xs"
                                        >
                                            View on PolygonScan <Globe className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                            >
                                Return to Dashboard
                            </button>
                            <button
                                onClick={() => window.open(deploymentUrl, '_blank')}
                                className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                            >
                                View Deployment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left: Form */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">🚀 Deployment Details</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Live URL
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <input
                                                type="url"
                                                value={deploymentUrl}
                                                onChange={(e) => setDeploymentUrl(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                                placeholder="https://my-project.vercel.app"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Platform
                                        </label>
                                        <div className="relative">
                                            <Server className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <select
                                                value={platform}
                                                onChange={(e) => setPlatform(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none bg-white"
                                            >
                                                <option>Vercel</option>
                                                <option>Netlify</option>
                                                <option>Heroku</option>
                                                <option>AWS</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Release Notes / README
                                        </label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                            <textarea
                                                value={readme}
                                                onChange={(e) => setReadme(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                                rows={4}
                                                placeholder="Describe your deployment and how to use it..."
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between">
                                        <button
                                            onClick={handleBackToImplement}
                                            className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Back
                                        </button>
                                        <button
                                            onClick={handleDeploy}
                                            disabled={submitting || !deploymentUrl}
                                            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                        >
                                            {submitting ? 'Deploying...' : 'Submit Deployment'}
                                            {!submitting && <Rocket className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: AI Socratic Tutor */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                                <h3 className="font-bold text-orange-900 mb-2">What is Operate?</h3>
                                <p className="text-sm text-orange-800">
                                    The Operate phase is about delivering value. It involves deploying your solution, maintaining it, and gathering feedback for future iterations.
                                </p>
                            </div>

                            {/* Socratic Tutor - now via sidebar */}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Checklist</h3>
                                <ul className="space-y-3">
                                    {[
                                        'Code passed all tests',
                                        'Environment variables configured',
                                        'Database migrations run',
                                        'Documentation updated'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
