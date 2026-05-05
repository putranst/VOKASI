'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { TABBED_COURSES } from '@/lib/data';
import { type Course } from '@/components/ui/CourseCard';
import QuizComponent from '@/components/Quiz';
import Discussion from '@/components/Discussion';
import { useAuth } from '@/lib/AuthContext';
import {
    CheckCircle,
    Circle,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Award,
} from 'lucide-react';

// ---- Types ----
interface ContentBlock {
    id: string;
    type: 'heading' | 'text' | 'discussion' | 'quiz' | string;
    content: string;
    metadata?: Record<string, any>;
}

interface ApiModule {
    id: number;
    title: string;
    order: number;
    content_blocks: ContentBlock[];
    status: string;
}

// ---- Block Renderer ----
function BlockRenderer({ block, courseId, onQuizComplete }: {
    block: ContentBlock;
    courseId: number;
    onQuizComplete: () => void;
}) {
    switch (block.type) {
        case 'heading':
            return (
                <h2 className={`font-black text-gray-900 ${block.metadata?.level === 1 ? 'text-2xl' : 'text-xl'} mb-2`}>
                    {block.content}
                </h2>
            );
        case 'text':
            return <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{block.content}</p>;
        case 'discussion':
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-bold text-blue-800 mb-1">💬 Discussion Prompt</p>
                    <p className="text-sm text-blue-700">{block.content}</p>
                </div>
            );
        case 'quiz':
            return <QuizComponent courseId={courseId} onComplete={onQuizComplete} />;
        default:
            return <p className="text-gray-600 text-sm italic">[{block.type}] {block.content}</p>;
    }
}

// ---- Main Page ----
export default function CourseLearnPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = parseInt(params.id as string);

    // Course
    const staticCourse = Object.values(TABBED_COURSES).flat().find(c => c.id === courseId);
    const [course, setCourse] = useState<Course | null>(staticCourse ?? null);
    const [courseLoading, setCourseLoading] = useState(!staticCourse);

    // Modules from API
    const [modules, setModules] = useState<ApiModule[]>([]);
    const [modulesLoading, setModulesLoading] = useState(true);

    // Progress
    const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
    const [progress, setProgress] = useState(0);
    const [markingComplete, setMarkingComplete] = useState(false);

    // Navigation
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

    // Fetch course if not in static data
    useEffect(() => {
        if (staticCourse) return;
        const run = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}`);
                if (res.ok) setCourse(await res.json());
            } catch { /* leave null */ } finally { setCourseLoading(false); }
        };
        run();
    }, [courseId, staticCourse]);

    // Fetch modules
    useEffect(() => {
        const run = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/modules`);
                if (res.ok) setModules(await res.json());
            } catch { /* ignore */ } finally { setModulesLoading(false); }
        };
        run();
    }, [courseId]);

    // Fetch progress
    const fetchProgress = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/progress?user_id=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setCompletedIds(new Set(data.completed_module_ids));
                setProgress(data.percentage);
            }
        } catch { /* ignore */ }
    }, [courseId, user]);

    useEffect(() => { fetchProgress(); }, [fetchProgress]);

    const handleMarkComplete = async () => {
        if (!user || !currentModule) return;
        setMarkingComplete(true);
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/modules/${currentModule.id}/complete?user_id=${user.id}`,
                { method: 'POST' }
            );
            await fetchProgress();
            // Auto-advance to next module
            setTimeout(() => {
                if (currentModuleIndex < modules.length - 1) setCurrentModuleIndex(i => i + 1);
            }, 400);
        } catch { /* ignore */ } finally { setMarkingComplete(false); }
    };

    // --- Loading / not found states ---
    if (courseLoading || modulesLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
                    <a href="/courses" className="text-primary font-bold hover:underline">← Back to Courses</a>
                </div>
            </div>
        );
    }

    const currentModule = modules[currentModuleIndex] ?? null;
    const isCurrentCompleted = currentModule ? completedIds.has(currentModule.id) : false;

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Learning', href: `/courses/${course.id}/learn` }
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Logo />
                        <div className="hidden md:block">
                            <h1 className="text-sm font-bold text-gray-900 truncate max-w-md">{course.title}</h1>
                            <p className="text-xs text-gray-500">{course.org}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="text-gray-600">Progress:</span>
                            <span className="ml-2 font-bold text-primary">{progress}%</span>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-sm font-bold text-gray-600 hover:text-primary transition-colors"
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </header>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {modules.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                                <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
                                <p className="text-gray-500">No content published yet for this course.</p>
                            </div>
                        ) : currentModule ? (
                            <>
                                {/* Module Content Blocks */}
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 space-y-6">
                                    <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                                        Module {currentModuleIndex + 1} of {modules.length}
                                    </div>
                                    {currentModule.content_blocks.map(block => (
                                        <BlockRenderer
                                            key={block.id}
                                            block={block}
                                            courseId={courseId}
                                            onQuizComplete={handleMarkComplete}
                                        />
                                    ))}
                                </div>

                                {/* Navigation + Complete */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900 mb-1">{currentModule.title}</h2>
                                            <p className="text-sm text-gray-500">{currentModule.content_blocks.length} content blocks</p>
                                        </div>
                                        {isCurrentCompleted ? (
                                            <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                                <CheckCircle size={20} />
                                                Completed
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleMarkComplete}
                                                disabled={markingComplete}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-all disabled:opacity-60"
                                            >
                                                {markingComplete ? 'Saving…' : 'Mark as Complete'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                        <button
                                            onClick={() => setCurrentModuleIndex(i => i - 1)}
                                            disabled={currentModuleIndex === 0}
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                        >
                                            <ChevronLeft size={18} /> Previous
                                        </button>
                                        <span className="text-sm text-gray-500">
                                            {currentModuleIndex + 1} / {modules.length}
                                        </span>
                                        <button
                                            onClick={() => setCurrentModuleIndex(i => i + 1)}
                                            disabled={currentModuleIndex === modules.length - 1}
                                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5a4a3b] transition-all"
                                        >
                                            Next <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : null}

                        {/* Discussion */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <Discussion courseId={courseId} />
                        </div>
                    </div>

                    {/* Sidebar — Module List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
                                <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                    {progress}% Done
                                </div>
                            </div>

                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-5">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                                {modules.map((mod, idx) => {
                                    const done = completedIds.has(mod.id);
                                    const active = idx === currentModuleIndex;
                                    return (
                                        <button
                                            key={mod.id}
                                            onClick={() => setCurrentModuleIndex(idx)}
                                            className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors ${
                                                active ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex-shrink-0 mt-0.5">
                                                {done
                                                    ? <CheckCircle size={18} className="text-green-600" />
                                                    : active
                                                        ? <Circle size={18} className="text-primary" />
                                                        : <Circle size={18} className="text-gray-300" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${active ? 'text-primary' : 'text-gray-800'}`}>
                                                    {mod.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">{mod.content_blocks.length} blocks</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Certificate CTA */}
                            <div className="mt-5 pt-5 border-t border-gray-200">
                                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                                    <Award className="text-gold mx-auto mb-2" size={28} />
                                    <p className="text-xs font-bold text-gray-700 mb-1">Complete all modules to earn</p>
                                    <p className="text-sm font-black text-primary">Blockchain Certificate</p>
                                </div>
                            </div>

                            {/* IRIS CTA */}
                            <div className="mt-4 p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl border border-accent/20">
                                <p className="text-sm font-bold text-gray-900 mb-1">IRIS Project</p>
                                <p className="text-xs text-gray-500 mb-3">Apply your learning hands-on</p>
                                <button
                                    onClick={() => router.push(`/courses/${courseId}/immerse`)}
                                    className="w-full py-2 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-all"
                                >
                                    Start IRIS Project →
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
