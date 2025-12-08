import React from 'react';
import Image from 'next/image';
import { Hexagon } from 'lucide-react';

interface LogoProps {
    dark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ dark = false }) => (
    <div className="flex items-center gap-3 tracking-tight select-none group cursor-pointer">
        <div className="relative w-28 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
                src="/logo.png"
                alt="TSEA-X Logo"
                fill
                className={`object-contain ${dark ? "brightness-0 invert" : ""}`}
                priority
            />
        </div>
    </div>
);
