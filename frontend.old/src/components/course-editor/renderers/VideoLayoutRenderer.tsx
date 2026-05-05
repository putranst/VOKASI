'use client';

import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { ContentBlock, VideoLayout } from '../types';

interface VideoLayoutRendererProps {
    block: ContentBlock;
    isEditing: boolean;
    onUpdate: (updates: Partial<ContentBlock>) => void;
}

export default function VideoLayoutRenderer({
    block,
    isEditing,
    onUpdate
}: VideoLayoutRendererProps) {
    const layout = block.layout as VideoLayout;
    const { videoUrl, videoUrl2, audioUrl, title, description } = block.metadata || {};

    const renderVideoPlayer = (url: string, className: string = '') => {
        if (!url) {
            return (
                <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
                    <div className="text-center p-8">
                        <Play size={48} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No video URL</p>
                        {isEditing && (
                            <input
                                type="text"
                                placeholder="Enter video URL (YouTube, Vimeo, or direct link)"
                                className="mt-3 px-3 py-2 border border-gray-300 rounded-lg w-full max-w-md text-sm"
                                defaultValue={url}
                                onChange={(e) => onUpdate({
                                    metadata: { ...block.metadata, videoUrl: e.target.value }
                                })}
                            />
                        )}
                    </div>
                </div>
            );
        }

        // Check if it's a YouTube or Vimeo URL
        const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
        const isVimeo = url.includes('vimeo.com');

        if (isYouTube || isVimeo) {
            let embedUrl = url;
            if (isYouTube) {
                const videoId = url.includes('youtu.be')
                    ? url.split('youtu.be/')[1]?.split('?')[0]
                    : url.split('v=')[1]?.split('&')[0];
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (isVimeo) {
                const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
                embedUrl = `https://player.vimeo.com/video/${videoId}`;
            }

            return (
                <div className={`relative ${className}`}>
                    <iframe
                        src={embedUrl}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        // Direct video file
        return (
            <video
                src={url}
                controls
                className={`w-full h-full rounded-lg object-cover ${className}`}
            />
        );
    };

    const renderAudioPlayer = () => {
        const [isPlaying, setIsPlaying] = React.useState(false);
        const [isMuted, setIsMuted] = React.useState(false);
        const audioRef = React.useRef<HTMLAudioElement>(null);

        return (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                <audio ref={audioRef} src={audioUrl} className="hidden" />

                <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                        onClick={() => {
                            if (audioRef.current) {
                                if (isPlaying) {
                                    audioRef.current.pause();
                                } else {
                                    audioRef.current.play();
                                }
                                setIsPlaying(!isPlaying);
                            }
                        }}
                        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white transition-colors"
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>

                    {/* Waveform/Progress */}
                    <div className="flex-1">
                        <div className="mb-2">
                            <h4 className="font-semibold text-gray-900">
                                {title || 'Audio Title'}
                            </h4>
                            {description && (
                                <p className="text-sm text-gray-500">{description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: '40%' }} />
                            </div>
                            <span className="text-sm text-gray-500 font-medium">
                                {block.metadata?.duration || '0:00'}
                            </span>
                        </div>
                    </div>

                    {/* Volume */}
                    <button
                        onClick={() => {
                            if (audioRef.current) {
                                audioRef.current.muted = !isMuted;
                                setIsMuted(!isMuted);
                            }
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {isMuted ? <VolumeX size={20} className="text-gray-400" /> : <Volume2 size={20} className="text-gray-600" />}
                    </button>
                </div>

                {isEditing && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <input
                            type="text"
                            placeholder="Audio URL"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                            defaultValue={audioUrl}
                            onChange={(e) => onUpdate({
                                metadata: { ...block.metadata, audioUrl: e.target.value }
                            })}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                placeholder="Title"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                defaultValue={title}
                                onChange={(e) => onUpdate({
                                    metadata: { ...block.metadata, title: e.target.value }
                                })}
                            />
                            <input
                                type="text"
                                placeholder="Duration (e.g., 3:45)"
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                defaultValue={block.metadata?.duration}
                                onChange={(e) => onUpdate({
                                    metadata: { ...block.metadata, duration: e.target.value }
                                })}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderTextContent = (isSecondary: boolean = false) => {
        const content = isSecondary ? (block.metadata?.description || '') : block.content;

        return isEditing ? (
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Heading"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-bold text-2xl"
                    defaultValue={title || 'Video Heading'}
                    onChange={(e) => onUpdate({
                        metadata: { ...block.metadata, title: e.target.value }
                    })}
                />
                <textarea
                    placeholder="Description text..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                    rows={4}
                    defaultValue={content}
                    onChange={(e) => {
                        if (isSecondary) {
                            onUpdate({ metadata: { ...block.metadata, description: e.target.value } });
                        } else {
                            onUpdate({ content: e.target.value });
                        }
                    }}
                />
            </div>
        ) : (
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {title || 'Video Heading'}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                    {content || 'Add description text here...'}
                </p>
            </div>
        );
    };

    // Render based on layout
    switch (layout) {
        case 'video-bottom':
            return (
                <div className="space-y-4">
                    {renderTextContent()}
                    {renderVideoPlayer(videoUrl || '', 'aspect-video')}
                </div>
            );

        case 'two-videos':
            return (
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {title || 'Two Videos'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            {renderVideoPlayer(videoUrl || '', 'aspect-video')}
                            <p className="mt-2 text-sm font-semibold text-gray-700">Video 1</p>
                        </div>
                        <div>
                            {renderVideoPlayer(videoUrl2 || '', 'aspect-video')}
                            <p className="mt-2 text-sm font-semibold text-gray-700">Video 2</p>
                        </div>
                    </div>
                </div>
            );

        case 'video-left':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        {renderVideoPlayer(videoUrl || '', 'aspect-video')}
                    </div>
                    <div>
                        {renderTextContent()}
                    </div>
                </div>
            );

        case 'video-right':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        {renderTextContent()}
                    </div>
                    <div>
                        {renderVideoPlayer(videoUrl || '', 'aspect-video')}
                    </div>
                </div>
            );

        case 'audio-player':
            return renderAudioPlayer();

        default:
            return (
                <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-500">Unknown video layout: {layout}</p>
                </div>
            );
    }
}
