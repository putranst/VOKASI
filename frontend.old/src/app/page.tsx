'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Users, Award, TrendingUp, BrainCircuit, MessageCircle } from 'lucide-react';

// New Components
import { HeroSlider } from '@/components/ui/HeroSlider';
import { T6Difference } from '@/components/ui/T6Difference';
import { CareerShowcase } from '@/components/ui/CareerShowcase';
import { ObjectionCrusher } from '@/components/ui/ObjectionCrusher';

// Existing Components  
import { SuccessStatsCard } from '@/components/ui/SuccessStatsCard';
import { TestimonialCard } from '@/components/ui/TestimonialCard';
import { ResourceCard } from '@/components/ui/ResourceCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-slate-800 selection:bg-primary selection:text-white font-sans w-full max-w-[100vw] overflow-x-hidden">
      <Navbar />

      {/* NEW: Dual Hero Slider (Ekspedisi AI + VOKASI Platform) */}
      <HeroSlider />

      {/* Trusted Partner Logos - Enhanced */}
      <div className="border-y border-gray-200 bg-white">
        <div className="max-w-[70rem] mx-auto px-4 py-6 sm:py-10">
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide">Trusted by World-Class Institutions</p>
          </div>
          <div className="flex gap-4 sm:gap-8 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 sm:flex-wrap sm:justify-center md:justify-between items-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <span className="text-base sm:text-xl font-bold text-primary whitespace-nowrap">Kemendikbudristek</span>
            <span className="text-base sm:text-xl font-sans font-black text-[#1a1a1a] tracking-tighter whitespace-nowrap">MIT<span className="font-light">Sloan</span></span>
            <span className="text-base sm:text-xl font-bold text-gray-700 whitespace-nowrap">BNSP</span>
            <span className="text-base sm:text-xl font-mono font-bold text-gray-600 whitespace-nowrap">GOVTECH</span>
            <span className="text-base sm:text-xl font-bold text-green-700 tracking-tight whitespace-nowrap">UN SDSN</span>
          </div>
        </div>
      </div>

      {/* NEW: The VOKASI Difference - Value Proposition */}
      <T6Difference />

      {/* NEW: Career Showcase with Salaries */}
      <CareerShowcase />

      {/* AI-Powered Learning Section - Streamlined */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <div className="max-w-[70rem] mx-auto px-4">
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
                    I'm stuck in the Reflection phase - how do I identify my knowledge gaps?
                  </p>
                </div>
                <div className="bg-primary/10 rounded-2xl p-4 ml-4">
                  <p className="text-sm text-gray-800">
                    Great question! In the Reflection phase, let's map your Q (what you know) vs P (what you need). What SFIA skills are you targeting? 🤔
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button className="text-xs bg-white px-3 py-1.5 rounded-full border border-gray-300 hover:border-primary transition-colors font-medium">
                      Gap Analysis
                    </button>
                    <button className="text-xs bg-white px-3 py-1.5 rounded-full border border-gray-300 hover:border-primary transition-colors font-medium">
                      SFIA Mapping
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
        <div className="max-w-[70rem] mx-auto px-4">
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
      <section className="py-20 max-w-[70rem] mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Student Success Stories</h2>
          <p className="text-gray-600 text-lg">Real transformations from the VOKASI community</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            name="Sarah Chen"
            previousRole="Marketing Manager"
            newRole="AI Product Manager"
            timeline="8 months"
            quote="The IRIS Cycle helped me bridge my marketing background with technical AI skills. Now I'm leading AI product strategy at a major tech company at $145K."
            avatar="SC"
          />
          <TestimonialCard
            name="Miguel Rodriguez"
            previousRole="Teacher"
            newRole="EdTech Developer"
            timeline="6 months"
            quote="VOKASI's project-based approach was perfect for my learning style. I built 4 real applications and landed my dream job before graduation."
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

      {/* Resource Center */}
      <section className="py-20 bg-[#0a1628] text-white overflow-hidden">
        <div className="max-w-[70rem] mx-auto px-4">
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
              title="From SMK to Startup: How AI Skills Are Reshaping Indonesian Careers"
              description="VOKASI graduates from vocational schools are landing roles in AI-driven industries — here's how structured upskilling made the difference."
              image="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
              partner="VOKASI"
              link="/blog/smk-to-startup-ai-careers"
            />
            <ResourceCard
              type="report"
              title="State of AI Readiness in Indonesian Vocational Education 2025"
              description="A nationwide snapshot of AI literacy, digital skills gaps, and how politeknik and BLK institutions are responding with new curricula."
              image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
              partner="VOKASI"
              link="/blog/ai-readiness-indonesian-vocational-education-2025"
            />
            <ResourceCard
              type="case-study"
              title="Building AI-Native Courses in Under 10 Minutes with VOKASI"
              description="Instructors across Indonesia are using VOKASI's AI course generator to create Bloom's Taxonomy-aligned, SFIA-mapped courses at unprecedented speed."
              image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80"
              partner="VOKASI"
              link="/blog/building-ai-courses-with-vokasi"
            />
          </div>

          <div className="text-center">
            <Link href="/blog" className="bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-4 rounded-lg font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/50 inline-flex items-center gap-2">
              <Sparkles size={18} />
              Explore all insights
            </Link>
          </div>
        </div>
      </section>

      {/* Desktop/Mobile Learning Section - Exact Clone Style */}
      <section className="py-16 bg-[#0a1628] text-white overflow-hidden">
        <div className="relative">
          {/* Full-width container with overflow visible for edge images */}
          <div className="max-w-[90rem] mx-auto px-4 relative">
            <div className="flex items-center justify-between gap-8">

              {/* Left - Desktop Browser (positioned to left edge) */}
              <div className="hidden lg:block flex-shrink-0 w-[320px] relative -ml-20">
                <div className="rounded-lg overflow-hidden shadow-2xl border border-white/10 bg-[#1e293b] transform -rotate-1">
                  {/* Browser Header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#0f172a] border-b border-white/10">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 ml-2">
                      <span>📁 Course Outline</span>
                      <span className="text-amber-400">⚡ Daily XP 450</span>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-[10px] bg-slate-700 px-2 py-0.5 rounded text-cyan-300">
                      ☀ Light mode
                    </div>
                  </div>
                  {/* IDE Content */}
                  <div className="p-3 font-mono text-[10px] leading-relaxed bg-[#1a2744]">
                    <div className="text-cyan-400 mb-1">with variables</div>
                    <div className="text-gray-500 text-[9px] mb-3"># Create a first variable saves<br /># Modify existing ARRAY for more flexibility</div>
                    <div className="text-purple-400 mb-1">calc_savings_multiplier</div>
                    <div className="text-gray-400 mb-1">= 1.1</div>
                    <div className="text-gray-500 mt-3">me!!</div>
                    <div className="mt-2">
                      <span className="text-purple-400">* growth_multiplier</span>
                      <span className="text-gray-400"> = 7</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="px-2 py-1 bg-slate-700 rounded text-[9px] text-gray-300">↻ Reset</button>
                      <button className="px-2 py-1 bg-slate-700 rounded text-[9px] text-gray-300">Run Code</button>
                      <button className="px-3 py-1 bg-cyan-500 rounded text-[9px] text-white font-bold">Submit Answer</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center - Text Content */}
              <div className="flex-1 text-center py-8 max-w-xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 italic leading-tight">
                  Switch between desktop and<br />mobile to continue learning
                </h2>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  Unlock skills faster in the VOKASI Mobile app by practicing code, watching videos, and keeping your streak alive!
                </p>
                <p className="text-cyan-400 font-semibold text-sm mb-6">Download the VOKASI app.</p>

                {/* App Store Buttons - Exact Style */}
                <div className="flex gap-3 justify-center">
                  <a href="#" className="flex items-center gap-2 bg-black border border-white/30 rounded-lg px-4 py-2 hover:bg-white/10 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] text-gray-400 leading-none">Download on the</div>
                      <div className="text-sm font-semibold leading-tight">App Store</div>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-2 bg-black border border-white/30 rounded-lg px-4 py-2 hover:bg-white/10 transition-all">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    <div className="text-left">
                      <div className="text-[9px] text-gray-400 leading-none">GET IT ON</div>
                      <div className="text-sm font-semibold leading-tight">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right - Mobile Phones (positioned to right edge) */}
              <div className="hidden lg:flex flex-shrink-0 w-[380px] relative -mr-20 gap-3 items-end">
                {/* Phone 1 - Main */}
                <div className="w-44 bg-[#1a2744] rounded-3xl p-2 shadow-2xl border border-white/10 transform rotate-1">
                  <div className="bg-[#0f172a] rounded-2xl overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-3 py-1 text-[8px] text-white">
                      <span>09:41</span>
                      <div className="flex gap-1 items-center">
                        <span>📶</span><span>🔋</span>
                      </div>
                    </div>
                    {/* App Content */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-[8px]">▶</div>
                        <div className="text-[8px]">
                          <div className="text-gray-400">DATA K</div>
                          <div className="text-amber-400">✨ 122</div>
                        </div>
                        <div className="ml-auto flex gap-1">
                          <div className="w-5 h-5 bg-amber-500 rounded-full text-[6px] flex items-center justify-center">🏆</div>
                          <div className="w-5 h-5 bg-green-500 rounded-full text-[6px] flex items-center justify-center">⚡</div>
                          <div className="w-5 h-5 bg-blue-500 rounded-full text-[6px] flex items-center justify-center">📊</div>
                        </div>
                      </div>
                      <div className="text-center mb-3">
                        <div className="text-[9px] text-gray-400 mb-1">Introduction to Data</div>
                        <div className="text-[10px] font-bold">Visualization with Seaborn</div>
                        <div className="text-[8px] text-gray-500">Data Analysis in Python</div>
                      </div>
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <span className="text-white text-lg">📊</span>
                      </div>
                      <button className="w-full bg-cyan-500 text-white text-[9px] font-bold py-2 rounded-lg">
                        Continue Learning
                      </button>
                      <div className="flex justify-around mt-3 text-[7px] text-gray-500">
                        <div className="text-center">
                          <div>📚</div>
                          <div>Flashcards</div>
                        </div>
                        <div className="text-center">
                          <div>💪</div>
                          <div>Practice</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phone 2 - Secondary */}
                <div className="w-40 bg-[#1a2744] rounded-3xl p-2 shadow-2xl border border-white/10 transform -rotate-2 translate-y-4">
                  <div className="bg-[#0f172a] rounded-2xl overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-3 py-1 text-[8px] text-white">
                      <span>09:41</span>
                      <div className="flex gap-1 items-center">
                        <span>📶</span><span>🔋</span>
                      </div>
                    </div>
                    {/* App Content - Exercise View */}
                    <div className="p-2">
                      <div className="flex gap-1 mb-2">
                        <div className="px-2 py-0.5 bg-slate-700 rounded text-[7px]">Exercise</div>
                        <div className="px-2 py-0.5 bg-cyan-600 rounded text-[7px]">Code</div>
                      </div>
                      <div className="text-[8px] text-gray-400 mb-2">Instructions</div>
                      <div className="text-[7px] text-gray-300 mb-2 leading-relaxed">
                        • Create a variable <span className="text-cyan-400">savings</span> with the value<br />
                        <span className="text-amber-400 ml-2">of 100</span><br />
                        • Check out this variable by typing<br />
                        <span className="text-cyan-400 ml-2">print(savings)</span> in the script
                      </div>
                      <div className="bg-slate-800 rounded p-1 text-[7px] font-mono">
                        <div className="text-gray-500"># Create a variable savings</div>
                        <div><span className="text-purple-400">savings</span> = <span className="text-amber-400">100</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
