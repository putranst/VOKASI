'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
    Plus, GripVertical, Trash2, ChevronDown, ChevronUp,
    Type, Video, Code, FileQuestion, MessageSquare, BookOpen,
    Lightbulb, Users, Sparkles, Save, Eye, Edit3, Wand2,
    CheckCircle, Clock, Target, LayoutGrid, Palette
} from 'lucide-react';
import { VisualCanvas, createInitialCanvasState, VisualElement } from './visual-editor/VisualCanvas';
import { AssetLibrary } from './visual-editor/AssetLibrary';

// Content Block Types
type BlockType =
    | 'text'
    | 'heading'
    | 'video'
    | 'code'
    | 'quiz'
    | 'discussion'
    | 'assignment'
    | 'ai_interaction'
    | 'resource'
    | 'divider'
    | 'design';

interface ContentBlock {
    id: string;
    type: BlockType;
    content: string;
    metadata?: {
        title?: string;
        duration?: number;
        questions?: QuizQuestion[];
        codeLanguage?: string;
        videoUrl?: string;
        resources?: string[];
        canvasState?: VisualElement[];
    };
}

interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number;
}

interface CourseEditorProps {
    initialBlocks?: ContentBlock[];
    onSave?: (blocks: ContentBlock[]) => void;
    courseTitle?: string;
    moduleTitle?: string;
}

// Block Type Configuration
const BLOCK_TYPES: Record<BlockType, { icon: React.ElementType; label: string; color: string; description: string }> = {
    text: { icon: Type, label: 'Text', color: 'bg-gray-100 text-gray-600', description: 'Rich text content' },
    heading: { icon: BookOpen, label: 'Heading', color: 'bg-blue-100 text-blue-600', description: 'Section heading' },
    video: { icon: Video, label: 'Video', color: 'bg-red-100 text-red-600', description: 'Embedded video' },
    code: { icon: Code, label: 'Code', color: 'bg-green-100 text-green-600', description: 'Code playground' },
    quiz: { icon: FileQuestion, label: 'Quiz', color: 'bg-purple-100 text-purple-600', description: 'Assessment quiz' },
    discussion: { icon: MessageSquare, label: 'Discussion', color: 'bg-yellow-100 text-yellow-600', description: 'Discussion prompt' },
    assignment: { icon: Target, label: 'Assignment', color: 'bg-orange-100 text-orange-600', description: 'Student assignment' },
    ai_interaction: { icon: Sparkles, label: 'AI Interaction', color: 'bg-indigo-100 text-indigo-600', description: 'Socratic AI checkpoint' },
    resource: { icon: Lightbulb, label: 'Resources', color: 'bg-teal-100 text-teal-600', description: 'Learning resources' },
    divider: { icon: LayoutGrid, label: 'Divider', color: 'bg-gray-50 text-gray-400', description: 'Section divider' },
    design: { icon: Palette, label: 'Visual Design', color: 'bg-pink-100 text-pink-600', description: 'Slides & Graphics' }
};

// --- Rich Block Components ---

const HeadingBlock = ({ block, onUpdate, onDelete }: { block: ContentBlock, onUpdate: any, onDelete: any }) => (
    <div className="relative group mb-4">
        <input
            type="text"
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            className="w-full text-3xl font-bold text-gray-900 border-none focus:ring-0 bg-transparent p-0 placeholder:text-gray-300"
            placeholder="Heading Title"
        />
        <div className="absolute -right-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onDelete(block.id)} className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm hover:shadow-md border border-gray-100 transition-all">
                <Trash2 size={16} />
            </button>
        </div>
    </div>
);

const ResourceBlock = ({ block, onUpdate }: { block: ContentBlock, onUpdate: any }) => (
    <div className="p-5 bg-teal-50 border border-teal-100 rounded-xl relative group transition-all hover:bg-teal-50/80 hover:border-teal-200">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl text-teal-600 shadow-sm">
                <Lightbulb size={24} />
            </div>
            <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                    <input
                        type="text"
                        value={block.metadata?.title || ''}
                        onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, title: e.target.value } })}
                        className="w-full text-lg font-bold text-teal-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-teal-400"
                        placeholder="Resource Title (e.g. Required Reading)"
                    />
                </div>
                <textarea
                    value={block.content}
                    onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                    className="w-full text-sm text-teal-800 bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-teal-500/70"
                    placeholder="Add description, instructions, or citation..."
                    rows={2}
                />
                {/* Link Input (Optional Metadata) */}
                <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-lg w-fit">
                    <span className="text-xs font-semibold text-teal-600 uppercase">Link:</span>
                    <input
                        type="text"
                        value={block.metadata?.link || ''}
                        onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, link: e.target.value } })}
                        className="bg-transparent border-none text-xs text-teal-700 w-64 focus:ring-0 p-0 placeholder:text-teal-400"
                        placeholder="https://..."
                    />
                </div>
            </div>
        </div>
    </div>
);

const AssignmentBlock = ({ block, onUpdate }: { block: ContentBlock, onUpdate: any }) => (
    <div className="p-6 bg-orange-50 border border-orange-100 rounded-xl relative group transition-all hover:shadow-md">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl text-orange-600 shadow-sm">
                <Target size={24} />
            </div>
            <div className="flex-1 space-y-3">
                <div className="flex justify-between items-center">
                    <input
                        type="text"
                        value={block.metadata?.title || ''}
                        onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, title: e.target.value } })}
                        className="text-lg font-bold text-orange-900 bg-transparent border-none focus:ring-0 p-0 placeholder:text-orange-400 w-full mr-4"
                        placeholder="Assignment Title"
                    />
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-orange-100">
                        <span className="text-xs text-orange-400 font-bold uppercase">Points</span>
                        <input
                            type="number"
                            value={block.metadata?.points || 100}
                            onChange={(e) => onUpdate(block.id, { metadata: { ...block.metadata, points: parseInt(e.target.value) } })}
                            className="w-12 text-sm font-bold text-orange-600 bg-transparent border-none focus:ring-0 p-0 text-right"
                        />
                    </div>
                </div>
                <div className="bg-white/60 p-4 rounded-lg border border-orange-100/50">
                    <textarea
                        value={block.content}
                        onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                        className="w-full text-base text-gray-700 bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-gray-400"
                        placeholder="Describe the assignment task, deliverables, and criteria..."
                        rows={4}
                    />
                </div>
            </div>
        </div>
    </div>
);

const DiscussionBlock = ({ block, onUpdate }: { block: ContentBlock, onUpdate: any }) => (
    <div className="p-5 bg-yellow-50 border border-yellow-100 rounded-xl relative group">
        <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl text-yellow-600 shadow-sm">
                <MessageSquare size={24} />
            </div>
            <div className="flex-1">
                <h4 className="text-xs font-bold text-yellow-600 uppercase mb-2">Discussion Prompt</h4>
                <textarea
                    value={block.content}
                    onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                    className="w-full text-lg font-medium text-yellow-900 bg-transparent border-none focus:ring-0 p-0 resize-none placeholder:text-yellow-400/70"
                    placeholder="Ask a question to spark debate..."
                    rows={2}
                />
            </div>
        </div>
    </div>
);

export function CourseEditor({ initialBlocks = [], onSave, courseTitle, moduleTitle }: CourseEditorProps) {
    const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks.length > 0 ? initialBlocks : [
        { id: '1', type: 'heading', content: 'Module Introduction', metadata: {} },
        { id: '2', type: 'text', content: 'Start writing your course content here. Click on any block to edit, or use the + button to add new blocks.', metadata: {} }
    ]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null);
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
    const [isAISuggesting, setIsAISuggesting] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string>('');

    const editorRef = useRef<HTMLDivElement>(null);

    // Generate unique ID
    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Add new block
    const addBlock = useCallback((type: BlockType, afterId?: string) => {
        const newBlock: ContentBlock = {
            id: generateId(),
            type,
            content: getDefaultContent(type),
            metadata: getDefaultMetadata(type)
        };

        setBlocks(prev => {
            if (afterId) {
                const index = prev.findIndex(b => b.id === afterId);
                return [...prev.slice(0, index + 1), newBlock, ...prev.slice(index + 1)];
            }
            return [...prev, newBlock];
        });
        setSelectedBlockId(newBlock.id);
        setShowBlockMenu(null);
    }, []);

    // Default content for each block type
    const getDefaultContent = (type: BlockType): string => {
        switch (type) {
            case 'heading': return 'New Section';
            case 'text': return 'Start typing your content...';
            case 'video': return '';
            case 'code': return '// Your code here\nconsole.log("Hello, World!");';
            case 'quiz': return 'What is the main concept?';
            case 'discussion': return 'Share your thoughts on...';
            case 'assignment': return 'Create a project that demonstrates...';
            case 'ai_interaction': return 'Ask the AI tutor about this concept';
            case 'resource': return 'Recommended reading and resources';
            case 'divider': return '';
            case 'design': return 'Visual Design Block';
            default: return '';
        }
    };

    // Default metadata for each block type
    const getDefaultMetadata = (type: BlockType) => {
        switch (type) {
            case 'quiz':
                return {
                    questions: [{
                        question: 'Sample question?',
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctAnswer: 0
                    }]
                };
            case 'video':
                return { videoUrl: '', duration: 10 };
            case 'code':
                return { codeLanguage: 'javascript' };
            case 'ai_interaction':
                return { title: 'Socratic Checkpoint' };
            case 'design':
                return { canvasState: createInitialCanvasState() };
            default:
                return {};
        }
    };

    // Update block content
    const updateBlock = useCallback((id: string, updates: Partial<ContentBlock>) => {
        setBlocks(prev => prev.map(block =>
            block.id === id ? { ...block, ...updates } : block
        ));
    }, []);

    // Delete block
    const deleteBlock = useCallback((id: string) => {
        setBlocks(prev => prev.filter(block => block.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    }, [selectedBlockId]);

    // Move block
    const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
        setBlocks(prev => {
            const index = prev.findIndex(b => b.id === id);
            if ((direction === 'up' && index === 0) ||
                (direction === 'down' && index === prev.length - 1)) {
                return prev;
            }
            const newBlocks = [...prev];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
            return newBlocks;
        });
    }, []);

    // AI Content Suggestion
    const getAISuggestion = useCallback(async (blockId: string, context: string) => {
        setIsAISuggesting(true);
        try {
            const response = await fetch('/api/v1/ai/suggest-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context,
                    course_title: courseTitle,
                    module_title: moduleTitle
                })
            });

            if (response.ok) {
                const data = await response.json();
                setAiSuggestion(data.suggestion || '');
            } else {
                // Fallback suggestion
                setAiSuggestion('AI suggests expanding this section with more examples and practical applications relevant to your learners.');
            }
        } catch (error) {
            setAiSuggestion('Consider adding more interactive elements to engage learners.');
        } finally {
            setIsAISuggesting(false);
        }
    }, [courseTitle, moduleTitle]);

    // Render individual block
    const renderBlock = (block: ContentBlock) => {
        const config = BLOCK_TYPES[block.type];
        const Icon = config.icon;
        const isSelected = selectedBlockId === block.id;

        if (isPreviewMode) {
            return renderBlockPreview(block);
        }

        return (
            <div
                key={block.id}
                className={`group relative flex gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${isSelected ? 'border-purple-500 bg-purple-50/50 shadow-lg' : 'border-transparent hover:border-gray-200 hover:bg-gray-50/50'}`}
                onClick={() => setSelectedBlockId(block.id)}
                draggable
                onDragStart={() => setDraggedBlockId(block.id)}
                onDragEnd={() => setDraggedBlockId(null)}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedBlockId && draggedBlockId !== block.id) {
                        // Handle drag over logic
                    }
                }}
            >
                {/* Drag Handle */}
                <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical size={16} className="text-gray-400 cursor-grab" />
                </div>

                {/* Block Type Icon */}
                <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={20} />
                </div>

                {/* Block Content */}
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-400 uppercase mb-1">
                        {config.label}
                    </div>
                    {renderBlockContent(block, isSelected)}
                </div>

                {/* Block Actions */}
                {isSelected && (
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
                            title="Move up"
                        >
                            <ChevronUp size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
                            title="Move down"
                        >
                            <ChevronDown size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); getAISuggestion(block.id, block.content); }}
                            className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-500"
                            title="Get AI suggestion"
                        >
                            <Wand2 size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-500"
                            title="Delete block"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}

                {/* Add Block Button (appears between blocks) */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowBlockMenu(block.id); }}
                        className="w-8 h-8 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 flex items-center justify-center"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                {/* Block Menu */}
                {showBlockMenu === block.id && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 min-w-[320px]">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Add Content Block</p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(BLOCK_TYPES).map(([type, config]) => {
                                const BlockIcon = config.icon;
                                return (
                                    <button
                                        key={type}
                                        onClick={(e) => { e.stopPropagation(); addBlock(type as BlockType, block.id); }}
                                        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors text-left`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
                                            <BlockIcon size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{config.label}</p>
                                            <p className="text-xs text-gray-500">{config.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render editable block content
    const renderBlockContent = (block: ContentBlock, isSelected: boolean) => {
        switch (block.type) {
            case 'heading':
                return <HeadingBlock block={block} onUpdate={updateBlock} onDelete={deleteBlock} />;

            case 'text':
                return (
                    <textarea
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        className="w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 resize-none min-h-[80px]"
                        placeholder="Start typing..."
                        rows={4}
                    />
                );

            case 'video':
                return (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={block.metadata?.videoUrl || ''}
                            onChange={(e) => updateBlock(block.id, {
                                metadata: { ...block.metadata, videoUrl: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="YouTube or Vimeo URL..."
                        />
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <input
                                type="number"
                                value={block.metadata?.duration || 10}
                                onChange={(e) => updateBlock(block.id, {
                                    metadata: { ...block.metadata, duration: parseInt(e.target.value) }
                                })}
                                className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                            />
                            <span className="text-sm text-gray-500">minutes</span>
                        </div>
                    </div>
                );

            case 'code':
                return (
                    <div className="space-y-2">
                        <select
                            value={block.metadata?.codeLanguage || 'javascript'}
                            onChange={(e) => updateBlock(block.id, {
                                metadata: { ...block.metadata, codeLanguage: e.target.value }
                            })}
                            className="px-2 py-1 border border-gray-200 rounded text-sm"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="typescript">TypeScript</option>
                            <option value="java">Java</option>
                            <option value="sql">SQL</option>
                            <option value="html">HTML/CSS</option>
                        </select>
                        <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            className="w-full font-mono text-sm bg-gray-900 text-green-400 rounded-lg p-4 min-h-[120px] resize-none"
                            placeholder="// Write your code here..."
                        />
                    </div>
                );

            case 'quiz':
                return (
                    <div className="space-y-3">
                        {(block.metadata?.questions || []).map((q, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                                <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) => {
                                        const questions = [...(block.metadata?.questions || [])];
                                        questions[idx] = { ...q, question: e.target.value };
                                        updateBlock(block.id, { metadata: { ...block.metadata, questions } });
                                    }}
                                    className="w-full font-medium text-gray-800 bg-transparent border-none focus:outline-none mb-2"
                                    placeholder="Question..."
                                />
                                <div className="space-y-1">
                                    {q.options.map((opt, optIdx) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={q.correctAnswer === optIdx}
                                                onChange={() => {
                                                    const questions = [...(block.metadata?.questions || [])];
                                                    questions[idx] = { ...q, correctAnswer: optIdx };
                                                    updateBlock(block.id, { metadata: { ...block.metadata, questions } });
                                                }}
                                                className="text-purple-600"
                                            />
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const questions = [...(block.metadata?.questions || [])];
                                                    const options = [...q.options];
                                                    options[optIdx] = e.target.value;
                                                    questions[idx] = { ...q, options };
                                                    updateBlock(block.id, { metadata: { ...block.metadata, questions } });
                                                }}
                                                className="flex-1 text-sm bg-transparent border-b border-dashed border-gray-300 focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                const questions = [...(block.metadata?.questions || [])];
                                questions.push({
                                    question: 'New question?',
                                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                    correctAnswer: 0
                                });
                                updateBlock(block.id, { metadata: { ...block.metadata, questions } });
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700"
                        >
                            + Add Question
                        </button>
                    </div>
                );

            case 'discussion':
                return <DiscussionBlock block={block} onUpdate={updateBlock} />;

            case 'assignment':
                return <AssignmentBlock block={block} onUpdate={updateBlock} />;

            case 'ai_interaction':
                return (
                    <div className="space-y-2 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-600" />
                            <span className="text-sm font-semibold text-purple-700">Socratic AI Checkpoint</span>
                        </div>
                        <textarea
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            className="w-full text-gray-700 bg-white/70 rounded-lg p-2 border-none focus:outline-none resize-none"
                            placeholder="What should the AI tutor help students understand at this point?"
                            rows={2}
                        />
                    </div>
                );

            case 'resource':
                return <ResourceBlock block={block} onUpdate={updateBlock} />;

            case 'divider':
                return <hr className="border-t-2 border-gray-200 my-2" />;

            case 'design':
                return (
                    <div className="h-[500px] border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-gray-50 relative pointer-events-auto">
                        <VisualCanvas
                            elements={block.metadata?.canvasState || []}
                            onChange={(newElements) => updateBlock(block.id, {
                                metadata: { ...block.metadata, canvasState: newElements }
                            })}
                        />
                    </div>
                );

            default:
                return <p className="text-gray-500">Unknown block type</p>;
        }
    };

    // Render block preview (student view)
    const renderBlockPreview = (block: ContentBlock) => {
        const config = BLOCK_TYPES[block.type];

        switch (block.type) {
            case 'heading':
                return (
                    <div key={block.id} className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{block.content}</h2>
                    </div>
                );

            case 'text':
                return (
                    <div key={block.id} className="mb-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {block.content}
                    </div>
                );

            case 'video':
                return (
                    <div key={block.id} className="mb-6 aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
                        {block.metadata?.videoUrl ? (
                            <iframe
                                src={block.metadata.videoUrl.replace('watch?v=', 'embed/')}
                                className="w-full h-full rounded-xl"
                                allowFullScreen
                            />
                        ) : (
                            <div className="text-gray-400 flex items-center gap-2">
                                <Video size={24} />
                                <span>Video will appear here</span>
                            </div>
                        )}
                    </div>
                );

            case 'code':
                return (
                    <div key={block.id} className="mb-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-t-xl">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-xs text-gray-400 ml-2">{block.metadata?.codeLanguage}</span>
                        </div>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-b-xl overflow-x-auto font-mono text-sm">
                            <code>{block.content}</code>
                        </pre>
                    </div>
                );

            case 'quiz':
                return (
                    <div key={block.id} className="mb-6 p-6 bg-purple-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 text-purple-700 font-semibold mb-4">
                            <FileQuestion size={20} />
                            <span>Quick Check</span>
                        </div>
                        {(block.metadata?.questions || []).map((q, idx) => (
                            <div key={idx} className="mb-4">
                                <p className="font-medium text-gray-800 mb-2">{q.question}</p>
                                <div className="space-y-2">
                                    {q.options.map((opt, optIdx) => (
                                        <label key={optIdx} className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-purple-50">
                                            <input type="radio" name={`q-${block.id}-${idx}`} className="text-purple-600" />
                                            <span>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'ai_interaction':
                return (
                    <div key={block.id} className="mb-6 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={20} />
                            <span className="font-semibold">AI Learning Checkpoint</span>
                        </div>
                        <p className="text-purple-100 mb-4">{block.content}</p>
                        <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                            Ask the AI Tutor
                        </button>
                    </div>
                );

            case 'divider':
                return <hr key={block.id} className="border-t-2 border-gray-200 my-8" />;

            case 'design':
                return (
                    <div key={block.id} className="mb-8">
                        <div className="h-[400px] border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-gray-50 pointer-events-none">
                            <VisualCanvas
                                elements={block.metadata?.canvasState || []}
                                onChange={() => { }}
                                readOnly={true}
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div key={block.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            {React.createElement(config.icon, { size: 18 })}
                            <span className="font-medium">{config.label}</span>
                        </div>
                        <p className="text-gray-700">{block.content}</p>
                    </div>
                );
        }
    };

    // Handle save
    const handleSave = () => {
        if (onSave) {
            onSave(blocks);
        }
        console.log('Saving blocks:', blocks);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Editor Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{courseTitle || 'Course Editor'}</h1>
                        <p className="text-sm text-gray-500">{moduleTitle || 'Edit module content'}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* AI Suggestion Panel */}
                        {aiSuggestion && (
                            <div className="max-w-xs p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                                <div className="flex items-center gap-1 text-purple-700 font-semibold mb-1">
                                    <Wand2 size={14} />
                                    AI Suggestion
                                </div>
                                <p className="text-purple-600 text-xs">{aiSuggestion}</p>
                                <button
                                    onClick={() => setAiSuggestion('')}
                                    className="text-xs text-purple-500 hover:underline mt-1"
                                >
                                    Dismiss
                                </button>
                            </div>
                        )}

                        {/* Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setIsPreviewMode(false)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!isPreviewMode ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                                    }`}
                            >
                                <Edit3 size={16} className="inline mr-1" />
                                Edit
                            </button>
                            <button
                                onClick={() => setIsPreviewMode(true)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isPreviewMode ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                                    }`}
                            >
                                <Eye size={16} className="inline mr-1" />
                                Preview
                            </button>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area with potential Sidebar */}
            <div className="flex max-w-7xl mx-auto">
                {/* Asset Library Sidebar - Shows only when Design Block is selected */}
                {!isPreviewMode && selectedBlockId && blocks.find(b => b.id === selectedBlockId)?.type === 'design' && (
                    <div className="w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-100px)] animate-in slide-in-from-left-4 duration-300 z-10">
                        <div className="h-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <AssetLibrary
                                onDragStart={(e, type, payload) => {
                                    // The drop is handled by the VisualCanvas
                                    e.dataTransfer.setData('type', type);
                                    if (payload) e.dataTransfer.setData('payload', payload);
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Editor Content */}
                <div
                    ref={editorRef}
                    className="flex-1 px-6 py-8 min-w-0"
                    onClick={() => { setShowBlockMenu(null); }}
                >
                    {isPreviewMode ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            {blocks.map(block => renderBlockPreview(block))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Add Block at Start */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => addBlock('text')}
                                    className="px-4 py-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add content block
                                </button>
                            </div>

                            {/* Blocks */}
                            {blocks.map(block => renderBlock(block))}

                            {/* Empty State */}
                            {blocks.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                        <LayoutGrid size={32} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Start building your course</h3>
                                    <p className="text-gray-500 mb-6">Add content blocks to create engaging learning experiences</p>
                                    <button
                                        onClick={() => addBlock('heading')}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                    >
                                        <Plus size={18} className="inline mr-2" />
                                        Add First Block
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Loading Overlay for AI */}
            {isAISuggesting && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center gap-4">
                        <div className="animate-spin">
                            <Sparkles size={24} className="text-purple-600" />
                        </div>
                        <span className="text-gray-700">AI is thinking...</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseEditor;
