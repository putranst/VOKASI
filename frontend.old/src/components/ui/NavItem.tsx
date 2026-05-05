import React from 'react';

interface NavItemProps {
    label: string;
    active?: boolean;
    href?: string;
    onClick?: () => void;
    icon?: React.ElementType;
    badge?: number;
}

export const NavItem: React.FC<NavItemProps> = ({ label, active, href, onClick, icon: Icon, badge }) => {
    const className = `w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${active
            ? 'bg-indigo-50 text-indigo-600 font-bold'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
        }`;

    const content = (
        <>
            {Icon && <Icon size={20} />}
            <span className="flex-1 text-left">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className={className}>
                {content}
            </button>
        );
    }

    return (
        <a href={href || '#'} className={className}>
            {content}
        </a>
    );
};
