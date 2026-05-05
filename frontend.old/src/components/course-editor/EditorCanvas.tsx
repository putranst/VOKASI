'use client';

import React, { useState } from 'react';
import {
    GripVertical, MoreVertical, Trash2, Copy, Edit3,
    Video, Image, FileText, Code, Table, List, Heading as HeadingIcon,
    Plus, Settings, ArrowLeft
} from 'lucide-react';
import { ContentBlock } from './types';
import VideoLayoutRenderer from './renderers/VideoLayoutRenderer';
import ImageLayoutRenderer from './renderers/ImageLayoutRenderer';
import TextLayoutRenderer from './renderers/TextLayoutRenderer';
import ActionLayoutRenderer from './renderers/ActionLayoutRenderer';
import { PersistentEditorToolbar, AIAction } from './PersistentEditorToolbar';
import { FloatingEditorToolbar } from './FloatingEditorToolbar';
import { EditorToolsSidebar } from './EditorToolsSidebar';
import { AddBlockButton } from './AddBlockButton';
import { AITextAssistant } from './AITextAssistant';
import { BlockOptionsModal } from './BlockOptionsModal';

interface EditorCanvasProps {
    pageTitle: string;
    blocks: ContentBlock[];
    selectedBlockId: string | null;
    onBlockSelect: (blockId: string | null) => void;
    onBlockUpdate: (blockId: string, updates: Partial<ContentBlock>) => void;
    onBlockDelete: (blockId: string) => void;
    onBlockDuplicate: (blockId: string) => void;
    onDropZoneClick: (afterBlockId: string | null, category?: string) => void;
}

export default function EditorCanvas({
    pageTitle,
    blocks,
    selectedBlockId,
    onBlockSelect,
    onBlockUpdate,
    onBlockDelete,
    onBlockDuplicate,
    onDropZoneClick
}: EditorCanvasProps) {
    const [editingBlockId, setEditingBlockId] = React.useState<string | null>(null);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [currentAIAction, setCurrentAIAction] = useState<AIAction | null>(null);
    const [blockOptionsId, setBlockOptionsId] = useState<string | null>(null);

    // Handle toolbar format actions
    const handleFormat = (format: string, value?: string) => {
        if (!selectedBlockId) return;
        console.log('Format:', format, value);
        // In production, apply formatting to selected block
    };

    // Handle heading changes
    const handleHeadingChange = (level: string) => {
        if (!selectedBlockId) return;
        console.log('Heading level:', level);
        // In production, update block heading level
    };

    // Handle AI actions
    const handleAIAction = (action: AIAction) => {
        if (!selectedBlockId) return;

        // Get selected block text
        const selectedBlock = blocks.find(b => b.id === selectedBlockId);
        if (!selectedBlock) return;

        // Use block content as selected text
        const text = selectedBlock.content || 'No content selected';
        setSelectedText(text);
        setCurrentAIAction(action);
        setShowAIAssistant(true);
    };

    // Handle AI replace
    const handleAIReplace = (newText: string) => {
        if (!selectedBlockId) return;
        onBlockUpdate(selectedBlockId, { content: newText });
    };

    // Handle AI insert below
    const handleAIInsertBelow = (newText: string) => {
        if (!selectedBlockId) return;
        const selectedBlock = blocks.find(b => b.id === selectedBlockId);
        if (!selectedBlock) return;

        const updatedContent = selectedBlock.content + '\n\n' + newText;
        onBlockUpdate(selectedBlockId, { content: updatedContent });
    };

    // Verify selected block exists
    const selectedBlock = React.useMemo(() =>
        blocks.find(b => b.id === selectedBlockId),
        [blocks, selectedBlockId]
    );

    return (
        <div className="flex flex-1 h-full bg-[#F9FAFB] overflow-hidden relative">
            {/* Left Sidebar removed - using Layout's sidebar */}

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Header (Breadcrumbs) */}
                {/* Header Block Removed - Handled Globally */}

                {/* Scrollable Document Area */}
                <div className="flex-1 overflow-y-auto flex justify-center bg-white" onClick={() => { onBlockSelect(null); setEditingBlockId(null); }}>
                    <div className="w-full max-w-none min-h-[calc(100vh-8rem)] px-32 py-16 relative" onClick={(e) => e.stopPropagation()}>

                        {/* Title Block */}
                        <div className="mb-8 group relative text-left">
                            <input
                                value={pageTitle}
                                readOnly
                                className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 bg-transparent border-none focus:ring-0 p-0 leading-tight"
                                placeholder="Untitled Page"
                            />
                            {/* Optional: Underline or just hidden */}
                            <div className="h-1 w-24 bg-blue-600 mt-4 rounded-full" />
                        </div>

                        {/* Blocks */}
                        <div className="space-y-2">
                            {/* Initial Drop Zone */}
                            {blocks.length === 0 && (
                                <div className="py-8 text-center text-gray-400">
                                    <p>Start writing or choose a block from the sidebar</p>
                                </div>
                            )}

                            {blocks.map((block) => (
                                <div key={block.id} className="relative group">
                                    {/* Actions Handle (Left Gutter) */}
                                    {/* Actions Handle (Left Gutter - Vertical Pill) */}
                                    <div className="absolute top-0 -left-16 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center py-2 gap-3 z-10 bg-white shadow-sm border border-gray-100 rounded-full w-10">
                                        <button
                                            className="text-gray-400 hover:text-gray-600 cursor-move"
                                            title="Drag to move"
                                        >
                                            <GripVertical size={16} />
                                        </button>
                                        <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                            <Settings size={16} />
                                        </button>
                                        <button
                                            onClick={() => onBlockDelete(block.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {/* Render Block */}
                                    <div
                                        className={`relative rounded-lg transition-all border-2 ${selectedBlockId === block.id
                                            ? 'border-blue-100 bg-blue-50/10'
                                            : 'border-transparent hover:border-gray-100'
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (selectedBlockId === block.id) {
                                                setEditingBlockId(block.id);
                                            } else {
                                                onBlockSelect(block.id);
                                                setEditingBlockId(null);
                                            }
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            setEditingBlockId(block.id);
                                        }}
                                    >
                                        {/* Floating Toolbar (Above Block) */}
                                        {selectedBlockId === block.id && (
                                            <div className="absolute -top-14 left-0 z-50">
                                                <FloatingEditorToolbar
                                                    onFormat={handleFormat}
                                                    onHeadingChange={handleHeadingChange}
                                                    onAIAction={handleAIAction}
                                                />
                                            </div>
                                        )}

                                        <div className="px-2 py-1">
                                            {renderBlockContent(block, editingBlockId === block.id, onBlockUpdate, setEditingBlockId)}
                                        </div>
                                    </div>

                                    {/* Add Button (Below Block) */}
                                    {/* Add Button (Centered Blue +) */}
                                    <div className="h-0 z-20 relative flex justify-center -mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => onDropZoneClick(block.id)}
                                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative top-[-16px]"
                                            title="Add Block"
                                        >
                                            <Plus size={20} strokeWidth={3} />
                                            <span className="absolute -top-8 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none group-hover/btn:opacity-100">
                                                Add Block
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Final Add Zone */}
                            <div className="pt-4">
                                <AddBlockButton
                                    onClick={() => onDropZoneClick(blocks.length > 0 ? blocks[blocks.length - 1].id : null)}
                                    label="Add Section"
                                    visible={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Tools Sidebar */}
            <EditorToolsSidebar onAddBlock={(type) => {
                // Determine insertion point (active block or end)
                onDropZoneClick(selectedBlockId || (blocks.length > 0 ? blocks[blocks.length - 1].id : null), type);
            }} />

            {/* AI Modal */}
            {showAIAssistant && selectedText && (
                <AITextAssistant
                    selectedText={selectedText}
                    onClose={() => setShowAIAssistant(false)}
                    onReplace={handleAIReplace}
                    onInsertBelow={handleAIInsertBelow}
                />
            )}

            {/* Block Options Modal */}
            {blockOptionsId && (
                <BlockOptionsModal
                    block={blocks.find(b => b.id === blockOptionsId)!}
                    onClose={() => setBlockOptionsId(null)}
                    onUpdate={onBlockUpdate}
                />
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// Helper functions
// ----------------------------------------------------------------------

function renderBlockContent(
    block: ContentBlock,
    isEditing: boolean,
    onBlockUpdate: (blockId: string, updates: Partial<ContentBlock>) => void,
    setEditingBlockId: (blockId: string | null) => void
) {
    // Use layout renderers for blocks with layouts
    if (block.layout) {
        const updateHandler = (updates: Partial<ContentBlock>) => {
            onBlockUpdate(block.id, updates);
        };

        switch (block.category) {
            case 'video':
                return (
                    <VideoLayoutRenderer
                        block={block}
                        isEditing={isEditing}
                        onUpdate={updateHandler}
                    />
                );
            case 'image':
                return (
                    <ImageLayoutRenderer
                        block={block}
                        isEditing={isEditing}
                        onUpdate={updateHandler}
                    />
                );
            case 'text':
                return (
                    <TextLayoutRenderer
                        block={block}
                        isEditing={isEditing}
                        onUpdate={updateHandler}
                    />
                );
            case 'actions':
                return (
                    <ActionLayoutRenderer
                        block={block}
                        isEditing={isEditing}
                        onUpdate={updateHandler}
                    />
                );
        }
    }

    // Fallback to old rendering for blocks without layouts
    switch (block.type) {
        case 'heading':
            return isEditing ? (
                <input
                    type="text"
                    value={block.content}
                    onChange={(e) => onBlockUpdate(block.id, { content: e.target.value })}
                    onBlur={() => setEditingBlockId(null)}
                    className="w-full text-2xl font-bold border-b-2 border-blue-500 focus:outline-none"
                    placeholder="Enter heading..."
                    autoFocus
                />
            ) : (
                <h2 className="text-2xl font-bold text-gray-900">{block.content || 'Untitled Heading'}</h2>
            );

        case 'text':
            return isEditing ? (
                <textarea
                    value={block.content}
                    onChange={(e) => onBlockUpdate(block.id, { content: e.target.value })}
                    onBlur={() => setEditingBlockId(null)}
                    className="w-full min-h-[150px] p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-y"
                    placeholder="Enter text content..."
                    autoFocus
                />
            ) : (
                <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{block.content || 'Click to edit text...'}</p>
                </div>
            );

        case 'video':
            return (
                <div className="space-y-3">
                    {isEditing ? (
                        <input
                            type="text"
                            value={block.metadata?.videoUrl || ''}
                            onChange={(e) => onBlockUpdate(block.id, {
                                metadata: { ...block.metadata, videoUrl: e.target.value }
                            })}
                            onBlur={() => setEditingBlockId(null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            placeholder="Enter video URL (YouTube, Vimeo, etc.)..."
                            autoFocus
                        />
                    ) : block.metadata?.videoUrl ? (
                        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                            <Video size={48} className="text-gray-600" />
                            <p className="ml-2 text-gray-400 text-sm">Video: {block.metadata.videoUrl}</p>
                        </div>
                    ) : (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                            <div className="text-center">
                                <Video size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Click Edit to add video URL</p>
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'image':
            return (
                <div className="space-y-3">
                    {isEditing ? (
                        <input
                            type="text"
                            value={block.metadata?.imageUrl || ''}
                            onChange={(e) => onBlockUpdate(block.id, {
                                metadata: { ...block.metadata, imageUrl: e.target.value }
                            })}
                            onBlur={() => setEditingBlockId(null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            placeholder="Enter image URL..."
                            autoFocus
                        />
                    ) : block.metadata?.imageUrl ? (
                        <img
                            src={block.metadata.imageUrl}
                            alt={block.metadata.title || 'Image'}
                            className="w-full rounded-lg"
                        />
                    ) : (
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                            <div className="text-center">
                                <Image size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Click Edit to add image URL</p>
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'quiz':
            return (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">?</div>
                        <h3 className="font-bold text-gray-900">Quiz</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                        {block.metadata?.questions?.length || 0} question(s) configured
                    </p>
                    {isEditing && (
                        <button
                            onClick={() => setEditingBlockId(null)}
                            className="mt-3 px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
                        >
                            Configure Quiz
                        </button>
                    )}
                </div>
            );

        case 'assignment':
            return (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={20} className="text-orange-600" />
                        <h3 className="font-bold text-gray-900">Assignment</h3>
                    </div>
                    {isEditing ? (
                        <textarea
                            value={block.content}
                            onChange={(e) => onBlockUpdate(block.id, { content: e.target.value })}
                            onBlur={() => setEditingBlockId(null)}
                            className="w-full min-h-[100px] p-2 border border-orange-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none resize-y"
                            placeholder="Enter assignment instructions..."
                            autoFocus
                        />
                    ) : (
                        <p className="text-sm text-gray-700">{block.content || 'Click to edit assignment...'}</p>
                    )}
                </div>
            );

        case 'code':
            return (
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                    {isEditing ? (
                        <textarea
                            value={block.content}
                            onChange={(e) => onBlockUpdate(block.id, { content: e.target.value })}
                            onBlur={() => setEditingBlockId(null)}
                            className="w-full min-h-[150px] bg-gray-800 text-green-400 p-2 rounded focus:outline-none resize-y font-mono"
                            placeholder="Enter code..."
                            autoFocus
                        />
                    ) : (
                        <pre className="text-green-400 overflow-x-auto">
                            <code>{block.content || '// Click to edit code...'}</code>
                        </pre>
                    )}
                </div>
            );

        case 'list':
            return (
                <div className="space-y-2">
                    {isEditing ? (
                        <textarea
                            value={block.content}
                            onChange={(e) => onBlockUpdate(block.id, { content: e.target.value })}
                            onBlur={() => setEditingBlockId(null)}
                            className="w-full min-h-[100px] p-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none resize-y"
                            placeholder="Enter list items (one per line)..."
                            autoFocus
                        />
                    ) : (
                        <ul className="list-disc list-inside space-y-1">
                            {(block.content || '').split('\n').filter(line => line.trim()).map((item, i) => (
                                <li key={i} className="text-gray-700">{item}</li>
                            ))}
                            {!block.content && <li className="text-gray-400 italic">Click to edit list...</li>}
                        </ul>
                    )}
                </div>
            );

        case 'divider':
            return <hr className="border-t-2 border-gray-200 my-4" />;

        default:
            return (
                <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Block type: {block.type}</p>
                    <p className="text-xs mt-1">Edit functionality coming soon</p>
                </div>
            );
    }
}
