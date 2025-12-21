'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
    Code2, Play, Terminal, Save, Cloud,
    Zap, Shield, Globe, ArrowRight, CheckCircle,
    Cpu, Database, Server, Layers
} from 'lucide-react';
import Link from 'next/link';

export default function CloudIDEPage() {
    const features = [
        {
            icon: <Cloud size={28} />,
            title: 'Browser-Based Development',
            description: 'No installation required. Write, test, and debug code directly in your browser with our powerful cloud IDE.'
        },
        {
            icon: <Terminal size={28} />,
            title: 'Multi-Language Support',
            description: 'Python, JavaScript, Java, C++, and more. Our IDE supports all major programming languages used in industry.'
        },
        {
            icon: <Zap size={28} />,
            title: 'Instant Feedback',
            description: 'Run your code instantly and get real-time output. No waiting for compilation or setup.'
        },
        {
            icon: <Shield size={28} />,
            title: 'Secure Sandbox',
            description: 'Your code runs in an isolated environment. Experiment freely without affecting your system.'
        },
        {
            icon: <Save size={28} />,
            title: 'Auto-Save & Version Control',
            description: 'Never lose your work. Code is automatically saved and you can track changes over time.'
        },
        {
            icon: <Globe size={28} />,
            title: 'Access Anywhere',
            description: 'Continue coding from any device. Your projects are stored in the cloud and always accessible.'
        }
    ];

    const supportedLanguages = [
        { name: 'Python', icon: '🐍', color: 'from-blue-500 to-yellow-400' },
        { name: 'JavaScript', icon: '💛', color: 'from-yellow-400 to-yellow-600' },
        { name: 'TypeScript', icon: '💙', color: 'from-blue-400 to-blue-600' },
        { name: 'Java', icon: '☕', color: 'from-red-500 to-orange-500' },
        { name: 'C/C++', icon: '⚙️', color: 'from-blue-600 to-purple-600' },
        { name: 'Go', icon: '🔵', color: 'from-cyan-400 to-blue-500' },
        { name: 'Rust', icon: '🦀', color: 'from-orange-500 to-red-600' },
        { name: 'SQL', icon: '📊', color: 'from-green-500 to-teal-500' }
    ];

    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative max-w-[70rem] mx-auto px-4 py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                                <Code2 size={16} />
                                CLOUD IDE
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-tight">
                                Code in the Cloud.
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"> Build Real Projects.</span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Our browser-based IDE lets you write, run, and debug code without any setup.
                                Part of the IRIS learning framework, you'll build real projects that demonstrate your skills.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    href="/pathways"
                                    className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all"
                                >
                                    Start Building <ArrowRight size={18} />
                                </Link>
                                <Link
                                    href="/courses"
                                    className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                                >
                                    Browse Courses
                                </Link>
                            </div>
                        </div>

                        {/* Code Preview */}
                        <div className="relative">
                            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                                {/* IDE Header */}
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-700/50 border-b border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono">main.py</div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                                            <Play size={14} className="text-green-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Code Area */}
                                <div className="p-4 font-mono text-sm">
                                    <pre className="text-gray-300">
                                        <code>
                                            <span className="text-purple-400">def</span> <span className="text-cyan-400">analyze_sustainability</span>(data):
                                            <span className="text-gray-500"># AI-powered analysis</span>
                                            score = model.predict(data)

                                            <span className="text-purple-400">if</span> score &gt; <span className="text-orange-400">0.8</span>:
                                            <span className="text-purple-400">return</span> <span className="text-green-400">"Excellent SDG alignment"</span>
                                            <span className="text-purple-400">return</span> <span className="text-green-400">"Needs improvement"</span>

                                            <span className="text-gray-500"># Run analysis</span>
                                            result = analyze_sustainability(project_data)
                                            <span className="text-cyan-400">print</span>(result)
                                        </code>
                                    </pre>
                                </div>

                                {/* Output Area */}
                                <div className="bg-slate-900/80 border-t border-white/10 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Terminal size={14} className="text-gray-400" />
                                        <span className="text-xs text-gray-400 font-bold">Output</span>
                                    </div>
                                    <div className="font-mono text-sm text-green-400">
                                        ✓ Excellent SDG alignment
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">Everything You Need to Code</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Our cloud IDE is designed for learners. Focus on building skills, not setting up tools.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, i) => (
                            <div key={i} className="group p-8 bg-gray-50 hover:bg-white rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Supported Languages */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Supported Languages</h2>
                        <p className="text-gray-600">Write code in all major programming languages</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {supportedLanguages.map((lang, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all text-center group">
                                <div className="text-4xl mb-3">{lang.icon}</div>
                                <div className="font-bold text-gray-900">{lang.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* IRIS Framework Integration */}
            <section className="py-20 bg-white">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-bold mb-6">
                                <Layers size={16} />
                                IRIS CYCLE
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 mb-6">
                                Build Real Projects. Earn Real Credentials.
                            </h2>
                            <p className="text-xl text-gray-600 mb-8">
                                The Cloud IDE is integrated into our IRIS learning framework.
                                During the <strong>Iteration</strong> phase, you'll write actual code
                                that solves real problems—not just theoretical exercises.
                            </p>

                            <div className="space-y-4">
                                {[
                                    'Immerse in authentic problem context',
                                    'Reflect on knowledge gaps & SFIA skills',
                                    'Iterate with Build-Measure-Learn cycles',
                                    'Scale and deploy your solution'
                                ].map((step, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {i + 1}
                                        </div>
                                        <span className={`font-medium ${i === 2 ? 'text-primary font-bold' : 'text-gray-700'}`}>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white">
                                <Cpu size={32} className="mb-4 opacity-80" />
                                <div className="text-2xl font-black mb-2">AI Assistance</div>
                                <p className="text-blue-100 text-sm">Get hints from our Socratic AI Tutor</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white">
                                <Database size={32} className="mb-4 opacity-80" />
                                <div className="text-2xl font-black mb-2">Data Access</div>
                                <p className="text-purple-100 text-sm">Connect to real datasets</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white">
                                <Server size={32} className="mb-4 opacity-80" />
                                <div className="text-2xl font-black mb-2">Cloud Deploy</div>
                                <p className="text-green-100 text-sm">Deploy your projects live</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white">
                                <Shield size={32} className="mb-4 opacity-80" />
                                <div className="text-2xl font-black mb-2">Verified</div>
                                <p className="text-orange-100 text-sm">Blockchain credentials</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <h2 className="text-4xl font-black mb-6">Ready to Start Coding?</h2>
                    <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Choose a career pathway and start building real projects today
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/pathways"
                            className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Choose Your Pathway <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/ai-tutor"
                            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all"
                        >
                            Meet the AI Tutor
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
