'use client';

import React from 'react';
import { Target, Shield, Zap } from 'lucide-react';

interface DifferenceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

const DifferenceCard: React.FC<DifferenceCardProps> = ({ icon, title, description, color }) => {
    return (
        <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300 group">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <div className="text-white">
                    {icon}
                </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    );
};

export const T6Difference = () => {
    return (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4">
                        WHY CHOOSE T6
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        The T6 Difference
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        We're not another online course platform. We're a career transformation engine powered by world-class institutions.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <DifferenceCard
                        icon={<Target size={32} />}
                        title="Job-First Learning"
                        description="Learn what employers ACTUALLY need. Build real projects using the CDIO framework. No theory-only courses. Just skills that get you hired."
                        color="from-blue-500 to-cyan-600"
                    />
                    <DifferenceCard
                        icon={<Shield size={32} />}
                        title="Blockchain Verified"
                        description="Credentials employers trust. No fake certificates or degree mills. Your achievements are permanently verified on the blockchain—unhackable and unforgeable."
                        color="from-purple-500 to-indigo-600"
                    />
                    <DifferenceCard
                        icon={<Zap size={32} />}
                        title="AI-Powered Support"
                        description="24/7 Socratic AI tutor guides you through challenges. Never get stuck. Learn 3x faster with personalized hints and instant feedback."
                        color="from-green-500 to-emerald-600"
                    />
                </div>

                {/* ROI Guarantee */}
                <div className="mt-16 bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-12 text-center text-white">
                    <h3 className="text-3xl font-black mb-4">Our Guarantee: You Get Results</h3>
                    <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                        Average graduates see a <strong className="text-cyan-300">$35K salary increase</strong> in Year 1.
                        If you complete your pathway and don't see career progress, we'll work with you until you do.
                    </p>
                    <div className="flex flex-wrap justify-center gap-8 text-sm">
                        <div>
                            <div className="text-4xl font-black text-cyan-300">82%</div>
                            <div className="text-white/80">Hired within 90 days</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-cyan-300">$35K</div>
                            <div className="text-white/80">Avg. salary increase</div>
                        </div>
                        <div>
                            <div className="text-4xl font-black text-cyan-300">4.9/5</div>
                            <div className="text-white/80">Student satisfaction</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
