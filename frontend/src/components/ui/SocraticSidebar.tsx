'use client';

import React, { useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import SocraticTutor from '@/components/SocraticTutor';

// IRIS phase names
type Phase = 'immerse' | 'realize' | 'iterate' | 'scale';

interface SocraticSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    phase: Phase;
    context?: any;
}


export default function SocraticSidebar({
    isOpen,
    onClose,
    projectId,
    phase,
    context
}: SocraticSidebarProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar - 1/3 width on desktop */}
            <aside
                className={`fixed top-0 right-0 h-full w-[33vw] min-w-[320px] max-w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-teal-600">
                    <div className="flex items-center gap-2 text-white">
                        <MessageSquare className="w-5 h-5" />
                        <span className="font-bold">Socratic Tutor</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="h-[calc(100%-64px)] overflow-hidden">
                    <SocraticTutor
                        projectId={projectId}
                        phase={phase}
                        context={context}
                        className="h-full rounded-none border-0 shadow-none"
                    />
                </div>
            </aside>
        </>
    );
}
