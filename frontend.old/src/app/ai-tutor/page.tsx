'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, BrainCircuit, MessageCircle, Clock, Target, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AITutorPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-24 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="max-w-[70rem] mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                                <Sparkles size={16} className="text-cyan-400" />
                                AI-POWERED LEARNING
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
                                Your Personal
                                <span className="block bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                    AI Tutor
                                </span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Learn 3X faster with personalized guidance, instant feedback, and the Socratic method. Our AI companion adapts to your learning style and helps you master complex concepts.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/pathways"
                                    className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all flex items-center gap-2"
                                >
                                    Start Learning <ArrowRight size={18} />
                                </Link>
                                <Link
                                    href="/courses"
                                    className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                                >
                                    Browse Courses
                                </Link>
                            </div>
                        </div>

                        {/* AI Chat Preview */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <Sparkles size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Socratic AI</div>
                                        <div className="text-xs text-green-400 flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            Online
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/10 rounded-2xl p-4 max-w-[80%]">
                                        <p className="text-sm text-gray-200">
                                            I'm struggling with the Design phase of my project. How should I approach system architecture?
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-4 ml-auto max-w-[85%]">
                                        <p className="text-sm text-gray-100">
                                            Great question! Let's break it down using the IRIS framework. First, what did you observe during your Immersion that defines the core problem? 🤔
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">User Authentication</span>
                                            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Data Flow</span>
                                            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">API Design</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">How Our AI Tutor Helps You</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Powered by advanced AI, our tutor provides personalized support throughout your learning journey
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: BrainCircuit,
                                title: 'Socratic Method',
                                description: 'Learn through guided questions that encourage critical thinking and deep understanding.',
                                color: 'text-purple-600',
                                bg: 'bg-purple-50'
                            },
                            {
                                icon: Target,
                                title: 'Context-Aware Hints',
                                description: 'Get personalized hints based on your current progress without giving away answers.',
                                color: 'text-cyan-600',
                                bg: 'bg-cyan-50'
                            },
                            {
                                icon: Clock,
                                title: '24/7 Availability',
                                description: 'Access help anytime, anywhere. No waiting for office hours or instructor responses.',
                                color: 'text-green-600',
                                bg: 'bg-green-50'
                            },
                            {
                                icon: MessageCircle,
                                title: 'Natural Conversations',
                                description: 'Chat naturally like you would with a human tutor. Ask follow-up questions freely.',
                                color: 'text-orange-600',
                                bg: 'bg-orange-50'
                            },
                            {
                                icon: Zap,
                                title: 'Instant Feedback',
                                description: 'Get immediate feedback on your code, designs, and project submissions.',
                                color: 'text-yellow-600',
                                bg: 'bg-yellow-50'
                            },
                            {
                                icon: Sparkles,
                                title: 'Adaptive Learning',
                                description: 'The AI adapts to your skill level and learning pace for personalized experiences.',
                                color: 'text-pink-600',
                                bg: 'bg-pink-50'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Highlight Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Powered by the IRIS Cycle</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our AI tutor integrates with the NUSA Framework's IRIS methodology, guiding you through Immersion, Reflection, Iteration, and Scale phases in every project.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black mb-6">Ready to Learn Smarter?</h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Start your personalized learning journey today with our AI-powered tutor
                    </p>
                    <Link
                        href="/pathways"
                        className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Get Started Free <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
