'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { InstitutionHero } from '@/components/InstitutionHero';
import { CourseCard } from '@/components/ui/CourseCard';
import { BookOpen, Users, Award, Star, Loader2, ArrowRight } from 'lucide-react';

interface InstitutionDetail {
    institution: {
        id: number;
        name: string;
        short_name: string;
        type: string;
        description: string;
        logo_url: string;
        banner_url?: string;
        country: string;
        founded_year?: number;
        website_url?: string;
        email?: string;
        linkedin_url?: string;
        twitter_url?: string;
        is_featured: boolean;
        total_courses: number;
        total_learners: string;
        total_programs: number;
        partner_since?: string;
    };
    courses: any[];
    featured_instructors: any[];
    pathways: any[];
}

export default function InstitutionProfilePage() {
    const params = useParams();
    const [data, setData] = useState<InstitutionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstitutionDetail = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/institutions/${params.id}`);
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Failed to fetch institution details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchInstitutionDetail();
        }
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Institution Not Found</h2>
                <p className="text-gray-500">The partner you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <InstitutionHero institution={data.institution} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Content: Courses */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Stats Grid - Mobile Only */}
                        <div className="grid grid-cols-2 gap-4 lg:hidden">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-2xl font-black text-gray-900 mb-1">{data.institution.total_courses}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Courses</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-2xl font-black text-gray-900 mb-1">{data.institution.total_learners}</div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Learners</div>
                            </div>
                        </div>

                        {/* Course Catalog */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
                                <div className="text-sm text-gray-500">
                                    {data.courses.length} courses found
                                </div>
                            </div>

                            {data.courses.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {data.courses.map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No courses yet</h3>
                                    <p className="text-gray-500">
                                        This institution hasn't published any courses yet. Check back soon!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Programs/Pathways (Placeholder) */}
                        {data.institution.total_programs > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Specialized Programs</h2>
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

                                    <div className="relative z-10">
                                        <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                                            Coming Soon
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">Professional Certificates</h3>
                                        <p className="text-gray-300 mb-6 max-w-lg">
                                            Master in-demand skills with comprehensive programs designed by {data.institution.short_name}.
                                        </p>
                                        <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                                            Explore Programs
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Stats & Info */}
                    <div className="space-y-8">
                        {/* Stats Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hidden lg:block sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-6">Institution Stats</h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-gray-900">{data.institution.total_courses}</div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Online Courses</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-gray-900">{data.institution.total_learners}</div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Learners</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-gray-900">{data.institution.total_programs}</div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Programs</div>
                                    </div>
                                </div>

                                {data.institution.partner_since && (
                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Partner Since</span>
                                            <span className="font-bold text-gray-900">{data.institution.partner_since}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact/Support Card */}
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10 p-6">
                            <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Have questions about courses from {data.institution.short_name}?
                            </p>
                            <a
                                href={`mailto:${data.institution.email}`}
                                className="block w-full py-3 text-center bg-white text-primary font-bold rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                                Contact Institution
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
