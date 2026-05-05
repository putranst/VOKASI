'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Clock, Tag, ArrowRight, FileText, BookOpen, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { ARTICLES, getArticleBySlug, type ArticleType, type ArticleSection } from '@/lib/articles';

const TYPE_LABELS: Record<ArticleType, string> = {
    article: 'Article',
    'case-study': 'Case Study',
    report: 'Report',
    webinar: 'Webinar',
};

const TYPE_COLORS: Record<ArticleType, string> = {
    article: 'bg-blue-100 text-blue-800',
    'case-study': 'bg-purple-100 text-purple-800',
    report: 'bg-amber-100 text-amber-800',
    webinar: 'bg-green-100 text-green-800',
};

const TYPE_ICONS: Record<ArticleType, React.ReactNode> = {
    article: <Newspaper size={13} />,
    'case-study': <FileText size={13} />,
    report: <BookOpen size={13} />,
    webinar: <Tag size={13} />,
};

function RenderSection({ section }: { section: ArticleSection }) {
    switch (section.kind) {
        case 'heading':
            return (
                <h2 className="text-2xl font-black text-gray-900 mt-10 mb-4 leading-tight">
                    {section.text}
                </h2>
            );
        case 'paragraph':
            return (
                <p className="text-gray-700 leading-relaxed mb-5 text-[17px]">
                    {section.text}
                </p>
            );
        case 'quote':
            return (
                <blockquote className="my-8 pl-5 border-l-4 border-primary">
                    <p className="text-xl font-semibold text-gray-800 italic leading-relaxed mb-2">
                        &ldquo;{section.text}&rdquo;
                    </p>
                    {section.author && (
                        <cite className="text-sm text-gray-500 not-italic">— {section.author}</cite>
                    )}
                </blockquote>
            );
        case 'list':
            return (
                <ul className="my-5 space-y-2.5">
                    {section.items?.map((item, i) => (
                        <li key={i} className="flex gap-3 text-gray-700 text-[17px] leading-relaxed">
                            <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                            {item}
                        </li>
                    ))}
                </ul>
            );
        case 'callout':
            return (
                <div className="my-8 rounded-2xl p-6 border-l-4 border-primary bg-emerald-50">
                    <p className="text-gray-800 leading-relaxed font-medium">{section.text}</p>
                </div>
            );
        case 'divider':
            return <hr className="my-10 border-gray-200" />;
        default:
            return null;
    }
}

export default function ArticlePage() {
    const { slug } = useParams<{ slug: string }>();
    const article = getArticleBySlug(slug);

    if (!article) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Navbar />
                <div className="max-w-[70rem] mx-auto px-4 py-32 text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Article not found</h1>
                    <p className="text-gray-500 mb-8">This article doesn&apos;t exist or may have moved.</p>
                    <Link href="/blog" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all">
                        <ArrowLeft size={16} /> Back to Insights
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    const related = ARTICLES.filter(a => a.slug !== article.slug && a.type === article.type).slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            <Navbar />

            {/* Hero Image */}
            <div className="relative h-[420px] overflow-hidden bg-gray-900">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 max-w-[70rem] mx-auto px-4 pb-10">
                    <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium mb-4 transition-colors">
                        <ArrowLeft size={15} /> Back to Insights
                    </Link>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${TYPE_COLORS[article.type]}`}>
                        {TYPE_ICONS[article.type]}
                        {TYPE_LABELS[article.type]}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-white leading-tight max-w-3xl">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* Article Body */}
            <div className="max-w-[70rem] mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-[1fr_300px] gap-12">

                    {/* Main Content */}
                    <div>
                        {/* Author + Meta */}
                        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                {article.author.split(' ').map(w => w[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{article.author}</p>
                                <p className="text-xs text-gray-500">{article.authorRole}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Clock size={12} />{article.date}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>{article.readTime}</span>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium">
                            {article.excerpt}
                        </p>

                        {/* Content Sections */}
                        <div>
                            {article.content.map((section, i) => (
                                <RenderSection key={i} section={section} />
                            ))}
                        </div>

                        {/* Tags */}
                        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-2">
                            {article.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {/* About VOKASI */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="font-black text-gray-900 mb-3">About VOKASI</h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                AI-native vocational education for Indonesia. Build career-ready AI skills with structured pathways, verifiable credentials, and real project work.
                            </p>
                            <Link
                                href="/pathways"
                                className="flex items-center justify-center gap-2 w-full bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all"
                            >
                                Explore Pathways <ArrowRight size={14} />
                            </Link>
                        </div>

                        {/* Related Articles */}
                        {related.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <h3 className="font-black text-gray-900 mb-4">More {TYPE_LABELS[article.type]}s</h3>
                                <div className="space-y-4">
                                    {related.map(r => (
                                        <Link key={r.slug} href={`/blog/${r.slug}`} className="group flex gap-3">
                                            <img src={r.image} alt={r.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                                                    {r.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock size={10} /> {r.readTime}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Articles */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <Link href="/blog" className="flex items-center justify-between text-sm font-bold text-primary hover:gap-2 transition-all">
                                View all insights <ArrowRight size={14} />
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>

            <Footer />
        </div>
    );
}
