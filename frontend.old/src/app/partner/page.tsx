'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { InboxDrawer } from '@/components/ui/InboxDrawer';
import {
    LayoutDashboard, BookOpen, Users, DollarSign,
    TrendingUp, Settings, LogOut, Plus, Search, MoreVertical, Star,
    UserPlus, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, GraduationCap
} from 'lucide-react';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';

interface InstitutionStats {
    institution_id: number;
    total_active_students: number;
    total_completions: number;
    total_certificates_issued: number;
    average_course_rating: number;
    total_revenue: number;
    month_over_month_growth: number;
}

interface Instructor {
    id: number;
    name: string;
    email: string;
    instructor_type: string;
    courses_count: number;
    pending_courses: number;
    created_at: string | null;
}

interface PendingCourse {
    id: number;
    title: string;
    category: string;
    level: string;
    instructor_id: number;
    instructor_name: string;
    created_at: string | null;
}

export default function InstitutionDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<InstitutionStats | null>(null);
    const [topCourses, setTopCourses] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<PendingCourse | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Form states
    const [newInstructorEmail, setNewInstructorEmail] = useState('');
    const [newInstructorName, setNewInstructorName] = useState('');

    // Mock institution ID (would come from auth context)
    const institutionId = 1;
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Stats
            const statsRes = await fetch(`${API_BASE_URL}/api/v1/institutions/${institutionId}/stats`);
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            // Fetch Courses
            const coursesRes = await fetch(`${API_BASE_URL}/api/v1/institutions/${institutionId}/courses`);
            if (coursesRes.ok) {
                const coursesData = await coursesRes.json();
                const sortedCourses = [...coursesData].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
                setTopCourses(sortedCourses);
            }

            // Fetch Instructors
            const instructorsRes = await fetch(`${API_BASE_URL}/api/v1/institutions/${institutionId}/instructors`);
            if (instructorsRes.ok) {
                const instructorsData = await instructorsRes.json();
                setInstructors(instructorsData);
            }

            // Fetch Pending Courses
            const pendingRes = await fetch(`${API_BASE_URL}/api/v1/institutions/${institutionId}/pending-courses`);
            if (pendingRes.ok) {
                const pendingData = await pendingRes.json();
                setPendingCourses(pendingData);
            }

        } catch (error) {
            console.error('[Institution Dashboard] Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [institutionId]);

    const handleAddInstructor = async () => {
        if (!newInstructorEmail || !newInstructorName) return;

        const formData = new FormData();
        formData.append('email', newInstructorEmail);
        formData.append('full_name', newInstructorName);

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/institutions/${institutionId}/instructors`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setShowAddInstructorModal(false);
                setNewInstructorEmail('');
                setNewInstructorName('');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to add instructor:', error);
        }
    };

    const handleApproveCourse = async (courseId: number) => {
        const formData = new FormData();
        formData.append('approver_id', '1'); // Would come from auth context

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/approve`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setShowApprovalModal(false);
                setSelectedCourse(null);
                fetchData();
            }
        } catch (error) {
            console.error('Failed to approve course:', error);
        }
    };

    const handleRejectCourse = async (courseId: number) => {
        if (!rejectionReason) return;

        const formData = new FormData();
        formData.append('approver_id', '1');
        formData.append('reason', rejectionReason);

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/courses/${courseId}/reject`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                setShowApprovalModal(false);
                setSelectedCourse(null);
                setRejectionReason('');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to reject course:', error);
        }
    };

    return (
        <RoleRouteGuard allowedRoles={['institution']}>
            <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-10">
                            <Link href="/">
                                <Logo />
                            </Link>
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                Partner Admin
                            </div>
                            <nav className="hidden lg:flex items-center gap-8">
                                <NavItem label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                                <NavItem label="Instructors" active={activeTab === 'instructors'} onClick={() => setActiveTab('instructors')} />
                                <NavItem label="Approvals" active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} />
                                <NavItem label="Courses" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                                <NavItem label="Revenue" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} />
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                                <InboxDrawer />
                                <NotificationPopover />
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                                    PA
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">Partner Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-12">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard Overview</h1>
                                    <p className="text-gray-600">Welcome back! Here's what's happening with your institution.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('instructors')}
                                    className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    <Users size={18} />
                                    Manage Instructors
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                            <Users size={24} />
                                        </div>
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            +{stats?.month_over_month_growth || 0}%
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-1">
                                        {stats?.total_active_students.toLocaleString() || 0}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">Active Students</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                                            <GraduationCap size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-1">
                                        {instructors.length}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">Instructors</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                            <Clock size={24} />
                                        </div>
                                        {pendingCourses.length > 0 && (
                                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                                Action Required
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-1">
                                        {pendingCourses.length}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">Pending Approvals</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-green-50 text-green-600">
                                            <DollarSign size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-1">
                                        ${(stats?.total_revenue || 0).toLocaleString()}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            {pendingCourses.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-xl bg-amber-100">
                                                <AlertCircle className="w-6 h-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Courses Awaiting Approval</h3>
                                                <p className="text-sm text-gray-600">{pendingCourses.length} course(s) need your review</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('approvals')}
                                            className="px-4 py-2 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2"
                                        >
                                            Review Now
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Top Courses */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Top Performing Courses</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Course</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Students</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {topCourses.map((course) => (
                                                <tr key={course.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
                                                    <td className="px-6 py-4 text-gray-600">{course.students_count || 0}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                            <Star size={14} fill="currentColor" />
                                                            {course.rating || '0.0'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Instructors Tab */}
                    {activeTab === 'instructors' && (
                        <>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 mb-2">Manage Instructors</h1>
                                    <p className="text-gray-600">Add and manage instructors in your institution.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddInstructorModal(true)}
                                    className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    <UserPlus size={18} />
                                    Add Instructor
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Instructor</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Courses</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Pending</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {instructors.map((instructor) => (
                                            <tr key={instructor.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {instructor.name.charAt(0)}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{instructor.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600">{instructor.email}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{instructor.courses_count}</td>
                                                <td className="px-6 py-4">
                                                    {instructor.pending_courses > 0 ? (
                                                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                                            {instructor.pending_courses} pending
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {instructors.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    No instructors yet. Add your first instructor!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {/* Approvals Tab */}
                    {activeTab === 'approvals' && (
                        <>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 mb-2">Pending Approvals</h1>
                                    <p className="text-gray-600">Review and approve courses from your instructors.</p>
                                </div>
                            </div>

                            {pendingCourses.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h2>
                                    <p className="text-gray-500">No courses pending approval.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingCourses.map((course) => (
                                        <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{course.title}</h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Users size={14} />
                                                            {course.instructor_name}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                                                            {course.category}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-xs">
                                                            {course.level}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCourse(course);
                                                            setShowApprovalModal(true);
                                                        }}
                                                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                                    >
                                                        Review
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveCourse(course.id)}
                                                        className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={16} />
                                                        Approve
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Placeholder for other tabs */}
                    {(activeTab === 'courses' || activeTab === 'revenue') && (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Settings className="w-8 h-8 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
                            </h2>
                            <p className="text-gray-500">Coming soon!</p>
                        </div>
                    )}
                </main>

                {/* Add Instructor Modal */}
                {showAddInstructorModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Instructor</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newInstructorName}
                                        onChange={(e) => setNewInstructorName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="Dr. John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newInstructorEmail}
                                        onChange={(e) => setNewInstructorEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="john@institution.edu"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddInstructorModal(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddInstructor}
                                    className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90"
                                >
                                    Add Instructor
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Approval Modal */}
                {showApprovalModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Review Course</h2>
                            <p className="text-gray-600 mb-4">{selectedCourse.title}</p>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Instructor</span>
                                    <span className="font-medium">{selectedCourse.instructor_name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Category</span>
                                    <span className="font-medium">{selectedCourse.category}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Level</span>
                                    <span className="font-medium">{selectedCourse.level}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (if rejecting)</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20"
                                    rows={3}
                                    placeholder="Please provide feedback for the instructor..."
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowApprovalModal(false);
                                        setSelectedCourse(null);
                                        setRejectionReason('');
                                    }}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRejectCourse(selectedCourse.id)}
                                    disabled={!rejectionReason}
                                    className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApproveCourse(selectedCourse.id)}
                                    className="px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 flex items-center gap-2"
                                >
                                    <CheckCircle size={16} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </RoleRouteGuard>
    );
}
