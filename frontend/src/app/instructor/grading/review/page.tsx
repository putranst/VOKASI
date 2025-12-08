'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { InboxDrawer } from '@/components/ui/InboxDrawer';
import { useAuth } from '@/lib/AuthContext';
import {
    ArrowLeft, LogOut, CheckCircle, XCircle, FileText,
    Sparkles, MessageSquare, Send, Loader2, Award
} from 'lucide-react';

interface ProjectDetail {
    project: {
        id: number;
        project_title: string;
        course_id: number;
        user_id: number;
        current_phase: string;
        completion_percentage: number;
    };
    charter?: {
        id: number;
        problem_statement: string;
        success_metrics: string;
        target_outcome: string;
        constraints: string;
        stakeholders: string;
        suggested_tools: string[];
        reasoning: string;
        estimated_duration: string;
        difficulty_level: string;
    };
    blueprint?: {
        id: number;
        logic_flow: string;
        component_list: string[];
        data_flow: string;
    };
    implementation?: {
        id: number;
        code_snapshot: string;
        notes: string;
        security_check_passed: boolean;
    };
}

function ReviewContent() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const projectId = searchParams.get('project');
    const submissionType = searchParams.get('type');

    const [activeTab, setActiveTab] = useState('grading');
    const [loading, setLoading] = useState(true);
    const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
    const [feedback, setFeedback] = useState('');
    const [grade, setGrade] = useState<'approve' | 'reject' | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [loadingAi, setLoadingAi] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    useEffect(() => {
        const fetchProjectDetail = async () => {
            if (!projectId) return;

            try {
                const response = await fetch(`http://localhost:8000/api/v1/projects/${projectId}`);
                if (response.ok) {
                    const data = await response.json();
                    setProjectDetail(data);
                }
            } catch (error) {
                console.error('Failed to fetch project details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectDetail();
    }, [projectId]);

    const handleGetAiSuggestion = async () => {
        setLoadingAi(true);
        try {
            // Mock AI suggestion for now
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (submissionType === 'Charter' && projectDetail?.charter) {
                setAiSuggestion(`**AI Analysis:**

✅ **Strengths:**
- Clear problem statement with measurable impact
- Well-defined success metrics
- Realistic constraints identified

⚠️ **Suggestions for Improvement:**
- Consider adding specific timeline milestones
- Stakeholder analysis could be more detailed
- Risk assessment is missing

**Recommended Grade:** Approve with minor revisions
**Confidence:** 85%`);
            } else if (submissionType === 'Blueprint' && projectDetail?.blueprint) {
                setAiSuggestion(`**AI Analysis:**

✅ **Strengths:**
- Logical component breakdown
- Clear data flow architecture

⚠️ **Areas to Address:**
- Error handling strategy not defined
- Scalability considerations missing
- Security measures need elaboration

**Recommended Grade:** Request revisions
**Confidence:** 78%`);
            } else {
                setAiSuggestion('AI analysis not available for this submission type.');
            }
        } catch (error) {
            console.error('AI suggestion failed:', error);
        } finally {
            setLoadingAi(false);
        }
    };

    const handleSubmitGrade = async () => {
        if (!grade || !projectId) return;

        setSubmitting(true);
        try {
            // Call feedback endpoint
            const response = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grade: grade,
                    feedback: feedback
                })
            });

            if (!response.ok) throw new Error('Failed to submit feedback');

            // Navigate back to grading queue
            router.push('/instructor/grading');
        } catch (error) {
            console.error('Failed to submit grade:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderSubmissionContent = () => {
        if (submissionType === 'Charter' && projectDetail?.charter) {
            const charter = projectDetail.charter;
            return (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Project Charter
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-blue-800 block mb-1">Problem Statement</label>
                                <p className="text-blue-900 bg-white rounded-lg p-3 border border-blue-200">
                                    {charter.problem_statement}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-blue-800 block mb-1">Success Metrics</label>
                                <p className="text-blue-900 bg-white rounded-lg p-3 border border-blue-200">
                                    {charter.success_metrics}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-blue-800 block mb-1">Target Outcome</label>
                                <p className="text-blue-900 bg-white rounded-lg p-3 border border-blue-200">
                                    {charter.target_outcome}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-blue-800 block mb-1">Constraints</label>
                                    <p className="text-blue-900 bg-white rounded-lg p-3 border border-blue-200 text-sm">
                                        {charter.constraints}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-blue-800 block mb-1">Stakeholders</label>
                                    <p className="text-blue-900 bg-white rounded-lg p-3 border border-blue-200 text-sm">
                                        {charter.stakeholders}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-blue-800 block mb-1">Suggested Tools</label>
                                <div className="flex flex-wrap gap-2">
                                    {charter.suggested_tools.map((tool, i) => (
                                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-white rounded-lg p-3 border border-blue-200">
                                    <span className="text-xs text-blue-600 font-medium">Duration</span>
                                    <p className="text-blue-900 font-bold">{charter.estimated_duration}</p>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-blue-200">
                                    <span className="text-xs text-blue-600 font-medium">Difficulty</span>
                                    <p className="text-blue-900 font-bold">{charter.difficulty_level}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (submissionType === 'Blueprint' && projectDetail?.blueprint) {
            const blueprint = projectDetail.blueprint;
            return (
                <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Design Blueprint
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-purple-800 block mb-1">Logic Flow</label>
                                <p className="text-purple-900 bg-white rounded-lg p-3 border border-purple-200 font-mono text-sm">
                                    {blueprint.logic_flow}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-purple-800 block mb-1">Components</label>
                                <div className="flex flex-wrap gap-2">
                                    {blueprint.component_list.map((comp, i) => (
                                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            {comp}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {blueprint.data_flow && (
                                <div>
                                    <label className="text-sm font-semibold text-purple-800 block mb-1">Data Flow</label>
                                    <p className="text-purple-900 bg-white rounded-lg p-3 border border-purple-200">
                                        {blueprint.data_flow}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (submissionType === 'Implementation' && projectDetail?.implementation) {
            const impl = projectDetail.implementation;
            return (
                <div className="space-y-6">
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
                        <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Implementation
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-amber-800 block mb-1">Code Snapshot</label>
                                <pre className="text-amber-900 bg-gray-900 text-green-400 rounded-lg p-4 border border-amber-200 font-mono text-xs overflow-x-auto">
                                    {impl.code_snapshot || '// No code submitted'}
                                </pre>
                            </div>

                            {impl.notes && (
                                <div>
                                    <label className="text-sm font-semibold text-amber-800 block mb-1">Notes</label>
                                    <p className="text-amber-900 bg-white rounded-lg p-3 border border-amber-200">
                                        {impl.notes}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                {impl.security_check_passed ? (
                                    <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold">
                                        <CheckCircle className="w-3 h-3" />
                                        Security Check Passed
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold">
                                        <XCircle className="w-3 h-3" />
                                        Security Check Failed
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return <p className="text-gray-500">No submission data available.</p>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/">
                            <Logo />
                        </Link>
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider">
                            Instructor Mode
                        </div>
                        <nav className="hidden lg:flex items-center gap-8">
                            <NavItem label="Overview" active={activeTab === 'overview'} href="/instructor" />
                            <NavItem label="My Students" active={activeTab === 'students'} href="/instructor/students" />
                            <NavItem label="Grading" active={activeTab === 'grading'} href="/instructor/grading" />
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                            <InboxDrawer />
                            <NotificationPopover />
                        </div>

                        <Link href="/instructor/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                MH
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden md:block">Mats Hanson</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/instructor/grading"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Grading Queue
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-black text-gray-900">
                            {projectDetail?.project.project_title || 'Review Submission'}
                        </h1>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider
                            ${submissionType === 'Charter' ? 'bg-blue-100 text-blue-700' :
                                submissionType === 'Blueprint' ? 'bg-purple-100 text-purple-700' :
                                    submissionType === 'Implementation' ? 'bg-amber-100 text-amber-700' :
                                        'bg-green-100 text-green-700'}`}>
                            {submissionType}
                        </span>
                    </div>
                    <p className="text-gray-600">
                        Student {projectDetail?.project.user_id} • Project #{projectDetail?.project.id}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Submission Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {renderSubmissionContent()}

                        {/* Grading Decision */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Your Feedback</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Feedback & Comments
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        rows={6}
                                        placeholder="Provide constructive feedback to the student..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Grading Decision
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setGrade('approve')}
                                            className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${grade === 'approve'
                                                ? 'bg-green-600 text-white shadow-lg scale-105'
                                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                                }`}
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => setGrade('reject')}
                                            className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${grade === 'reject'
                                                ? 'bg-red-600 text-white shadow-lg scale-105'
                                                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                                }`}
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Request Revisions
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmitGrade}
                                    disabled={!grade || submitting}
                                    className="w-full px-6 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Submit Grade
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Assistant */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 shadow-sm p-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-purple-900">AI Grading Assistant</h3>
                            </div>

                            {!aiSuggestion ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-purple-800">
                                        Get AI-powered insights and grading suggestions based on this submission.
                                    </p>
                                    <button
                                        onClick={handleGetAiSuggestion}
                                        disabled={loadingAi}
                                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loadingAi ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                Get AI Suggestion
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                                        <div className="prose prose-sm max-w-none text-gray-700">
                                            {aiSuggestion.split('\n').map((line, i) => (
                                                <p key={i} className="mb-2">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setAiSuggestion('')}
                                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                                    >
                                        Clear suggestion
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Project Progress</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Completion</span>
                                    <span className="font-bold text-gray-900">
                                        {projectDetail?.project.completion_percentage || 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${projectDetail?.project.completion_percentage || 0}%` }}
                                    />
                                </div>
                                <div className="pt-2 border-t border-gray-100">
                                    <span className="text-xs text-gray-500">Current Phase</span>
                                    <p className="font-bold text-gray-900 capitalize">
                                        {projectDetail?.project.current_phase || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function ReviewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <ReviewContent />
        </Suspense>
    );
}
