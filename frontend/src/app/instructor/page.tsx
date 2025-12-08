'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, CheckCircle, Clock, AlertCircle, Search,
    Filter, ChevronRight, BookOpen, Code, X, Sparkles, Save,
    Users, TrendingUp, LogOut, Award, FileText, Plus
} from 'lucide-react';
import { CourseModal, CourseFormData } from '@/components/instructor/CourseModal';
import SyllabusManager from '@/components/instructor/SyllabusManager';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { useAuth } from '@/lib/AuthContext';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { PageTransition } from '@/components/ui/PageTransition';

interface GradingQueueItem {
    id: number;
    project_id: number;
    student_name: string;
    project_title: string;
    submission_type: 'charter' | 'design' | 'implementation';
    course_title: string;
    submitted_at: string;
    status: 'pending' | 'graded' | 'needs_review';
}

interface GradingResult {
    grade: string;
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
}

interface InstructorStats {
    totalStudents: number;
    pendingReviews: number;
    averageRating: number;
    activeCourses: number;
}

interface Course {
    id: number;
    title: string;
    students_count: string;
    rating: number;
    image: string;
    level: string;
    category: string;
    description?: string;
    duration?: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    course: string;
    status: string;
    enrolled_at: string;
    progress: number;
    grade: string;
}

export default function InstructorDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'syllabus' | 'students' | 'grading'>('overview');

    const [loading, setLoading] = useState(true);
    const [queue, setQueue] = useState<GradingQueueItem[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [stats, setStats] = useState<InstructorStats>({
        totalStudents: 0,
        pendingReviews: 0,
        averageRating: 0,
        activeCourses: 0
    });

    // Grading Modal State
    const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<GradingQueueItem | null>(null);
    const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
    const [isGrading, setIsGrading] = useState(false);

    // Course Modal State
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseFormData | null>(null);

    // Syllabus Modal State
    const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
    const [selectedCourseForSyllabus, setSelectedCourseForSyllabus] = useState<Course | null>(null);

    // Filters
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        if (!user?.email) return;

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

        try {
            const [queueRes, coursesRes, studentsRes] = await Promise.all([
                fetch(`${BACKEND_URL}/api/v1/instructor/grading-queue`),
                fetch(`${BACKEND_URL}/api/v1/instructor/courses?user_email=${user.email}`),
                fetch(`${BACKEND_URL}/api/v1/instructor/students?user_email=${user.email}`)
            ]);

            let queueData = [];
            let coursesData = [];
            let studentsData = [];

            if (queueRes.ok) {
                const data = await queueRes.json();
                queueData = data.map((item: any) => ({
                    ...item,
                    status: item.status.toLowerCase()
                }));
                setQueue(queueData);
            }

            if (coursesRes.ok) {
                coursesData = await coursesRes.json();
                setCourses(coursesData);
            }

            if (studentsRes.ok) {
                studentsData = await studentsRes.json();
                setStudents(studentsData);
            }

            setStats({
                totalStudents: studentsData.length,
                pendingReviews: queueData.filter((i: any) => i.status === 'pending').length,
                averageRating: 4.8, // Mock for now
                activeCourses: coursesData.length
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (item: GradingQueueItem) => {
        setSelectedSubmission(item);
        setIsGradingModalOpen(true);
        setIsGrading(true);
        setGradingResult(null);

        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${BACKEND_URL}/api/v1/projects/${item.project_id}/grade`, {
                method: 'POST'
            });

            if (!response.ok) throw new Error('Failed to generate grade');

            const data = await response.json();
            setGradingResult(data);
        } catch (error) {
            console.error('Grading failed:', error);
            setGradingResult({
                grade: 'Error',
                score: 0,
                feedback: 'Failed to generate AI feedback. Please try again.',
                strengths: [],
                weaknesses: []
            });
        } finally {
            setIsGrading(false);
        }
    };

    const submitFinalGrade = () => {
        alert(`Grade submitted for ${selectedSubmission?.student_name}!`);
        setIsGradingModalOpen(false);
        // In real app: call API to save grade and update status
        // Optimistic update
        if (selectedSubmission) {
            setQueue(queue.map(item =>
                item.id === selectedSubmission.id ? { ...item, status: 'graded' } : item
            ));
            setStats(prev => ({ ...prev, pendingReviews: prev.pendingReviews - 1 }));
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleSaveCourse = async (courseData: CourseFormData) => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        try {
            let response;
            if (editingCourse) {
                // Update
                response = await fetch(`${BACKEND_URL}/api/v1/instructor/courses/${courseData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(courseData)
                });
            } else {
                // Create
                response = await fetch(`${BACKEND_URL}/api/v1/instructor/courses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...courseData,
                        instructor: user?.name || 'Instructor',
                        org: 'TSEA',
                        institution_id: 1
                    })
                });
            }

            if (!response.ok) throw new Error('Failed to save course');

            fetchDashboardData();
            setIsCourseModalOpen(false);
            setEditingCourse(null);
        } catch (error) {
            console.error('Failed to save course:', error);
            alert('Failed to save course. Please try again.');
        }
    };

    const openCreateModal = () => {
        setEditingCourse(null);
        setIsCourseModalOpen(true);
    };

    const openEditModal = (course: Course) => {
        setEditingCourse({
            id: course.id,
            title: course.title,
            description: course.description || '',
            level: course.level,
            category: course.category,
            image: course.image,
            duration: course.duration || ''
        });
        setIsCourseModalOpen(true);
    };

    const filteredQueue = queue.filter(item => {
        const matchesFilter = filter === 'all' || item.status === filter;
        const matchesSearch = item.student_name.toLowerCase().includes(search.toLowerCase()) ||
            item.project_title.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'graded': return 'bg-green-100 text-green-800';
            case 'needs_review': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'charter': return <BookOpen className="w-4 h-4" />;
            case 'design': return <LayoutDashboard className="w-4 h-4" />;
            case 'implementation': return <Code className="w-4 h-4" />;
            default: return <CheckCircle className="w-4 h-4" />;
        }
    };

    return (
        <RoleRouteGuard allowedRoles={['instructor']}>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-20 hidden lg:block">
                    <div className="p-6">
                        <Logo />
                    </div>

                    <nav className="mt-6 px-4 space-y-2">
                        <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <NavItem icon={BookOpen} label="My Courses" active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                        <NavItem icon={Users} label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
                        <NavItem icon={CheckCircle} label="Grading Queue" active={activeTab === 'grading'} onClick={() => setActiveTab('grading')} badge={stats.pendingReviews > 0 ? stats.pendingReviews : undefined} />
                        <NavItem icon={FileText} label="Syllabus" active={activeTab === 'syllabus'} onClick={() => setActiveTab('syllabus')} />
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
                                {activeTab === 'overview' ? 'Instructor Dashboard' :
                                    activeTab === 'courses' ? 'My Courses' :
                                        activeTab === 'students' ? 'Student Management' : 'Grading Queue'}
                            </h1>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">Instructor</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {user?.name?.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </header>

                    <PageTransition className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Users size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5 new</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Total Students</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.totalStudents}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
                                                <Clock size={20} />
                                            </div>
                                            {stats.pendingReviews > 0 && (
                                                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Action Needed</span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Pending Reviews</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.pendingReviews}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <BookOpen size={20} />
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Active Courses</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.activeCourses}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <Award size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Top 10%</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Avg. Course Rating</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.averageRating}</h3>
                                    </div>
                                </div>

                                {/* Recent Submissions (Preview) */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Recent Submissions</h3>
                                        <button
                                            onClick={() => setActiveTab('grading')}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    {/* Reuse the table logic but limited items */}
                                    {/* ... (Table code below) ... */}
                                </div>
                            </div>
                        )}

                        {(activeTab === 'grading' || activeTab === 'overview') && (
                            <div className={activeTab === 'overview' ? 'mt-8' : ''}>
                                {/* Filters */}
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search students or projects..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="graded">Graded</option>
                                            <option value="needs_review">Needs Review</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Queue List */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student / Project</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {loading ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                            Loading submissions...
                                                        </td>
                                                    </tr>
                                                ) : filteredQueue.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                            No submissions found matching your criteria.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredQueue.slice(0, activeTab === 'overview' ? 5 : undefined).map((item, index) => (
                                                        <tr key={`queue-${item.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium text-gray-900">{item.project_title}</span>
                                                                    <span className="text-sm text-gray-500">{item.student_name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {item.course_title}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2 text-sm text-gray-700 capitalize">
                                                                    {getTypeIcon(item.submission_type)}
                                                                    {item.submission_type}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {new Date(item.submitted_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                                    {item.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <button
                                                                    onClick={() => handleGrade(item)}
                                                                    className="flex items-center gap-1 px-3 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all text-sm font-medium"
                                                                    title="AI Grade"
                                                                >
                                                                    <Sparkles className="w-4 h-4" />
                                                                    Grade
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                                    <button onClick={openCreateModal} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 flex items-center gap-2 transition-colors shadow-lg shadow-primary/20">
                                        <Plus size={18} /> Create Course
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courses.map(course => (
                                        <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                            <div className="h-40 bg-gray-200 relative">
                                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-900">
                                                    {course.level}
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                    <span className="flex items-center gap-1"><Users size={14} /> {course.students_count} Students</span>
                                                    <span className="flex items-center gap-1"><Award size={14} /> {course.rating}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(course)}
                                                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-xl hover:bg-indigo-100 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCourseForSyllabus(course);
                                                            setIsSyllabusModalOpen(true);
                                                        }}
                                                        className="flex-1 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <FileText size={14} />
                                                        Syllabus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {courses.length === 0 && (
                                        <div className="col-span-full text-center py-12 text-gray-500">
                                            No courses found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'syllabus' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">Syllabus Management</h2>
                                    <p className="text-sm text-gray-500">Select a course to manage its syllabus</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {courses.map(course => (
                                        <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                                            onClick={() => {
                                                setSelectedCourseForSyllabus(course);
                                                setIsSyllabusModalOpen(true);
                                            }}
                                        >
                                            <div className="h-32 bg-gray-200 relative">
                                                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute bottom-3 left-4 right-4">
                                                    <h3 className="font-bold text-white line-clamp-1">{course.title}</h3>
                                                    <p className="text-white/80 text-sm">{course.duration}</p>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                                    <span className="flex items-center gap-1"><Users size={14} /> {course.students_count} Students</span>
                                                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium">{course.level}</span>
                                                </div>
                                                <button
                                                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 group-hover:shadow-xl group-hover:shadow-emerald-500/30"
                                                >
                                                    <FileText size={16} />
                                                    Manage Syllabus
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {courses.length === 0 && (
                                        <div className="col-span-full text-center py-12 text-gray-500">
                                            No courses found. Create a course first to manage its syllabus.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'students' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {students.map(student => (
                                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">{student.name}</span>
                                                            <span className="text-sm text-gray-500">{student.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{student.course}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{student.enrolled_at}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${student.progress}%` }}></div>
                                                            </div>
                                                            <span className="text-xs font-medium text-gray-600">{student.progress}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {students.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No students found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </PageTransition>

                    {/* Grading Modal */}
                    {isGradingModalOpen && selectedSubmission && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Grading: {selectedSubmission.project_title}</h2>
                                        <p className="text-sm text-gray-500">Student: {selectedSubmission.student_name} • Type: {selectedSubmission.submission_type}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsGradingModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {isGrading ? (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <p className="text-gray-600 font-medium animate-pulse">AI Agent is analyzing submission...</p>
                                        </div>
                                    ) : gradingResult ? (
                                        <>
                                            <div className="flex gap-4">
                                                <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                                                    <div className="text-sm text-gray-500 mb-1">Suggested Grade</div>
                                                    <div className="text-3xl font-bold text-indigo-600">{gradingResult.grade}</div>
                                                </div>
                                                <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                                                    <div className="text-sm text-gray-500 mb-1">Score</div>
                                                    <div className="text-3xl font-bold text-gray-900">{gradingResult.score}/100</div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
                                                <textarea
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[120px]"
                                                    defaultValue={gradingResult.feedback}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                                    <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> Strengths
                                                    </h3>
                                                    <ul className="space-y-1">
                                                        {gradingResult.strengths.map((s, i) => (
                                                            <li key={i} className="text-sm text-green-700">• {s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                                    <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" /> Improvements
                                                    </h3>
                                                    <ul className="space-y-1">
                                                        {gradingResult.weaknesses.map((w, i) => (
                                                            <li key={i} className="text-sm text-orange-700">• {w}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-red-500">Failed to load grading results.</div>
                                    )}
                                </div>

                                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsGradingModalOpen(false)}
                                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitFinalGrade}
                                        disabled={isGrading || !gradingResult}
                                        className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Save className="w-4 h-4" />
                                        Submit Grade
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <CourseModal
                        isOpen={isCourseModalOpen}
                        onClose={() => setIsCourseModalOpen(false)}
                        onSubmit={handleSaveCourse}
                        initialData={editingCourse}
                        isEditing={!!editingCourse}
                    />

                    {isSyllabusModalOpen && selectedCourseForSyllabus && (
                        <SyllabusManager
                            courseId={selectedCourseForSyllabus.id}
                            courseTitle={selectedCourseForSyllabus.title}
                            courseDuration={selectedCourseForSyllabus.duration}
                            onClose={() => {
                                setIsSyllabusModalOpen(false);
                                setSelectedCourseForSyllabus(null);
                            }}
                            onSave={async (syllabusData) => {
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/courses/${selectedCourseForSyllabus.id}/syllabus`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(syllabusData)
                                });
                                if (!response.ok) {
                                    const errorData = await response.text();
                                    console.error('Syllabus save failed:', response.status, errorData);
                                    throw new Error('Failed to save syllabus');
                                }
                                console.log('Syllabus saved successfully');
                            }}
                        />
                    )}
                </main>
            </div>
        </RoleRouteGuard>
    );
}
