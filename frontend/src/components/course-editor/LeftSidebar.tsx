'use client';

import React from 'react';
import {
    ChevronRight, ChevronDown, Plus, MoreVertical, FileText,
    Trash2, Edit2, GripVertical, FolderOpen, Folder, Menu
} from 'lucide-react';
import { Module, Page } from './types';

interface LeftSidebarProps {
    modules: Module[];
    activePageId: string | null;
    activeModuleId: string | null;
    onPageSelect: (pageId: string, moduleId: string) => void;
    onModuleToggle: (moduleId: string) => void;
    onAddModule: () => void;
    onAddPage: (moduleId: string) => void;
    onDeleteModule: (moduleId: string) => void;
    onDeletePage: (pageId: string) => void;
    onRenameModule: (moduleId: string, newTitle: string) => void;
    onRenamePage: (pageId: string, newTitle: string) => void;
}

export default function LeftSidebar({
    modules,
    activePageId,
    activeModuleId,
    onPageSelect,
    onModuleToggle,
    onAddModule,
    onAddPage,
    onDeleteModule,
    onDeletePage,
    onRenameModule,
    onRenamePage
}: LeftSidebarProps) {
    const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null);
    const [editingPageId, setEditingPageId] = React.useState<string | null>(null);
    const [editValue, setEditValue] = React.useState('');

    const startEditModule = (module: Module) => {
        setEditingModuleId(module.id);
        setEditValue(module.title);
    };

    const startEditPage = (page: Page) => {
        setEditingPageId(page.id);
        setEditValue(page.title);
    };

    const saveModuleEdit = (moduleId: string) => {
        if (editValue.trim()) {
            onRenameModule(moduleId, editValue.trim());
        }
        setEditingModuleId(null);
        setEditValue('');
    };

    const savePageEdit = (pageId: string) => {
        if (editValue.trim()) {
            onRenamePage(pageId, editValue.trim());
        }
        setEditingPageId(null);
        setEditValue('');
    };

    return (
        <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 shrink-0 pb-2">
                <div className="flex items-center gap-2 text-gray-700">
                    <div className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                        <Menu size={16} />
                    </div>
                    <h3 className="text-sm font-semibold">Table of content</h3>
                </div>
            </div>

            {/* Scrollable Module/Page List */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-2 space-y-1">
                    {modules.length === 0 ? (
                        <div className="p-8 text-center">
                            <FolderOpen size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500 mb-3">No modules yet</p>
                            <button
                                onClick={onAddModule}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create First Module
                            </button>
                        </div>
                    ) : (
                        modules.map((module, moduleIndex) => (
                            <div key={module.id} className="space-y-0.5">
                                {/* Module Header */}
                                <div
                                    className={`group rounded-lg transition-colors ${activeModuleId === module.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-1 p-1.5">
                                        {/* Expand/Collapse Button */}
                                        <button
                                            onClick={() => onModuleToggle(module.id)}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors shrink-0"
                                        >
                                            {module.isExpanded ? (
                                                <ChevronDown size={14} className="text-gray-600" />
                                            ) : (
                                                <ChevronRight size={14} className="text-gray-600" />
                                            )}
                                        </button>

                                        {/* Module Icon */}
                                        <div className="shrink-0">
                                            {module.isExpanded ? (
                                                <FolderOpen size={16} className="text-blue-600" />
                                            ) : (
                                                <Folder size={16} className="text-gray-500" />
                                            )}
                                        </div>

                                        {/* Module Title */}
                                        {editingModuleId === module.id ? (
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onBlur={() => saveModuleEdit(module.id)}
                                                onKeyPress={(e) => e.key === 'Enter' && saveModuleEdit(module.id)}
                                                className="flex-1 px-2 py-1 text-xs font-semibold border border-blue-500 rounded focus:outline-none"
                                                autoFocus
                                            />
                                        ) : (
                                            <button
                                                onClick={() => module.pages.length > 0 && onPageSelect(module.pages[0].id, module.id)}
                                                className="flex-1 text-left px-2 py-1 text-xs font-semibold text-gray-900 truncate"
                                            >
                                                {module.title}
                                            </button>
                                        )}

                                        {/* Module Actions */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                                            <button
                                                onClick={() => onAddPage(module.id)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                title="Add Page"
                                            >
                                                <Plus size={12} className="text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => startEditModule(module)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                title="Rename Module"
                                            >
                                                <Edit2 size={12} className="text-gray-600" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete module "${module.title}"?`)) {
                                                        onDeleteModule(module.id);
                                                    }
                                                }}
                                                className="p-1 hover:bg-red-100 rounded transition-colors"
                                                title="Delete Module"
                                            >
                                                <Trash2 size={12} className="text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Pages List */}
                                {module.isExpanded && (
                                    <div className="ml-6 space-y-0.5 border-l-2 border-gray-200 pl-2">
                                        {module.pages.length === 0 ? (
                                            <div className="px-2 py-2 text-xs text-gray-400 italic">
                                                No pages yet
                                            </div>
                                        ) : (
                                            module.pages.map((page) => (
                                                <div
                                                    key={page.id}
                                                    className={`group rounded-lg transition-colors ${activePageId === page.id
                                                        ? 'bg-blue-100 border-l-2 border-blue-600 pl-2'
                                                        : 'hover:bg-gray-50 pl-2'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-1.5 p-1.5">
                                                        {/* Page Icon */}
                                                        <FileText
                                                            size={14}
                                                            className={activePageId === page.id ? 'text-blue-600' : 'text-gray-400'}
                                                        />

                                                        {/* Page Title */}
                                                        {editingPageId === page.id ? (
                                                            <input
                                                                type="text"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onBlur={() => savePageEdit(page.id)}
                                                                onKeyPress={(e) => e.key === 'Enter' && savePageEdit(page.id)}
                                                                className="flex-1 px-1.5 py-0.5 text-xs border border-blue-500 rounded focus:outline-none"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => onPageSelect(page.id, module.id)}
                                                                className={`flex-1 text-left px-1.5 py-0.5 text-xs truncate ${activePageId === page.id
                                                                    ? 'font-semibold text-blue-900'
                                                                    : 'text-gray-700 font-medium'
                                                                    }`}
                                                            >
                                                                {page.title}
                                                            </button>
                                                        )}

                                                        {/* Page Actions */}
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                                                            <button
                                                                onClick={() => startEditPage(page)}
                                                                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                                                                title="Rename Page"
                                                            >
                                                                <Edit2 size={10} className="text-gray-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Delete page "${page.title}"?`)) {
                                                                        onDeletePage(page.id);
                                                                    }
                                                                }}
                                                                className="p-0.5 hover:bg-red-100 rounded transition-colors"
                                                                title="Delete Page"
                                                            >
                                                                <Trash2 size={10} className="text-red-600" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
