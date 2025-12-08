'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { NotificationPopover } from '@/components/ui/NotificationPopover';
import { InboxDrawer } from '@/components/ui/InboxDrawer';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { BookOpen, Award, TrendingUp, Clock, LogOut, X, Check, ArrowRight, Sparkles, GraduationCap, Users, Shield } from 'lucide-react';
import { CourseProgressCard, DashboardCourseProgress } from '@/components/CourseProgressCard';
import { CourseCard, Course } from '@/components/ui/CourseCard';
import DigitalWallet from '@/components/DigitalWallet';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { PageTransition } from '@/components/ui/PageTransition';
import { KnowledgeGraph } from '@/components/ui/KnowledgeGraph';

interface DashboardData {
    enrolled_courses: DashboardCourseProgress[];
    credentials: any[];
    total_learning_hours: number;
    average_progress: number;
    recommended_courses: Course[];
    upcoming_deadlines: any[];
}

export default function DashboardPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const [showCredentialModal, setShowCredentialModal] = useState(false);
    const [selectedCredential, setSelectedCredential] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'knowledge' | 'courses' | 'credentials'>('overview');

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else {
            const fetchDashboardData = async () => {
                if (!user) return;

                try {
                    console.log('[Dashboard] Fetching data for user:', user.id);

                    const response = await fetch(`http://localhost:8000/api/v1/student/dashboard?user_id=${user.id}`);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const dashboardData = await response.json();
                    console.log('[Dashboard] Data loaded:', dashboardData);

                    setData(dashboardData);
                } catch (error) {
                    console.error('[Dashboard] Failed to fetch dashboard data:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchDashboardData();
        }
    }, [isAuthenticated, router, user?.id]);

    if (!isAuthenticated || !user) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleViewCredential = (cert: any) => {
        setSelectedCredential(cert);
        setShowCredentialModal(true);
    };

    return (
        <RoleRouteGuard allowedRoles={['student']}>
            <div className="min-h-screen bg-gray-50 flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-20 hidden lg:block">
                    <div className="p-6">
                        <Logo />
                    </div>

                    <nav className="mt-6 px-4 space-y-2">
                        <NavItem icon={BookOpen} label="My Learning" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                        <NavItem icon={Award} label="Credentials" active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} />
                        <NavItem icon={TrendingUp} label="Knowledge Graph" active={activeTab === 'knowledge'} onClick={() => setActiveTab('knowledge')} />
                        <NavItem icon={Users} label="Community" />
                    </nav>

                    <div className="absolute bottom-8 left-0 w-full px-6">
                        <div className="bg-primary/5 rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <Sparkles size={14} />
                                </div>
                                <span className="text-xs font-bold text-primary">Pro Plan</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-3">Upgrade to unlock advanced AI features and unlimited projects.</p>
                            <button className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                                Upgrade Now
                            </button>
                        </div>

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
                                {activeTab === 'overview' ? 'My Learning Dashboard' : 'Digital Credential Wallet'}
                            </h1>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <Clock size={14} className="text-gray-400" />
                                    <span className="text-xs font-medium text-gray-600">
                                        {data?.total_learning_hours || 0}h Learning Time
                                    </span>
                                </div>

                                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                                <InboxDrawer />
                                <NotificationPopover />

                                <div className="flex items-center gap-3 ml-2">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 p-0.5">
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
                        {activeTab === 'overview' ? (
                            <>
                                {/* Welcome Section */}
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                                    </h2>
                                    <p className="text-gray-600">
                                        You've made great progress this week. Keep it up!
                                    </p>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                <BookOpen size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+2 this week</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Enrolled Courses</p>
                                        <h3 className="text-2xl font-black text-gray-900">{data?.enrolled_courses.length || 0}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <Award size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{data?.credentials.length || 0} Earned</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Credentials</p>
                                        <h3 className="text-2xl font-black text-gray-900">{data?.credentials.length || 0}</h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                                                <TrendingUp size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Average Progress</p>
                                        <h3 className="text-2xl font-black text-gray-900">{data?.average_progress || 0}%</h3>
                                    </div>
                                </div>

                                {/* Continue Learning */}
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">Continue Learning</h3>
                                        <Link href="/courses" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                            Browse All Courses <ArrowRight size={14} />
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {data?.enrolled_courses.map((course) => (
                                            <CourseProgressCard key={course.course_id} course={course} />
                                        ))}
                                        {(!data?.enrolled_courses || data.enrolled_courses.length === 0) && (
                                            <div className="col-span-full bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                                    <BookOpen size={24} />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">No active courses</h3>
                                                <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet.</p>
                                                <Link href="/courses" className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors">
                                                    Explore Courses
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recommended For You */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recommended For You</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {data?.recommended_courses.map((course) => (
                                            <CourseCard key={course.id} course={course} />
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : activeTab === 'knowledge' ? (
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">My Knowledge Graph</h2>
                                        <p className="text-gray-600">Visualize your learning journey and connections between concepts.</p>
                                    </div>
                                    <div className="h-[500px] w-full bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                        <KnowledgeGraph width={1200} height={500} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <DigitalWallet credentials={data?.credentials || []} />
                        )}
                    </PageTransition>
                </main>

                {/* Blockchain Credential Modal */}
                {showCredentialModal && selectedCredential && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowCredentialModal(false)}>
                        <div className="bg-white rounded-3xl max-w-md w-full p-8 relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowCredentialModal(false)}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Sparkles className="text-green-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Blockchain Verified</h3>
                                <p className="text-sm text-gray-600">This credential is permanently secured on the Polygon network.</p>
                            </div>

                            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-xs font-bold text-gray-500">Credential</span>
                                    <span className="text-sm font-bold text-gray-900 text-right">{selectedCredential.title}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-xs font-bold text-gray-500">Issuer</span>
                                    <span className="text-sm font-bold text-gray-900">{selectedCredential.org}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                                    <span className="text-xs font-bold text-gray-500">Date</span>
                                    <span className="text-sm font-bold text-gray-900">{selectedCredential.date}</span>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 block mb-1">Contract Address</span>
                                    <code className="text-[10px] font-mono text-gray-600 bg-gray-200 px-2 py-1 rounded block break-all">
                                        {selectedCredential.hash}
                                    </code>
                                </div>
                            </div>

                            <a
                                href={`https://polygonscan.com/address/${selectedCredential.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-8 w-full bg-[#8247e5] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#7036d4] transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
                            >
                                View on PolygonScan <ArrowRight size={18} />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </RoleRouteGuard>
    );
}
