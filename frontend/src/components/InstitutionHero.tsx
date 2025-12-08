import React from 'react';
import { MapPin, Calendar, Globe, Mail, Linkedin, Twitter, CheckCircle } from 'lucide-react';

interface Institution {
    id: number;
    name: string;
    short_name: string;
    type: string;
    description: string;
    logo_url: string;
    banner_url?: string;
    country: string;
    founded_year?: number;
    website_url?: string;
    email?: string;
    linkedin_url?: string;
    twitter_url?: string;
    is_featured: boolean;
}

interface InstitutionHeroProps {
    institution: Institution;
}

export const InstitutionHero: React.FC<InstitutionHeroProps> = ({ institution }) => {
    return (
        <div className="relative bg-white border-b border-gray-200">
            {/* Banner Image */}
            <div className="h-64 md:h-80 w-full relative overflow-hidden bg-slate-900">
                {institution.banner_url ? (
                    <img
                        src={institution.banner_url}
                        alt={`${institution.name} banner`}
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="flex flex-col md:flex-row items-start gap-8 -mt-16 mb-8">
                    {/* Logo Box */}
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex items-center justify-center flex-shrink-0">
                        <img
                            src={institution.logo_url}
                            alt={institution.name}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${institution.short_name}&background=random&size=128`;
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-4 md:pt-20">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                                {institution.name}
                            </h1>
                            {institution.is_featured && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle size={14} />
                                    Verified Partner
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-gray-400" />
                                {institution.country}
                            </div>
                            {institution.founded_year && (
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    Est. {institution.founded_year}
                                </div>
                            )}
                            <div className="flex items-center gap-2 capitalize">
                                <span className={`w-2 h-2 rounded-full ${institution.type === 'university' ? 'bg-blue-500' :
                                        institution.type === 'corporate' ? 'bg-purple-500' :
                                            institution.type === 'nonprofit' ? 'bg-green-500' : 'bg-orange-500'
                                    }`} />
                                {institution.type}
                            </div>
                        </div>

                        <p className="text-gray-600 max-w-3xl leading-relaxed mb-6">
                            {institution.description}
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {institution.website_url && (
                                <a
                                    href={institution.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors"
                                >
                                    <Globe size={16} />
                                    Website
                                </a>
                            )}
                            {institution.email && (
                                <a
                                    href={`mailto:${institution.email}`}
                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                    <Mail size={20} />
                                </a>
                            )}
                            {institution.linkedin_url && (
                                <a
                                    href={institution.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-[#0077b5] hover:bg-[#0077b5]/5 rounded-lg transition-colors"
                                >
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {institution.twitter_url && (
                                <a
                                    href={institution.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/5 rounded-lg transition-colors"
                                >
                                    <Twitter size={20} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
