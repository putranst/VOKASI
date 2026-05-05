'use client';

import React from 'react';
import {
    MonitorPlay, Image, Type, MousePointerClick, CodeXml, Gamepad2
} from 'lucide-react';

interface ToolButtonProps {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
}

function ToolButton({ icon: Icon, label, onClick }: ToolButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-1.5 p-1 text-slate-500 hover:text-blue-600 transition-all group w-full"
        >
            <div className="transition-transform group-hover:scale-110">
                <Icon size={22} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium text-slate-600">{label}</span>
        </button>
    );
}

interface EditorToolsSidebarProps {
    onAddBlock: (type: string) => void;
}

export function EditorToolsSidebar({ onAddBlock }: EditorToolsSidebarProps) {
    return (
        <div className="w-[72px] bg-slate-50 flex flex-col items-center py-6 gap-3 z-30 fixed right-6 top-1/2 -translate-y-1/2 h-fit rounded-3xl shadow-sm border border-slate-100/50">
            <ToolButton
                icon={MonitorPlay}
                label="Video"
                onClick={() => onAddBlock('video')}
            />
            <ToolButton
                icon={Image}
                label="Image"
                onClick={() => onAddBlock('image')}
            />
            <ToolButton
                icon={Type}
                label="Text"
                onClick={() => onAddBlock('text')}
            />
            <ToolButton
                icon={MousePointerClick}
                label="Actions"
                onClick={() => onAddBlock('actions')}
            />
            <ToolButton
                icon={CodeXml}
                label="Embed"
                onClick={() => onAddBlock('code')}
            />
            <ToolButton
                icon={Gamepad2}
                label="Activities"
                onClick={() => onAddBlock('quiz')}
            />
        </div>
    );
}
