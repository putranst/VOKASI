'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { InboxDrawer } from '@/components/ui/InboxDrawer';
import { useAuth } from '@/lib/AuthContext';
import { FileText, CheckCircle, XCircle, Clock, LogOut, Filter, Loader2 } from 'lucide-react';

interface GradingItem {
    id: number;
    project_id: number;
    student_name: string;
    project_title: string;
    submission_type: string;
    course_title: string;
    submitted_at: string;
    status: string;
}

export default function GradingPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('grading');
    const [filterStatus, setFilterStatus] = useState('all');
    const [submissions, setSubmissions] = useState<GradingItem[]>([]);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    useEffect(() => {
        const fetchGradingQueue = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/instructor/grading-queue`);
                if (response.ok) {
                    const data = await response.json();
                    setSubmissions(data);
                }
            } catch (error) {
                console.error('Failed to fetch grading queue:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGradingQueue();
    }, []);

    const filteredSubmissions = submissions.filter(s => filterStatus === 'all' || s.status === filterStatus);

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

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Grading Queue</h1>
                        <p className="text-gray-600">Review and grade student submissions across all CDIO phases.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white font-medium"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Graded">Graded</option>
                            <option value="Returned">Returned</option>
                        </select>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                <Clock size={24} />
                            </div>
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-600">
                                Urgent
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-1">
                            {submissions.filter(s => s.status === 'Pending').length}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-1">
                            {submissions.filter(s => s.status === 'Graded').length}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">Graded This Week</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                <FileText size={24} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-1">{submissions.length}</h3>
                        <p className="text-sm text-gray-500 font-medium">Total Submissions</p>
                    </div>
                </div>

                {/* Submissions List */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Submissions</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filteredSubmissions.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No submissions found.
                                </div>
                            ) : (
                                filteredSubmissions.map((submission) => (
                                    <div key={`${submission.submission_type}-${submission.id}`} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    {submission.student_name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-gray-900">{submission.project_title}</h3>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider
                                                            ${submission.submission_type === 'Charter' ? 'bg-blue-100 text-blue-700' :
                                                                submission.submission_type === 'Blueprint' ? 'bg-purple-100 text-purple-700' :
                                                                    submission.submission_type === 'Implementation' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-green-100 text-green-700'}`}>
                                                            {submission.submission_type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {submission.student_name} • {submission.course_title} • {submission.submitted_at}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full ${submission.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                    submission.status === 'Graded' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {submission.status === 'Pending' && <Clock size={14} />}
                                                    {submission.status === 'Graded' && <CheckCircle size={14} />}
                                                    {submission.status === 'Returned' && <XCircle size={14} />}
                                                    {submission.status}
                                                </div>

                                                {submission.status === 'Pending' && (
                                                    <Link
                                                        href={`/instructor/grading/review?project=${submission.project_id}&type=${submission.submission_type}`}
                                                        className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                                    >
                                                        Review Now
                                                    </Link>
                                                )}
                                                {submission.status === 'Graded' && (
                                                    <Link
                                                        href={`/instructor/grading/review?project=${submission.project_id}&type=${submission.submission_type}`}
                                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        View Grade
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
