# The Case for Small Language Models in Southeast Asia

## Why the next wave of AI adoption won't come from frontier models

There's a problem nobody in the AI industry wants to talk about.

We've built these incredible frontier models — GPT-4o, Claude Opus, Gemini Ultra — that can write poetry, debug complex code, and reason through multi-step problems. They're genuinely impressive. I use them daily.

But here's what keeps me up at night: 70 million SMEs in Southeast Asia can't afford them.

Not "won't." Can't.

Let me show you the math. If you're a mid-size company in Jakarta doing 10 million tokens a month through a frontier API — that's maybe 500 customer support conversations, a few internal documents, some code generation — you're looking at $125 to $400 per month. That sounds manageable until you realize most SMEs in this region operate on margins where $400 a month is someone's salary.

And that's just the API cost. It doesn't include the engineering talent to integrate it, the compliance overhead of sending customer data to servers in Virginia, or the fact that when OpenAI has a bad day, your entire business stops working.

I've been in this industry for 25 years. I've seen enough cycles to know when we're building on someone else's foundation — and when that foundation can be pulled out from under you.

---

## The inference problem is getting worse, not better

Here's what the frontier model companies won't put in their pitch decks:

API pricing has stabilized, but it hasn't dropped the way compute costs historically drop. GPT-4o costs $2.50 per million input tokens and $10 per million output tokens. Claude Sonnet is $3 and $15. These prices haven't moved meaningfully in over a year.

Meanwhile, the demand is exploding. Every startup, every enterprise, every government agency wants to plug into these APIs. The result? Rate limits. Latency spikes. Outages that last hours. In March 2025, OpenAI had a 6-hour outage that took down thousands of dependent applications. Six hours. For businesses that had bet their entire customer experience on a single API endpoint.

I talked to a founder in Ho Chi Minh City who built her customer service chatbot on GPT-4. When the API went down during Vietnamese New Year — peak shopping season — she lost three days of sales. She told me: "I realized I was building my house on someone else's land."

Data sovereignty makes this worse. When a bank in Thailand sends customer queries to a US-hosted API, that data crosses multiple jurisdictions. Singapore's PDPA, Indonesia's PDP Law, Vietnam's Cybersecurity Law — they all have different rules about where personal data can go. Most frontier API providers can't tell you exactly which country your data is processed in at any given moment.

For enterprises, this is a dealbreaker. For government agencies, even more so.

---

## Small models are not small thinking

Here's where I push back on the industry narrative.

The AI world has a bias: bigger is better. More parameters, more compute, more data. The benchmarks that get attention — MMLU, HumanEval, GPQA — are designed to test frontier-level reasoning. When a 7-billion-parameter model scores 68% on MMLU versus GPT-4o's 88%, the headline is "small model lags behind."

But that framing misses the point entirely.

Most business tasks don't need frontier reasoning. A customer support chatbot doesn't need to solve PhD-level math. A document summarizer doesn't need to write poetry. A code assistant for a bootcamp student doesn't need to architect distributed systems.

What they need is: fast, cheap, reliable, and private.

That's what small language models deliver.

Consider what's happened in the last 18 months:

Microsoft's Phi-3 Mini (3.8 billion parameters) runs on a phone. Not "runs in the cloud and the phone talks to it" — actually runs on the device. No internet required. No API cost. No data leaving the building.

Meta's Llama 3.2 (1B and 3B variants) is open-weight, meaning anyone can download it, fine-tune it, and deploy it wherever they want. A university in Bandung can run it on a $500 laptop.

Google's Gemma 2 (2B and 9B) is competitive with models 5x its size on many real-world tasks.

Mistral's Small model delivers performance comparable to GPT-3.5 at a fraction of the cost, with full European data compliance.

And then there's the fine-tuning story. A small model fine-tuned on 5,000 examples of Indonesian customer support conversations will outperform GPT-4o on that specific task. Not because it's smarter — because it's specialized. I've seen this happen repeatedly: a 7B model, properly fine-tuned on domain-specific data, beats a general-purpose 175B model on the metrics that actually matter.

---

## What this means for Southeast Asia

Let me be specific about where SLMs change the game in this region.

### SMEs: AI without the subscription

There are roughly 70 million SMEs in Southeast Asia. They account for 99% of all businesses and contribute 40-50% of GDP in most ASEAN countries. Most of them have never used AI. Not because they don't want to — because the economics don't work.

An SLM deployed on a local server — or even on a decent laptop — changes the calculus entirely. A warung in Yogyakarta running a local Llama model for inventory management and customer WhatsApp responses. A garment factory in Ho Chi Minh City using a fine-tuned model for quality control documentation. A logistics company in Manila using an SLM to automate customs paperwork.

These aren't hypothetical. I've seen early versions of all three. The common thread: they needed a model that was cheap to run, worked offline, and didn't require sending business data overseas.

### Education: tutors that don't spy on students

This one is close to my heart.

AI tutoring has enormous potential. A patient, always-available tutor that adapts to each student's pace — that's transformative for education systems where teacher-to-student ratios are 1:40 or worse.

But the current approach — sending every student's question, every wrong answer, every moment of confusion to a US server — raises serious privacy concerns. These are children. Their learning data shouldn't be a product.

SLMs solve this. A school in rural Java can run a fine-tuned 3B model on a local server. The student data never leaves the building. The model can be tuned for Bahasa Indonesia, for the local curriculum, for the specific way students in that region struggle with fractions or algebra.

Cost matters here too. Indonesia has 50 million students in K-12. If each student generates 1,000 tokens per tutoring session, that's 50 billion tokens per session. At frontier API prices, that's $125,000 per session. For one day of tutoring. The economics are insane.

With an SLM running on school infrastructure: effectively zero marginal cost.

### Enterprise: internal tools without external dependency

Large companies in SEA — banks, telcos, logistics firms — are all experimenting with AI. Most are doing it through frontier APIs because that's what the consultants recommended.

The smarter ones are building internal SLM deployments. A Thai bank I spoke with runs a fine-tuned Llama model for internal document search and compliance checking. It processes sensitive financial documents that can never leave their network. The model runs on their own GPU cluster. Total monthly cost: the electricity.

A Malaysian logistics company uses an SLM for route optimization documentation — the model generates and updates SOPs based on operational data. Nothing leaves the building.

These companies aren't anti-frontier. They use GPT-4 and Claude for non-sensitive tasks where the reasoning capability matters. But for anything involving customer data, financial records, or proprietary information? SLM. Every time.

---

## The regenerative argument

I want to go beyond just cost savings. I think SLMs represent something more important for this region.

The current AI industry concentrates power in a handful of US companies. Every API call reinforces that concentration. Every startup that builds on GPT-4 is adding another brick to someone else's moat.

SLMs — especially open-weight ones — enable a different dynamic. They enable local ecosystems.

Imagine: a community of Indonesian developers fine-tunes a Llama model for Bahasa Indonesia legal documents. That model gets shared, improved, and adapted by lawyers, notaries, and legal tech companies across the archipelago. Jobs are created — model trainers, AI operations engineers, domain experts who curate training data. Economic value stays local.

Or: a Vietnamese university develops an SLM-based tutoring system for high school math. Other universities adapt it for physics, chemistry, biology. A local edtech company commercializes it. Students get better education. Teachers get better tools. The university gets licensing revenue. The edtech company creates jobs.

This is what I mean by regenerative AI. Not just efficiency — which often means fewer jobs — but ecosystem creation. AI that generates economic activity in the communities it serves, rather than extracting it.

The frontier model companies talk about "democratizing AI." But democratization doesn't mean giving everyone access to a $20/month API. It means giving everyone the ability to own, modify, and deploy AI on their own terms.

SLMs are how we get there.

---

## What needs to happen

Three things, if we're serious about this:

First, investment in local language fine-tuning. Most SLMs are trained primarily on English data. For SEA, we need models that understand Bahasa Indonesia, Vietnamese, Thai, Tagalog — not just at a conversational level, but at a professional level. This is tractable work. It doesn't require training from scratch. It requires curated datasets and fine-tuning infrastructure.

Second, infrastructure for deployment. SLMs need to run somewhere. For many SMEs, that means cloud GPU instances in-region — not in Virginia or Oregon. AWS, Google, and Azure all have SEA regions now, but the cost of GPU instances is still prohibitive for small businesses. We need shared inference infrastructure, community GPU clusters, or government-subsidized compute.

Third, education and awareness. Most business leaders in SEA think AI means "ChatGPT." They don't know that a 3-billion-parameter model can do 80% of what they need at 1% of the cost. The consulting firms selling them "AI transformation" packages have no incentive to tell them this — their margins depend on complexity.

I'm not anti-frontier. I use frontier models every day. They're incredible tools for complex reasoning, creative work, and tasks that genuinely need that level of capability.

But for the 70 million SMEs, the 50 million students, and the countless businesses in this region that need AI to be practical, affordable, and private — small language models are the answer.

The age of abundance might come someday. In the meantime, let's build AI that actually works for the people who need it most.

---

*Putra is a technology leader with 25+ years in the industry and 10+ years leading teams across Southeast Asia. He writes about AI democratization, regenerative technology, and practical AI for the masses. Find more at putra.io.*
