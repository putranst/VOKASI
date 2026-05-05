'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';

export const StaticHero = () => {
    return (
        <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-primary overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Copy */}
                    <div className="text-white">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6 border border-white/20">
                            <Sparkles size={16} className="text-cyan-300" />
                            <span>Blockchain-Verified Credentials — Mapped to BNSP Standards</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
                            Land Your Dream Job in{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                                6 Months
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed font-medium">
                            Join <strong className="text-cyan-300">1,100+ professionals</strong> who transformed their careers with project-based learning.
                            <span className="block mt-2 text-lg text-white/80">No degree required. Just results.</span>
                        </p>

                        {/* Social Proof Strip */}
                        <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-white/20">
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <span className="text-white/90 font-semibold">4.9/5 from 847 reviews</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90 font-semibold">
                                <TrendingUp size={20} className="text-green-400" />
                                <span>82% hired within 90 days</span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/pathways"
                                className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Start Your Free Career Assessment
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <Link
                                href="/pathways"
                                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
                            >
                                Browse 33 Career Paths
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/70">
                            <span className="flex items-center gap-1">
                                <CheckCircle size={16} className="text-green-400" />
                                No credit card required
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle size={16} className="text-green-400" />
                                Start learning in 5 minutes
                            </span>
                            <span className="flex items-center gap-1">
                                <CheckCircle size={16} className="text-green-400" />
                                450+ companies hiring our grads
                            </span>
                        </div>
                    </div>

                    {/* Right: Visual/Stats */}
                    <div className="relative">
                        {/* Success Metrics Card */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                            <div className="mb-6">
                                <div className="text-white/70 text-sm font-semibold mb-2">AVERAGE OUTCOMES</div>
                                <div className="h-1 w-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded"></div>
                            </div>

                            {/* Stats Grid */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white/80 text-sm mb-1">Salary Increase</div>
                                        <div className="text-4xl font-black text-white">+47%</div>
                                    </div>
                                    <div className="text-5xl">💰</div>
                                </div>

                                <div className="h-px bg-white/10"></div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white/80 text-sm mb-1">Time to Job Offer</div>
                                        <div className="text-4xl font-black text-white">4.2 mo</div>
                                    </div>
                                    <div className="text-5xl">⚡</div>
                                </div>

                                <div className="h-px bg-white/10"></div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white/80 text-sm mb-1">Remote-Friendly Roles</div>
                                        <div className="text-4xl font-black text-white">89%</div>
                                    </div>
                                    <div className="text-5xl">🌍</div>
                                </div>

                                <div className="h-px bg-white/10"></div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white/80 text-sm mb-1">Companies Hiring</div>
                                        <div className="text-4xl font-black text-white">450+</div>
                                    </div>
                                    <div className="text-5xl">🏢</div>
                                </div>
                            </div>

                            {/* Live Activity Indicator */}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-3 text-white/80 text-sm">
                                    <div className="relative">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                                    </div>
                                    <span className="font-medium">
                                        <strong className="text-white">Sarah from Jakarta</strong> just got hired as ESG Analyst - $95K
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl rotate-6 font-bold text-sm">
                            🏆 #1 For Career Changers
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
