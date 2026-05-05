'use client';

import React, { useState } from 'react';
import {
    Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight,
    List, ListOrdered, Link as LinkIcon, Sparkles, ChevronDown, Image as ImageIcon,
    Video, MoreVertical
} from 'lucide-react';

interface PersistentEditorToolbarProps {
    selectedBlockId: string | null;
    onFormat: (format: string, value?: string) => void;
    onHeadingChange: (level: string) => void;
    onAIAction: (action: AIAction) => void;
}

export type AIAction =
    | 'improve'
    | 'shorten'
    | 'longer'
    | 'simplify'
    | 'summarize'
    | 'complete'
    | 'paraphrase';

const HEADING_OPTIONS = [
    { value: 'paragraph', label: 'Paragraph' },
    { value: 'heading1', label: 'Heading 1' },
    { value: 'heading2', label: 'Heading 2' },
    { value: 'heading3', label: 'Heading 3' },
    { value: 'heading4', label: 'Heading 4' },
    { value: 'heading5', label: 'Heading 5' },
    { value: 'heading6', label: 'Heading 6' },
];

const AI_OPTIONS: { action: AIAction; label: string }[] = [
    { action: 'improve', label: 'Improve writing' },
    { action: 'shorten', label: 'Make shorter' },
    { action: 'longer', label: 'Make longer' },
    { action: 'simplify', label: 'Simplify language' },
    { action: 'summarize', label: 'Summarize' },
    { action: 'complete', label: 'Complete' },
    { action: 'paraphrase', label: 'Paraphrase' },
];

export function PersistentEditorToolbar({
    selectedBlockId,
    onFormat,
    onHeadingChange,
    onAIAction
}: PersistentEditorToolbarProps) {
    const [showAIDropdown, setShowAIDropdown] = useState(false);
    const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
    const [activeHeading, setActiveHeading] = useState('paragraph');

    const handleHeadingSelect = (value: string) => {
        setActiveHeading(value);
        onHeadingChange(value);
        setShowHeadingDropdown(false);
    };

    const handleAISelect = (action: AIAction) => {
        onAIAction(action);
        setShowAIDropdown(false);
    };

    const isDisabled = !selectedBlockId;

    return (
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-1 px-4 py-2">
                {/* Heading Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowHeadingDropdown(!showHeadingDropdown)}
                        disabled={isDisabled}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 
                                 bg-white hover:bg-gray-50 transition-colors min-w-32
                                 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className="text-sm font-medium text-gray-700">
                            {HEADING_OPTIONS.find(h => h.value === activeHeading)?.label || 'Paragraph'}
                        </span>
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>

                    {/* Heading Dropdown Menu */}
                    {showHeadingDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowHeadingDropdown(false)}
                            />
                            <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 
                                          rounded-lg shadow-lg z-20 py-1">
                                {HEADING_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleHeadingSelect(option.value)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 
                                                 text-gray-700 transition-colors"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Text Formatting */}
                <ToolbarButton
                    icon={Bold}
                    title="Bold (Ctrl+B)"
                    onClick={() => onFormat('bold')}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    icon={Italic}
                    title="Italic (Ctrl+I)"
                    onClick={() => onFormat('italic')}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    icon={Underline}
                    title="Underline (Ctrl+U)"
                    onClick={() => onFormat('underline')}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    icon={Strikethrough}
                    title="Strikethrough"
                    onClick={() => onFormat('strikethrough')}
                    disabled={isDisabled}
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Alignment */}
                <ToolbarButton
                    icon={AlignLeft}
                    title="Align Left"
                    onClick={() => onFormat('alignLeft')}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    icon={AlignCenter}
                    title="Align Center"
                    onClick={() => onFormat('alignCenter')}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    icon={AlignRight}
                    title="Align Right"
                    onClick={() => onFormat('alignRight')}
                    disabled={isDisabled}
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Lists */}
                <ToolbarButton
                    icon={List}
                    title="Bullet List"
                    onClick={() => onFormat('bulletList')}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    icon={ListOrdered}
                    title="Numbered List"
                    onClick={() => onFormat('numberedList')}
                    disabled={isDisabled}
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* Insert */}
                <ToolbarButton
                    icon={LinkIcon}
                    title="Insert Link"
                    onClick={() => {
                        const url = prompt('Enter URL:');
                        if (url) onFormat('link', url);
                    }}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    icon={ImageIcon}
                    title="Insert Image"
                    onClick={() => onFormat('image')}
                    disabled={isDisabled}
                />
                <ToolbarButton
                    icon={Video}
                    title="Insert Video"
                    onClick={() => onFormat('video')}
                    disabled={isDisabled}
                />

                <div className="w-px h-6 bg-gray-300 mx-1" />

                {/* More Options */}
                <ToolbarButton
                    icon={MoreVertical}
                    title="More Options"
                    onClick={() => { }}
                    disabled={isDisabled}
                />

                <div className="flex-1" />

                {/* AI Assistant Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowAIDropdown(!showAIDropdown)}
                        disabled={isDisabled}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg 
                                 bg-gradient-to-r from-purple-500 to-indigo-500 
                                 text-white font-medium text-sm transition-all
                                 hover:from-purple-600 hover:to-indigo-600 hover:shadow-md
                                 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Sparkles size={16} />
                        <span>AI Assistant</span>
                        <ChevronDown size={14} />
                    </button>

                    {/* AI Dropdown Menu */}
                    {showAIDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowAIDropdown(false)}
                            />
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 
                                          rounded-lg shadow-xl z-20 py-1">
                                {AI_OPTIONS.map((option) => (
                                    <button
                                        key={option.action}
                                        onClick={() => handleAISelect(option.action)}
                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 
                                                 text-gray-700 hover:text-purple-700 transition-colors"
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Interaction Builder */}
                <button
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500
                             bg-white text-amber-700 font-medium text-sm transition-all
                             hover:bg-amber-50
                             ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span>✨</span>
                    <span>Interaction Builder</span>
                </button>
            </div>
        </div>
    );
}

interface ToolbarButtonProps {
    icon: React.ElementType;
    title: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
}

function ToolbarButton({ icon: Icon, title, onClick, active, disabled }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            disabled={disabled}
            className={`p-2 rounded-lg transition-all ${active
                    ? 'bg-indigo-100 text-indigo-600'
                    : disabled
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            <Icon size={18} />
        </button>
    );
}
