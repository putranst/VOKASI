'use client';

import React from 'react';
import { X } from 'lucide-react';
import { BlockCategory, BlockLayout, LayoutTemplate } from './types';
import { LAYOUT_TEMPLATES } from './layout-config';

interface LayoutPickerModalProps {
    category: BlockCategory;
    onSelect: (layout: BlockLayout) => void;
    onClose: () => void;
}

export default function LayoutPickerModal({
    category,
    onSelect,
    onClose
}: LayoutPickerModalProps) {
    const layouts = LAYOUT_TEMPLATES[category] || [];

    const getCategoryTitle = () => {
        switch (category) {
            case 'video': return 'Add Video Block';
            case 'image': return 'Add Image Block';
            case 'text': return 'Add Text Block';
            case 'actions': return 'Add Actions Block';
            case 'activities': return 'Add Activities Block';
            case 'pdf': return 'Add PDF Block';
            case 'embed': return 'Add Embed Block';
            default: return 'Choose Layout';
        }
    };

    const handleLayoutSelect = (layout: BlockLayout) => {
        onSelect(layout);
        onClose();
    };

    return (
        <React.Fragment>
            {/* Backdrop (transparent but blocking clicks) */}
            <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className="fixed top-28 bottom-6 right-28 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 flex flex-col z-50 animate-in slide-in-from-right-10 duration-200"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: 'calc(100vh - 140px)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900">{getCategoryTitle()}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Layouts Grid */}
                <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                    {layouts.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-sm text-gray-500 mb-4">No layouts available</p>
                            <button
                                onClick={() => onSelect(null)}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Add Default
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {layouts.map((template) => (
                                <button
                                    key={template.layout as string}
                                    onClick={() => handleLayoutSelect(template.layout)}
                                    className="group relative border border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md transition-all text-left bg-white"
                                >
                                    {/* Layout Preview */}
                                    <div className="aspect-[2/1] bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100">
                                        {template.thumbnail.startsWith('<svg') ? (
                                            <div
                                                className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
                                                dangerouslySetInnerHTML={{ __html: template.thumbnail }}
                                            />
                                        ) : (
                                            <img
                                                src={template.thumbnail}
                                                alt={template.label}
                                                className="w-full h-full object-contain mix-blend-multiply"
                                            />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                                                {template.label}
                                            </h3>
                                            {template.isPro && (
                                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">
                                                    PRO
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
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
    );
}
