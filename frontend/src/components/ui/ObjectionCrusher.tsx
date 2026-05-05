'use client';

import React from 'react';
import { Clock, Code, DollarSign, Building2 } from 'lucide-react';

interface ObjectionProps {
    icon: React.ReactNode;
    objection: string;
    answer: string;
}

const ObjectionItem: React.FC<ObjectionProps> = ({ icon, objection, answer }) => {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary hover:shadow-lg transition-all">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    {icon}
                </div>
                <div>
                    <div className="font-bold text-gray-900 mb-2">{objection}</div>
                    <div className="text-gray-600">{answer}</div>
                </div>
            </div>
        </div>
    );
};

export const ObjectionCrusher = () => {
    return (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-5xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 mb-4">
                        Still On The Fence? We Get It.
                    </h2>
                    <p className="text-xl text-gray-600">
                        Here are the honest answers to what&apos;s probably holding you back:
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <ObjectionItem
                        icon={<Clock size={24} />}
                        objection="I don't have time..."
                        answer="Self-paced learning means you control the schedule. Most students commit 10 hours/week and complete pathways in 12-18 months while working full-time."
                    />
                    <ObjectionItem
                        icon={<Code size={24} />}
                        objection="I'm not technical..."
                        answer="18 of our 33 pathways require zero coding. And for tech roles, we start from absolute basics. If you can use email, you can learn with VOKASI."
                    />
                    <ObjectionItem
                        icon={<DollarSign size={24} />}
                        objection="It's too expensive..."
                        answer="Average graduates see a $35K salary increase in Year 1. That's 10x ROI. We also offer payment plans and scholarships for qualified applicants."
                    />
                    <ObjectionItem
                        icon={<Building2 size={24} />}
                        objection="Will employers accept it?"
                        answer="450+ companies are already hiring our graduates. VOKASI blockchain-verified credentials are mapped to BNSP national competency standards and carry weight with Indonesian employers. Your portfolio of real IRIS projects speaks louder than any certificate."
                    />
                </div>

                <div className="mt-12 text-center">
                    <p className="text-lg text-gray-600 mb-6">
                        Still have questions? We&apos;re here to help.
                    </p>
                    <a
                        href="mailto:hello@vokasi.id"
                        className="inline-block bg-white border-2 border-primary text-primary px-8 py-4 rounded-2xl font-bold hover:bg-primary hover:text-white transition-all"
                    >
                        Talk to Our Team
                    </a>
                </div>
            </div>
        </section>
    );
};
