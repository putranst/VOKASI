'use client';

import React from 'react';
import { FileText, Video, BookOpen, ExternalLink } from 'lucide-react';

interface ResourceCardProps {
    type: 'case-study' | 'report' | 'webinar' | 'media';
    title: string;
    description: string;
    image?: string;
    partner?: string;
    link?: string;
}

const typeConfig = {
    'case-study': { icon: FileText, label: 'CASE STUDY', color: 'bg-purple-600' },
    'report': { icon: BookOpen, label: 'REPORT', color: 'bg-amber-900' },
    'webinar': { icon: Video, label: 'WEBINAR', color: 'bg-blue-600' },
    'media': { icon: ExternalLink, label: 'MEDIA', color: 'bg-blue-500' }
};

export function ResourceCard({ type, title, description, image, partner }: ResourceCardProps) {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <div className="group cursor-pointer bg-gray-900 rounded-2xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300">
            {/* Image/Background */}
            <div className="relative h-48 overflow-hidden">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className={`w-full h-full ${config.color} opacity-80`} />
                )}

                {/* Type Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Icon size={14} className="text-white" />
                    <span className="text-xs font-bold text-white">{config.label}</span>
                </div>

                {/* Partner Badge */}
                {partner && (
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full">
                        <span className="text-xs font-bold text-gray-900">{partner}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-3">
                    {description}
                </p>
            </div>
        </div>
    );
}
