'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FileText, BookOpen, Code2, Award, Sparkles, Search, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const docCategories = [
    {
        icon: BookOpen,
        title: 'Getting Started',
        description: 'New to T6? Start here.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        docs: [
            { title: 'Platform Overview', description: 'Learn about T6 and its features' },
            { title: 'Creating Your Account', description: 'Sign up and set up your profile' },
            { title: 'Choosing a Career Pathway', description: 'Find the right path for you' },
            { title: 'First Steps', description: 'Navigate your first course' }
        ]
    },
    {
        icon: FileText,
        title: 'IRIS Cycle',
        description: 'Our learning methodology',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        docs: [
            { title: 'What is IRIS?', description: 'Immersion, Reflection, Iteration, Scale' },
            { title: 'Immersion Phase', description: 'Problem context observation' },
            { title: 'Reflection Phase', description: 'Gap analysis & SFIA mapping' },
            { title: 'Iteration Phase', description: 'Build-Measure-Learn cycles' },
            { title: 'Scale Phase', description: 'Deployment and credential' }
        ]
    },
    {
        icon: Sparkles,
        title: 'AI Tutor',
        description: 'Your learning companion',
        color: 'text-cyan-600',
        bg: 'bg-cyan-50',
        docs: [
            { title: 'How the AI Tutor Works', description: 'Socratic learning method' },
            { title: 'Getting Help', description: 'Asking effective questions' },
            { title: 'Context-Aware Hints', description: 'Personalized guidance' },
            { title: 'Best Practices', description: 'Maximize your learning' }
        ]
    },
    {
        icon: Code2,
        title: 'Cloud IDE',
        description: 'Build real projects',
        color: 'text-green-600',
        bg: 'bg-green-50',
        docs: [
            { title: 'IDE Overview', description: 'Features and capabilities' },
            { title: 'Supported Languages', description: 'Python, JavaScript, and more' },
            { title: 'Running Code', description: 'Execute and test your projects' },
            { title: 'Saving Work', description: 'Auto-save and project management' }
        ]
    },
    {
        icon: Award,
        title: 'Credentials',
        description: 'Blockchain certificates',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        docs: [
            { title: 'Understanding Credentials', description: 'What T6 credentials mean' },
            { title: 'Earning Credentials', description: 'Complete projects to earn' },
            { title: 'Blockchain Verification', description: 'How verification works' },
            { title: 'Sharing Credentials', description: 'Add to LinkedIn and more' }
        ]
    }
];

export default function DocsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <FileText size={16} />
                            DOCUMENTATION
                        </div>
                        <h1 className="text-5xl font-black mb-6">Platform Guides</h1>
                        <p className="text-xl text-gray-300 mb-8">
                            Everything you need to get the most out of T6
                        </p>

                        {/* Search */}
                        <div className="relative max-w-xl mx-auto">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search documentation..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-8 bg-white border-b border-gray-100">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="flex flex-wrap gap-4 justify-center">
                        {['Getting Started', 'IRIS Cycle', 'AI Tutor', 'Cloud IDE', 'Credentials'].map((link) => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase().replace(' ', '-')}`}
                                className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Documentation Grid */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="space-y-12">
                        {docCategories.map((category, i) => (
                            <div key={i} id={category.title.toLowerCase().replace(' ', '-')} className="scroll-mt-32">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 ${category.bg} ${category.color} rounded-xl flex items-center justify-center`}>
                                        <category.icon size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                                        <p className="text-gray-500">{category.description}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {category.docs.map((doc, j) => (
                                        <div
                                            key={j}
                                            className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{doc.description}</p>
                                                </div>
                                                <ChevronRight size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Help CTA */}
            <section className="py-16 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-white text-center">
                        <h2 className="text-3xl font-black mb-4">Can't Find What You're Looking For?</h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Our support team and AI tutor are here to help you succeed
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link
                                href="/faq"
                                className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                View FAQs
                            </Link>
                            <Link
                                href="/contact"
                                className="border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
