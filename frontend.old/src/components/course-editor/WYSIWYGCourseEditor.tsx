'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Settings, ArrowLeft, Pencil, Cloud, Eye, Share2, Menu,
    Image, MousePointerClick, Gamepad2, BookOpen, FileType2, CodeXml, Minus, Video
} from 'lucide-react';
import LeftSidebar from './LeftSidebar';
import EditorCanvas from './EditorCanvas';
import LayoutPickerModal from './LayoutPickerModal';
import { Module, Page, ContentBlock, CourseData, BlockType, BlockCategory, BlockLayout } from './types';

interface WYSIWYGCourseEditorProps {
    courseId: string;
    initialData?: CourseData;
    onSave?: (data: CourseData) => Promise<void>;
    onPublish?: (data: CourseData) => Promise<void>;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function WYSIWYGCourseEditor({
    courseId,
    initialData,
    onSave,
    onPublish
}: WYSIWYGCourseEditorProps) {
    // State
    const [course, setCourse] = useState<CourseData>(initialData || {
        id: courseId,
        title: 'Untitled Course',
        description: '',
        modules: []
    });

    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [activePageId, setActivePageId] = useState<string | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showBlockPicker, setShowBlockPicker] = useState(false);
    const [insertAfterBlockId, setInsertAfterBlockId] = useState<string | null>(null);
    const [showLayoutPicker, setShowLayoutPicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<BlockCategory | null>(null);

    // Get active page
    const activePage = React.useMemo(() => {
        if (!activePageId) return null;
        for (const module of course.modules) {
            const page = module.pages.find(p => p.id === activePageId);
            if (page) return page;
        }
        return null;
    }, [course.modules, activePageId]);

    // Sync with initialData change
    useEffect(() => {
        if (initialData) {
            setCourse(initialData);
        }
    }, [initialData]);

    // Auto-save effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSave && course.modules.length > 0) {
                handleAutoSave();
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [course]);

    // Initialize with first page
    useEffect(() => {
        if (course.modules.length > 0 && !activePageId) {
            const firstModule = course.modules[0];
            if (firstModule.pages.length > 0) {
                setActiveModuleId(firstModule.id);
                setActivePageId(firstModule.pages[0].id);
            }
        }
    }, [course.modules]);

    // Module & Page Management
    const handleAddModule = useCallback(() => {
        const newModule: Module = {
            id: generateId(),
            title: `Module ${course.modules.length + 1}`,
            order: course.modules.length,
            pages: [],
            courseId: course.id,
            isExpanded: true
        };

        setCourse(prev => ({
            ...prev,
            modules: [...prev.modules, newModule]
        }));
        setActiveModuleId(newModule.id);
    }, [course]);

    const handleAddPage = useCallback((moduleId: string) => {
        setCourse(prev => {
            const modules = prev.modules.map(module => {
                if (module.id === moduleId) {
                    const newPage: Page = {
                        id: generateId(),
                        title: `Page ${module.pages.length + 1}`,
                        order: module.pages.length,
                        content: [],
                        moduleId: module.id
                    };
                    return {
                        ...module,
                        pages: [...module.pages, newPage],
                        isExpanded: true
                    };
                }
                return module;
            });

            // Set new page as active
            const updatedModule = modules.find(m => m.id === moduleId);
            if (updatedModule && updatedModule.pages.length > 0) {
                const newPage = updatedModule.pages[updatedModule.pages.length - 1];
                setActiveModuleId(moduleId);
                setActivePageId(newPage.id);
            }

            return { ...prev, modules };
        });
    }, []);

    const handleModuleToggle = useCallback((moduleId: string) => {
        setCourse(prev => ({
            ...prev,
            modules: prev.modules.map(module =>
                module.id === moduleId ? { ...module, isExpanded: !module.isExpanded } : module
            )
        }));
    }, []);

    const handlePageSelect = useCallback((pageId: string, moduleId: string) => {
        setActivePageId(pageId);
        setActiveModuleId(moduleId);
        setSelectedBlockId(null);
    }, []);

    const handleDeleteModule = useCallback((moduleId: string) => {
        setCourse(prev => {
            const modules = prev.modules.filter(m => m.id !== moduleId);
            // If active module was deleted, select first module
            if (activeModuleId === moduleId && modules.length > 0) {
                setActiveModuleId(modules[0].id);
                if (modules[0].pages.length > 0) {
                    setActivePageId(modules[0].pages[0].id);
                }
            }
            return { ...prev, modules };
        });
    }, [activeModuleId]);

    const handleDeletePage = useCallback((pageId: string) => {
        setCourse(prev => {
            const modules = prev.modules.map(module => ({
                ...module,
                pages: module.pages.filter(p => p.id !== pageId)
            }));

            // If active page was deleted, select next available page
            if (activePageId === pageId) {
                for (const module of modules) {
                    if (module.pages.length > 0) {
                        setActiveModuleId(module.id);
                        setActivePageId(module.pages[0].id);
                        break;
                    }
                }
            }

            return { ...prev, modules };
        });
    }, [activePageId]);

    const handleRenameModule = useCallback((moduleId: string, newTitle: string) => {
        setCourse(prev => ({
            ...prev,
            modules: prev.modules.map(module =>
                module.id === moduleId ? { ...module, title: newTitle } : module
            )
        }));
    }, []);

    const handleRenamePage = useCallback((pageId: string, newTitle: string) => {
        setCourse(prev => ({
            ...prev,
            modules: prev.modules.map(module => ({
                ...module,
                pages: module.pages.map(page =>
                    page.id === pageId ? { ...page, title: newTitle } : page
                )
            }))
        }));
    }, []);

    // Category selection (for layout picker)
    const handleCategorySelect = useCallback((category: BlockCategory) => {
        setSelectedCategory(category);
        setShowLayoutPicker(true);
        setShowBlockPicker(false);
    }, []);

    // Layout selection (from layout picker)
    const handleLayoutSelect = useCallback((layout: BlockLayout) => {
        if (!selectedCategory || !activePageId) return;

        // Map layout to block type
        const blockType = getBlockTypeForLayout(layout, selectedCategory);
        handleBlockSelectWithLayout(blockType, layout);

        setShowLayoutPicker(false);
        setSelectedCategory(null);
    }, [selectedCategory, activePageId]);

    // Block Management
    const handleBlockSelectWithLayout = useCallback((blockType: string, layout?: BlockLayout) => {
        if (!activePageId) {
            alert('Please select a page first');
            return;
        }

        const newBlock: ContentBlock = {
            id: generateId(),
            type: blockType as BlockType,
            category: getCategoryForBlockType(blockType as BlockType),
            layout: layout || null,
            content: '',
            order: activePage?.content.length || 0,
            metadata: getDefaultMetadataForLayout(layout)
        };

        setCourse(prev => ({
            ...prev,
            modules: prev.modules.map(module => ({
                ...module,
                pages: module.pages.map(page => {
                    if (page.id === activePageId) {
                        let newContent: ContentBlock[];

                        if (insertAfterBlockId === null) {
                            // Insert at beginning
                            newContent = [newBlock, ...page.content];
                        } else {
                            // Insert after specific block
                            const index = page.content.findIndex(b => b.id === insertAfterBlockId);
                            newContent = [
                                ...page.content.slice(0, index + 1),
                                newBlock,
                                ...page.content.slice(index + 1)
                            ];
                        }

                        // Update order
                        newContent = newContent.map((block, idx) => ({ ...block, order: idx }));

                        return { ...page, content: newContent };
                    }
                    return page;
                })
            }))
        }));

        setSelectedBlockId(newBlock.id);
        setShowBlockPicker(false);
        setInsertAfterBlockId(null);
    }, [activePageId, activePage, insertAfterBlockId]);

    const handleBlockSelect = useCallback((blockType: string, layout?: BlockLayout) => {
        handleBlockSelectWithLayout(blockType, layout);
    }, [handleBlockSelectWithLayout]);

    const handleBlockUpdate = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
        setCourse(prev => ({
            ...prev,
            modules: prev.modules.map(module => ({
                ...module,
                pages: module.pages.map(page => ({
                    ...page,
                    content: page.content.map(block =>
                        block.id === blockId ? { ...block, ...updates } : block
                    )
                }))
            }))
        }));
    }, []);

    const handleBlockDelete = useCallback((blockId: string) => {
        setCourse(prev => ({
            ...prev,
            modules: prev.modules.map(module => ({
                ...module,
                pages: module.pages.map(page => ({
                    ...page,
                    content: page.content.filter(block => block.id !== blockId)
                }))
            }))
        }));
        setSelectedBlockId(null);
    }, []);

    const handleBlockDuplicate = useCallback((blockId: string) => {
        setCourse(prev => ({
            ...prev,
            modules: prev.modules.map(module => ({
                ...module,
                pages: module.pages.map(page => {
                    const blockIndex = page.content.findIndex(b => b.id === blockId);
                    if (blockIndex === -1) return page;

                    const originalBlock = page.content[blockIndex];
                    const duplicatedBlock: ContentBlock = {
                        ...originalBlock,
                        id: generateId(),
                        order: originalBlock.order + 1
                    };

                    const newContent = [
                        ...page.content.slice(0, blockIndex + 1),
                        duplicatedBlock,
                        ...page.content.slice(blockIndex + 1)
                    ].map((block, idx) => ({ ...block, order: idx }));

                    return { ...page, content: newContent };
                })
            }))
        }));
    }, []);

    const handleDropZoneClick = useCallback((afterBlockId: string | null, category?: string) => {
        setInsertAfterBlockId(afterBlockId);

        if (category) {
            // Context-aware open from sidebar
            let mappedCategory: BlockCategory = 'text'; // Default

            if (['video', 'image', 'text', 'actions', 'pdf'].includes(category)) {
                mappedCategory = category as BlockCategory;
            } else if (category === 'code') {
                mappedCategory = 'embed';
            } else if (category === 'quiz') {
                mappedCategory = 'activities';
            }

            setSelectedCategory(mappedCategory);
            setShowLayoutPicker(true);
            setShowBlockPicker(false);
        } else {
            // Generic open (+)
            setShowBlockPicker(true);
        }
    }, []);

    // Save & Publish
    const handleAutoSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(course);
            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleManualSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave(course);
            setLastSaved(new Date());
            alert('Course saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save course');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!onPublish) return;
        if (!confirm('Publish this course? Students will be able to see all changes.')) return;

        setIsSaving(true);
        try {
            await onPublish(course);
            alert('Course published successfully!');
        } catch (error) {
            console.error('Publish failed:', error);
            alert('Failed to publish course');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-white overflow-hidden text-slate-900 font-sans">
            {/* 1. Top Global Header */}
            <header className="h-14 border-b border-gray-100 shrink-0 bg-white z-30 px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <h1 className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                            {course.title || 'Untitled Course'}
                        </h1>
                        <Pencil size={12} className="text-gray-300 group-hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    {/* Status */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Cloud size={12} />
                        <span>Saved</span>
                    </div>

                    <div className="h-4 w-px bg-gray-200" />



                    {/* Actions */}
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors px-2">
                        Preview
                    </button>
                    <button
                        onClick={handlePublish}
                        className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md shadow-sm transition-all hover:shadow flex items-center gap-1.5"
                    >
                        {course.approval_status === 'draft' ? (
                            <>
                                <Cloud size={16} />
                                Publish Course
                            </>
                        ) : (
                            <>
                                <Share2 size={16} />
                                Share
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* 2. Navigation Tabs */}
            <div className="h-12 border-b border-gray-100 shrink-0 bg-white z-20 flex items-center justify-center">
                <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-lg">
                    <button className="px-4 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/50 rounded-md shadow-sm border border-blue-100/50">
                        Mini course
                    </button>
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-md transition-all">
                        Completion
                    </button>
                    <button className="px-4 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-md transition-all">
                        Landing page
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Fixed */}
                <LeftSidebar
                    modules={course.modules}
                    activePageId={activePageId}
                    activeModuleId={activeModuleId}
                    onPageSelect={handlePageSelect}
                    onModuleToggle={handleModuleToggle}
                    onAddModule={handleAddModule}
                    onAddPage={handleAddPage}
                    onDeleteModule={handleDeleteModule}
                    onDeletePage={handleDeletePage}
                    onRenameModule={handleRenameModule}
                    onRenamePage={handleRenamePage}
                />

                {/* Central Canvas - Scrollable */}
                {activePage ? (
                    <EditorCanvas
                        pageTitle={activePage.title}
                        blocks={activePage.content}
                        selectedBlockId={selectedBlockId}
                        onBlockSelect={setSelectedBlockId}
                        onBlockUpdate={handleBlockUpdate}
                        onBlockDelete={handleBlockDelete}
                        onBlockDuplicate={handleBlockDuplicate}
                        onDropZoneClick={handleDropZoneClick}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="text-gray-300 mb-4">
                                <Settings size={64} className="mx-auto" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-600 mb-2">No Page Selected</h2>
                            <p className="text-gray-500">
                                {course.modules.length === 0
                                    ? 'Create a module to get started'
                                    : 'Select a page from the left sidebar to begin editing'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Layout Picker Modal */}
            {showLayoutPicker && selectedCategory && (
                <LayoutPickerModal
                    category={selectedCategory}
                    onSelect={handleLayoutSelect}
                    onClose={() => {
                        setShowLayoutPicker(false);
                        setSelectedCategory(null);
                    }}
                />
            )}

            {/* Block Picker Drawer */}
            {showBlockPicker && (
                <React.Fragment>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setShowBlockPicker(false)}
                    />

                    {/* Drawer Panel */}
                    <div
                        className="fixed top-28 bottom-6 right-28 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 flex flex-col z-50 animate-in slide-in-from-right-10 duration-200"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxHeight: 'calc(100vh - 140px)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Content</h3>
                                <p className="text-xs text-gray-500">Choose a block type</p>
                            </div>
                            <button
                                onClick={() => setShowBlockPicker(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <ArrowLeft size={20} className="rotate-180" />
                            </button>
                        </div>

                        {/* Options Grid */}
                        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="space-y-6">
                                {/* Content Section */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                                        Content & Media
                                    </h4>
                                    <button
                                        onClick={() => handleCategorySelect('text')}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Pencil size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Text</div>
                                            <div className="text-[11px] text-gray-500">Headings, paragraphs</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleCategorySelect('image')}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <Image size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Image</div>
                                            <div className="text-[11px] text-gray-500">Photos, galleries</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleCategorySelect('video')}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                                            <Video size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Video & Audio</div>
                                            <div className="text-[11px] text-gray-500">Embed player, upload</div>
                                        </div>
                                    </button>
                                </div>

                                {/* Interactive Section */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                                        Interactive
                                    </h4>
                                    <button
                                        onClick={() => handleCategorySelect('actions')}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <MousePointerClick size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Actions</div>
                                            <div className="text-[11px] text-gray-500">Buttons, hotspots</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleBlockSelect('quiz');
                                            setShowBlockPicker(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                                            <Gamepad2 size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Quiz</div>
                                            <div className="text-[11px] text-gray-500">Multiple choice</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleBlockSelect('assignment');
                                            setShowBlockPicker(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <BookOpen size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Assignment</div>
                                            <div className="text-[11px] text-gray-500">Homework, rubric</div>
                                        </div>
                                    </button>
                                </div>

                                {/* Advanced Section */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                                        Advanced
                                    </h4>
                                    <button
                                        onClick={() => {
                                            handleBlockSelect('pdf');
                                            setShowBlockPicker(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-rose-500 hover:bg-rose-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                            <FileType2 size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">PDF</div>
                                            <div className="text-[11px] text-gray-500">Embed document</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleBlockSelect('embed');
                                            setShowBlockPicker(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-slate-500 hover:bg-slate-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-600 group-hover:text-white transition-colors">
                                            <CodeXml size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Embed Code</div>
                                            <div className="text-[11px] text-gray-500">Iframe, HTML</div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleBlockSelect('divider');
                                            setShowBlockPicker(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 hover:border-gray-500 hover:bg-gray-50/50 hover:shadow-sm transition-all group text-left"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-gray-600 group-hover:text-white transition-colors">
                                            <Minus size={18} />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">Divider</div>
                                            <div className="text-[11px] text-gray-500">Separator line</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background-color: #e5e7eb;
                            border-radius: 20px;
                        }
                    `}</style>
                </React.Fragment>
            )}

        </div>
    );
}

// Helper functions
function getCategoryForBlockType(type: BlockType): BlockCategory {
    const categoryMap: Record<BlockType, BlockCategory> = {
        'video': 'video',
        'audio': 'video',
        'image': 'image',
        'image-gallery': 'image',
        'heading': 'text',
        'text': 'text',
        'list': 'text',
        'table': 'text',
        'hotspot': 'actions',
        'flip-card': 'actions',
        'button': 'actions',
        'numbered-cards': 'actions',
        'community': 'actions',
        'quiz': 'activities',
        'assignment': 'activities',
        'discussion': 'activities',
        'survey': 'activities',
        'pdf': 'pdf',
        'embed': 'embed',
        'code': 'embed',
        'divider': 'embed'
    };
    return categoryMap[type] || 'text';
}

function getBlockTypeForLayout(layout: BlockLayout, category: BlockCategory): BlockType {
    if (!layout) return 'text'; // Default fallback

    // Map layout to appropriate block type
    switch (category) {
        case 'video':
            if (layout === 'audio-player') return 'audio';
            return 'video';
        case 'image':
            if (layout === 'image-gallery') return 'image-gallery';
            return 'image';
        case 'text':
            if (layout === 'heading-text' || layout === 'heading-two-columns') return 'heading';
            return 'text';
        case 'actions':
            if (layout === 'image-hotspot') return 'hotspot';
            if (layout === 'flip-card') return 'flip-card';
            if (layout === 'numbered-cards') return 'numbered-cards';
            return 'button'; // Default for button layouts
        default:
            return 'text';
    }
}

function getDefaultMetadataForLayout(layout?: BlockLayout | null): any {
    if (!layout) return {};

    // Provide sensible defaults based on layout
    switch (layout) {
        case 'two-videos':
            return { videoUrl: '', videoUrl2: '' };
        case 'two-images':
            return { imageUrl: '', imageUrl2: '', caption: '' };
        case 'three-images':
            return { imageUrl: '', imageUrl2: '', imageUrl3: '', caption: '' };
        case 'image-gallery':
            return { images: [] };
        case 'audio-player':
            return { audioUrl: '', duration: '0:00', controls: true };
        case 'image-hotspot':
            return { imageUrl: '', hotspots: [] };
        case 'flip-card':
            return { flipCards: [{ id: generateId(), front: 'Front', back: 'Back' }] };
        case 'numbered-cards':
            return {
                numberedCards: [
                    { id: generateId(), number: 1, heading: 'Step 1', content: '' },
                    { id: generateId(), number: 2, heading: 'Step 2', content: '' },
                    { id: generateId(), number: 3, heading: 'Step 3', content: '' }
                ]
            };
        default:
            return {};
    }
}
