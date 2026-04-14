'use client';

import React, { useState } from 'react';
import { Plus, Repeat, ExternalLink, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { ContentBlock, ActionLayout, Hotspot, FlipCard, ButtonData, NumberedCard } from '../types';

interface ActionLayoutRendererProps {
    block: ContentBlock;
    isEditing: boolean;
    onUpdate: (updates: Partial<ContentBlock>) => void;
}

export default function ActionLayoutRenderer({
    block,
    isEditing,
    onUpdate
}: ActionLayoutRendererProps) {
    const layout = block.layout as ActionLayout;
    const { hotspots = [], flipCards = [], buttons = [], numberedCards = [], imageUrl } = block.metadata || {};
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    // IMAGE HOTSPOT
    const renderImageHotspot = () => {
        const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

        return (
            <div className="relative">
                {/* Image */}
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                    {imageUrl ? (
                        <img src={imageUrl} alt="Interactive image" className="w-full" />
                    ) : (
                        <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                            <p className="text-gray-400">Add image URL</p>
                        </div>
                    )}

                    {/* Hotspots */}
                    {hotspots.map((hotspot: Hotspot) => (
                        <button
                            key={hotspot.id}
                            className="absolute w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
                            onClick={() => setSelectedHotspot(hotspot.id === selectedHotspot ? null : hotspot.id)}
                        >
                            <Plus size={20} />
                        </button>
                    ))}

                    {/* Hotspot Details */}
                    {selectedHotspot && hotspots.find((h: Hotspot) => h.id === selectedHotspot) && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 animate-slide-up">
                            <h4 className="font-bold text-gray-900 mb-1">
                                {hotspots.find((h: Hotspot) => h.id === selectedHotspot)?.title}
                            </h4>
                            <p className="text-sm text-gray-700">
                                {hotspots.find((h: Hotspot) => h.id === selectedHotspot)?.description}
                            </p>
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="mt-4 space-y-2">
                        <input
                            type="text"
                            placeholder="Image URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            defaultValue={imageUrl}
                            onChange={(e) => onUpdate({
                                metadata: { ...block.metadata, imageUrl: e.target.value }
                            })}
                        />
                        <button
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                            onClick={() => {
                                const newHotspot: Hotspot = {
                                    id: `hotspot-${Date.now()}`,
                                    x: 50,
                                    y: 50,
                                    title: 'New Hotspot',
                                    description: 'Click to edit'
                                };
                                onUpdate({
                                    metadata: { ...block.metadata, hotspots: [...hotspots, newHotspot] }
                                });
                            }}
                        >
                            + Add Hotspot
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // FLIP CARDS
    const renderFlipCards = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {flipCards.map((card: FlipCard) => {
                    const isFlipped = flippedCards.has(card.id);

                    return (
                        <div
                            key={card.id}
                            className="relative h-48 cursor-pointer perspective-1000"
                            onClick={() => {
                                const newFlipped = new Set(flippedCards);
                                if (isFlipped) {
                                    newFlipped.delete(card.id);
                                } else {
                                    newFlipped.add(card.id);
                                }
                                setFlippedCards(newFlipped);
                            }}
                        >
                            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                                {/* Front */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center p-6 backface-hidden">
                                    <div className="text-center text-white">
                                        <Repeat size={32} className="mx-auto mb-2" />
                                        <p className="font-semibold">{card.front}</p>
                                    </div>
                                </div>

                                {/* Back */}
                                <div className="absolute inset-0 bg-white border-2 border-gray-200 rounded-xl shadow-lg flex items-center justify-center p-6 transform rotate-y-180 backface-hidden">
                                    <p className="text-gray-700 text-center">{card.back}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isEditing && (
                    <button
                        className="h-48 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 transition-colors flex items-center justify-center"
                        onClick={() => {
                            const newCard: FlipCard = {
                                id: `card-${Date.now()}`,
                                front: 'Front text',
                                back: 'Back text'
                            };
                            onUpdate({
                                metadata: { ...block.metadata, flipCards: [...flipCards, newCard] }
                            });
                        }}
                    >
                        <Plus size={32} className="text-gray-400" />
                    </button>
                )}
            </div>
        );
    };

    // BUTTON VARIANTS
    const renderButtons = () => {
        const getSocialIcon = (platform?: string) => {
            switch (platform) {
                case 'twitter': return <Twitter size={18} />;
                case 'instagram': return <Instagram size={18} />;
                case 'youtube': return <Youtube size={18} />;
                case 'linkedin': return <Linkedin size={18} />;
                default: return <ExternalLink size={18} />;
            }
        };

        if (layout === 'fit-button') {
            return (
                <div className="flex gap-3 flex-wrap">
                    {buttons.map((btn: ButtonData) => (
                        <button
                            key={btn.id}
                            className="px-4 py-2 bg-white border-2 border-gray-300 hover:border-blue-500 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2 transition-colors"
                        >
                            {getSocialIcon(btn.socialPlatform)}
                            <span>{btn.text}</span>
                        </button>
                    ))}
                </div>
            );
        }

        if (layout === 'full-button') {
            return (
                <div className="space-y-3">
                    {buttons.map((btn: ButtonData) => (
                        <button
                            key={btn.id}
                            className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold flex items-center justify-center gap-3 shadow-lg transition-all hover:scale-[1.02]"
                        >
                            {getSocialIcon(btn.socialPlatform)}
                            <span>{btn.text}</span>
                        </button>
                    ))}
                </div>
            );
        }

        if (layout === 'social-button') {
            return (
                <div className="flex gap-3 justify-center">
                    {buttons.map((btn: ButtonData) => (
                        <button
                            key={btn.id}
                            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center justify-center shadow-md transition-all hover:scale-110"
                        >
                            {getSocialIcon(btn.socialPlatform)}
                        </button>
                    ))}
                </div>
            );
        }

        if (layout === 'button-right') {
            return (
                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <p className="text-gray-700">{block.content || 'Add description text for the button.'}</p>
                    </div>
                    {buttons[0] && (
                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold whitespace-nowrap shadow-md transition-colors">
                            {buttons[0].text}
                        </button>
                    )}
                </div>
            );
        }

        return null;
    };

    // NUMBERED CARDS
    const renderNumberedCards = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {numberedCards.map((card: NumberedCard) => (
                    <div
                        key={card.id}
                        className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
                    >
                        <div className="text-4xl font-bold text-blue-600 mb-3">
                            {String(card.number).padStart(2, '0')}
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">{card.heading}</h4>
                        <p className="text-sm text-gray-600">{card.content}</p>
                    </div>
                ))}
            </div>
        );
    };

    // Render based on layout
    switch (layout) {
        case 'image-hotspot':
            return renderImageHotspot();

        case 'flip-card':
            return renderFlipCards();

        case 'fit-button':
        case 'full-button':
        case 'social-button':
        case 'button-right':
            return renderButtons();

        case 'numbered-cards':
            return renderNumberedCards();

        default:
            return (
                <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-500">Unknown action layout: {layout}</p>
                </div>
            );
    }
}
