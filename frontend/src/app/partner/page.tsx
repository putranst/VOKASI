'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { InboxDrawer } from '@/components/ui/InboxDrawer';
import { supabase } from '@/lib/supabase';
import {
    LayoutDashboard, BookOpen, Users, DollarSign,
    TrendingUp, Settings, LogOut, Plus, Search, MoreVertical, Star
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

export default function InstitutionDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<InstitutionStats | null>(null);
    const [topCourses, setTopCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock institution ID (would come from auth context)
    const institutionId = 1;
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                console.log('[Institution Dashboard] Fetching stats for institution:', institutionId);

                // Fetch Stats from API
                const statsRes = await fetch(`${API_BASE_URL}/api/v1/institutions/${institutionId}/stats`);
                if (!statsRes.ok) throw new Error('Failed to fetch stats');
                const statsData = await statsRes.json();
                setStats(statsData);

                // Fetch Courses from API
                const coursesRes = await fetch(`${API_BASE_URL}/api/v1/institutions/${institutionId}/courses`);
                if (!coursesRes.ok) throw new Error('Failed to fetch courses');
                const coursesData = await coursesRes.json();

                // Set Top Courses (sorted by rating)
                const sortedCourses = [...coursesData].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
                setTopCourses(sortedCourses);

            } catch (error) {
                console.error('[Institution Dashboard] Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [institutionId]);

    return (
        <RoleRouteGuard allowedRoles={['institution']}>
            <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-10">
                            <Link href="/">
                                <Logo />
                            </Link>
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                Institution Admin
                            </div>
                            <nav className="hidden lg:flex items-center gap-8">
                                <NavItem label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                                <NavItem label="Courses" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                                <NavItem label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                                <NavItem label="Revenue" active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} />
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 mr-4 border-r border-gray-200 pr-4">
                                <InboxDrawer />
                                <NotificationPopover />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                                    MIT
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden md:block">MIT Admin</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 py-12">
                    {activeTab === 'overview' ? (
                        <>
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard Overview</h1>
                                    <p className="text-gray-600">Welcome back! Here's what's happening with your courses today.</p>
                                </div>
                                <button className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                                    <Plus size={18} />
                                    Create New Course
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
                                            <BookOpen size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-1">
                                        {stats?.total_completions.toLocaleString() || 0}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">Course Completions</p>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                            <Star size={24} />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-gray-900 mb-1">
                                        {stats?.average_course_rating || 0}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">Average Rating</p>
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

                            {/* Recent Activity / Courses Table */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Top Performing Courses</h2>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search courses..."
                                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course Name</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Students</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {topCourses.length > 0 ? (
                                                topCourses.map((course) => (
                                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                                                                    {course.image && <img src={course.image} alt={course.title} className="w-full h-full object-cover" />}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-900">{course.title}</div>
                                                                    <div className="text-xs text-gray-500">Updated recently</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">{course.students_count || 0}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                                                                <Star size={14} fill="currentColor" />
                                                                {course.rating || '0.0'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                                            {/* Revenue per course would require grouping, using global avg for MVP display */}
                                                            -
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                                                <MoreVertical size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                        No courses found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Settings className="w-8 h-8 text-gray-400" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
                            </h2>
                            <p className="text-gray-500 max-w-md">
                                This module is currently under development. Check back soon for updates.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </RoleRouteGuard >
    );
}
