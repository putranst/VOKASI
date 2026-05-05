'use client';

import React from 'react';
import {
    Video, Image, Type, FileText, MessageSquare,
    HelpCircle, FileQuestion, Sparkles, Code, Minus,
    Zap, BookOpen
} from 'lucide-react';
import { BlockCategory, BlockLayout } from './types';

interface RightSidebarProps {
    onBlockSelect: (blockType: string, layout?: BlockLayout) => void;
    onCategorySelect: (category: BlockCategory) => void;
}

// Category info with icons
const CATEGORIES: Array<{
    category: BlockCategory;
    label: string;
    icon: React.ReactNode;
    color: string;
    emoji: string;
    hasLayouts: boolean;
    description: string;
}> = [
        {
            category: 'video',
            label: 'Video',
            icon: <Video size={20} />,
            color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
            emoji: '📹',
            hasLayouts: true,
            description: '5 layouts available'
        },
        {
            category: 'image',
            label: 'Image',
            icon: <Image size={20} />,
            color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
            emoji: '🖼️',
            hasLayouts: true,
            description: '6 layouts available'
        },
        {
            category: 'text',
            label: 'Text',
            icon: <Type size={20} />,
            color: 'bg-slate-50 text-slate-700 hover:bg-slate-100',
            emoji: '📝',
            hasLayouts: true,
            description: '5 layouts available'
        },
        {
            category: 'actions',
            label: 'Actions',
            icon: <Zap size={20} />,
            color: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
            emoji: '✨',
            hasLayouts: true,
            description: 'Interactive elements'
        },
        {
            category: 'activities',
            label: 'Activities',
            icon: <HelpCircle size={20} />,
            color: 'bg-green-50 text-green-600 hover:bg-green-100',
            emoji: '🎯',
            hasLayouts: false,
            description: 'Quizzes, assignments'
        },
        {
            category: 'pdf',
            label: 'PDF',
            icon: <FileText size={20} />,
            color: 'bg-red-50 text-red-600 hover:bg-red-100',
            emoji: '📕',
            hasLayouts: false,
            description: 'Document viewer'
        },
        {
            category: 'embed',
            label: 'Embed',
            icon: <Code size={20} />,
            color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
            emoji: '🔗',
            hasLayouts: false,
            description: 'HTML, code, iframes'
        }
    ];

export default function RightSidebar({ onBlockSelect, onCategorySelect }: RightSidebarProps) {
    const handleCategoryClick = (category: BlockCategory, hasLayouts: boolean) => {
        if (hasLayouts) {
            // Open layout picker
            onCategorySelect(category);
        } else {
            // Create block directly for categories without layouts
            switch (category) {
                case 'activities':
                    onBlockSelect('quiz'); // Default activity
                    break;
                case 'pdf':
                    onBlockSelect('pdf');
                    break;
                case 'embed':
                    onBlockSelect('embed');
                    break;
            }
        }
    };

    return (
        <div className="h-full w-72 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            {/* Header - Fixed */}
            <div className="p-5 border-b border-gray-200 shrink-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-blue-600" />
                    <h3 className="text-base font-bold text-gray-900">Add Content Block</h3>
                </div>
                <p className="text-xs text-gray-600">
                    Click a category to choose layout variations
                </p>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.category}
                            onClick={() => handleCategoryClick(cat.category, cat.hasLayouts)}
                            className={`w-full p-4 rounded-xl border-2 border-gray-200 transition-all ${cat.color} group hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{cat.emoji}</span>
                                    <div className="text-left">
                                        <div className="font-bold text-sm">{cat.label}</div>
                                        <div className="text-xs opacity-75">{cat.description}</div>
                                    </div>
                                </div>
                                <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                                    {cat.icon}
                                </div>
                            </div>

                            {/* Layout indicator */}
                            {cat.hasLayouts && (
                                <div className="mt-3 pt-3 border-t border-current border-opacity-20 flex items-center justify-between text-xs">
                                    <span className="opacity-75">Multiple layouts</span>
                                    <svg
                                        className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Quick Actions Section */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Quick Add
                    </h4>
                    <div className="space-y-2">
                        <button
                            onClick={() => onBlockSelect('quiz')}
                            className="w-full p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                        >
                            <HelpCircle size={16} />
                            <span>Quiz</span>
                        </button>
                        <button
                            onClick={() => onBlockSelect('assignment')}
                            className="w-full p-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                        >
                            <FileQuestion size={16} />
                            <span>Assignment</span>
                        </button>
                        <button
                            onClick={() => onBlockSelect('discussion')}
                            className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                        >
                            <MessageSquare size={16} />
                            <span>Discussion</span>
                        </button>
                        <button
                            onClick={() => onBlockSelect('divider')}
                            className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                        >
                            <Minus size={16} />
                            <span>Divider</span>
                        </button>
                    </div>
                </div>

                {/* AI Assistant Hint */}
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-2">
                        <Sparkles size={16} className="text-blue-600 mt-0.5 shrink-0" />
                        <div>
                            <div className="text-xs font-semibold text-blue-900 mb-1">
                                AI Tip
                            </div>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Select any text block to access AI writing assistance: rewrite, translate, summarize, and more!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
