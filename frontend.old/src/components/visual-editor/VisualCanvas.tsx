'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Move, Type, Image as ImageIcon, Square, Circle,
    Trash2, Copy, Layers, ZoomIn, ZoomOut, Maximize,
    Palette, Type as TypeIcon, GripHorizontal
} from 'lucide-react';

// Types
export type VisualElementType = 'text' | 'image' | 'shape';

export interface VisualElement {
    id: string;
    type: VisualElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    content: string; // Text content or Image URL
    rotation: number;
    style: {
        backgroundColor?: string;
        color?: string;
        fontSize?: number;
        fontWeight?: string;
        borderRadius?: number;
        borderWidth?: number;
        borderColor?: string;
        opacity?: number;
        zIndex: number;
    };
}

interface VisualCanvasProps {
    elements: VisualElement[];
    onChange: (elements: VisualElement[]) => void;
    readOnly?: boolean;
}

export function VisualCanvas({ elements, onChange, readOnly = false }: VisualCanvasProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);

    // Canvas panning handlers with Spacebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !readOnly) {
                setIsPanning(true);
                if (containerRef.current) containerRef.current.style.cursor = 'grab';
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !readOnly) {
                deleteElement(selectedId);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsPanning(false);
                if (containerRef.current) containerRef.current.style.cursor = 'default';
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectedId, readOnly]);

    // Element Handlers
    const updateElement = (id: string, updates: Partial<VisualElement>) => {
        const newElements = elements.map(el => el.id === id ? { ...el, ...updates } : el);
        onChange(newElements);
    };

    const deleteElement = (id: string) => {
        onChange(elements.filter(el => el.id !== id));
        setSelectedId(null);
    };

    const duplicateElement = (id: string) => {
        const el = elements.find(e => e.id === id);
        if (el) {
            const newEl = {
                ...el,
                id: Math.random().toString(36).substr(2, 9),
                x: el.x + 20,
                y: el.y + 20,
                style: { ...el.style, zIndex: Math.max(...elements.map(e => e.style.zIndex || 0)) + 1 }
            };
            onChange([...elements, newEl]);
            setSelectedId(newEl.id);
        }
    };

    const bringToFront = (id: string) => {
        const maxZ = Math.max(...elements.map(e => e.style.zIndex || 0));
        updateElement(id, { style: { ...elements.find(e => e.id === id)?.style!, zIndex: maxZ + 1 } });
    };

    // Drop Handler for new assets
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type') as VisualElementType;
        const payload = e.dataTransfer.getData('payload');

        if (type && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // Calculate position relative to container and scale/pan
            const x = (e.clientX - rect.left - pan.x) / scale;
            const y = (e.clientY - rect.top - pan.y) / scale;

            const newElement: VisualElement = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                x: x - 50, // Center roughly
                y: y - 25,
                width: type === 'text' ? 200 : 150,
                height: type === 'text' ? 50 : 150,
                content: payload || 'New Text',
                rotation: 0,
                style: {
                    backgroundColor: type === 'shape' ? '#e2e8f0' : undefined,
                    color: '#0f172a',
                    fontSize: 16,
                    borderRadius: type === 'image' ? 8 : 4,
                    zIndex: (elements.length > 0 ? Math.max(...elements.map(e => e.style.zIndex)) : 0) + 1
                }
            };
            onChange([...elements, newElement]);
            setSelectedId(newElement.id);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
            {/* Toolbar */}
            {!readOnly && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 flex items-center gap-2 border border-gray-200">
                    <button onClick={() => setScale(s => Math.min(s + 0.1, 3))} className="p-2 hover:bg-gray-100 rounded-full" title="Zoom In"><ZoomIn size={18} /></button>
                    <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button onClick={() => setScale(s => Math.max(s - 0.1, 0.5))} className="p-2 hover:bg-gray-100 rounded-full" title="Zoom Out"><ZoomOut size={18} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-2" />
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Move size={14} />
                        <span>Hold Space to Pan</span>
                    </div>
                </div>
            )}

            {/* Context Toolbar (Selected Element) */}
            {!readOnly && selectedId && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur text-white shadow-xl rounded-xl px-4 py-2 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                    <button onClick={() => bringToFront(selectedId)} className="p-2 hover:bg-white/20 rounded-lg" title="Bring to Front"><Layers size={18} /></button>
                    <button onClick={() => duplicateElement(selectedId)} className="p-2 hover:bg-white/20 rounded-lg" title="Duplicate"><Copy size={18} /></button>
                    <button onClick={() => deleteElement(selectedId)} className="p-2 hover:bg-red-500/50 rounded-lg text-red-200 hover:text-white" title="Delete"><Trash2 size={18} /></button>
                    <div className="w-px h-4 bg-white/20 mx-1" />
                    {/* Size Controls */}
                    <input
                        type="number"
                        value={elements.find(e => e.id === selectedId)?.width}
                        onChange={e => updateElement(selectedId, { width: parseInt(e.target.value) })}
                        className="w-16 bg-transparent border-b border-white/30 text-center text-sm focus:outline-none"
                    />
                    <span className="text-xs text-white/50">px</span>
                </div>
            )}

            {/* Canvas Area */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden relative"
                onDrop={!readOnly ? handleDrop : undefined}
                onDragOver={e => e.preventDefault()}
                onWheel={(e) => {
                    if (e.ctrlKey) {
                        e.preventDefault();
                        const delta = -e.deltaY * 0.001;
                        setScale(s => Math.min(Math.max(0.5, s + delta), 3));
                    } else if (isPanning) {
                        setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
                    }
                }}
            >
                {/* Grid Background */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundSize: `${20 * scale}px ${20 * scale}px`,
                        backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
                        backgroundPosition: `${pan.x}px ${pan.y}px`,
                        opacity: 0.5
                    }}
                />

                {/* Transform Container */}
                <motion.div
                    className="origin-top-left w-full h-full"
                    style={{
                        x: pan.x,
                        y: pan.y,
                        scale: scale
                    }}
                >
                    {elements.map(el => (
                        <motion.div
                            key={el.id}
                            drag={!readOnly}
                            dragMomentum={false}
                            onDragEnd={(_, info) => {
                                if (!readOnly) {
                                    updateElement(el.id, { x: el.x + info.offset.x, y: el.y + info.offset.y });
                                }
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!readOnly) setSelectedId(el.id);
                            }}
                            initial={false}
                            style={{
                                position: 'absolute',
                                left: el.x,
                                top: el.y,
                                width: el.width,
                                height: el.height,
                                rotate: el.rotation,
                                zIndex: el.style.zIndex,
                                cursor: isPanning ? 'grab' : 'move'
                            }}
                            className={`group relative ${selectedId === el.id ? 'ring-2 ring-purple-500' : 'hover:ring-1 hover:ring-purple-300'}`}
                        >
                            {/* Content Rendering */}
                            {el.type === 'text' && (
                                <textarea
                                    value={el.content}
                                    onChange={e => updateElement(el.id, { content: e.target.value })}
                                    className="w-full h-full bg-transparent resize-none p-2 focus:outline-none"
                                    style={{
                                        fontSize: el.style.fontSize,
                                        color: el.style.color,
                                        fontWeight: el.style.fontWeight
                                    }}
                                    readOnly={readOnly}
                                />
                            )}
                            {el.type === 'image' && (
                                <img
                                    src={el.content}
                                    className="w-full h-full object-cover rounded-lg pointer-events-none"
                                    alt="canvas-img"
                                />
                            )}
                            {el.type === 'shape' && (
                                <div
                                    className="w-full h-full rounded-lg bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400"
                                >
                                    <Square size={24} />
                                </div>
                            )}

                            {/* Selection Handles */}
                            {selectedId === el.id && !readOnly && (
                                <>
                                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-white border border-purple-500 rounded-full shadow cursor-nwse-resize flex items-center justify-center">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border border-purple-500 rounded-full shadow cursor-nwse-resize flex items-center justify-center">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

// Helper to export initial/empty state
export const createInitialCanvasState = (): VisualElement[] => [
    {
        id: '1',
        type: 'text',
        x: 100,
        y: 100,
        width: 300,
        height: 60,
        content: 'Design your concept here...',
        rotation: 0,
        style: { fontSize: 24, zIndex: 1, color: '#1e293b' }
    }
];
