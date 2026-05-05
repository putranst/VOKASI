import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={item.href} className="flex items-center gap-2">
                        {index > 0 && <ChevronRight size={16} className="text-gray-400" />}

                        {isLast ? (
                            <span className="text-primary font-semibold">{item.label}</span>
                        ) : (
                            <Link
                                href={item.href}
                                className="text-gray-600 hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
