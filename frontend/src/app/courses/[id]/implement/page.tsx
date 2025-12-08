'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Code, ArrowLeft, Rocket, CheckCircle2, Star } from 'lucide-react';
import CloudIDE from '@/components/CloudIDE';
import GradingResultsModal from '@/components/GradingResultsModal';
import CDIOStepper from '@/components/ui/CDIOStepper';
import { supabase } from '@/lib/supabase';

export default function ImplementPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = params.id as string;
    const projectId = searchParams.get('project');
    const [success, setSuccess] = useState(false);
    const [grading, setGrading] = useState(false);
    const [gradingResult, setGradingResult] = useState<any>(null);
    const [showGradingModal, setShowGradingModal] = useState(false);

    const handleSuccess = () => {
        setSuccess(true);
        setTimeout(() => {
            router.push(`/courses/${courseId}/operate?project=${projectId}`);
        }, 1500);
    };

    const handleBackToDesign = () => {
        router.push(`/courses/${courseId}/design?project=${projectId}`);
    };

    const handleRequestFeedback = async () => {
        if (!projectId) {
            alert('Project not found');
            return;
        }

        setGrading(true);
        try {
            // Fetch latest code from Supabase
            const { data: implData, error: implError } = await supabase
                .from('implementations')
                .select('code_snapshot')
                .eq('project_id', parseInt(projectId))
                .single();

            if (implError || !implData?.code_snapshot) {
                alert('Please save your code in the Cloud IDE first.');
                setGrading(false);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api/v1/grading/implementation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: parseInt(projectId),
                    code_snapshot: implData.code_snapshot
                })
            });

            if (response.ok) {
                const result = await response.json();
                setGradingResult(result);
                setShowGradingModal(true);
            } else {
                alert('Failed to get feedback. Make sure you have submitted code first.');
            }
        } catch (error) {
            console.error('Grading request failed:', error);
            alert('Network error. Please check your connection.');
        } finally {
            setGrading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Code className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Implement Phase</h1>
                            <p className="text-sm text-gray-600">Build your solution in the Cloud IDE</p>
                        </div>
                    </div>

                    {/* CDIO Progress Bar */}
                    <div className="mt-6 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-medium">
                        <span className="text-primary">Conceive</span>
                        <span className="text-blue-600">Design</span>
                        <span className="text-green-600">Implement</span>
                        <span className="text-gray-400">Operate</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* CDIO Stepper Navigation */}
                <CDIOStepper courseId={parseInt(courseId)} currentPhase="implement" />

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-green-800 font-medium">Implementation submitted successfully! Moving to Operate phase...</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Cloud IDE */}
                    <div className="lg:col-span-2 space-y-6">
                        <CloudIDE projectId={projectId || "0"} />

                        {/* Request AI Feedback Button */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <button
                                onClick={handleRequestFeedback}
                                disabled={grading}
                                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Star className="w-5 h-5" />
                                {grading ? 'Getting AI Feedback...' : 'Request AI Code Review'}
                            </button>
                            <p className="text-xs text-gray-500 mt-3 text-center">
                                ⚡ Get instant feedback on your code quality, functionality, and best practices
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Tips */}
                    <div className="space-y-6">
                        <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                            <h3 className="font-bold text-green-900 mb-2">What is Implement?</h3>
                            <p className="text-sm text-green-800">
                                The Implement phase is where you write the code for your solution. Use test-driven development and version control best practices.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Best Practices</h3>
                            <ul className="space-y-3">
                                {[
                                    'Write clean, readable code',
                                    'Add meaningful comments',
                                    'Test edge cases',
                                    'Follow naming conventions',
                                    'Use version control (Git)'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-2">💡 Pro Tip</h3>
                            <p className="text-sm text-blue-800">
                                Use the AI Code Review to get instant feedback on your implementation before moving to the Operate phase!
                            </p>
                        </div>

                        <button
                            onClick={handleBackToDesign}
                            className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Design
                        </button>
                    </div>
                </div>
            </div>

            <GradingResultsModal
                isOpen={showGradingModal}
                onClose={() => setShowGradingModal(false)}
                result={gradingResult}
                title="Code Implementation Review"
            />
        </div>
    );
}
