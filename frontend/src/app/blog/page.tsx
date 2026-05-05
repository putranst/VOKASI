'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowRight, Clock, FileText, BookOpen, Newspaper, Tag } from 'lucide-react';
import Link from 'next/link';
import { ARTICLES, type ArticleType } from '@/lib/articles';

const TYPE_LABELS: Record<ArticleType | 'all', string> = {
    all: 'All',
    article: 'Articles',
    'case-study': 'Case Studies',
    report: 'Reports',
    webinar: 'Webinars',
};

const TYPE_COLORS: Record<ArticleType, string> = {
    article: 'bg-blue-100 text-blue-800',
    'case-study': 'bg-purple-100 text-purple-800',
    report: 'bg-amber-100 text-amber-800',
    webinar: 'bg-green-100 text-green-800',
};

const TYPE_ICONS: Record<ArticleType, React.ReactNode> = {
    article: <Newspaper size={12} />,
    'case-study': <FileText size={12} />,
    report: <BookOpen size={12} />,
    webinar: <Tag size={12} />,
};

export default function BlogPage() {
    const [activeFilter, setActiveFilter] = useState<ArticleType | 'all'>('all');

    const featured = ARTICLES.find(a => a.featured);
    const filtered = ARTICLES.filter(a =>
        !a.featured && (activeFilter === 'all' || a.type === activeFilter)
    );

    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans">
            <Navbar />

            {/* Hero */}
            <section
                className="relative text-white py-20 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)' }}
            >
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(16,185,129,0.3) 0%, transparent 60%)' }} />
                <div className="max-w-[70rem] mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <Newspaper size={14} />
                        INSIGHTS & RESOURCES
                    </div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight">
                        <span className="text-white">VO</span><span style={{ color: '#10b981' }}>KASI</span> Insights
                    </h1>
                    <p className="text-lg text-emerald-100 max-w-2xl">
                        Research, case studies, and practical guides on AI education, vocational upskilling, and the future of Indonesian careers.
                    </p>
                </div>
            </section>

            <div className="max-w-[70rem] mx-auto px-4 py-12">

                {/* Featured Article */}
                {featured && (
                    <Link href={`/blog/${featured.slug}`} className="group block mb-14">
                        <div className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                            <div className="relative h-64 lg:h-auto">
                                <img src={featured.image} alt={featured.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                                <span className="absolute top-4 left-4 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500 text-white">
                                    ★ Featured
                                </span>
                            </div>
                            <div className="bg-white p-8 lg:p-10 flex flex-col justify-center">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit mb-4 ${TYPE_COLORS[featured.type]}`}>
                                    {TYPE_ICONS[featured.type]}
                                    {TYPE_LABELS[featured.type]}
                                </span>
                                <h2 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">
                                    {featured.title}
                                </h2>
                                <p className="text-gray-600 mb-6 leading-relaxed">{featured.excerpt}</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{featured.author}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <Clock size={11} /> {featured.date} · {featured.readTime}
                                        </p>
                                    </div>
                                    <span className="flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
                                        Read <ArrowRight size={16} />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2 flex-wrap mb-8">
                    {(Object.keys(TYPE_LABELS) as (ArticleType | 'all')[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeFilter === f
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                                }`}
                        >
                            {TYPE_LABELS[f]}
                        </button>
                    ))}
                </div>

                {/* Article Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {filtered.map(article => (
                        <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
                            <article className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all h-full flex flex-col">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[article.type]}`}>
                                        {TYPE_ICONS[article.type]}
                                        {TYPE_LABELS[article.type]}
                                    </span>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-black text-gray-900 mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock size={11} /> {article.date} · {article.readTime}
                                        </p>
                                        <span className="text-xs font-bold text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
                                            Read <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>

                {/* Newsletter CTA */}
                <div className="rounded-3xl p-10 text-white text-center" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)' }}>
                    <h2 className="text-2xl font-black mb-2">Stay ahead of the curve</h2>
                    <p className="text-white/80 mb-6 max-w-md mx-auto text-sm">
                        New research, case studies, and product insights delivered to your inbox.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white"
                        />
                        <button className="bg-white text-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
