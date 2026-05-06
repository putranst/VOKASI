"use client";
import { useState } from "react";

const TIERS = [
  {
    name:"Free",
    price:"Rp 0",
    period:"forever",
    description:"Start your AI learning journey at no cost",
    cta:"Get Started",
    ctaHref:"/register",
    features:[
      "10 challenges per month",
      "Basic portfolio with watermark",
      "Community Socratic Circles",
      "Peer review (2/week)",
      "Email support",
    ],
    limitations:["No mentor matching","No sandbox access","No certificates","Basic analytics only"],
    highlight:false,
    badge:"",
  },
  {
    name:"Student Pro",
    price:"Rp 49.000",
    period:"per month",
    description:"For serious learners building job-ready AI skills",
    cta:"Start Pro",
    ctaHref:"/register?plan=pro",
    features:[
      "Unlimited challenges",
      "Full portfolio (no watermark)",
      "AI-powered mentor matching",
      "Python sandbox environment",
      "Blockchain certificates",
      "Advanced analytics + competency radar",
      "Priority support",
    ],
    limitations:[],
    highlight:true,
    badge:"Most Popular",
  },
  {
    name:"Institution",
    price:"Rp 15.000",
    period:"per student / semester",
    description:"Full platform for SMK, polytechnic, and university partnerships",
    cta:"Contact Sales",
    ctaHref:"mailto:sales@vokasi2.id",
    features:[
      "Everything in Student Pro",
      "LMS integration (Moodle, LMS)",
      "Instructor dashboard + tools",
      "Cohort management + analytics",
      "Custom challenge library",
      "SSO + roster sync",
      "Bulk certificate issuance",
      "Dedicated account manager",
    ],
    limitations:[],
    highlight:false,
    badge:"For Institutions",
  },
  {
    name:"Enterprise",
    price:"Custom",
    period:"annual contract",
    description:"White-label AI education platform for large organizations",
    cta:"Talk to Us",
    ctaHref:"mailto:enterprise@vokasi2.id",
    features:[
      "Everything in Institution",
      "Custom challenge domain",
      "Private mentor pool",
      "White-label option",
      "API access + webhooks",
      "SLA + 99.9% uptime",
      "On-premise deployment option",
      "Indonesian PDPA compliance",
    ],
    limitations:[],
    highlight:false,
    badge:"Custom",
  },
];

const FAQS = [
  { q:"Can I switch plans anytime?", a:"Yes. Upgrade instantly, downgrade at end of billing cycle. No lock-in." },
  { q:"What payment methods do you accept?", a:"GoPay, OVO, Dana, Bank Transfer (Indonesia). Credit card via Stripe for international." },
  { q:"Is there a free trial for Institution?", a:"Yes — 30-day free pilot for up to 50 students. No credit card required." },
  { q:"Do certificates have blockchain verification?", a:"Yes. Every certificate has a SHA-256 hash stored on-chain. Employers can verify at verifikasi.vokasi2.id." },
  { q:"What is the sandbox environment?", a:"Isolated Docker container with Python, Jupyter, and pre-installed ML libraries. Auto-terminates after 2 hours of inactivity." },
  { q:"Is VOKASI2 available in Bahasa Indonesia?", a:"Primary language is Bahasa Indonesia. English available as secondary language for international programs." },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="text-center py-20 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-medium mb-2">
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-bold text-white">
            Invest in your <span className="text-emerald-400">AI career</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            From free starter challenges to enterprise-grade AI education infrastructure.
            No hidden fees. Cancel anytime.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-slate-500"}`}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              className={`w-12 h-6 rounded-full transition-colors relative ${annual ? "bg-emerald-500" : "bg-slate-700"}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-white" : "text-slate-500"}`}>Annual</span>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Save 20%</span>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {TIERS.map(tier => (
            <div key={tier.name}
              className={`rounded-2xl p-6 flex flex-col relative ${
                tier.highlight
                  ? "bg-gradient-to-b from-emerald-500/10 to-slate-900 border-2 border-emerald-500/40"
                  : "bg-slate-900 border border-slate-800 hover:border-slate-700"
              } transition-all`}>
              {tier.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold ${tier.highlight ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                  {tier.badge}
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-3xl font-bold text-white">{tier.price}</span>
                  <span className="text-slate-500 text-sm mb-1">/{tier.period}</span>
                </div>
                <p className="text-slate-400 text-sm mt-2">{tier.description}</p>
              </div>
              <a href={tier.ctaHref}
                className={`w-full text-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors mb-6 ${
                  tier.highlight
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}>
                {tier.cta}
              </a>
              <div className="space-y-2 flex-1">
                {tier.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    <span className="text-slate-300">{f}</span>
                  </div>
                ))}
                {tier.limitations.map(l => (
                  <div key={l} className="flex items-start gap-2.5 text-sm">
                    <span className="text-slate-600 mt-0.5 shrink-0">·</span>
                    <span className="text-slate-600">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-slate-800 rounded-xl overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-900 transition-colors">
                <span className="font-medium text-white text-sm">{faq.q}</span>
                <span className={`text-slate-400 text-lg transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-16 px-4 bg-gradient-to-t from-emerald-500/5 to-transparent border-t border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-3">Ready to start learning?</h2>
        <p className="text-slate-400 mb-6">Join thousands of Indonesian students building job-ready AI skills</p>
        <div className="flex gap-3 justify-center">
          <a href="/register" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">Get Started Free</a>
          <a href="/demo" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors border border-slate-700">Request Demo</a>
        </div>
      </section>
    </div>
  );
}
