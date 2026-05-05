import React from 'react';
import { Navbar } from '@/components/Navbar';
import { CheckCircle, TrendingUp, Users } from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function EnterprisePage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            <main>
                <section className="bg-[#1a1a1a] text-white py-24">
                    <div className="max-w-[70rem] mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h1 className="text-5xl font-black mb-6">VOKASI for Enterprise</h1>
                            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                                Upskill your workforce with the same rigorous curriculum used by top Asian governments and universities.
                            </p>
                            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-[#5a4a3b] transition-all">
                                Schedule a Demo
                            </button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl" />
                            <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-lg flex items-center justify-center"><CheckCircle /></div>
                                        <div>
                                            <h3 className="font-bold text-lg">Verified Credentials</h3>
                                            <p className="text-sm text-gray-400">Blockchain-backed proof of skills.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-lg flex items-center justify-center"><TrendingUp /></div>
                                        <div>
                                            <h3 className="font-bold text-lg">Performance Analytics</h3>
                                            <p className="text-sm text-gray-400">Track team progress in real-time.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-500/20 text-purple-500 rounded-lg flex items-center justify-center"><Users /></div>
                                        <div>
                                            <h3 className="font-bold text-lg">Custom Learning Paths</h3>
                                            <p className="text-sm text-gray-400">Tailored to your company's goals.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
