'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TrendingUp, ArrowRight, GraduationCap, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function SuccessStoriesPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-900 via-emerald-800 to-teal-700 text-white py-24">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <TrendingUp size={16} />
                            SUCCESS STORIES
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black mb-6">
                            Real Transformations
                        </h1>
                        <p className="text-xl text-green-100 leading-relaxed mb-8">
                            Discover how VOKASI graduates have transformed their careers through project-based learning and AI-powered education.
                        </p>
                    </div>
                </div>
            </section>

            {/* Coming Soon Section */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Users size={48} className="text-green-600" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Stories Coming Soon</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            We're currently collecting and documenting success stories from our VOKASI graduates. Check back soon to read inspiring stories of career transformation through our IRIS-based learning programs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/pathways"
                                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all"
                            >
                                Start Your Journey <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
                            >
                                Share Your Story
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* What You'll Achieve */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">What VOKASI Graduates Achieve</h2>
                        <p className="text-gray-600">Skills and outcomes from our career pathways</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <GraduationCap size={40} className="text-primary mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Industry-Ready Skills</h3>
                            <p className="text-gray-600">
                                Master practical skills through hands-on projects using the IRIS framework. Build a portfolio that demonstrates real capabilities.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <Briefcase size={40} className="text-accent mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Career Transition Support</h3>
                            <p className="text-gray-600">
                                Transition to tech careers including AI/ML Engineering, Data Science, Full-Stack Development, and more.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <TrendingUp size={40} className="text-green-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Blockchain Credentials</h3>
                            <p className="text-gray-600">
                                Earn verifiable credentials recorded on the blockchain that employers can trust and validate instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black mb-6">Write Your Success Story</h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Join VOKASI and begin your career transformation journey today
                    </p>
                    <Link
                        href="/pathways"
                        className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Explore Pathways <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
