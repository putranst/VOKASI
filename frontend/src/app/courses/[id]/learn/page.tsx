'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { NavItem } from '@/components/ui/NavItem';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { TABBED_COURSES } from '@/lib/data';
import QuizComponent from '@/components/Quiz';
import Discussion from '@/components/Discussion';
import {
    Play,
    Pause,
    CheckCircle,
    Circle,
    Lock,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    FileText,
    MessageSquare,
    Award,
    Clock
} from 'lucide-react';

// Mock course content structure
interface CourseModule {
    id: number;
    title: string;
    duration: string;
    completed: boolean;
    locked: boolean;
    lessons: CourseLesson[];
}

interface CourseLesson {
    id: number;
    title: string;
    type: 'video' | 'reading' | 'quiz';
    duration: string;
    completed: boolean;
    locked: boolean;
}

export default function CourseLearnPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = parseInt(params.id as string);

    // Find course
    const allCourses = Object.values(TABBED_COURSES).flat();
    const course = allCourses.find(c => c.id === courseId);

    // State
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(45); // Overall course progress

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

    // Mock course modules with progress
    const modules: CourseModule[] = [
        {
            id: 1,
            title: 'Introduction to ' + course.title.split(':')[0],
            duration: '45 min',
            completed: true,
            locked: false,
            lessons: [
                { id: 1, title: 'Welcome & Overview', type: 'video', duration: '10 min', completed: true, locked: false },
                { id: 2, title: 'Course Objectives', type: 'reading', duration: '15 min', completed: true, locked: false },
                { id: 3, title: 'Knowledge Check', type: 'quiz', duration: '20 min', completed: true, locked: false },
            ]
        },
        {
            id: 2,
            title: 'Core Concepts and Frameworks',
            duration: '2 hrs',
            completed: false,
            locked: false,
            lessons: [
                { id: 4, title: 'Theoretical Foundations', type: 'video', duration: '30 min', completed: true, locked: false },
                { id: 5, title: 'Framework Overview', type: 'video', duration: '40 min', completed: false, locked: false },
                { id: 6, title: 'Case Study Analysis', type: 'reading', duration: '25 min', completed: false, locked: false },
                { id: 7, title: 'Module 2 Assessment', type: 'quiz', duration: '25 min', completed: false, locked: false },
            ]
        },
        {
            id: 3,
            title: 'Practical Applications',
            duration: '3 hrs',
            completed: false,
            locked: false,
            lessons: [
                { id: 8, title: 'Real-World Scenarios', type: 'video', duration: '45 min', completed: false, locked: false },
                { id: 9, title: 'Hands-On Workshop', type: 'video', duration: '60 min', completed: false, locked: false },
                { id: 10, title: 'Best Practices Guide', type: 'reading', duration: '30 min', completed: false, locked: false },
                { id: 11, title: 'Practical Assessment', type: 'quiz', duration: '45 min', completed: false, locked: false },
            ]
        },
        {
            id: 4,
            title: 'Advanced Topics',
            duration: '2.5 hrs',
            completed: false,
            locked: true,
            lessons: [
                { id: 12, title: 'Advanced Methodologies', type: 'video', duration: '50 min', completed: false, locked: true },
                { id: 13, title: 'Emerging Trends', type: 'video', duration: '40 min', completed: false, locked: true },
                { id: 14, title: 'Research Papers', type: 'reading', duration: '35 min', completed: false, locked: true },
                { id: 15, title: 'Final Assessment', type: 'quiz', duration: '45 min', completed: false, locked: true },
            ]
        }
    ];

    const currentModule = modules[currentModuleIndex];
    const currentLesson = currentModule.lessons[currentLessonIndex];

    const handleNextLesson = () => {
        if (currentLessonIndex < currentModule.lessons.length - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
        } else if (currentModuleIndex < modules.length - 1) {
            setCurrentModuleIndex(currentModuleIndex + 1);
            setCurrentLessonIndex(0);
        }
        setIsPlaying(false);
    };

    const handlePreviousLesson = () => {
        if (currentLessonIndex > 0) {
            setCurrentLessonIndex(currentLessonIndex - 1);
        } else if (currentModuleIndex > 0) {
            setCurrentModuleIndex(currentModuleIndex - 1);
            setCurrentLessonIndex(modules[currentModuleIndex - 1].lessons.length - 1);
        }
        setIsPlaying(false);
    };

    const handleMarkComplete = () => {
        // In a real app, this would update the backend
        currentLesson.completed = true;
        // Auto-advance to next lesson
        setTimeout(handleNextLesson, 500);
    };

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Learning', href: `/courses/${course.id}/learn` }
    ];

    const getLessonIcon = (type: string) => {
        switch (type) {
            case 'video': return <Play size={14} className="text-primary" />;
            case 'reading': return <BookOpen size={14} className="text-accent" />;
            case 'quiz': return <FileText size={14} className="text-gold" />;
            default: return <Circle size={14} />;
        }
    };

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
                        {/* Video Player / Content Area */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                            {currentLesson.type === 'video' ? (
                                <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                                    <img
                                        src={course.image}
                                        alt={currentLesson.title}
                                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                                    />
                                    <div className="relative z-10 text-center">
                                        <button
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className="w-20 h-20 bg-white/20 backdrop-blur border-2 border-white/50 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                                        >
                                            {isPlaying ? (
                                                <Pause className="text-white" size={32} />
                                            ) : (
                                                <Play className="text-white ml-1" size={32} />
                                            )}
                                        </button>
                                        <p className="text-white mt-4 text-sm font-medium">Video Lecture</p>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                        <div className="h-full bg-primary" style={{ width: isPlaying ? '60%' : '0%' }}></div>
                                    </div>
                                </div>
                            ) : currentLesson.type === 'reading' ? (
                                <div className="p-12 space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <BookOpen className="text-accent" size={32} />
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{currentLesson.title}</h3>
                                            <p className="text-sm text-gray-500">Reading Material • {currentLesson.duration}</p>
                                        </div>
                                    </div>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 leading-relaxed">
                                            This comprehensive reading material explores the key concepts and practical applications
                                            covered in {course.title}. You'll gain deeper insights into the theoretical frameworks
                                            and real-world implementations.
                                        </p>
                                        <h4 className="text-lg font-bold text-gray-900 mt-8 mb-4">Key Learning Points</h4>
                                        <ul className="space-y-3">
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                                <span>Understanding core principles and their application in real-world scenarios</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                                <span>Best practices from leading organizations and industry experts</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                                <span>Case studies demonstrating successful implementation strategies</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                                <span>Common challenges and proven solutions for overcoming them</span>
                                            </li>
                                        </ul>
                                        <p className="text-gray-700 leading-relaxed mt-6">
                                            Take your time to review this material carefully. The concepts covered here will be
                                            essential for the upcoming assessments and practical applications.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <QuizComponent
                                    courseId={courseId}
                                    onComplete={handleNextLesson}
                                />
                            )}
                        </div>

                        {/* Lesson Info & Navigation */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-2">{currentLesson.title}</h2>
                                    <p className="text-gray-600">{currentModule.title}</p>
                                </div>
                                {currentLesson.completed ? (
                                    <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                        <CheckCircle size={20} />
                                        Completed
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleMarkComplete}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-all"
                                    >
                                        Mark as Complete
                                    </button>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                <button
                                    onClick={handlePreviousLesson}
                                    disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                    Previous
                                </button>

                                <div className="text-sm text-gray-600">
                                    Lesson {currentModule.lessons.slice(0, currentLessonIndex + 1).reduce((sum, l) => sum + 1, 0)} of {modules.reduce((sum, m) => sum + m.lessons.length, 0)}
                                </div>

                                <button
                                    onClick={handleNextLesson}
                                    disabled={currentModuleIndex === modules.length - 1 && currentLessonIndex === currentModule.lessons.length - 1}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5a4a3b] transition-all"
                                >
                                    Next
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Discussion */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <Discussion courseId={courseId} />
                        </div>
                    </div>

                    {/* Sidebar - Course Curriculum */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Course Content</h3>
                                <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                    {progress}% Complete
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-6">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Module List */}
                            <div className="space-y-4 max-h-[600px] overflow-y-auto">
                                {modules.map((module, moduleIdx) => (
                                    <div key={module.id}>
                                        <div className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${moduleIdx === currentModuleIndex ? 'bg-primary/10' : 'hover:bg-gray-50'
                                            }`}>
                                            <div className="flex-shrink-0 mt-1">
                                                {module.locked ? (
                                                    <Lock size={18} className="text-gray-400" />
                                                ) : module.completed ? (
                                                    <CheckCircle size={18} className="text-green-600" />
                                                ) : (
                                                    <Circle size={18} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold mb-1 ${module.locked ? 'text-gray-400' : 'text-gray-900'}`}>
                                                    {module.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Clock size={12} />
                                                    {module.duration}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lesson List */}
                                        {moduleIdx === currentModuleIndex && (
                                            <div className="ml-8 mt-2 space-y-1">
                                                {module.lessons.map((lesson, lessonIdx) => (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => {
                                                            if (!lesson.locked) {
                                                                setCurrentLessonIndex(lessonIdx);
                                                                setIsPlaying(false);
                                                            }
                                                        }}
                                                        disabled={lesson.locked}
                                                        className={`w-full text-left flex items-center gap-2 p-2 rounded text-xs transition-colors ${lessonIdx === currentLessonIndex
                                                            ? 'bg-primary/20 text-primary font-bold'
                                                            : lesson.locked
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {lesson.locked ? (
                                                            <Lock size={14} className="text-gray-400" />
                                                        ) : lesson.completed ? (
                                                            <CheckCircle size={14} className="text-green-600" />
                                                        ) : (
                                                            getLessonIcon(lesson.type)
                                                        )}
                                                        <span className="flex-1 truncate">{lesson.title}</span>
                                                        <span className="text-xs text-gray-500">{lesson.duration}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Certificate CTA */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                                    <Award className="text-gold mx-auto mb-2" size={32} />
                                    <p className="text-xs font-bold text-gray-700 mb-1">Complete all modules to earn</p>
                                    <p className="text-sm font-black text-primary">Blockchain Certificate</p>
                                </div>
                            </div>

                            {/* CDIO Project CTA */}
                            <div className="mt-4">
                                <div className="p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                                            <BookOpen className="text-accent" size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">CDIO Project</p>
                                            <p className="text-xs text-gray-500">Apply your knowledge</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-3">
                                        Start your hands-on project through the Conceive-Design-Implement-Operate framework.
                                    </p>
                                    <button
                                        onClick={() => router.push(`/courses/${courseId}/conceive`)}
                                        className="w-full py-2 bg-accent text-white rounded-lg text-sm font-bold hover:bg-accent/90 transition-all"
                                    >
                                        Start CDIO Project →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
