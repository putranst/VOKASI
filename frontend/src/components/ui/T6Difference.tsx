'use client';

import React from 'react';
import { Target, Shield, Zap, Cloud, MessageSquareMore, WifiOff } from 'lucide-react';

interface DifferenceCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

const DifferenceCard: React.FC<DifferenceCardProps> = ({ icon, title, description, color }) => {
    return (
        <div
            className="flex-shrink-0 w-72 md:w-80 bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300 group snap-center"
        >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <div className="text-white">
                    {icon}
                </div>
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    );
};

const DIFFERENCE_DATA = [
    {
        icon: <Target size={24} />,
        title: "Job-First Learning",
        description: "Learn what employers ACTUALLY need. Build real projects using the IRIS Cycle. No theory-only courses. Just skills that get you hired.",
        color: "from-blue-500 to-cyan-600"
    },
    {
        icon: <Shield size={24} />,
        title: "Blockchain Verified",
        description: "Credentials employers trust. No fake certificates or degree mills. Your achievements are permanently verified on the blockchain—unhackable and unforgeable.",
        color: "from-purple-500 to-indigo-600"
    },
    {
        icon: <Zap size={24} />,
        title: "AI-Powered Support",
        description: "24/7 Socratic AI tutor guides you through challenges. Never get stuck. Learn 3x faster with personalized hints and instant feedback.",
        color: "from-green-500 to-emerald-600"
    },
    {
        icon: <Cloud size={24} />,
        title: "Cloud-Hosted IDE",
        description: "No expensive hardware required. Access GPU-powered Jupyter notebooks from a Chromebook, tablet, or basic laptop.",
        color: "from-cyan-500 to-blue-600"
    },
    {
        icon: <MessageSquareMore size={24} />,
        title: "Socratic AI Tutor",
        description: "Our AI doesn't give you the answer. It asks questions to guide your reasoning, ensuring deep transfer learning.",
        color: "from-amber-500 to-orange-600"
    },
    {
        icon: <WifiOff size={24} />,
        title: "Offline-First Design",
        description: "Low bandwidth? No problem. T6 caches curriculum locally and syncs your project work when connectivity returns.",
        color: "from-rose-500 to-pink-600"
    }
];

export const T6Difference = () => {
    return (
        <section
            className="py-16 overflow-hidden relative"
            style={{ backgroundColor: '#EEF2F6' }}
        >
            {/* Header */}
            <div className="max-w-[70rem] mx-auto px-4 mb-6">
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                    Built for the Real Economy
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl">
                    T6 isn't just a learning management system. It's an integrated development environment engineered for the unique challenges of the Indonesian archipelago.
                </p>
            </div>

            {/* Full-width Scrolling Cards */}
            <div
                className="flex gap-5 overflow-x-auto pb-6 pt-4 no-scrollbar px-4 md:px-8 snap-x"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                }}
            >
                {DIFFERENCE_DATA.map((item, i) => (
                    <DifferenceCard
                        key={i}
                        icon={item.icon}
                        title={item.title}
                        description={item.description}
                        color={item.color}
                    />
                ))}
            </div>

            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-16 pointer-events-none z-10" style={{ background: 'linear-gradient(to right, #EEF2F6, transparent)' }} />
            <div className="absolute inset-y-0 right-0 w-16 pointer-events-none z-10" style={{ background: 'linear-gradient(to left, #EEF2F6, transparent)' }} />
        </section>
    );
};
