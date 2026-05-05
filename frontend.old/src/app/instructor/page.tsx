'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard, CheckCircle, Clock, AlertCircle, Search,
    Filter, ChevronRight, BookOpen, Code, X, Sparkles, Save,
    Users, TrendingUp, LogOut, Award, FileText, Plus, BarChart2, Pencil, GraduationCap
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

interface CapstoneSubmission {
    id: number;
    user_id: number;
    title: string;
    description: string;
    artifact_url?: string;
    github_url?: string;
    status: 'pending' | 'ai_graded' | 'approved' | 'rejected' | 'revision_requested';
    ai_score?: number;
    ai_feedback?: string;
    instructor_score?: number;
    instructor_feedback?: string;
    submitted_at: string;
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

const GradingQueueTable = ({ items, loading, onGrade, limit }: { items: GradingQueueItem[], loading: boolean, onGrade: (item: GradingQueueItem) => void, limit?: number }) => {
    const displayItems = limit ? items.slice(0, limit) : items;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-full">
            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
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
                        ) : displayItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No submissions found.
                                </td>
                            </tr>
                        ) : (
                            displayItems.map((item, index) => (
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
                                            onClick={() => onGrade(item)}
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
    );
};

export default function InstructorDashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'syllabus' | 'students' | 'grading' | 'capstone'>('overview');

    const [loading, setLoading] = useState(true);
    const [queue, setQueue] = useState<GradingQueueItem[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [capstoneQueue, setCapstoneQueue] = useState<CapstoneSubmission[]>([]);
    const [capstoneLoading, setCapstoneLoading] = useState(false);
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

    // AM-006: Puck course list
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const [puckCourses, setPuckCourses] = useState<Array<{
        course_id: number;
        title: string;
        approval_status: string;
        total_blocks: number;
        unique_learners: number;
        avg_completion_pct: number;
        certificates_issued: number;
        reflections_submitted: number;
    }>>([]);

    useEffect(() => {
        fetch(`${API_BASE}/api/v1/puck/courses`)
            .then(r => r.ok ? r.json() : [])
            .then(setPuckCourses)
            .catch(() => {});
    }, [API_BASE]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
            fetchCapstoneQueue();
        }
    }, [user]);

    const fetchCapstoneQueue = async () => {
        setCapstoneLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/v1/instructor/capstone`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!res.ok) throw new Error('Failed to fetch capstone submissions');
            const data = await res.json();
            setCapstoneQueue(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch capstone queue:', e);
            setCapstoneQueue([]);
        } finally {
            setCapstoneLoading(false);
        }
    };

    const reviewCapstone = async (submissionId: number, decision: 'approved' | 'rejected' | 'revision_requested') => {
        try {
            const token = localStorage.getItem('token');
            const reviewerId = Number(user?.id || 0);
            const res = await fetch(`${API_BASE}/api/v1/capstone/${submissionId}/review`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    decision,
                    reviewer_id: reviewerId,
                    instructor_feedback:
                        decision === 'approved'
                            ? 'Good work. Capstone approved.'
                            : decision === 'revision_requested'
                                ? 'Please improve your documentation and resubmit.'
                                : 'Capstone does not meet minimum criteria yet.',
                }),
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || 'Failed to review capstone');
            }
            await fetchCapstoneQueue();
        } catch (e) {
            console.error(e);
            alert('Failed to update capstone status. Please try again.');
        }
    };

    const fetchDashboardData = async () => {
        if (!user?.email) return;

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

        try {
            const [queueRes, coursesRes, studentsRes] = await Promise.all([
                fetch(`${BACKEND_URL}/api/v1/instructor/grading-queue`),
                fetch(`${BACKEND_URL}/api/v1/instructor/courses?user_email=${user.email}`),
                fetch(`${BACKEND_URL}/api/v1/instructor/students?user_email=${user.email}`)
            ]);

            let queueData: GradingQueueItem[] = [];
            let coursesData: Course[] = [];
            let studentsData: Student[] = [];

            if (queueRes.ok) {
                const data: Array<{ [key: string]: unknown }> = await queueRes.json();
                queueData = data.map((item) => ({
                    id: Number(item.id),
                    project_id: Number(item.project_id),
                    student_name: String(item.student_name ?? ''),
                    project_title: String(item.project_title ?? ''),
                    course_title: String(item.course_title ?? ''),
                    submitted_at: String(item.submitted_at ?? new Date().toISOString()),
                    ...item,
                    status: String(item.status ?? 'pending').toLowerCase() as GradingQueueItem['status'],
                    submission_type: (String(item.submission_type ?? '').toLowerCase() === 'blueprint'
                        ? 'design'
                        : String(item.submission_type ?? 'implementation').toLowerCase()) as GradingQueueItem['submission_type']
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
                pendingReviews: queueData.filter((i) => i.status === 'pending').length,
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
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
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
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
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
                        org: 'VOKASI',
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

    // Helper functions removed from here (moved to module scope)

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
                        <NavItem icon={GraduationCap} label="Capstone Review" active={activeTab === 'capstone'} onClick={() => setActiveTab('capstone')} badge={capstoneQueue.filter(c => c.status === 'ai_graded' || c.status === 'pending').length || undefined} />
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
                <main className="flex-1 lg:ml-64 min-h-screen w-full max-w-[100vw] overflow-x-hidden">
                    {/* Header */}
                    <header className="bg-white border-b border-gray-100 sticky top-0 z-10 w-full">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                            <h1 className="text-xl font-bold text-gray-900 truncate pr-2">
                                {activeTab === 'overview' ? 'Instructor Dashboard' :
                                    activeTab === 'courses' ? 'My Courses' :
                                        activeTab === 'students' ? 'Student Management' :
                                            activeTab === 'capstone' ? 'Capstone Review' : 'Grading Queue'}
                            </h1>
                            <div className="flex items-center gap-4 shrink-0">
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

                    <PageTransition className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-w-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                <Users size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">+5 new</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium truncate">Total Students</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.totalStudents}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-w-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                                                <Clock size={20} />
                                            </div>
                                            {stats.pendingReviews > 0 && (
                                                <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full whitespace-nowrap">Action Needed</span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium truncate">Pending Reviews</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.pendingReviews}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-w-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                                                <BookOpen size={20} />
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium truncate">Active Courses</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.activeCourses}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-w-0">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                                <Award size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full whitespace-nowrap">Top 10%</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium truncate">Avg. Course Rating</p>
                                        <h3 className="text-2xl font-black text-gray-900">{stats.averageRating}</h3>
                                    </div>
                                </div>

                                {/* AM-006: VOKASI Courses (Puck) */}
                                {puckCourses.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <LayoutDashboard size={16} className="text-emerald-600" />
                                                <h3 className="text-base font-bold text-gray-900">Kursus VOKASI</h3>
                                                <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{puckCourses.length}</span>
                                            </div>
                                            <button
                                                onClick={() => router.push('/instructor/create-course')}
                                                className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700"
                                            >
                                                <Plus size={12} /> New Course
                                            </button>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {puckCourses.map((c) => (
                                                <div key={c.course_id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                                    {/* Status dot */}
                                                    <div className={`h-2 w-2 shrink-0 rounded-full ${
                                                        c.approval_status === 'published' ? 'bg-emerald-500' :
                                                        c.approval_status === 'approved' ? 'bg-blue-500' :
                                                        'bg-zinc-300'
                                                    }`} />
                                                    {/* Title + stats */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{c.title}</p>
                                                        <div className="mt-1.5 flex items-center gap-3">
                                                            {/* progress bar */}
                                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${
                                                                            c.avg_completion_pct >= 80 ? 'bg-emerald-500' :
                                                                            c.avg_completion_pct >= 40 ? 'bg-blue-400' : 'bg-zinc-300'
                                                                        }`}
                                                                        style={{ width: `${c.avg_completion_pct}%` }}
                                                                    />
                                                                </div>
                                                                <span className="shrink-0 text-[11px] text-gray-400">{c.avg_completion_pct}%</span>
                                                            </div>
                                                            <span className="shrink-0 flex items-center gap-1 text-[11px] text-gray-400">
                                                                <Users size={10} />{c.unique_learners}
                                                            </span>
                                                            <span className="shrink-0 flex items-center gap-1 text-[11px] text-gray-400">
                                                                <Award size={10} />{c.certificates_issued}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            onClick={() => router.push(`/instructor/builder/${c.course_id}`)}
                                                            className="flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-50"
                                                            title="Open Builder"
                                                        >
                                                            <Pencil size={10} /> Builder
                                                        </button>
                                                        <button
                                                            onClick={() => router.push(`/instructor/builder/${c.course_id}?analytics=1`)}
                                                            className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100"
                                                            title="Analytics"
                                                        >
                                                            <BarChart2 size={10} /> Analytics
                                                        </button>
                                                        <button
                                                            onClick={() => window.open(`/courses/${c.course_id}/learn/puck`, '_blank')}
                                                            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-100"
                                                            title="Student View"
                                                        >
                                                            <ChevronRight size={10} /> Preview
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Submissions (Preview) */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Recent Submissions</h3>
                                        <button
                                            onClick={() => setActiveTab('grading')}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 whitespace-nowrap"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <GradingQueueTable
                                        items={queue.filter(i => i.status === 'pending')}
                                        loading={loading}
                                        onGrade={handleGrade}
                                        limit={5}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'grading' && (
                            <div>
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
                                            className="w-full md:w-auto px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="graded">Graded</option>
                                            <option value="needs_review">Needs Review</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Queue List */}
                                <GradingQueueTable
                                    items={filteredQueue}
                                    loading={loading}
                                    onGrade={handleGrade}
                                />
                            </div>
                        )}

                        {activeTab === 'courses' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                                    <button onClick={() => router.push('/instructor/create-course')} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 flex items-center gap-2 transition-colors shadow-lg shadow-primary/20">
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
                                                        Syllabus
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/courses/${course.id}/editor`)}
                                                    className="w-full mt-2 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                                >
                                                    <LayoutDashboard size={14} />
                                                    Manage Content
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/instructor/builder/${course.id}`)}
                                                    className="w-full mt-2 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                                >
                                                    <LayoutDashboard size={14} />
                                                    Visual Builder
                                                </button>
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
                                            {students.map((student, index) => (
                                                <tr key={`student-${student.id}-${index}`} className="hover:bg-gray-50 transition-colors">
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

                        {activeTab === 'capstone' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900">Capstone Review Queue</h2>
                                    <button
                                        onClick={fetchCapstoneQueue}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Refresh
                                    </button>
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left whitespace-nowrap">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submission</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Score</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {capstoneLoading ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading capstone submissions...</td>
                                                    </tr>
                                                ) : capstoneQueue.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No capstone submissions yet.</td>
                                                    </tr>
                                                ) : (
                                                    capstoneQueue.map((s) => (
                                                        <tr key={s.id} className="hover:bg-gray-50 transition-colors align-top">
                                                            <td className="px-6 py-4">
                                                                <div className="max-w-xs">
                                                                    <p className="font-medium text-gray-900 truncate">{s.title}</p>
                                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 whitespace-normal">{s.description}</p>
                                                                    <div className="flex items-center gap-3 mt-2 text-xs">
                                                                        {s.artifact_url && (
                                                                            <a href={s.artifact_url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">Artifact</a>
                                                                        )}
                                                                        {s.github_url && (
                                                                            <a href={s.github_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">GitHub</a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                                {s.ai_score ?? '-'}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    s.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                                    s.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                    s.status === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                                                                    s.status === 'ai_graded' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                    {s.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {new Date(s.submitted_at).toLocaleDateString()}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button
                                                                        onClick={() => reviewCapstone(s.id, 'approved')}
                                                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
                                                                    >
                                                                        Approve
                                                                    </button>
                                                                    <button
                                                                        onClick={() => reviewCapstone(s.id, 'revision_requested')}
                                                                        className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold hover:bg-orange-100"
                                                                    >
                                                                        Request Revision
                                                                    </button>
                                                                    <button
                                                                        onClick={() => reviewCapstone(s.id, 'rejected')}
                                                                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100"
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </div>
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
                        onEditSyllabus={(courseId, courseTitle) => {
                            // Find course by ID and open syllabus manager
                            const course = courses.find(c => c.id === courseId);
                            if (course) {
                                setSelectedCourseForSyllabus(course);
                                setIsSyllabusModalOpen(true);
                                setIsCourseModalOpen(false);
                            }
                        }}
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
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/courses/${selectedCourseForSyllabus.id}/syllabus`, {
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
        </RoleRouteGuard >
    );
}
