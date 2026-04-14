'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Sparkles, BookOpen, FileEdit, Wand2 } from 'lucide-react';
import { CourseCreationForm } from '@/components/CourseCreationForm';
import { AICourseGenerator } from '@/components/AICourseGenerator';
import { SmartCourseWizard } from '@/components/SmartCourseWizard';

import { useAuth } from '@/lib/AuthContext';

export default function CreateCoursePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [mode, setMode] = useState<'smart' | 'ai' | 'manual'>('smart');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleManualSubmit = async (formData: any) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    instructor: formData.instructor,
                    org: formData.org,
                    image: formData.image,
                    tag: formData.tag,
                    level: formData.level,
                    category: formData.category || 'Technology',
                    description: formData.description,
                    duration: formData.duration,
                    institution_id: formData.institution_id ? parseInt(formData.institution_id) : undefined,
                    instructor_id: formData.instructor_id  // Link to instructor
                })
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    router.push('/instructor');
                }, 2000);
            } else {
                throw new Error('Failed to create course');
            }
        } catch (error) {
            console.error('Failed to create course:', error);
            alert('Failed to create course. Please try again.');
        }
    };

    const handleSmartCourseCreated = (courseData: any) => {
        if (courseData.approval_status === 'draft') {
            // Redirect to Editor for Drafts
            router.push(`/courses/${courseData.id}/editor`);
        } else {
            // Success Message & Redirect to Dashboard for Published
            setShowSuccess(true);
            setTimeout(() => {
                router.push('/instructor');
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/instructor" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <Logo />
                    </div>
                </div>
            </header>

            {showSuccess && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="text-green-600" size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Course Created Successfully!</h3>
                        <p className="text-gray-600">Redirecting to dashboard...</p>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Create New Course</h1>
                    <p className="text-xl text-gray-500">Choose how you'd like to create your course</p>
                </div>

                {/* Mode Selector */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {/* Smart Wizard - NEW! */}
                    <button
                        onClick={() => setMode('smart')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all relative ${mode === 'smart'
                            ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-lg shadow-purple-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                            }`}
                    >
                        <Wand2 size={20} />
                        Smart Wizard
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                            NEW
                        </span>
                    </button>

                    {/* AI Generation */}
                    <button
                        onClick={() => setMode('ai')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${mode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                            }`}
                    >
                        <Sparkles size={20} />
                        AI from Topic
                    </button>

                    {/* Manual Form */}
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${mode === 'manual'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary/30'
                            }`}
                    >
                        <FileEdit size={20} />
                        Manual Form
                    </button>
                </div>

                {/* Mode Description */}
                <div className="text-center mb-8">
                    {mode === 'smart' && (
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            <span className="font-semibold text-purple-600">Alexandria AI:</span> Upload your slides, PDFs, or images and let AI extract the structure,
                            generate teaching agendas with activities, quizzes, and publish instantly.
                        </p>
                    )}
                    {mode === 'ai' && (
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Enter a topic and AI will generate a complete IRIS-aligned course structure.
                        </p>
                    )}
                    {mode === 'manual' && (
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Fill out the form manually to create a new course with full control.
                        </p>
                    )}
                </div>

                {/* Render Selected Mode */}
                {mode === 'smart' && (
                    <SmartCourseWizard
                        onCourseCreated={handleSmartCourseCreated}
                        onCancel={() => router.push('/instructor')}
                    />
                )}

                {mode === 'manual' && (
                    <CourseCreationForm
                        onSubmit={handleManualSubmit}
                        onCancel={() => router.push('/instructor')}
                    />
                )}

                {mode === 'ai' && (
                    <AICourseGenerator
                        onCourseGenerated={(courseData) => {
                            // Submit the AI-generated course with user info
                            handleManualSubmit({
                                title: courseData.title,
                                description: courseData.description,
                                level: courseData.level,
                                duration: courseData.duration,
                                tag: courseData.tag || 'New',
                                image: courseData.image,
                                category: courseData.category || 'Technology',
                                instructor: user?.name || 'Instructor',
                                org: 'TSEA',
                                instructor_id: user?.id  // Link to logged-in instructor
                            });
                        }}
                    />
                )}
            </main>
        </div>
    );
}

