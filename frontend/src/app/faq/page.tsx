'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import Link from 'next/link';

const faqCategories = [
    {
        name: 'General',
        faqs: [
            {
                question: 'What is VOKASI?',
                answer: 'VOKASI is an AI-powered education platform that uses the IRIS Cycle (Immersion, Reflection, Iteration, Scale) framework to provide project-based learning experiences. We combine world-class curriculum with an AI tutor and cloud-based development tools to help learners transform their careers.'
            },
            {
                question: 'Who is VOKASI for?',
                answer: 'VOKASI is designed for career changers, professionals looking to upskill, and anyone who wants to learn practical tech skills through hands-on projects. Our learners come from diverse backgrounds including marketing, teaching, HR, and more.'
            },
            {
                question: 'How long do programs take to complete?',
                answer: 'Most learners complete their career pathway in 6-12 months, depending on prior experience and time commitment. Our flexible, self-paced format allows you to learn while maintaining work and life responsibilities.'
            },
            {
                question: 'Is there a free trial?',
                answer: 'Yes! You can explore our career pathways and sample course content for free. Create an account to get started and experience our AI tutor and learning platform.'
            }
        ]
    },
    {
        name: 'Courses & Learning',
        faqs: [
            {
                question: 'What is the IRIS Cycle?',
                answer: 'IRIS stands for Immersion, Reflection, Iteration, and Scale. It\'s part of the NUSA Framework (National Upskilling Sprint for AI) designed for hands-on, action learning. You immerse in real problem contexts, reflect on knowledge gaps, iterate through Build-Measure-Learn cycles, and scale your solution to real institutions.'
            },
            {
                question: 'How does the AI Tutor work?',
                answer: 'Our AI Tutor uses the Socratic method to guide your learning. Instead of giving you direct answers, it asks thoughtful questions that help you discover solutions yourself. It\'s available 24/7 and adapts to your skill level and learning pace.'
            },
            {
                question: 'What programming languages are supported?',
                answer: 'Our Cloud IDE supports Python, JavaScript, TypeScript, HTML/CSS, SQL, and more. The specific languages available depend on your chosen career pathway and course requirements.'
            },
            {
                question: 'Can I work on projects offline?',
                answer: 'While our Cloud IDE requires an internet connection, you can download course materials and project specifications for offline review. Your progress syncs automatically when you reconnect.'
            }
        ]
    },
    {
        name: 'Credentials & Certificates',
        faqs: [
            {
                question: 'What are VOKASI credentials?',
                answer: 'VOKASI credentials are blockchain-verified certificates that prove your skills and project completions. Each credential is permanently recorded on the blockchain, making it impossible to forge and easy for employers to verify.'
            },
            {
                question: 'How do I earn a credential?',
                answer: 'You earn credentials by completing projects within your courses. Each major project milestone awards a credential that you can add to your LinkedIn profile and share with potential employers.'
            },
            {
                question: 'How can employers verify my credentials?',
                answer: 'Employers can verify any VOKASI credential using our public verification page at /verify-credential. They simply enter the credential ID and can instantly confirm its authenticity and view the associated skills.'
            },
            {
                question: 'Do credentials expire?',
                answer: 'No, VOKASI credentials never expire. They serve as a permanent record of your achievements and the skills you demonstrated at the time of completion.'
            }
        ]
    },
    {
        name: 'Technical Support',
        faqs: [
            {
                question: 'What browsers are supported?',
                answer: 'VOKASI works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your preferred browser for the best experience with our Cloud IDE.'
            },
            {
                question: 'My code isn\'t running. What should I do?',
                answer: 'First, check for syntax errors highlighted in the editor. If the issue persists, try refreshing the page or ask our AI Tutor for help debugging. You can also reach out to support through the contact page.'
            },
            {
                question: 'How do I reset my password?',
                answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link within a few minutes. Check your spam folder if you don\'t see it.'
            },
            {
                question: 'Is my data secure?',
                answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your personal information with third parties without consent.'
            }
        ]
    }
];

export default function FAQPage() {
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('General');

    const toggleItem = (key: string) => {
        setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const currentCategory = faqCategories.find(c => c.name === activeCategory);

    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-br from-amber-600 via-orange-500 to-red-500 text-white py-20">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <HelpCircle size={16} />
                        FREQUENTLY ASKED QUESTIONS
                    </div>
                    <h1 className="text-5xl font-black mb-6">How Can We Help?</h1>
                    <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-8">
                        Find answers to common questions about VOKASI, our courses, and credentials
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" />
                        <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-white"
                        />
                    </div>
                </div>
            </section>

            {/* Category Tabs */}
            <section className="py-4 bg-white border-b border-gray-100 sticky top-16 z-40">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {faqCategories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.name
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ List */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {currentCategory?.faqs.map((faq, i) => {
                            const key = `${activeCategory}-${i}`;
                            const isOpen = openItems[key];

                            return (
                                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <button
                                        onClick={() => toggleItem(key)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-bold text-gray-900 pr-4">{faq.question}</span>
                                        {isOpen ? (
                                            <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6">
                                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 bg-white">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <MessageCircle size={48} className="mx-auto text-primary mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Still Have Questions?</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all"
                    >
                        Contact Support
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
