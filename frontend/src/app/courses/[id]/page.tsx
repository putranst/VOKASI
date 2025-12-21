'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { EnrollmentButton } from '@/components/EnrollmentButton';
import { TABBED_COURSES } from '@/lib/data';
import { Star, Clock, Users, Award, PlayCircle, BookOpen, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = parseInt(params.id as string);
    const { user } = useAuth();

    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentId, setEnrollmentId] = useState<number | undefined>();
    const [loading, setLoading] = useState(true);

    // Find course across all categories
    const allCourses = Object.values(TABBED_COURSES).flat();
    const course = allCourses.find(c => c.id === courseId);

    useEffect(() => {
        // Check enrollment status on page load
        const checkEnrollment = async () => {
            try {
                if (!user) return;
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/enrollments/check?user_id=${user.id}&course_id=${courseId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setIsEnrolled(data.enrolled);
                    setEnrollmentId(data.enrollment?.id);
                }
            } catch (error) {
                console.error('Failed to check enrollment:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            checkEnrollment();
        } else {
            setLoading(false);
        }
    }, [courseId, user]);

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

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Courses', href: '/courses' },
        { label: course.title, href: `/courses/${course.id}` }
    ];

    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-[70rem] mx-auto px-4 py-4">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
            </div>

            <main>
                {/* Hero Section */}
                <section className="bg-[#1a1a1a] text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-bold text-white mb-4">
                                {course.level}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-6">{course.title}</h1>
                            <p className="text-xl text-gray-300 mb-6">
                                Delivered by {course.instructor} from {course.org}
                            </p>
                            <div className="flex items-center gap-6 mb-8">
                                <div className="flex items-center gap-2">
                                    <Star className="text-gold" size={20} fill="currentColor" />
                                    <span className="font-bold">{course.rating}</span>
                                    <span className="text-gray-400">({course.students_count} students)</span>
                                </div>
                                {course.tag && (
                                    <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-xs font-bold">
                                        {course.tag}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-4">
                                {isEnrolled ? (
                                    <>
                                        <a
                                            href={`/courses/${course.id}/immersion`}
                                            className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-[#5a4a3b] transition-all flex items-center gap-2"
                                        >
                                            <PlayCircle size={20} />
                                            Start/Continue Project
                                        </a>
                                        <a
                                            href={`/courses/${course.id}/learn`}
                                            className="bg-white text-primary border-2 border-primary px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                                        >
                                            <BookOpen size={20} />
                                            View Content
                                        </a>
                                    </>
                                ) : (
                                    // Just show text if not enrolled, the button below handles enrollment
                                    // Actually the button is in the sticky sidebar usually, but let's see where it was.
                                    // In the original code, this was just text "Enroll in this course..." or empty if not enrolled here?
                                    // Ah, the original had a check. Let's keep the logic simple.
                                    <div className="text-gray-300 text-sm italic">
                                        Enroll in this course to access the content
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl" />
                            <img
                                src={course.image}
                                alt={course.title}
                                className="relative rounded-2xl shadow-2xl border border-white/10 w-full h-auto"
                            />
                        </div>
                    </div>
                </section>

                {/* Course Details */}
                <section className="py-16 max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                            <Clock className="mx-auto mb-4 text-primary" size={32} />
                            <h3 className="font-bold text-gray-900 mb-2">Duration</h3>
                            <p className="text-gray-600">6-8 weeks</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                            <Users className="mx-auto mb-4 text-accent" size={32} />
                            <h3 className="font-bold text-gray-900 mb-2">Students</h3>
                            <p className="text-gray-600">{course.students_count} enrolled</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                            <Award className="mx-auto mb-4 text-gold" size={32} />
                            <h3 className="font-bold text-gray-900 mb-2">Certificate</h3>
                            <p className="text-gray-600">Blockchain verified</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="md:col-span-2">
                            <h2 className="text-3xl font-black text-gray-900 mb-6">What You'll Learn</h2>
                            <div className="space-y-4 mb-12">
                                {[
                                    "Master the core concepts and frameworks",
                                    "Apply practical skills to real-world scenarios",
                                    "Earn a blockchain-verified credential",
                                    "Join a global network of practitioners"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                        <p className="text-gray-700">{item}</p>
                                    </div>
                                ))}
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 mb-6">Course Description</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                This comprehensive course provides cutting-edge knowledge and practical skills for professionals
                                looking to make an impact in their field. Taught by world-class experts from {course.org},
                                you'll gain hands-on experience through real-world case studies and interactive projects.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                Upon completion, you'll receive a blockchain-verified credential recognized across the
                                Hexahelix ecosystem, validating your expertise and commitment to excellence.
                            </p>
                        </div>

                        <div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 sticky top-24">
                                <h3 className="font-bold text-gray-900 mb-4">Course Includes</h3>
                                <div className="space-y-3 text-sm mb-6">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <BookOpen size={18} className="text-primary" />
                                        <span>24+ hours of content</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <PlayCircle size={18} className="text-primary" />
                                        <span>HD video lectures</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Users size={18} className="text-primary" />
                                        <span>Live Q&A sessions</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Award size={18} className="text-primary" />
                                        <span>Verifiable certificate</span>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="w-full py-4 bg-gray-100 rounded-xl text-center text-gray-500 font-bold">
                                        Loading...
                                    </div>
                                ) : (
                                    <EnrollmentButton
                                        courseId={courseId}
                                        userId={user?.id || 0}
                                        isEnrolled={isEnrolled}
                                        enrollmentId={enrollmentId}
                                        onEnrollmentChange={(enrolled) => {
                                            setIsEnrolled(enrolled);
                                            if (!enrolled) setEnrollmentId(undefined);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
