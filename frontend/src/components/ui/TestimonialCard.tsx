'use client';

import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialCardProps {
    name: string;
    previousRole: string;
    newRole: string;
    quote: string;
    timeline: string;
    avatar?: string;
}

export function TestimonialCard({
    name,
    previousRole,
    newRole,
    quote,
    timeline,
    avatar
}: TestimonialCardProps) {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {avatar || name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{previousRole}</span>
                        <span className="text-primary">→</span>
                        <span className="font-semibold text-primary">{newRole}</span>
                    </div>
                    <span className="inline-block mt-2 text-xs font-bold text-white bg-primary px-3 py-1 rounded-full">
                        {timeline}
                    </span>
                </div>
            </div>

            <div className="relative">
                <Quote className="absolute -top-2 -left-2 text-primary/20" size={32} />
                <p className="text-gray-700 leading-relaxed pl-8 italic">
                    {quote}
                </p>
            </div>
        </div>
    );
}
