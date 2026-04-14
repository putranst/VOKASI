'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock, TextLayout } from '../types';
import { TextEditingToolbar } from '../TextEditingToolbar';
import { AITextAssistant } from '../AITextAssistant';

interface TextLayoutRendererProps {
    block: ContentBlock;
    isEditing: boolean;
    onUpdate: (updates: Partial<ContentBlock>) => void;
}

export default function TextLayoutRenderer({
    block,
    isEditing,
    onUpdate
}: TextLayoutRendererProps) {
    const layout = block.layout as TextLayout;
    const { title } = block.metadata || {};

    // State for toolbar and AI assistant
    const [showToolbar, setShowToolbar] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [activeField, setActiveField] = useState<'content' | 'title' | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Handle text selection
    const handleTextSelect = (e: React.MouseEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;
        const selection = target.value.substring(target.selectionStart, target.selectionEnd);
        if (selection.length > 0) {
            setSelectedText(selection);
            setShowToolbar(true);
        }
    };

    // Handle formatting
    const handleFormat = (format: string, value?: string) => {
        // Basic formatting - in production, use a rich text library
        console.log('Format:', format, value);
    };

    // Handle AI operations
    const handleAIReplace = (newText: string) => {
        if (activeField === 'content') {
            const currentValue = block.content;
            const updatedContent = currentValue.replace(selectedText, newText);
            onUpdate({ content: updatedContent });
        }
    };

    const handleAIInsertBelow = (newText: string) => {
        if (activeField === 'content') {
            const updatedContent = block.content + '\n\n' + newText;
            onUpdate({ content: updatedContent });
        }
    };

    // Render functions with toolbar integration
    const renderEditableHeading = () => (
        <input
            type="text"
            placeholder="Heading"
            className="w-full px-0 py-2 border-0 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none font-bold text-3xl"
            defaultValue={title || block.content}
            onChange={(e) => onUpdate({
                metadata: { ...block.metadata, title: e.target.value }
            })}
        />
    );

    const renderEditableText = (placeholder: string = 'Enter text...', rows: number = 4) => (
        <div className="relative">
            <textarea
                ref={textareaRef}
                placeholder={placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={rows}
                defaultValue={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                onMouseUp={handleTextSelect}
                onFocus={() => {
                    setActiveField('content');
                    setShowToolbar(true);
                }}
                onBlur={() => {
                    // Keep toolbar visible if AI assistant is open
                    setTimeout(() => {
                        if (!showAIAssistant) {
                            setShowToolbar(false);
                        }
                    }, 200);
                }}
            />
            {/* Show toolbar when editing */}
            {isEditing && showToolbar && activeField === 'content' && (
                <div className="absolute -top-14 left-0 z-50">
                    <TextEditingToolbar
                        onFormat={handleFormat}
                        onAIAssist={() => {
                            if (selectedText) {
                                setShowAIAssistant(true);
                            } else {
                                alert('Please select text first');
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );

    const renderStaticHeading = () => (
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {title || block.content || 'Heading'}
        </h2>
    );

    const renderStaticText = () => (
        <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {block.content || 'Add your text content here...'}
            </p>
        </div>
    );

    const renderColumn = (content: string, index: number) => {
        const contentKey = index === 0 ? 'content' : `column${index + 1}`;
        const metadataKey = `column${index + 1}Content`;

        return isEditing ? (
            <div>
                <input
                    type="text"
                    placeholder={`Heading ${index + 1}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold text-lg mb-2"
                    defaultValue={block.metadata?.[`column${index + 1}Title`] || 'Heading'}
                    onChange={(e) => onUpdate({
                        metadata: { ...block.metadata, [`column${index + 1}Title`]: e.target.value }
                    })}
                />
                <textarea
                    placeholder="Column text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none text-sm"
                    rows={5}
                    defaultValue={index === 0 ? block.content : (block.metadata?.[metadataKey] || '')}
                    onChange={(e) => {
                        if (index === 0) {
                            onUpdate({ content: e.target.value });
                        } else {
                            onUpdate({
                                metadata: { ...block.metadata, [metadataKey]: e.target.value }
                            });
                        }
                    }}
                />
            </div>
        ) : (
            <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                    {block.metadata?.[`column${index + 1}Title`] || 'Heading'}
                </h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                    {index === 0 ? block.content : (block.metadata?.[metadataKey] || 'Add text here...')}
                </p>
            </div>
        );
    };

    // Render based on layout
    return (
        <>
            {(() => {
                switch (layout) {
                    case 'heading-text':
                        return (
                            <div className="space-y-4">
                                {isEditing ? renderEditableHeading() : renderStaticHeading()}
                                {isEditing ? renderEditableText('Add paragraph text...', 6) : renderStaticText()}
                            </div>
                        );

                    case 'text-only':
                        return (
                            <div>
                                {isEditing ? renderEditableText('Enter your text...', 5) : renderStaticText()}
                            </div>
                        );

                    case 'two-columns':
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {renderColumn(block.content, 0)}
                                {renderColumn(block.metadata?.column2Content || '', 1)}
                            </div>
                        );

                    case 'heading-two-columns':
                        return (
                            <div className="space-y-6">
                                {isEditing ? renderEditableHeading() : renderStaticHeading()}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {renderColumn(block.content, 0)}
                                    {renderColumn(block.metadata?.column2Content || '', 1)}
                                </div>
                            </div>
                        );

                    case 'three-columns':
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {renderColumn(block.content, 0)}
                                {renderColumn(block.metadata?.column2Content || '', 1)}
                                {renderColumn(block.metadata?.column3Content || '', 2)}
                            </div>
                        );

                    default:
                        return (
                            <div className="p-4 bg-gray-100 rounded-lg">
                                <p className="text-sm text-gray-500">Unknown text layout: {layout}</p>
                            </div>
                        );
                }
            })()}

            {/* AI Text Assistant Modal */}
            {showAIAssistant && selectedText && (
                <AITextAssistant
                    selectedText={selectedText}
                    onClose={() => {
                        setShowAIAssistant(false);
                        setShowToolbar(false);
                    }}
                    onReplace={handleAIReplace}
                    onInsertBelow={handleAIInsertBelow}
                />
            )}
        </>
    );
}
