'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { useAuth } from '@/lib/AuthContext';
import {
    Building2, BookOpen, Users, TrendingUp, Award, LogOut, Plus,
    BarChart3, Settings, DollarSign, ArrowRight, Star, Clock,
    GraduationCap, CheckCircle, AlertCircle, Loader2, Eye, Edit, Archive
} from 'lucide-react';
import { CourseCard, Course } from '@/components/ui/CourseCard';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { PageTransition } from '@/components/ui/PageTransition';

interface InstitutionStats {
    total_courses: number;
    total_learners: string;
    total_programs: number;
    total_enrollments: number;
    completion_rate: number;
    average_rating: number;
    revenue_this_month: number;
    new_enrollments_this_week: number;
}

interface InstitutionCourse {
    id: number;
    title: string;
    instructor: string;
    enrollments: number;
    rating: number;
    status: 'published' | 'draft' | 'pending';
    completionRate: number;
    thumbnail: string;
    category: string;
}

interface StudentEnrollment {
    id: number;
    student_name: string;
    student_email: string;
    course_title: string;
    enrolled_date: string;
    progress: number;
    status: 'active' | 'completed' | 'dropped';
}

interface InstitutionData {
    institution: {
        id: number;
        name: string;
        short_name: string;
        logo_url: string;
        type: string;
    };
    stats: InstitutionStats;
    courses: InstitutionCourse[];
    recent_enrollments: StudentEnrollment[];
}

export default function InstitutionDashboardPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'analytics'>('overview');
    const [data, setData] = useState<InstitutionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else {
            fetchInstitutionData();
        }
    }, [isAuthenticated, router, user?.id]);

    const fetchInstitutionData = async () => {
        try {
            // Try to fetch real data from the backend
            const institutionId = user?.institution_id || 1; // Default to 1 for demo
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

            const response = await fetch(`${backendUrl}/api/v1/institutions/${institutionId}/dashboard`);

            if (response.ok) {
                const apiData = await response.json();
                setData(apiData);
            } else {
                console.warn('[InstitutionDashboard] API returned error, using fallback data');
                setData(getMockData());
            }
        } catch (error) {
            console.error('[InstitutionDashboard] Failed to fetch data:', error);
            // Fallback to mock data for demo purposes
            setData(getMockData());
        } finally {
            setLoading(false);
        }
    };

    // Fallback mock data for demo purposes
    const getMockData = (): InstitutionData => ({
        institution: {
            id: 1,
            name: 'United in Diversity Foundation',
            short_name: 'UID',
            logo_url: 'https://ui-avatars.com/api/?name=UID&background=0066cc&color=fff&size=128',
            type: 'nonprofit'
        },
        stats: {
            total_courses: 12,
            total_learners: '5,234',
            total_programs: 3,
            total_enrollments: 8420,
            completion_rate: 72,
            average_rating: 4.6,
            revenue_this_month: 45000,
            new_enrollments_this_week: 127
        },
        courses: [
            { id: 1, title: 'Introduction to AI Ethics', instructor: 'Dr. Sarah Chen', enrollments: 1234, rating: 4.8, status: 'published', completionRate: 68, thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400', category: 'AI & Ethics' },
            { id: 2, title: 'Sustainable Development Goals', instructor: 'Prof. Ahmad Rahman', enrollments: 892, rating: 4.5, status: 'published', completionRate: 55, thumbnail: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=400', category: 'Sustainability' },
            { id: 3, title: 'Digital Literacy for All', instructor: 'Maria Santos', enrollments: 2156, rating: 4.7, status: 'published', completionRate: 82, thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400', category: 'Digital Skills' },
            { id: 4, title: 'Climate Action Leadership', instructor: 'Dr. James Liu', enrollments: 456, rating: 4.3, status: 'draft', completionRate: 0, thumbnail: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=400', category: 'Environment' },
        ],
        recent_enrollments: [
            { id: 1, student_name: 'John Smith', student_email: 'john@example.com', course_title: 'Introduction to AI Ethics', enrolled_date: '2026-01-14', progress: 25, status: 'active' },
            { id: 2, student_name: 'Emma Wilson', student_email: 'emma@example.com', course_title: 'Digital Literacy for All', enrolled_date: '2026-01-13', progress: 80, status: 'active' },
            { id: 3, student_name: 'Carlos Rodriguez', student_email: 'carlos@example.com', course_title: 'Sustainable Development Goals', enrolled_date: '2026-01-12', progress: 100, status: 'completed' },
            { id: 4, student_name: 'Aisha Patel', student_email: 'aisha@example.com', course_title: 'Introduction to AI Ethics', enrolled_date: '2026-01-11', progress: 45, status: 'active' },
            { id: 5, student_name: 'Li Wei', student_email: 'li@example.com', course_title: 'Digital Literacy for All', enrolled_date: '2026-01-10', progress: 0, status: 'dropped' },
        ]
    });

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (!isAuthenticated || !user) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published: 'bg-green-100 text-green-700',
            draft: 'bg-gray-100 text-gray-700',
            pending: 'bg-amber-100 text-amber-700',
            active: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700',
            dropped: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <RoleRouteGuard allowedRoles={['institution', 'admin']}>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-20 hidden lg:block">
                    <div className="p-6">
                        <Logo />
                    </div>

                    {/* Institution Badge */}
                    <div className="mx-4 mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                            <img
                                src={data?.institution.logo_url}
                                alt={data?.institution.name}
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                                <p className="text-sm font-bold text-gray-900">{data?.institution.short_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{data?.institution.type}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="mt-2 px-4 space-y-2">
                        <NavItem icon={BarChart3} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <NavItem icon={BookOpen} label="Courses" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                        <NavItem icon={Users} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                        <NavItem icon={TrendingUp} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                        <div className="pt-4 border-t border-gray-100">
                            <NavItem icon={Settings} label="Settings" />
                        </div>
                    </nav>

                    <div className="absolute bottom-8 left-0 w-full px-6">
                        <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-600 transition-colors w-full px-4 py-2 rounded-lg hover:bg-red-50">
                            <LogOut size={18} />
                            <span className="font-medium text-sm">Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 min-h-screen">
                    {/* Header */}
                    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-gray-900">
                                {activeTab === 'overview' ? 'Institution Dashboard' :
                                    activeTab === 'courses' ? 'Manage Courses' :
                                        activeTab === 'students' ? 'Student Enrollments' : 'Analytics & Reports'}
                            </h1>

                            <div className="flex items-center gap-4">
                                <Link
                                    href="/instructor"
                                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Create Course
                                </Link>

                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">Institution Admin</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
                                                alt={user?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <PageTransition className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        {activeTab === 'overview' && (
                            <>
                                {/* Welcome Section */}
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Welcome back! 👋
                                    </h2>
                                    <p className="text-gray-600">
                                        Here's an overview of your institution's performance on T6.
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <BookOpen size={20} />
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Total Courses</p>
                                        <h3 className="text-2xl font-black text-gray-900">{data?.stats.total_courses}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Users size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                +{data?.stats.new_enrollments_this_week} this week
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Active Learners</p>
                                        <h3 className="text-2xl font-black text-gray-900">{data?.stats.total_learners}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <TrendingUp size={20} />
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Completion Rate</p>
                                        <h3 className="text-2xl font-black text-gray-900">{data?.stats.completion_rate}%</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                <Star size={20} />
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Average Rating</p>
                                        <h3 className="text-2xl font-black text-gray-900">{data?.stats.average_rating}/5</h3>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {/* Top Courses */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-gray-900">Your Courses</h3>
                                            <button
                                                onClick={() => setActiveTab('courses')}
                                                className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                            >
                                                View All <ArrowRight size={14} />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {data?.courses.slice(0, 3).map((course) => (
                                                <div key={course.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                                    <img
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900 truncate">{course.title}</h4>
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusBadge(course.status)}`}>
                                                                {course.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">{course.instructor}</p>
                                                    </div>
                                                    <div className="text-right hidden md:block">
                                                        <div className="flex items-center gap-1 text-amber-500 mb-1">
                                                            <Star size={14} fill="currentColor" />
                                                            <span className="font-bold text-sm">{course.rating}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">{course.enrollments.toLocaleString()} students</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                                            <Edit size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Activity */}
                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-bold text-gray-900">Recent Enrollments</h3>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                                            <div className="space-y-4">
                                                {data?.recent_enrollments.slice(0, 5).map((enrollment) => (
                                                    <div key={enrollment.id} className="flex items-center gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                            {enrollment.student_name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 truncate">{enrollment.student_name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{enrollment.course_title}</p>
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusBadge(enrollment.status)}`}>
                                                            {enrollment.progress}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setActiveTab('students')}
                                                className="w-full mt-4 text-sm font-bold text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors"
                                            >
                                                View All Students
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-8 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Ready to expand your reach?</h3>
                                            <p className="text-gray-300">Create a new course and reach thousands of learners worldwide.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <Link
                                                href="/instructor"
                                                className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
                                            >
                                                <Plus size={18} />
                                                Create Course
                                            </Link>
                                            <button className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/20">
                                                View Analytics
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'courses' && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
                                        <p className="text-gray-600">Manage and monitor all your courses</p>
                                    </div>
                                    <Link
                                        href="/instructor"
                                        className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Create Course
                                    </Link>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Instructor</th>
                                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrollments</th>
                                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Completion</th>
                                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {data?.courses.map((course) => (
                                                <tr key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={course.thumbnail}
                                                                alt={course.title}
                                                                className="w-12 h-8 rounded object-cover flex-shrink-0"
                                                            />
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">{course.title}</p>
                                                                <p className="text-xs text-gray-500">{course.category}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{course.instructor}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-bold text-gray-900">{course.enrollments.toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center hidden lg:table-cell">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-green-500 rounded-full"
                                                                    style={{ width: `${course.completionRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-500">{course.completionRate}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-1 text-amber-500">
                                                            <Star size={14} fill="currentColor" />
                                                            <span className="font-bold text-sm">{course.rating}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${getStatusBadge(course.status)}`}>
                                                            {course.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-center gap-2">
                                                            <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="View">
                                                                <Eye size={16} />
                                                            </button>
                                                            <button className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Edit">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Archive">
                                                                <Archive size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab === 'students' && (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Student Enrollments</h2>
                                        <p className="text-gray-600">Track student progress across all courses</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
                                            <option>All Courses</option>
                                            {data?.courses.map(c => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))}
                                        </select>
                                        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
                                            <option>All Status</option>
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                            <option value="dropped">Dropped</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Enrolled Date</th>
                                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                                                <th className="text-center px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {data?.recent_enrollments.map((enrollment) => (
                                                <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                                {enrollment.student_name.split(' ').map(n => n[0]).join('')}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">{enrollment.student_name}</p>
                                                                <p className="text-xs text-gray-500">{enrollment.student_email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{enrollment.course_title}</td>
                                                    <td className="px-6 py-4 text-center text-sm text-gray-500 hidden md:table-cell">
                                                        {new Date(enrollment.enrolled_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${enrollment.progress === 100 ? 'bg-green-500' :
                                                                        enrollment.progress > 50 ? 'bg-blue-500' :
                                                                            'bg-amber-500'
                                                                        }`}
                                                                    style={{ width: `${enrollment.progress}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700 w-8">{enrollment.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${getStatusBadge(enrollment.status)}`}>
                                                            {enrollment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {activeTab === 'analytics' && (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                                    <p className="text-gray-600">Track your institution's performance metrics</p>
                                </div>

                                {/* Revenue & Growth */}
                                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h3 className="font-bold text-gray-900 mb-6">Revenue Overview</h3>
                                        <div className="flex items-end gap-6">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">This Month</p>
                                                <p className="text-3xl font-black text-gray-900">${data?.stats.revenue_this_month?.toLocaleString()}</p>
                                            </div>
                                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                +12% from last month
                                            </span>
                                        </div>
                                        <div className="mt-6 h-32 bg-gradient-to-t from-blue-50 to-transparent rounded-xl flex items-end justify-around px-4 pb-2">
                                            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                        <h3 className="font-bold text-gray-900 mb-6">Enrollment Trends</h3>
                                        <div className="flex items-end gap-6">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Total Enrollments</p>
                                                <p className="text-3xl font-black text-gray-900">{data?.stats.total_enrollments?.toLocaleString()}</p>
                                            </div>
                                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                +{data?.stats.new_enrollments_this_week} this week
                                            </span>
                                        </div>
                                        <div className="mt-6 h-32 bg-gradient-to-t from-purple-50 to-transparent rounded-xl flex items-end justify-around px-4 pb-2">
                                            {[55, 70, 60, 85, 75, 95, 88].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="w-8 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Performing Courses */}
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-6">Top Performing Courses</h3>
                                    <div className="space-y-4">
                                        {data?.courses.sort((a, b) => b.enrollments - a.enrollments).slice(0, 4).map((course, index) => (
                                            <div key={course.id} className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                                    {index + 1}
                                                </div>
                                                <img
                                                    src={course.thumbnail}
                                                    alt={course.title}
                                                    className="w-12 h-8 rounded object-cover"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 text-sm">{course.title}</p>
                                                    <p className="text-xs text-gray-500">{course.instructor}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{course.enrollments.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">enrollments</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </PageTransition>
                </main>
            </div>
        </RoleRouteGuard>
    );
}
