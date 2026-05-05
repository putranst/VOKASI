'use client';

import React from 'react';
import Image from 'next/image';

interface FacultyCardProps {
    name: string;
    title: string;
    institution: string;
    photo?: string;
}

export function FacultyCard({ name, title, institution, photo }: FacultyCardProps) {
    // Generate initials for placeholder
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="flex-shrink-0 w-64 group cursor-pointer">
            <div className="relative overflow-hidden rounded-2xl bg-gray-800 aspect-[3/4]">
                {/* Photo or gradient placeholder */}
                {photo ? (
                    <Image
                        src={photo}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="256px"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-gray-800 flex items-center justify-center">
                        <span className="text-6xl font-black text-white/20">{initials}</span>
                    </div>
                )}

                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Institution badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-gray-900">
                    {institution}
                </div>

                {/* Name and title overlaid at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-bold text-xl mb-1">{name}</h3>
                    <p className="text-sm text-gray-300 font-medium">{title}</p>
                </div>
            </div>
        </div>
    );
}
