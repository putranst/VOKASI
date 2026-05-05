'use client';

import React from 'react';
import { Video, Image as ImageIcon, Type, Zap, Activity, Link, FileText } from 'lucide-react';
import { BlockCategory } from './types';

interface FloatingIconMenuProps {
    onCategorySelect: (category: BlockCategory) => void;
}

const MENU_ITEMS = [
    { category: 'video' as BlockCategory, icon: Video, label: 'Video', color: 'from-blue-500 to-blue-600' },
    { category: 'image' as BlockCategory, icon: ImageIcon, label: 'Image', color: 'from-purple-500 to-purple-600' },
    { category: 'text' as BlockCategory, icon: Type, label: 'Text', color: 'from-green-500 to-green-600' },
    { category: 'actions' as BlockCategory, icon: Zap, label: 'Actions', color: 'from-amber-500 to-amber-600' },
    { category: 'activities' as BlockCategory, icon: Activity, label: 'Activities', color: 'from-pink-500 to-pink-600' },
    { category: 'embed' as BlockCategory, icon: Link, label: 'Embed', color: 'from-indigo-500 to-indigo-600' },
    { category: 'pdf' as BlockCategory, icon: FileText, label: 'PDF', color: 'from-red-500 to-red-600' },
];

export function FloatingIconMenu({ onCategorySelect }: FloatingIconMenuProps) {
    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 flex flex-col gap-2">
                {MENU_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.category}
                            onClick={() => onCategorySelect(item.category)}
                            className="group relative w-12 h-12 rounded-xl bg-gray-50 hover:bg-gradient-to-br transition-all duration-300 
                                     flex items-center justify-center text-gray-600 hover:text-white hover:shadow-lg hover:scale-110"
                            style={{
                                backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                            }}
                            onMouseEnter={(e) => {
                                const gradient = item.color.split(' ');
                                e.currentTarget.style.setProperty('--tw-gradient-from', gradient[0].split('-').slice(1).join('-'));
                                e.currentTarget.style.setProperty('--tw-gradient-to', gradient[1].split('-').slice(1).join('-'));
                            }}
                        >
                            <Icon size={20} className="transition-transform group-hover:scale-110" />

                            {/* Tooltip */}
                            <div className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium 
                                          rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                {item.label}
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full 
                                              border-4 border-transparent border-l-gray-900"></div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
