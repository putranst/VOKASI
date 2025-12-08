'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { ArrowLeft, Sparkles, BookOpen, FileEdit } from 'lucide-react';
import { CourseCreationForm } from '@/components/CourseCreationForm';
import { AICourseGenerator } from '@/components/AICourseGenerator';

import { useAuth } from '@/lib/AuthContext';

export default function CreateCoursePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [mode, setMode] = useState<'ai' | 'manual'>('manual');
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
                    description: formData.description,
                    duration: formData.duration,
                    institution_id: formData.institution_id ? parseInt(formData.institution_id) : undefined
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
                <div className="flex justify-center gap-4 mb-12">
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
                    <button
                        onClick={() => setMode('ai')}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${mode === 'ai'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-purple/30'
                            }`}
                    >
                        <Sparkles size={20} />
                        AI Generation
                    </button>
                </div>

                {mode === 'manual' ? (
                    <CourseCreationForm
                        onSubmit={handleManualSubmit}
                        onCancel={() => router.push('/instructor')}
                    />
                ) : (
                    <AICourseGenerator
                        onCourseGenerated={(courseData) => {
                            // Pre-fill manual form with AI data and switch to manual mode for review
                            // For now, just show success and redirect or log
                            console.log('AI Generated:', courseData);

                            handleManualSubmit({
                                ...courseData,
                                instructor: user?.name || 'Mats Hanson', // Use logged in user
                                org: 'UID', // Default to UID for Mats
                                institution_id: 5 // Default to UID institution ID
                            });
                        }}
                    />
                )}
            </main>
        </div>
    );
}
