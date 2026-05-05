'use client';

import React from 'react';
import { FacultyCard } from './FacultyCard';

export const FACULTY_DATA = [
    {
        name: "Suhono Supangkat",
        title: "Professor of Smart Cities & AI",
        institution: "ITB",
        photo: "https://ui-avatars.com/api/?name=Suhono+Supangkat&size=400&background=2563EB&color=fff&bold=true"
    },
    {
        name: "Togar M. Simatupang",
        title: "Professor of Operations",
        institution: "ITB",
        photo: "https://ui-avatars.com/api/?name=Togar+Simatupang&size=400&background=064e3b&color=fff&bold=true"
    },
    {
        name: "Shobi Lawalata",
        title: "Director of Learning Programs",
        institution: "VOKASI",
        photo: "https://ui-avatars.com/api/?name=Shobi+Lawalata&size=400&background=00A859&color=fff&bold=true"
    },
    {
        name: "Alessandro Golkar",
        title: "Professor of Systems Engineering",
        institution: "TU Munich",
        photo: "https://ui-avatars.com/api/?name=Alessandro+Golkar&size=400&background=307CF6&color=fff&bold=true"
    },
    {
        name: "Ela Ben-Ur",
        title: "Design Thinking Expert",
        institution: "Olin College",
        photo: "https://ui-avatars.com/api/?name=Ela+Ben+Ur&size=400&background=EC4899&color=fff&bold=true"
    },
    {
        name: "Carlos Faerron",
        title: "Planetary Health & SDG Advisor",
        institution: "Johns Hopkins",
        photo: "https://ui-avatars.com/api/?name=Carlos+Faerron&size=400&background=0EA5E9&color=fff&bold=true"
    },
    {
        name: "Marina Alberti",
        title: "Professor of Urban Design",
        institution: "Univ. of Washington",
        photo: "https://ui-avatars.com/api/?name=Marina+Alberti&size=400&background=4B2188&color=fff&bold=true"
    },
    {
        name: "Mats Hanson",
        title: "Professor of Mechatronics",
        institution: "KTH Royal Institute of Technology",
        photo: "https://ui-avatars.com/api/?name=Mats+Hanson&size=400&background=1f4287&color=fff&bold=true"
    },
    {
        name: "Peter Finn",
        title: "CEO & Innovation Lead",
        institution: "Synectify",
        photo: "https://ui-avatars.com/api/?name=Peter+Finn&size=400&background=0F172A&color=fff&bold=true"
    }
];

export const FacultyGrid = () => {
    return (
        <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
            <div className="max-w-[70rem] mx-auto px-4 mb-4 z-10 relative">
                <h2 className="text-3xl font-black mb-4">World-Class Faculty</h2>
                <div className="flex justify-between items-end">
                    <p className="text-gray-400 text-lg max-w-2xl">
                        Learn from mentors and industry leaders bridging the gap between academia and real-world impact.
                    </p>
                    <div className="hidden md:flex gap-2">
                        <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase border border-white/20">ITB</div>
                        <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase border border-white/20">KTH</div>
                        <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase border border-white/20">TU Munich</div>
                        <div className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase border border-white/20">Johns Hopkins</div>
                    </div>
                </div>
            </div>

            {/* Scrolling Marquee */}
            <div
                className="flex gap-6 overflow-x-auto pb-8 pt-8 no-scrollbar px-4 md:px-8 snap-x"
                style={{
                    maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
                }}
            >
                {/* Render listed twice for infinite effect illusion if we were using animation, 
                    but for horizontal scroll snap, just rendering all once is good enough for MVP. 
                    Actually let's just dump them all.
                */}
                {FACULTY_DATA.map((faculty, i) => (
                    <div key={i} className="snap-center">
                        <FacultyCard {...faculty} />
                    </div>
                ))}
            </div>

            {/* Fade edges */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none z-10" />
        </section>
    );
};
