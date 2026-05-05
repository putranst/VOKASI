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
import { BookOpen, Award, TrendingUp, Clock, LogOut, X, Check, ArrowRight, Sparkles, GraduationCap, Users, Shield, Target } from 'lucide-react';
import { CourseProgressCard, DashboardCourseProgress } from '@/components/CourseProgressCard';
import { CourseCard, Course } from '@/components/ui/CourseCard';
import DigitalWallet from '@/components/DigitalWallet';
import { RoleRouteGuard } from '@/components/RoleRouteGuard';
import { PageTransition } from '@/components/ui/PageTransition';
import { KnowledgeGraph } from '@/components/ui/KnowledgeGraph';
import { CareerGoalBanner } from '@/components/CareerGoalBanner';
import { CareerExplorer } from '@/components/CareerExplorer';
import { CAREER_PATHWAYS } from '@/components/careerData';
import { IRISProgressTracker } from '@/components/ui/IRISProgressTracker';
import { ActiveProjectCard } from '@/components/ActiveProjectCard';
import { NaskaBuddy } from '@/components/NaskaBuddy';
import { FeedbackSummaryCard } from '@/components/dashboard/FeedbackSummaryCard';

interface DashboardData {
    enrolled_courses: DashboardCourseProgress[];
    credentials: any[];
    total_learning_hours: number;
    average_progress: number;
    recommended_courses: Course[];
    upcoming_deadlines: any[];
    career_pathway_id?: string | null;
    iris_projects?: {
        project_id: number;
        course_id: number;
        project_title: string;
        current_phase: 'immerse' | 'realize' | 'iterate' | 'scale' | 'completed';
        completion_percentage: number;
        sfia_target_level?: number;
        ai_feedback?: {
            grade: string;
            score: number;
            strengths: string[];
            weaknesses: string[];
        };
        credential_earned?: boolean;
    }[];
    learning_streak?: {
        current_streak: number;
        longest_streak: number;
        this_week: boolean[];
        total_xp: number;
    };
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

                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/student/dashboard?user_id=${user.id}`);

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

    const handleSelectPathway = async (pathwayId: string) => {
        if (!user) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/users/${user.id}/career-pathway`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ career_pathway_id: pathwayId })
            });

            if (response.ok) {
                // Update local state
                setData(prev => prev ? { ...prev, career_pathway_id: pathwayId } : null);
                console.log('[Dashboard] Career pathway updated to:', pathwayId);
            }
        } catch (error) {
            console.error('[Dashboard] Failed to update career pathway:', error);
        }
    };

    // Get selected pathway details
    const selectedPathway = data?.career_pathway_id
        ? CAREER_PATHWAYS.find(p => p.id === data.career_pathway_id)
        : null;

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

                {/* Main Content - Premium Layout */}
                <main className="flex-1 lg:ml-64 min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#FAFAFA]">
                    {/* Premium Header */}
                    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all duration-500">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {activeTab === 'overview' ? 'My Learning Space' : 'Credential Vault'}
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* NASKA TRIGGER (Placeholder) */}
                                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-100/50 shadow-sm cursor-pointer hover:shadow-md transition-all group">
                                    <Sparkles size={16} className="text-purple-600 animate-pulse" />
                                    <span className="text-xs font-semibold text-purple-700 group-hover:text-purple-800">Ask Naska</span>
                                </div>

                                <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                                <div className="flex items-center gap-4">
                                    <InboxDrawer />
                                    <NotificationPopover />

                                    <div className="relative group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-500 group-hover:to-blue-500 transition-all duration-500">
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
                        </div>
                    </header>

                    <PageTransition className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                        {activeTab === 'overview' ? (
                            <>
                                {/* Premium Greeting Section */}
                                <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 sm:p-10 mb-8 group">
                                    {/* Abstract Background Decoration */}
                                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000"></div>

                                    <div className="relative z-10 max-w-2xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full mb-4">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Learning Engine Active</span>
                                        </div>
                                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                                            Good Morning, {user?.name?.split(' ')[0]}. <br />
                                            <span className="text-gray-400 font-medium">Ready to continue your IRIS journey?</span>
                                        </h2>
                                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                            {selectedPathway
                                                ? `You're making excellent progress on the ${selectedPathway.title} track. Your recent activity suggests focusing on logic design today.`
                                                : "Your cognitive engine is ready. Select a pathway to begin personalized optimization."
                                            }
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                            <button className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                                <BookOpen size={16} /> Resume Learning
                                            </button>
                                            <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                                                <Target size={16} /> View Goals
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Career Explorer - Show if no pathway selected */}
                                {!data?.career_pathway_id && (
                                    <div id="career-explorer">
                                        <CareerExplorer
                                            onSelectPathway={handleSelectPathway}
                                            selectedPathwayId={data?.career_pathway_id}
                                        />
                                    </div>
                                )}

                                {/* Selected Career Goal Card - Show if pathway selected */}
                                {selectedPathway && (
                                    <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">{selectedPathway.icon}</div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-blue-200 mb-1">Your Career Goal</div>
                                                <h3 className="text-xl font-bold">{selectedPathway.title}</h3>
                                                <p className="text-blue-100 text-sm mt-1">{selectedPathway.shortDescription}</p>
                                            </div>
                                            <div className="hidden md:flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold">{selectedPathway.requiredCourses.length}</div>
                                                    <div className="text-xs text-blue-200">Required Courses</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold">{selectedPathway.timeToMastery.split('-')[0]}</div>
                                                    <div className="text-xs text-blue-200">Months to Master</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Stats Grid - Simplified */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-8">
                                    {/* Enrolled Courses */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] min-w-0">
                                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                                <BookOpen size={16} className="sm:hidden" />
                                                <BookOpen size={18} className="hidden sm:block" />
                                            </div>
                                        </div>
                                        <p className="text-blue-600/80 text-xs sm:text-sm font-medium truncate">Courses</p>
                                        <h3 className="text-xl sm:text-2xl font-black text-blue-900">{data?.enrolled_courses.length || 0}</h3>
                                    </div>

                                    {/* Credentials */}
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-6 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] min-w-0">
                                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                                                <Award size={16} className="sm:hidden" />
                                                <Award size={18} className="hidden sm:block" />
                                            </div>
                                        </div>
                                        <p className="text-purple-600/80 text-xs sm:text-sm font-medium truncate">Credentials</p>
                                        <h3 className="text-xl sm:text-2xl font-black text-purple-900">{data?.credentials.length || 0}</h3>
                                    </div>

                                    {/* Average Progress */}
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-6 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] min-w-0">
                                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                                <TrendingUp size={16} className="sm:hidden" />
                                                <TrendingUp size={18} className="hidden sm:block" />
                                            </div>
                                        </div>
                                        <p className="text-amber-600/80 text-xs sm:text-sm font-medium truncate">Progress</p>
                                        <h3 className="text-xl sm:text-2xl font-black text-amber-900">{data?.average_progress || 0}%</h3>
                                    </div>
                                </div>

                                {/* Your Active Project - Unified Block */}
                                {data && data.enrolled_courses && data.enrolled_courses.length > 0 && (
                                    <div className="mb-8">
                                        {(() => {
                                            const activeProject = data.iris_projects?.find(p => p.course_id === data.enrolled_courses[0].course_id);
                                            const activeCourse = data.enrolled_courses[0];
                                            const phase = activeProject?.current_phase || (activeCourse.progress > 75 ? 'scale' : activeCourse.progress > 50 ? 'iterate' : activeCourse.progress > 25 ? 'realize' : 'immerse');

                                            return (
                                                <div className="space-y-6">
                                                    <ActiveProjectCard
                                                        courseId={activeCourse.course_id}
                                                        courseTitle={activeCourse.title}
                                                        courseImage={activeCourse.image}
                                                        instructor={'VOKASI Faculty'}
                                                        progress={activeCourse.progress}
                                                        currentPhase={phase as 'immerse' | 'realize' | 'iterate' | 'scale'}
                                                        sfiaLevel={2}
                                                        targetSfiaLevel={3}
                                                        estimatedCompletion="2 weeks"
                                                        totalModules={10}
                                                        completedModules={Math.round((activeCourse.progress / 100) * 10)}
                                                        lastActivity="Today"
                                                    />

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* AI Feedback Display */}
                                                        {activeProject?.ai_feedback && (
                                                            <FeedbackSummaryCard
                                                                courseId={activeCourse.course_id}
                                                                grade={activeProject.ai_feedback.grade}
                                                                score={activeProject.ai_feedback.score}
                                                                strengths={activeProject.ai_feedback.strengths}
                                                                weaknesses={activeProject.ai_feedback.weaknesses}
                                                            />
                                                        )}

                                                        {/* Credential Earned Banner */}
                                                        {(activeProject?.current_phase === 'completed' || activeProject?.current_phase === 'scale') && (
                                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="p-1 bg-white/20 rounded-lg">
                                                                            <Award size={16} className="text-white" />
                                                                        </div>
                                                                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Ready to Claim</span>
                                                                    </div>
                                                                    <h3 className="text-lg font-bold mb-1">Innovation Practitioner</h3>
                                                                    <p className="text-indigo-100 text-xs">Verify your achievement on the blockchain.</p>
                                                                </div>
                                                                <Link
                                                                    href={`/courses/${activeCourse.course_id}/scale`}
                                                                    className="mt-4 w-full py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold text-center hover:bg-indigo-50 transition-colors"
                                                                >
                                                                    View Credential
                                                                </Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Empty State for No Active Project */}
                                {(!data?.enrolled_courses || data.enrolled_courses.length === 0) && (
                                    <div className="mb-8 bg-white p-8 rounded-2xl border border-dashed border-gray-200 text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <BookOpen size={24} className="text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Start Your Learning Journey</h3>
                                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                            Enroll in a course to begin your IRIS project and track your progress toward mastery.
                                        </p>
                                        <Link
                                            href="/courses"
                                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
                                        >
                                            <Sparkles size={16} />
                                            Explore Courses
                                        </Link>
                                    </div>
                                )}

                                {/* Continue Learning - Additional Courses */}
                                {data?.enrolled_courses && data.enrolled_courses.length > 1 && (
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900">Other Active Courses</h3>
                                            <Link href="/courses" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                                                Browse All <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {data.enrolled_courses.slice(1).map((course) => (
                                                <CourseProgressCard key={course.course_id} course={course} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommended For You */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-900">Recommended For You</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">AI Curated</span>
                                    </div>
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
                            <DigitalWallet userId={user?.id || 0} />
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
                <NaskaBuddy />
            </div>
        </RoleRouteGuard>
    );
}
