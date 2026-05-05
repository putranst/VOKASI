'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Target, GraduationCap, Briefcase, Globe, Users, Handshake, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const sdgGoals = [
    {
        number: 4,
        title: 'Quality Education',
        description: 'Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all.',
        color: 'bg-red-500',
        impact: 'Our IRIS-based curriculum and AI tutor provide accessible, world-class education to learners worldwide.'
    },
    {
        number: 8,
        title: 'Decent Work & Economic Growth',
        description: 'Promote sustained, inclusive and sustainable economic growth, full and productive employment.',
        color: 'bg-rose-600',
        impact: '82% employment rate within 6 months of graduation, with average salary increases of 45%.'
    },
    {
        number: 9,
        title: 'Industry, Innovation & Infrastructure',
        description: 'Build resilient infrastructure, promote inclusive industrialization and foster innovation.',
        color: 'bg-orange-500',
        impact: 'Training the next generation of innovators with hands-on project-based learning.'
    },
    {
        number: 10,
        title: 'Reduced Inequalities',
        description: 'Reduce inequality within and among countries through inclusive education access.',
        color: 'bg-pink-600',
        impact: 'Scholarship programs and flexible learning paths remove barriers to quality education.'
    },
    {
        number: 17,
        title: 'Partnerships for Goals',
        description: 'Strengthen global partnerships for sustainable development.',
        color: 'bg-blue-700',
        impact: 'Our Hexahelix model unites government, academia, business, civil society, media, and environment.'
    }
];

export default function SDGPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
                    <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
                    <div className="absolute top-1/2 left-1/2 w-80 h-80 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>

                <div className="max-w-[70rem] mx-auto px-4 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <Target size={16} />
                            UN SUSTAINABLE DEVELOPMENT GOALS
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black mb-6">
                            Education for a
                            <span className="block text-cyan-300">Sustainable Future</span>
                        </h1>
                        <p className="text-xl text-blue-100 leading-relaxed">
                            VOKASI is committed to advancing the United Nations Sustainable Development Goals through accessible, quality education and meaningful partnerships.
                        </p>
                    </div>
                </div>
            </section>

            {/* SDG Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">Our SDG Alignment</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            We directly contribute to 5 of the 17 Sustainable Development Goals
                        </p>
                    </div>

                    <div className="space-y-8">
                        {sdgGoals.map((goal, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all">
                                <div className={`${goal.color} text-white w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                                    <span className="text-3xl font-black">{goal.number}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{goal.title}</h3>
                                    <p className="text-gray-600 mb-4">{goal.description}</p>
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <p className="text-sm font-medium text-primary">
                                            <strong>Our Impact:</strong> {goal.impact}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { icon: GraduationCap, value: '1,100+', label: 'Graduates' },
                            { icon: Globe, value: '25+', label: 'Countries Reached' },
                            { icon: Briefcase, value: '82%', label: 'Employment Rate' },
                            { icon: Users, value: '450+', label: 'Partner Organizations' }
                        ].map((stat, i) => (
                            <div key={i} className="p-6">
                                <stat.icon size={32} className="mx-auto mb-4 opacity-80" />
                                <div className="text-4xl font-black mb-2">{stat.value}</div>
                                <div className="text-white/80 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hexahelix Link */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <Handshake size={48} className="text-accent mb-6" />
                                <h2 className="text-3xl font-black text-gray-900 mb-4">
                                    The Hexahelix Approach
                                </h2>
                                <p className="text-gray-600 text-lg mb-8">
                                    Our unique framework brings together six key stakeholders—government, business, academia, civil society, media, and environment—to create systemic change.
                                </p>
                                <Link
                                    href="/hexahelix"
                                    className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:bg-accent/90 transition-all"
                                >
                                    Learn About Hexahelix <ArrowRight size={18} />
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-accent/10 to-primary/10 rounded-3xl flex items-center justify-center">
                                    <div className="text-9xl font-black text-accent/20">6</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
