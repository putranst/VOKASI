'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
    label: string;
    href: string;
    icon?: React.ReactNode;
    description?: string;
}

interface NavDropdownProps {
    label: string;
    items: DropdownItem[];
    className?: string;
}

export const NavDropdown: React.FC<NavDropdownProps> = ({ label, items, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={dropdownRef}
            className={`relative ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-primary transition-colors py-2 px-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                {label}
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 min-w-[220px] animate-dropdown">
                        {/* Dropdown arrow */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />

                        <div className="relative bg-white rounded-xl">
                            {items.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item.icon && (
                                        <div className="text-gray-400 group-hover:text-primary transition-colors mt-0.5">
                                            {item.icon}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors">
                                            {item.label}
                                        </div>
                                        {item.description && (
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {item.description}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
