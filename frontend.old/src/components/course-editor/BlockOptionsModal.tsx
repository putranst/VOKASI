'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Palette } from 'lucide-react';
import { ContentBlock } from './types';

interface BlockOptionsModalProps {
    block: ContentBlock;
    onClose: () => void;
    onUpdate: (blockId: string, updates: Partial<ContentBlock>) => void;
}

const COLORS = [
    { value: '#ffffff', label: 'White' },
    { value: '#f9fafb', label: 'Gray 50' },
    { value: '#f3f4f6', label: 'Gray 100' },
    { value: '#eff6ff', label: 'Blue 50' },
    { value: '#eef2ff', label: 'Indigo 50' },
    { value: '#fdf2f8', label: 'Pink 50' },
    { value: '#fff7ed', label: 'Orange 50' },
    { value: '#f0fdf4', label: 'Green 50' },
];

export function BlockOptionsModal({ block, onClose, onUpdate }: BlockOptionsModalProps) {
    const [activeTab, setActiveTab] = useState<'color' | 'image'>('color');
    const [imageUrl, setImageUrl] = useState(block.metadata?.backgroundImage || '');

    const handleColorSelect = (color: string) => {
        onUpdate(block.id, {
            metadata: {
                ...block.metadata,
                backgroundColor: color,
                backgroundImage: undefined // Clear image if color is selected
            }
        });
    };

    const handleImageSubmit = () => {
        if (imageUrl) {
            onUpdate(block.id, {
                metadata: {
                    ...block.metadata,
                    backgroundImage: imageUrl,
                    backgroundColor: undefined // Clear color if image is selected
                }
            });
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            {/* Modal */}
            <div className="absolute top-12 left-0 z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Block Options</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Background</h4>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
                        <button
                            onClick={() => setActiveTab('color')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'color'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Palette size={14} />
                            Color
                        </button>
                        <button
                            onClick={() => setActiveTab('image')}
                            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'image'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <ImageIcon size={14} />
                            Image
                        </button>
                    </div>

                    {/* Color Picker */}
                    {activeTab === 'color' && (
                        <div className="grid grid-cols-4 gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => handleColorSelect(color.value)}
                                    className={`w-full aspect-square rounded-lg border flex items-center justify-center transition-all ${block.metadata?.backgroundColor === color.value
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.label}
                                >
                                    {block.metadata?.backgroundColor === color.value && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Image Input */}
                    {activeTab === 'image' && (
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Enter image URL..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                            />
                            <button
                                onClick={handleImageSubmit}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Apply Image
                            </button>
                            {block.metadata?.backgroundImage && (
                                <div className="mt-2 relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={block.metadata.backgroundImage}
                                        alt="Background"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={() => onUpdate(block.id, { metadata: { ...block.metadata, backgroundImage: undefined } })}
                                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 hover:bg-red-50"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
