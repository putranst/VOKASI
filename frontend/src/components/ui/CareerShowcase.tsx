'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowRight } from 'lucide-react';

interface CareerTeaserProps {
    icon: string;
    title: string;
    salaryRange: string;
    growth: string;
    highlight: string;
    category: 'sdg' | 'future' | 'demand';
}

const CareerTeaserCard: React.FC<CareerTeaserProps> = ({ icon, title, salaryRange, growth, highlight, category }) => {
    const getCategoryColor = () => {
        switch (category) {
            case 'sdg': return 'from-green-500 to-emerald-600';
            case 'future': return 'from-purple-500 to-indigo-600';
            case 'demand': return 'from-blue-500 to-cyan-600';
        }
    };

    return (
        <Link
            href="/pathways"
            className="group bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-primary hover:shadow-2xl transition-all duration-300 cursor-pointer"
        >
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                {title}
            </h3>

            <div className="mb-4">
                <div className="text-3xl font-black text-primary mb-1">{salaryRange}</div>
                <div className="flex items-center gap-2 text-sm">
                    <TrendingUp size={14} className="text-green-600" />
                    <span className="text-green-600 font-semibold">{growth} growth</span>
                </div>
            </div>

            <div className={`inline-block bg-gradient-to-r ${getCategoryColor()} text-white text-xs font-bold px-3 py-1.5 rounded-full mb-4`}>
                {highlight}
            </div>

            <div className="flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Explore this path
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
};

export const CareerShowcase = () => {
    const topCareers = [
        {
            icon: '🧠',
            title: 'AI/ML Engineer',
            salaryRange: '$105K - $180K',
            growth: '+42%',
            highlight: 'Future Tech',
            category: 'future' as const
        },
        {
            icon: '🌱',
            title: 'Sustainability Consultant',
            salaryRange: '$75K - $130K',
            growth: '+22%',
            highlight: 'Save the Planet',
            category: 'sdg' as const
        },
        {
            icon: '🔗',
            title: 'Blockchain Architect',
            salaryRange: '$110K - $185K',
            growth: '+40%',
            highlight: 'Build Web3',
            category: 'future' as const
        },
        {
            icon: '📈',
            title: 'Data Scientist',
            salaryRange: '$95K - $165K',
            growth: '+36%',
            highlight: 'In-Demand Now',
            category: 'demand' as const
        },
        {
            icon: '✍️',
            title: 'Prompt Engineer',
            salaryRange: '$85K - $150K',
            growth: '+60%',
            highlight: 'Hottest Job 2024',
            category: 'future' as const
        },
        {
            icon: '☁️',
            title: 'Cloud Architect',
            salaryRange: '$110K - $180K',
            growth: '+25%',
            highlight: 'Remote-First',
            category: 'demand' as const
        },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="max-w-[70rem] mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
                        Where Will You Be in 6 Months?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Pick from <strong>33 high-growth careers</strong> with clear salary ranges and proven pathways.
                        These aren't dreams—they're achievable goals.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {topCareers.map((career, index) => (
                        <CareerTeaserCard key={index} {...career} />
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/pathways"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/30 transition-all"
                    >
                        Explore All 33 Career Paths
                        <ArrowRight size={20} />
                    </Link>
                    <p className="mt-4 text-gray-500 text-sm">
                        Each pathway shows required courses, skills, and time to mastery
                    </p>
                </div>
            </div>
        </section>
    );
};
