'use client';

import React, { useState } from 'react';
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Link as LinkIcon, Sparkles, ChevronDown
} from 'lucide-react';

interface TextEditingToolbarProps {
    onFormat: (format: string, value?: string) => void;
    onAIAssist: () => void;
    position?: { top: number; left: number };
}

export function TextEditingToolbar({ onFormat, onAIAssist, position }: TextEditingToolbarProps) {
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

    const handleFormat = (format: string) => {
        const newFormats = new Set(activeFormats);
        if (newFormats.has(format)) {
            newFormats.delete(format);
        } else {
            newFormats.add(format);
        }
        setActiveFormats(newFormats);
        onFormat(format);
    };

    const toolbarStyle = position ? {
        position: 'absolute' as const,
        top: `${position.top}px`,
        left: `${position.left}px`,
    } : {};

    return (
        <div
            className="bg-white border border-gray-200 rounded-xl shadow-lg px-2 py-2 flex items-center gap-1 z-50"
            style={toolbarStyle}
        >
            {/* Text Formatting */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
                <ToolbarButton
                    icon={Bold}
                    title="Bold (Ctrl+B)"
                    active={activeFormats.has('bold')}
                    onClick={() => handleFormat('bold')}
                />
                <ToolbarButton
                    icon={Italic}
                    title="Italic (Ctrl+I)"
                    active={activeFormats.has('italic')}
                    onClick={() => handleFormat('italic')}
                />
                <ToolbarButton
                    icon={Underline}
                    title="Underline (Ctrl+U)"
                    active={activeFormats.has('underline')}
                    onClick={() => handleFormat('underline')}
                />
                <ToolbarButton
                    icon={Strikethrough}
                    title="Strikethrough"
                    active={activeFormats.has('strikethrough')}
                    onClick={() => handleFormat('strikethrough')}
                />
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
                <ToolbarButton
                    icon={AlignLeft}
                    title="Align Left"
                    active={activeFormats.has('alignLeft')}
                    onClick={() => handleFormat('alignLeft')}
                />
                <ToolbarButton
                    icon={AlignCenter}
                    title="Align Center"
                    active={activeFormats.has('alignCenter')}
                    onClick={() => handleFormat('alignCenter')}
                />
                <ToolbarButton
                    icon={AlignRight}
                    title="Align Right"
                    active={activeFormats.has('alignRight')}
                    onClick={() => handleFormat('alignRight')}
                />
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
                <ToolbarButton
                    icon={List}
                    title="Bullet List"
                    active={activeFormats.has('bulletList')}
                    onClick={() => handleFormat('bulletList')}
                />
                <ToolbarButton
                    icon={ListOrdered}
                    title="Numbered List"
                    active={activeFormats.has('numberedList')}
                    onClick={() => handleFormat('numberedList')}
                />
            </div>

            {/* Link */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
                <ToolbarButton
                    icon={LinkIcon}
                    title="Insert Link"
                    onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) onFormat('link', url);
                    }}
                />
            </div>

            {/* AI Assistant */}
            <button
                onClick={onAIAssist}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 
                         text-white font-medium text-sm hover:from-purple-600 hover:to-indigo-600 transition-all
                         hover:shadow-md hover:scale-105"
            >
                <Sparkles size={14} />
                <span>AI Assistant</span>
                <ChevronDown size={14} />
            </button>
        </div>
    );
}

interface ToolbarButtonProps {
    icon: React.ElementType;
    title: string;
    active?: boolean;
    onClick: () => void;
}

function ToolbarButton({ icon: Icon, title, active, onClick }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-2 rounded-lg transition-all ${active
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            <Icon size={16} />
        </button>
    );
}
