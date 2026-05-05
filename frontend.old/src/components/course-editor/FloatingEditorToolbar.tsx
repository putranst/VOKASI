'use client';

import React, { useState } from 'react';
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    Link as LinkIcon, Sparkles, ChevronDown, Wand2, MoreHorizontal,
    Image as ImageIcon, Video
} from 'lucide-react';
import { AIAction } from './PersistentEditorToolbar'; // Re-use types for now

interface FloatingEditorToolbarProps {
    onFormat: (format: string, value?: string) => void;
    onHeadingChange: (level: string) => void;
    onAIAction: (action: AIAction) => void;
}

// Re-defining for local usage if needed, but imported type is better
const AI_OPTIONS = [
    { action: 'improve', label: 'Improve writing' },
    { action: 'shorten', label: 'Make shorter' },
    { action: 'longer', label: 'Make longer' },
    { action: 'simplify', label: 'Simplify' },
];

export function FloatingEditorToolbar({
    onFormat,
    onHeadingChange,
    onAIAction
}: FloatingEditorToolbarProps) {
    const [showAIDropdown, setShowAIDropdown] = useState(false);

    return (
        <div className="flex items-center gap-1 p-1.5 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Block Type Selector */}
            <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors">
                Paragraph
                <ChevronDown size={14} className="text-gray-400" />
            </button>

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* Formatting */}
            <IconButton icon={Bold} onClick={() => onFormat('bold')} />
            <IconButton icon={Italic} onClick={() => onFormat('italic')} />
            <IconButton icon={AlignLeft} onClick={() => onFormat('alignLeft')} /> {/* Usually cycle alignment */}
            <IconButton icon={LinkIcon} onClick={() => {
                const url = prompt('Enter URL:');
                if (url) onFormat('link', url);
            }} />

            <IconButton icon={ImageIcon} onClick={() => onFormat('image')} />
            <IconButton icon={Video} onClick={() => onFormat('video')} />

            <div className="w-px h-5 bg-gray-200 mx-1" />

            {/* More */}
            <IconButton icon={MoreHorizontal} onClick={() => { }} />

            {/* AI Assistant Button */}
            <div className="relative ml-1">
                <button
                    onClick={() => setShowAIDropdown(!showAIDropdown)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors"
                >
                    <Sparkles size={14} />
                    AI Assistant
                    <ChevronDown size={12} />
                </button>

                {showAIDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-50">
                        {AI_OPTIONS.map((opt) => (
                            <button
                                key={opt.action}
                                onClick={() => {
                                    onAIAction(opt.action as AIAction);
                                    setShowAIDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-amber-50 text-amber-600 rounded-lg text-sm font-medium transition-colors ml-1">
                <Wand2 size={14} />
                Interaction
            </button>
        </div>
    );
}

function IconButton({ icon: Icon, onClick }: { icon: any, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <Icon size={18} />
        </button>
    );
}
