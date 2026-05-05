'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, X, ZoomIn, Upload } from 'lucide-react';
import { ContentBlock, ImageLayout } from '../types';

interface ImageLayoutRendererProps {
    block: ContentBlock;
    isEditing: boolean;
    onUpdate: (updates: Partial<ContentBlock>) => void;
}

export default function ImageLayoutRenderer({
    block,
    isEditing,
    onUpdate
}: ImageLayoutRendererProps) {
    const layout = block.layout as ImageLayout;
    const { imageUrl, imageUrl2, imageUrl3, images = [], caption, title } = block.metadata || {};
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState('');

    const renderImagePlaceholder = (url: string | undefined, label: string, metadataKey: string) => {
        if (!url && !isEditing) {
            return (
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <ImageIcon size={48} className="mx-auto text-blue-300 mb-2" />
                        <p className="text-sm text-gray-500">{label}</p>
                    </div>
                </div>
            );
        }

        if (isEditing && !url) {
            return (
                <div className="aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-blue-500 transition-colors">
                    <div className="text-center p-4">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <input
                            type="text"
                            placeholder="Enter image URL"
                            className="mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full text-sm"
                            onChange={(e) => onUpdate({
                                metadata: { ...block.metadata, [metadataKey]: e.target.value }
                            })}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="relative group">
                <img
                    src={url}
                    alt={caption || label}
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => {
                        if (!isEditing) {
                            setLightboxImage(url || '');
                            setLightboxOpen(true);
                        }
                    }}
                />
                {!isEditing && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                        <ZoomIn className="text-white" size={32} />
                    </div>
                )}
                {isEditing && (
                    <div className="mt-2">
                        <input
                            type="text"
                            placeholder="Image URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            defaultValue={url}
                            onChange={(e) => onUpdate({
                                metadata: { ...block.metadata, [metadataKey]: e.target.value }
                            })}
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderTextContent = () => {
        return isEditing ? (
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Heading"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-bold text-xl"
                    defaultValue={title || ''}
                    onChange={(e) => onUpdate({
                        metadata: { ...block.metadata, title: e.target.value }
                    })}
                />
                <textarea
                    placeholder="Text content..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    defaultValue={block.content}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                />
            </div>
        ) : (
            <div>
                {title && <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>}
                <p className="text-gray-700 leading-relaxed">
                    {block.content || 'Add text content here...'}
                </p>
            </div>
        );
    };

    const renderCaption = () => {
        return isEditing ? (
            <input
                type="text"
                placeholder="Image caption"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
                defaultValue={caption}
                onChange={(e) => onUpdate({
                    metadata: { ...block.metadata, caption: e.target.value }
                })}
            />
        ) : caption ? (
            <p className="text-sm text-gray-600 text-center mt-2 italic">{caption}</p>
        ) : null;
    };

    // Lightbox component
    const Lightbox = () => {
        if (!lightboxOpen) return null;

        return (
            <div
                className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                onClick={() => setLightboxOpen(false)}
            >
                <button
                    onClick={() => setLightboxOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white"
                >
                    <X size={24} />
                </button>
                <img
                    src={lightboxImage}
                    alt="Full size"
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        );
    };

    // Render based on layout
    switch (layout) {
        case 'single-image':
            return (
                <div>
                    {renderImagePlaceholder(imageUrl, 'Single Image', 'imageUrl')}
                    {renderCaption()}
                    <Lightbox />
                </div>
            );

        case 'image-top':
            return (
                <div className="space-y-4">
                    {renderImagePlaceholder(imageUrl, 'Image', 'imageUrl')}
                    {renderTextContent()}
                    <Lightbox />
                </div>
            );

        case 'image-bottom':
            return (
                <div className="space-y-4">
                    {renderTextContent()}
                    {renderImagePlaceholder(imageUrl, 'Image', 'imageUrl')}
                    <Lightbox />
                </div>
            );

        case 'two-images':
            return (
                <div>
                    {title && <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            {renderImagePlaceholder(imageUrl, 'Image 1', 'imageUrl')}
                            <p className="mt-2 text-sm font-semibold text-gray-700 text-center">Heading 1</p>
                        </div>
                        <div>
                            {renderImagePlaceholder(imageUrl2, 'Image 2', 'imageUrl2')}
                            <p className="mt-2 text-sm font-semibold text-gray-700 text-center">Heading 2</p>
                        </div>
                    </div>
                    <Lightbox />
                </div>
            );

        case 'three-images':
            return (
                <div>
                    {title && <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            {renderImagePlaceholder(imageUrl, 'Image 1', 'imageUrl')}
                            <p className="mt-2 text-sm font-semibold text-gray-700 text-center">Heading 1</p>
                        </div>
                        <div>
                            {renderImagePlaceholder(imageUrl2, 'Image 2', 'imageUrl2')}
                            <p className="mt-2 text-sm font-semibold text-gray-700 text-center">Heading 2</p>
                        </div>
                        <div>
                            {renderImagePlaceholder(imageUrl3, 'Image 3', 'imageUrl3')}
                            <p className="mt-2 text-sm font-semibold text-gray-700 text-center">Heading 3</p>
                        </div>
                    </div>
                    <Lightbox />
                </div>
            );

        case 'image-gallery':
            return (
                <div>
                    {title && <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {images.length === 0 && isEditing ? (
                            <>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div
                                        key={i}
                                        className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                                    >
                                        <ImageIcon size={24} className="text-gray-400" />
                                    </div>
                                ))}
                            </>
                        ) : (
                            images.map((img, index) => (
                                <div key={index} className="aspect-square relative group">
                                    <img
                                        src={img}
                                        alt={`Gallery image ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => {
                                            setLightboxImage(img);
                                            setLightboxOpen(true);
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg">
                                        <ZoomIn className="text-white" size={24} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {isEditing && (
                        <div className="mt-4">
                            <textarea
                                placeholder="Enter image URLs (one per line)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                rows={3}
                                defaultValue={images.join('\n')}
                                onChange={(e) => {
                                    const urls = e.target.value.split('\n').filter(url => url.trim());
                                    onUpdate({
                                        metadata: { ...block.metadata, images: urls }
                                    });
                                }}
                            />
                        </div>
                    )}
                    <Lightbox />
                </div>
            );

        default:
            return (
                <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-500">Unknown image layout: {layout}</p>
                </div>
            );
    }
}
