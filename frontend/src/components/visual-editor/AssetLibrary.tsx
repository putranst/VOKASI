'use client';

import React from 'react';
import { Type, Square, Image as ImageIcon, Circle, Triangle, Star, Layout, CreditCard } from 'lucide-react';
import { VisualElementType } from './VisualCanvas';

interface AssetLibraryProps {
    onDragStart: (e: React.DragEvent, type: VisualElementType, payload?: string) => void;
}

export function AssetLibrary({ onDragStart }: AssetLibraryProps) {
    const handleDragStart = (e: React.DragEvent, type: VisualElementType, payload: string = '') => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('payload', payload);
        onDragStart(e, type, payload);
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">Design Assets</h3>
                <p className="text-xs text-gray-500">Drag to canvas</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Text Assets */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Typography</h4>
                    <div className="space-y-2">
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'text', 'Heading')}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab hover:bg-purple-50 hover:border-purple-200 transition-colors"
                        >
                            <h1 className="text-xl font-bold text-gray-800 pointer-events-none">Add a Heading</h1>
                        </div>
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'text', 'Subheading text')}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab hover:bg-purple-50 hover:border-purple-200 transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-gray-600 pointer-events-none">Subheading</h3>
                        </div>
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'text', 'Body text block...')}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-grab hover:bg-purple-50 hover:border-purple-200 transition-colors"
                        >
                            <p className="text-sm text-gray-500 pointer-events-none">Add body text</p>
                        </div>
                    </div>
                </div>

                {/* Shapes */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Shapes</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'shape', 'square')}
                            className="aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center cursor-grab hover:bg-purple-50 hover:border-purple-200"
                        >
                            <Square size={24} className="text-gray-600" />
                        </div>
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'shape', 'circle')}
                            className="aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center cursor-grab hover:bg-purple-50 hover:border-purple-200"
                        >
                            <Circle size={24} className="text-gray-600" />
                        </div>
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'shape', 'card')}
                            className="aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center cursor-grab hover:bg-purple-50 hover:border-purple-200"
                        >
                            <CreditCard size={24} className="text-gray-600" />
                        </div>
                        <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'shape', 'layout')}
                            className="aspect-square bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center cursor-grab hover:bg-purple-50 hover:border-purple-200"
                        >
                            <Layout size={24} className="text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Stock Images */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Stock Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            'https://images.unsplash.com/photo-1552664730-d307ca884978?w=300',
                            'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300',
                            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300',
                            'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300'
                        ].map((src, i) => (
                            <div
                                key={i}
                                draggable
                                onDragStart={(e) => handleDragStart(e, 'image', src)}
                                className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-grab hover:opacity-80 transition-opacity"
                            >
                                <img src={src} alt="Stock" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
