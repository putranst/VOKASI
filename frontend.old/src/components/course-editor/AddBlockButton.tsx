'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface AddBlockButtonProps {
    onClick: () => void;
    label?: string;
    visible?: boolean;
}

export function AddBlockButton({ onClick, label = "Add Block", visible = true }: AddBlockButtonProps) {
    return (
        <div
            className={`group flex items-center justify-center py-2 transition-opacity ${visible ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all text-sm font-medium"
            >
                <Plus size={16} />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-x-[-10px] group-hover:translate-x-0">{label}</span>
            </button>
        </div>
    );
}
