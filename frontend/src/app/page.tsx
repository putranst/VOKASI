'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Users, Award, TrendingUp, BrainCircuit, MessageCircle } from 'lucide-react';

// New Components
import { EnterpriseHero } from '@/components/ui/EnterpriseHero';
import { T6Difference } from '@/components/ui/T6Difference';
import { CareerShowcase } from '@/components/ui/CareerShowcase';
import { ObjectionCrusher } from '@/components/ui/ObjectionCrusher';

// Existing Components  
import { SuccessStatsCard } from '@/components/ui/SuccessStatsCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { FacultyGrid } from '@/components/ui/FacultyGrid';
import { ResourceCard } from '@/components/ui/ResourceCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-slate-800 selection:bg-primary selection:text-white font-sans">
      <Navbar />

      {/* NEW: Multi-Audience Enterprise Hero */}
      <EnterpriseHero />

      {/* Trusted Partner Logos - Enhanced */}
      <div className="border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Trusted by World-Class Institutions</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <span className="text-xl font-serif font-bold text-accent">Tsinghua University</span>
            <span className="text-xl font-sans font-black text-[#1a1a1a] tracking-tighter">MIT<span className="font-light">Sloan</span></span>
            <span className="text-xl font-bold text-primary">United in Diversity</span>
            <span className="text-xl font-mono font-bold text-gray-600">GOVTECH</span>
            <span className="text-xl font-bold text-green-700 tracking-tight">UN SDSN</span>
          </div>
        </div>
      </div>

      {/* NEW: The T6 Difference - Value Proposition */}
      <T6Difference />

      {/* NEW: Career Showcase with Salaries */}
      <CareerShowcase />

      {/* AI-Powered Learning Section - Streamlined */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Sparkles size={16} />
                AI-Powered Learning
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-6">
                Learn 3X Faster with Your AI Tutor
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Get instant guidance, personalized hints, and 1-on-1 support throughout your learning journey. Our Socratic AI assistant adapts to your pace and learning style—so you never get stuck.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <BrainCircuit className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Context-Aware Hints</h3>
                    <p className="text-sm text-gray-600">Get help exactly when you need it, without giving away answers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-xl">
                    <MessageCircle className="text-accent" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Socratic Method</h3>
                    <p className="text-sm text-gray-600">Learn through guided questions that deepen understanding</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="text-5xl font-black text-primary mb-2">94%</div>
                <div className="text-sm font-medium text-gray-600">of students love our AI support</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <div className="font-bold text-gray-900">AI Companion</div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                    Online
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-100 rounded-2xl p-4">
                  <p className="text-sm text-gray-700">
                    I'm stuck on implementing the Design phase for my sustainability project. Can you help?
                  </p>
                </div>
                <div className="bg-primary/10 rounded-2xl p-4 ml-4">
                  <p className="text-sm text-gray-800">
                    Great question! Let's think about it step by step. In the Design phase of CDIO, what do you think are the key components you need to architect? 🤔
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button className="text-xs bg-white px-3 py-1.5 rounded-full border border-gray-300 hover:border-primary transition-colors font-medium">
                      System Architecture
                    </button>
                    <button className="text-xs bg-white px-3 py-1.5 rounded-full border border-gray-300 hover:border-primary transition-colors font-medium">
                      Prototyping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics Section */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Proven Results. Real Impact.</h2>
            <p className="text-gray-600 text-lg">Join thousands of learners transforming their careers</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <SuccessStatsCard
              value="82%"
              label="Employment Rate"
              icon={<TrendingUp className="text-primary" size={24} />}
              trend="+5% YoY"
            />
            <SuccessStatsCard
              value="1,100+"
              label="Graduates Worldwide"
              icon={<Award className="text-accent" size={24} />}
            />
            <SuccessStatsCard
              value="4.2 mo"
              label="Avg. Time to Job Offer"
              icon={<Users className="text-green-600" size={24} />}
            />
            <SuccessStatsCard
              value="450+"
              label="Partner Companies"
              icon={<Sparkles className="text-primary" size={24} />}
            />
          </div>
        </div>
      </section>

      {/* Student Success Stories */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Student Success Stories</h2>
          <p className="text-gray-600 text-lg">Real transformations from the T6 community</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            name="Sarah Chen"
            previousRole="Marketing Manager"
            newRole="AI Product Manager"
            timeline="8 months"
            quote="The CDIO framework helped me bridge my marketing background with technical AI skills. Now I'm leading AI product strategy at a major tech company at $145K."
            avatar="SC"
          />
          <TestimonialCard
            name="Miguel Rodriguez"
            previousRole="Teacher"
            newRole="EdTech Developer"
            timeline="6 months"
            quote="T6's project-based approach was perfect for my learning style. I built 4 real applications and landed my dream job before graduation."
            avatar="MR"
          />
          <TestimonialCard
            name="Priya Sharma"
            previousRole="HR Specialist"
            newRole="Data Analyst"
            timeline="10 months"
            quote="The AI tutor and community support made learning data science accessible. I went from zero coding to analyzing enterprise data at $105K."
            avatar="PS"
          />
        </div>
      </section>

      {/* NEW: Objection Crusher */}
      <ObjectionCrusher />

      {/* NEW: Comprehensive Faculty Grid */}
      <FacultyGrid />

      {/* Resource Center */}
      <section className="py-20 bg-[#0a1628] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16 bg-cyan-500"></div>
              <Sparkles className="text-cyan-400" size={20} />
              <span className="text-cyan-400 text-sm font-bold tracking-wider uppercase">Resource Center</span>
              <Sparkles className="text-cyan-400" size={20} />
              <div className="h-px w-16 bg-cyan-500"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Stay ahead of what&apos;s next
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Research and insights from tech experts and thought leaders
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <ResourceCard
              type="case-study"
              title="Sustainability Goes Local: Empowering Community Development"
              description="Tsinghua SEA hosts roundtable forum on local sustainability initiatives"
              image="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80"
              partner="TSEA"
            />
            <ResourceCard
              type="report"
              title="Happy Digital X 3.0: Transforming Urban Planning"
              description="HDX program facilitates integration across cohorts for sustainable planning"
              image="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80"
            />
            <ResourceCard
              type="case-study"
              title="United In Diversity: Forging Solutions Through Social Innovation"
              description="UID invites collaboration to address climate change and inequality"
              image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80"
              partner="UID"
            />
          </div>

          <div className="text-center">
            <button className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 flex items-center gap-2 mx-auto">
              <Sparkles size={18} />
              Explore all resources
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-purple-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Your Future Is Waiting. Start Today.
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join 1,100+ professionals who transformed their careers. No credit card required. Start learning in 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pathways"
              className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
            >
              Find Your Perfect Career Path
            </Link>
            <Link
              href="/login"
              className="border-2 border-white text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
