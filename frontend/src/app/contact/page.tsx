'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, MapPin, Phone, Send, MessageCircle, Building2, GraduationCap, Briefcase, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="min-h-screen bg-background text-slate-800 font-sans">
            <Navbar />

            {/* Hero */}
            <section className="bg-gradient-to-br from-rose-900 via-pink-800 to-orange-700 text-white py-20">
                <div className="max-w-[70rem] mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-6">
                        <Mail size={16} />
                        GET IN TOUCH
                    </div>
                    <h1 className="text-5xl font-black mb-6">Contact Us</h1>
                    <p className="text-xl text-pink-100 max-w-2xl mx-auto">
                        Have questions? Want to partner with us? We'd love to hear from you.
                    </p>
                </div>
            </section>

            {/* Contact Options */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <GraduationCap size={24} className="text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">I'm a Learner</h3>
                                <p className="text-sm text-gray-600">Questions about courses or enrollment</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                                <Building2 size={24} className="text-accent" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Enterprise/Government</h3>
                                <p className="text-sm text-gray-600">Partnership and training inquiries</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <Briefcase size={24} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Career Opportunities</h3>
                                <p className="text-sm text-gray-600">Join the VOKASI team</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-[70rem] mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Form */}
                        <div className="bg-white p-10 rounded-3xl shadow-xl">
                            <h2 className="text-2xl font-black text-gray-900 mb-6">Send Us a Message</h2>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-gray-600">We'll get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                                        >
                                            <option>General Inquiry</option>
                                            <option>Course Information</option>
                                            <option>Enterprise Partnership</option>
                                            <option>Government Partnership</option>
                                            <option>Technical Support</option>
                                            <option>Media Inquiry</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                        <textarea
                                            required
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            rows={5}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                            placeholder="Tell us how we can help..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send size={18} /> Send Message
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 mb-6">Contact Information</h2>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Mail size={24} className="text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Email</h3>
                                            <p className="text-gray-600">hello@vokasi.id</p>
                                            <p className="text-gray-600">partner@vokasi.id</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Phone size={24} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">WhatsApp</h3>
                                            <p className="text-gray-600">+62 812 0000 8080</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <MapPin size={24} className="text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Headquarters</h3>
                                            <p className="text-gray-600">
                                                VOKASI Indonesia<br />
                                                Jakarta Selatan<br />
                                                DKI Jakarta, Indonesia
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white p-8 rounded-2xl shadow-lg">
                                <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
                                <div className="space-y-3">
                                    <Link href="/faq" className="flex items-center gap-2 text-primary hover:underline">
                                        <MessageCircle size={16} /> Frequently Asked Questions
                                    </Link>
                                    <Link href="/docs" className="flex items-center gap-2 text-primary hover:underline">
                                        <MessageCircle size={16} /> Platform Documentation
                                    </Link>
                                    <Link href="/enterprise" className="flex items-center gap-2 text-primary hover:underline">
                                        <MessageCircle size={16} /> Enterprise Solutions
                                    </Link>
                                    <Link href="/government" className="flex items-center gap-2 text-primary hover:underline">
                                        <MessageCircle size={16} /> Government Programs
                                    </Link>
                                </div>
                            </div>

                            {/* Website */}
                            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-2xl">
                                <p className="text-sm text-gray-600">
                                    Visit our platform: <a href="https://vokasi.id" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">vokasi.id</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
