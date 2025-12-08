'use client';

import React from 'react';
import { TrendingUp, Clock } from 'lucide-react';
import { CareerPathway } from './careerData';

interface CareerCardProps {
    career: CareerPathway;
    onClick: () => void;
}

export const CareerCard: React.FC<CareerCardProps> = ({ career, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all duration-300 cursor-pointer group"
        >
            {/* Category Badge */}
            <div className={`inline-block bg-gradient-to-r ${getCategoryColor(career.category)} text-white text-xs font-bold px-3 py-1 rounded-full mb-3`}>
                {career.category}
            </div>

            {/* Icon & Title */}
            <div className="flex items-start gap-4 mb-4">
                <div className="text-5xl">{career.icon}</div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {career.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                        {career.shortDescription}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <TrendingUp size={12} />
                        Salary
                    </div>
                    <div className="font-bold text-gray-900 text-sm">{career.salary}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Clock size={12} />
                        Growth
                    </div>
                    <div className="font-bold text-green-600 text-sm">{career.growth}</div>
                </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-3 rounded-lg font-bold text-sm group-hover:shadow-lg transition-all">
                Learn More →
            </button>
        </div>
    );
};

function getCategoryColor(category: string): string {
    switch (category) {
        case 'SDGs & ESG':
            return 'from-green-500 to-emerald-600';
        case 'Future Tech':
            return 'from-purple-500 to-indigo-600';
        case 'In-Demand Now':
            return 'from-blue-500 to-cyan-600';
        default:
            return 'from-gray-500 to-gray-600';
    }
}
