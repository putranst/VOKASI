import React from 'react';
import Link from 'next/link';
import { Building2, Users, BookOpen, Award } from 'lucide-react';

interface Institution {
    id: number;
    name: string;
    short_name: string;
    type: string;
    logo_url: string;
    total_courses: number;
    total_learners: string;
    is_featured: boolean;
    country: string;
}

interface InstitutionCardProps {
    institution: Institution;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({ institution }) => {
    return (
        <Link
            href={`/partners/${institution.id}`}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
        >
            <div className="p-8 flex flex-col items-center text-center flex-1">
                <div className="w-24 h-24 mb-6 relative flex items-center justify-center p-4 bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-md transition-all">
                    <img
                        src={institution.logo_url}
                        alt={institution.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                            // Fallback if image fails
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${institution.short_name}&background=random&size=128`;
                        }}
                    />
                </div>

                <div className="mb-2">
                    {institution.is_featured && (
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">
                            Featured Partner
                        </span>
                    )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {institution.name}
                </h3>

                <p className="text-sm text-gray-500 font-medium mb-6">
                    {institution.country} • <span className="capitalize">{institution.type}</span>
                </p>

                <div className="grid grid-cols-2 gap-4 w-full mt-auto pt-6 border-t border-gray-50">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <BookOpen size={14} />
                            <span className="text-xs font-medium uppercase tracking-wide">Courses</span>
                        </div>
                        <span className="font-bold text-gray-900">{institution.total_courses}</span>
                    </div>
                    <div className="text-center border-l border-gray-50">
                        <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                            <Users size={14} />
                            <span className="text-xs font-medium uppercase tracking-wide">Learners</span>
                        </div>
                        <span className="font-bold text-gray-900">{institution.total_learners}</span>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 text-center text-xs font-bold text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors uppercase tracking-wider">
                View Profile
            </div>
        </Link>
    );
};
