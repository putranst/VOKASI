import React from 'react';

interface LogoProps {
    dark?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ dark = false, size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-lg tracking-[-0.04em]',
        md: 'text-2xl tracking-[-0.05em]',
        lg: 'text-4xl tracking-[-0.05em]',
    };

    const dotSize = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
    };

    return (
        <div className="flex items-center gap-1 select-none group cursor-pointer transition-opacity hover:opacity-80">
            <span
                className={`font-black ${sizeClasses[size]} leading-none`}
                style={{ fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", Inter, system-ui, sans-serif' }}
            >
                <span style={{ color: '#064e3b' }}>VO</span>
                <span className={dark ? 'text-white' : 'text-slate-900'}>KASI</span>
            </span>
            <span
                className={`${dotSize[size]} rounded-full flex-shrink-0 mb-0.5 self-end`}
                style={{ backgroundColor: '#10b981' }}
                aria-hidden="true"
            />
        </div>
    );
};
