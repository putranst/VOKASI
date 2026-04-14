import React from 'react';
import { BookOpen, Briefcase, LucideIcon } from 'lucide-react';

export interface Pathway {
    title: string;
    subtitle: string;
    courses: number;
    duration: string;
    partner: string;
    icon: LucideIcon;
    color: string;
    bg: string;
}

interface PathwayCardProps {
    path: Pathway;
}

export const PathwayCard: React.FC<PathwayCardProps> = ({ path }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className={`w-12 h-12 rounded-xl ${path.bg} ${path.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <path.icon size={24} />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">{path.title}</h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{path.subtitle}</p>

        <div className="flex items-center gap-3 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
            <span className="flex items-center gap-1"><BookOpen size={14} /> {path.courses} Courses</span>
            <span className="flex items-center gap-1"><Briefcase size={14} /> {path.partner}</span>
        </div>
    </div>
);
