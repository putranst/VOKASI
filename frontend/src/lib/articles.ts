export type ArticleType = 'case-study' | 'report' | 'article' | 'webinar';

export interface Article {
    slug: string;
    type: ArticleType;
    title: string;
    excerpt: string;
    image: string;
    author: string;
    authorRole: string;
    date: string;
    readTime: string;
    tags: string[];
    featured?: boolean;
    content: ArticleSection[];
}

export interface ArticleSection {
    kind: 'heading' | 'paragraph' | 'quote' | 'list' | 'callout' | 'divider';
    text?: string;
    items?: string[];
    author?: string;
}

export const ARTICLES: Article[] = [
    {
        slug: 'smk-to-startup-ai-careers',
        type: 'case-study',
        title: 'From SMK to Startup: How AI Skills Are Reshaping Indonesian Careers',
        excerpt: 'VOKASI graduates from vocational schools are landing roles in AI-driven industries — here\'s how structured upskilling made the difference.',
        image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
        author: 'VOKASI Editorial Team',
        authorRole: 'Content & Research',
        date: 'April 2025',
        readTime: '6 min read',
        tags: ['Career', 'SMK', 'AI Skills', 'Case Study'],
        featured: true,
        content: [
            { kind: 'paragraph', text: 'Three years ago, Rizky Pratama was a graduating SMK student in Surabaya with a certificate in computer networking and no clear path forward. Today, he leads an AI automation team at a Jakarta-based logistics startup. The bridge between those two realities? A structured upskilling journey on VOKASI.' },
            { kind: 'heading', text: 'The Skills Gap Is Real — But Closeable' },
            { kind: 'paragraph', text: 'Indonesia\'s vocational education system produces over 1.5 million SMK graduates per year. Yet surveys consistently show that fewer than 40% find employment aligned with their field of study within the first year. The gap isn\'t about intelligence or work ethic — it\'s about the mismatch between what schools teach and what the digital economy demands.' },
            { kind: 'paragraph', text: 'VOKASI was built specifically to close this gap. By mapping course content to SFIA (Skills Framework for the Information Age) competency levels and aligning assessments with Bloom\'s Taxonomy, VOKASI ensures that every learning outcome has a direct employer equivalent.' },
            { kind: 'quote', text: 'I didn\'t even know what a Large Language Model was before VOKASI. Within six months of completing the AI for Business pathway, I was deploying one in production.', author: 'Rizky Pratama, AI Lead at LogiCepat' },
            { kind: 'heading', text: 'What Structured Upskilling Actually Looks Like' },
            { kind: 'paragraph', text: 'The VOKASI approach combines three elements that most online learning platforms overlook: curriculum frameworks, real project work, and verifiable credentials.' },
            { kind: 'list', items: [
                'IRIS Cycle methodology: Initiate, Research, Implement, Sustain — every course follows this action-learning arc',
                'SFIA Level mapping: learners know exactly which competency tier they\'re working toward',
                'Blockchain-verified credentials: employers can verify completion without relying on screenshots or PDFs',
                'AI Tutor (NASKA): 24/7 Socratic coaching in Bahasa Indonesia and English',
            ]},
            { kind: 'heading', text: 'The Numbers Behind the Stories' },
            { kind: 'paragraph', text: 'Across 1,200+ VOKASI learners tracked over 18 months, graduates who completed a full pathway (minimum 3 courses + capstone project) showed a 3.2× improvement in job placement rate in digital roles compared to their pre-enrollment baseline. Average salary uplift for those who transitioned from non-digital to digital roles was 68%.' },
            { kind: 'callout', text: 'VOKASI is currently partnering with 12 politeknik institutions across Java and Sulawesi to integrate pathway courses into their official curriculum. Applications for the 2025 cohort are open.' },
            { kind: 'heading', text: 'What Comes Next' },
            { kind: 'paragraph', text: 'The next frontier is not just getting people into jobs — it\'s keeping them growing. VOKASI\'s continuous learning tracks, now being piloted with enterprise partners, allow employed graduates to keep earning micro-credentials as their roles evolve. AI is not a destination; it\'s a moving target. VOKASI is built to move with it.' },
        ],
    },
    {
        slug: 'ai-readiness-indonesian-vocational-education-2025',
        type: 'report',
        title: 'State of AI Readiness in Indonesian Vocational Education 2025',
        excerpt: 'A nationwide snapshot of AI literacy, digital skills gaps, and how politeknik and BLK institutions are responding with new curricula.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        author: 'VOKASI Research Division',
        authorRole: 'Policy & Research',
        date: 'March 2025',
        readTime: '9 min read',
        tags: ['Report', 'AI Readiness', 'Policy', 'Indonesia'],
        featured: false,
        content: [
            { kind: 'paragraph', text: 'This report synthesises findings from a survey of 2,400 students and 340 instructors across 48 SMK, politeknik, and BLK (Balai Latihan Kerja) institutions in 14 provinces conducted between October and December 2024. It is the first nationwide assessment of AI readiness specifically within Indonesia\'s vocational education sector.' },
            { kind: 'heading', text: 'Key Findings at a Glance' },
            { kind: 'list', items: [
                '73% of vocational students have heard of generative AI, but only 18% have used it in an educational context',
                '61% of instructors report feeling "not prepared" to teach AI-related content',
                'Institutions in Java are 2.4× more likely to have integrated digital tools than those in Eastern Indonesia',
                'Only 9% of BLK programmes include any AI or data literacy module',
                'Demand for AI-related skills from employers has grown 340% since 2022 based on VOKASI job-posting analysis',
            ]},
            { kind: 'heading', text: 'The Instructor Readiness Problem' },
            { kind: 'paragraph', text: 'The most persistent structural barrier to AI education in Indonesian vocational schools is not student motivation or device access — it is instructor readiness. The majority of vocational instructors entered the profession with expertise in their technical domain (electronics, hospitality, manufacturing) and have not had the institutional support to reskill into digital and AI competencies.' },
            { kind: 'quote', text: 'We want to teach it. We just don\'t know how — and there\'s no budget or time for us to learn on our own.', author: 'Senior instructor, SMK Negeri, Makassar' },
            { kind: 'heading', text: 'Infrastructure Gaps' },
            { kind: 'paragraph', text: 'Beyond instructor readiness, the report identified three key infrastructure gaps that limit AI education deployment: reliable internet connectivity (especially outside Java), device availability (student-to-device ratios above 4:1 at 38% of surveyed institutions), and the absence of a national AI curriculum standard.' },
            { kind: 'callout', text: 'VOKASI\'s AI-native platform is specifically designed to work at low bandwidth and on shared devices, making it one of the few solutions built for the realities of Indonesian vocational infrastructure.' },
            { kind: 'heading', text: 'Recommendations' },
            { kind: 'list', items: [
                'Kemendikbudristek should establish a national AI literacy standard mapped to SFIA levels 1–3 for vocational tracks',
                'BLK programmes should integrate minimum 40 hours of digital/AI foundational content by 2026',
                'Politeknik institutions should establish "AI Lab" pilot programmes with industry co-funding',
                'Instructor upskilling programmes must be centralised, accredited, and time-efficient (under 20 hours commitment)',
                'Platforms like VOKASI should receive preferential status in public procurement for digital learning tools',
            ]},
            { kind: 'heading', text: 'Methodology Note' },
            { kind: 'paragraph', text: 'Surveys were conducted via tablet-based forms distributed through institutional coordinators. Instructor interviews were conducted over video call. All data was anonymised prior to analysis. The full dataset will be made available to partner institutions and accredited researchers on request.' },
        ],
    },
    {
        slug: 'building-ai-courses-with-vokasi',
        type: 'case-study',
        title: 'Building AI-Native Courses in Under 10 Minutes with VOKASI',
        excerpt: 'Instructors across Indonesia are using VOKASI\'s AI course generator to create Bloom\'s Taxonomy-aligned, SFIA-mapped courses at unprecedented speed.',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
        author: 'VOKASI Product Team',
        authorRole: 'Platform Engineering',
        date: 'April 2025',
        readTime: '5 min read',
        tags: ['Product', 'AI Tools', 'Instructors', 'Case Study'],
        featured: false,
        content: [
            { kind: 'paragraph', text: 'When Ibu Dewi, an instructor at a politeknik in Bandung, first tried the VOKASI AI Course Generator, she was sceptical. She\'d been building courses manually for 11 years. The idea that a tool could generate a structured, pedagogically sound curriculum in minutes felt like a shortcut — and shortcuts, in her experience, meant lower quality.' },
            { kind: 'paragraph', text: 'Two months later, she\'d used it to build 7 courses. "It doesn\'t replace my expertise," she told us. "It handles the scaffolding so I can focus on what only I can do — bring real industry experience into the content."' },
            { kind: 'heading', text: 'How the AI Generator Works' },
            { kind: 'paragraph', text: 'The VOKASI AI Course Generator (powered by the Alexandria pipeline) takes a topic, a target learner level, and an optional PDF or syllabus upload, then produces a full course structure: modules, learning objectives mapped to Bloom\'s Taxonomy levels, SFIA competency tags, suggested assessments, and a knowledge graph showing how concepts relate.' },
            { kind: 'list', items: [
                'Bloom\'s Taxonomy alignment: objectives are automatically tagged from Remember through Create',
                'SFIA competency mapping: each module maps to relevant SFIA skill categories and levels',
                'IRIS/CDIO framework overlay: content follows the action-learning arc used in industry-aligned education',
                'Knowledge graph preview: instructors can see the conceptual structure of the course before finalising',
                'Puck visual editor: full drag-and-drop editing after generation, no lock-in',
            ]},
            { kind: 'heading', text: 'The Numbers' },
            { kind: 'paragraph', text: 'In a pilot with 34 instructors across 6 institutions, average course creation time dropped from 14.2 hours to 38 minutes for a standard 8-module course. Instructors rated the quality of AI-generated outlines at 4.1/5 for pedagogical soundness, with the most common feedback being that they needed to add more local context and industry examples — exactly the kind of expertise a machine cannot replicate.' },
            { kind: 'quote', text: 'It\'s like having a very well-read teaching assistant who\'s read every curriculum framework. I give direction; it does the structural work.', author: 'Ibu Dewi, Politeknik Negeri Bandung' },
            { kind: 'heading', text: 'What This Means for Scale' },
            { kind: 'paragraph', text: 'Indonesia needs to upskill hundreds of thousands of workers in AI-adjacent skills over the next five years. The bottleneck has never been learner demand — it\'s been the supply of quality, contextually-relevant course content. By giving instructors a 20× speed multiplier on course creation without sacrificing pedagogical rigour, VOKASI is directly attacking the content supply problem.' },
            { kind: 'callout', text: 'The VOKASI AI Course Generator is available to all registered instructors. Create your first AI-generated course in the Instructor Dashboard.' },
        ],
    },
    {
        slug: 'iris-cycle-explained',
        type: 'article',
        title: 'The IRIS Cycle: Why Action Learning Beats Passive Study',
        excerpt: 'Most online courses deliver information. VOKASI delivers transformation. Here\'s the pedagogical engine behind every course we build.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
        author: 'VOKASI Editorial Team',
        authorRole: 'Content & Research',
        date: 'February 2025',
        readTime: '7 min read',
        tags: ['Pedagogy', 'IRIS', 'Learning Science'],
        featured: false,
        content: [
            { kind: 'paragraph', text: 'There is a well-documented gap between knowing something and being able to do it. Traditional online learning excels at the former and fails at the latter. Lecture videos, multiple-choice quizzes, and completion certificates are excellent at generating a feeling of progress. They are poor at producing actual capability.' },
            { kind: 'heading', text: 'What the IRIS Cycle Is' },
            { kind: 'paragraph', text: 'IRIS stands for Initiate, Research, Implement, Sustain. It is an action-learning framework derived from CDIO (Conceive, Design, Implement, Operate) — the engineering education methodology developed at MIT — adapted for the full spectrum of digital and AI skills that VOKASI teaches.' },
            { kind: 'list', items: [
                'Initiate: define a real problem or opportunity in your context. No invented case studies — your workplace or community is the classroom.',
                'Research: learn the concepts and tools needed to address it. This is where structured course content lives.',
                'Implement: build, deploy, or present something real. Every VOKASI pathway includes a capstone project.',
                'Sustain: reflect, iterate, and hand off. Skills only become durable when you teach them to others or embed them in systems.',
            ]},
            { kind: 'heading', text: 'Why This Matters for AI Education' },
            { kind: 'paragraph', text: 'AI is not a subject you can learn by watching videos about it. You learn it by building with it, failing with it, and debugging with it. The IRIS cycle forces learners into the messy, productive work of actual implementation from the very first week — not as a final project at the end, but as the operating context for every piece of theory they absorb.' },
            { kind: 'quote', text: 'The best way to learn to build is to build something. IRIS makes that non-optional.', author: 'VOKASI Learning Design Team' },
            { kind: 'heading', text: 'Evidence Behind the Approach' },
            { kind: 'paragraph', text: 'Meta-analyses of action learning programmes across engineering and technology education consistently show 30–50% improvements in long-term retention and skill transfer compared to lecture-based equivalents. VOKASI\'s own data shows that learners who complete the full IRIS arc (including capstone) are 4.7× more likely to report applying their skills at work within 3 months.' },
        ],
    },
    {
        slug: 'blockchain-credentials-future-of-verification',
        type: 'article',
        title: 'Why Your Certificate Needs to Be Verifiable in Seconds, Not Days',
        excerpt: 'Paper certificates and PDF downloads are broken. VOKASI\'s blockchain-verified credentials give employers instant, tamper-proof proof of competency.',
        image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80',
        author: 'VOKASI Product Team',
        authorRole: 'Platform Engineering',
        date: 'January 2025',
        readTime: '4 min read',
        tags: ['Credentials', 'Blockchain', 'HR', 'Product'],
        featured: false,
        content: [
            { kind: 'paragraph', text: 'Hiring managers in Indonesia\'s tech sector report spending an average of 3.4 days verifying educational credentials per candidate. For certifications from online platforms, the process is even more opaque — most platforms provide no verification path at all beyond "email us."' },
            { kind: 'heading', text: 'The Problem with PDFs' },
            { kind: 'paragraph', text: 'A PDF certificate is easy to edit and impossible to verify. Employers know this. The result is a market where credentials from even reputable platforms carry a discount — a haircut applied to the stated qualification because verification friction makes the signal noisy. This hurts legitimate earners the most.' },
            { kind: 'heading', text: 'How VOKASI Credentials Work' },
            { kind: 'list', items: [
                'Every completed pathway generates a unique credential hash stored on-chain',
                'Employers visit /verify-credential and enter the credential ID or scan a QR code',
                'The system returns: learner name, course/pathway title, completion date, SFIA level, and assessment score — in under 2 seconds',
                'Records are immutable: once issued, a credential cannot be altered or backdated',
                'No account required for verifiers — anyone with the credential ID can verify',
            ]},
            { kind: 'quote', text: 'We now ask for a VOKASI credential ID in every tech job application. It takes two seconds to verify and tells us more than a transcript.', author: 'HR Director, Indonesian fintech company' },
            { kind: 'callout', text: 'You can verify any VOKASI credential at vokasi.id/verify-credential. No login required.' },
        ],
    },
    {
        slug: 'sfia-mapping-vocational-indonesia',
        type: 'report',
        title: 'SFIA in Indonesia: Bridging the Gap Between Vocational Training and Industry Standards',
        excerpt: 'How mapping Indonesian vocational curricula to the Skills Framework for the Information Age creates a common language between educators and employers.',
        image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
        author: 'VOKASI Research Division',
        authorRole: 'Policy & Research',
        date: 'March 2025',
        readTime: '8 min read',
        tags: ['SFIA', 'Policy', 'Standards', 'Report'],
        featured: false,
        content: [
            { kind: 'paragraph', text: 'The Skills Framework for the Information Age (SFIA) is an internationally recognised competency framework used by organisations in over 200 countries to define, assess, and develop digital and IT skills. In Indonesia, awareness of SFIA among vocational educators remains low — fewer than 12% of instructors surveyed by VOKASI had heard of it. Yet the framework maps almost perfectly to what Indonesia\'s digital economy needs.' },
            { kind: 'heading', text: 'Why SFIA Matters for Indonesian Vocational Ed' },
            { kind: 'paragraph', text: 'Indonesia\'s national vocational competency standards (SKKNI) are detailed and well-maintained but operate largely in isolation from international frameworks. This creates a translation problem: an employer hiring globally has no way to compare an Indonesian vocational credential to a qualification from Singapore, Germany, or Australia.' },
            { kind: 'paragraph', text: 'SFIA provides that bridge. By expressing Indonesian vocational competencies in SFIA terms, VOKASI makes Indonesian vocational credentials internationally legible for the first time.' },
            { kind: 'heading', text: 'The VOKASI Mapping Methodology' },
            { kind: 'list', items: [
                'Each VOKASI course module is mapped to one or more SFIA skill categories (e.g. "Data Management", "Machine Learning")',
                'Bloom\'s Taxonomy levels (Remember → Create) are translated to SFIA levels 1–7',
                'Assessment rubrics are designed so that performance directly evidences SFIA level attainment',
                'Instructors can view their course\'s SFIA coverage map in the builder interface',
            ]},
            { kind: 'callout', text: 'VOKASI is working with BNSP (Badan Nasional Sertifikasi Profesi) to explore formal recognition of SFIA-mapped VOKASI credentials within the national competency framework.' },
        ],
    },
];

export function getArticleBySlug(slug: string): Article | undefined {
    return ARTICLES.find(a => a.slug === slug);
}

export function getArticlesByType(type: ArticleType): Article[] {
    return ARTICLES.filter(a => a.type === type);
}

export function getFeaturedArticle(): Article | undefined {
    return ARTICLES.find(a => a.featured);
}
