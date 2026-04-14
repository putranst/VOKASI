import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Award,
    Users,
    Search,
    Menu,
    X,
    ChevronRight,
    PlayCircle,
    CheckCircle,
    Globe,
    Cpu,
    Shield,
    BarChart2,
    Briefcase,
    MessageSquare,
    Hexagon,
    Zap,
    LayoutGrid,
    Video,
    Star,
    TrendingUp,
    Monitor,
    FileText,
    Layers,
    Coffee
} from 'lucide-react';

// --- Brand Identity: T6 Enterprise ---
// Font: Lato (Matches Connex.tsea.asia)
// Colors: Tobacco Brown (#6C5948), Tsinghua Purple (#663399), Dusty Gray (#969696)

const BRAND = {
    primary: "#6C5948", // Tobacco Brown
    secondary: "#663399", // Tsinghua Purple
    accent: "#D4AF37", // Gold
    dark: "#1a1a1a",
    bg: "#FAFAFA"
};

// --- Mock Data ---

const CATEGORIES = [
    "Sustainable Development", "Public Policy", "Data & AI", "Business Leadership", "Urban Planning", "Green Finance"
];

const TABBED_COURSES = {
    "Sustainable Development": [
        {
            id: 1,
            title: "Circular Economy Models for SMEs",
            instructor: "UID Expert Panel",
            org: "United in Diversity",
            rating: 4.8,
            students: "12k",
            image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=600&q=80",
            tag: "Bestseller",
            level: "Beginner"
        },
        {
            id: 2,
            title: "Blue Carbon: Marine Conservation Strategies",
            instructor: "Prof. Lin",
            org: "Tsinghua SEA",
            rating: 4.9,
            students: "8.5k",
            image: "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&w=600&q=80",
            tag: "New",
            level: "Advanced"
        },
        {
            id: 3,
            title: "Renewable Energy Transitions",
            instructor: "Dr. Sarah Jenkins",
            org: "MIT Sloan",
            rating: 4.7,
            students: "15k",
            image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80",
            tag: "Trending",
            level: "Intermediate"
        },
        {
            id: 4,
            title: "ESG Reporting Standards 2025",
            instructor: "Finance Ministry",
            org: "GovTech",
            rating: 4.9,
            students: "22k",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
            tag: "Essential",
            level: "Executive"
        }
    ],
    "Public Policy": [
        {
            id: 5,
            title: "AI Governance for Policymakers",
            instructor: "GovTech Institute",
            org: "T6 Public",
            rating: 4.9,
            students: "9k",
            image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&q=80",
            tag: "Updated",
            level: "Executive"
        },
    ]
};

const PATHWAYS = [
    {
        title: "Chief Sustainability Officer",
        subtitle: "Orchestrate green transformation.",
        courses: 6,
        duration: "3 Months",
        partner: "MIT Sloan & UID",
        icon: Globe,
        color: "text-green-600",
        bg: "bg-green-50"
    },
    {
        title: "Smart City Architect",
        subtitle: "Design the cities of tomorrow.",
        courses: 8,
        duration: "4 Months",
        partner: "Tsinghua Architecture",
        icon: Hexagon,
        color: "text-[#663399]",
        bg: "bg-purple-50"
    },
    {
        title: "Tri-Sector Mediator",
        subtitle: "Bridge Govt, Business & Civil Society.",
        courses: 5,
        duration: "2.5 Months",
        partner: "United in Diversity",
        icon: Users,
        color: "text-[#6C5948]",
        bg: "bg-[#6C5948]/10"
    }
];

// --- Components ---

const Logo = ({ dark = false }) => (
    <div className="flex items-center gap-3 tracking-tight select-none group cursor-pointer">
        <div className="relative w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-105">
            {/* Abstract Hexahelix Icon */}
            <Hexagon className={dark ? "text-white" : "text-[#6C5948]"} strokeWidth={1.5} size={36} />
            <Hexagon className={`absolute inset-0 rotate-90 opacity-60 ${dark ? "text-gray-400" : "text-[#663399]"}`} strokeWidth={1.5} size={36} />
            <span className={`font-bold text-sm relative z-10 ${dark ? "text-white" : "text-gray-800"}`}>T6</span>
        </div>
        <span className={`font-bold text-xl ${dark ? "text-white" : "text-gray-900"}`}>TSEA-X</span>
    </div>
);

const NavItem = ({ label, active }) => (
    <a
        href="#"
        className={`text-sm font-bold transition-colors ${active ? 'text-[#6C5948]' : 'text-gray-600 hover:text-[#6C5948]'
            }`}
    >
        {label}
    </a>
);

const StarRating = ({ rating, count }) => (
    <div className="flex items-center gap-1 text-xs font-bold">
        <span className="text-[#6C5948] mr-1">{rating}</span>
        <div className="flex text-[#D4AF37]">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} fill={i < Math.floor(rating) ? "currentColor" : "none"} />
            ))}
        </div>
        <span className="text-gray-400 font-normal ml-1">({count})</span>
    </div>
);

const CourseCard = ({ course }) => (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-[#6C5948]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 cursor-pointer flex flex-col h-full">
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/0 group-hover:bg-gray-900/10 transition-colors z-10" />
            <img src={course.image} alt={course.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#6C5948] shadow-sm">
                {course.level}
            </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <p className="text-[11px] font-bold text-[#663399] uppercase tracking-wide">{course.org}</p>
                {course.tag && <span className="text-[10px] font-bold text-[#D4AF37] bg-yellow-50 px-2 py-0.5 rounded-full">{course.tag}</span>}
            </div>

            <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#6C5948] transition-colors">
                {course.title}
            </h3>
            <p className="text-xs text-gray-500 mb-3 truncate">{course.instructor}</p>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                <StarRating rating={course.rating} count={course.students} />
                <div className="text-[#6C5948] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    <PlayCircle size={20} />
                </div>
            </div>
        </div>
    </div>
);

const PathwayCard = ({ path }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 hover:border-[#6C5948]/30 hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className={`w-12 h-12 rounded-xl ${path.bg} ${path.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
            <path.icon size={24} />
        </div>
        <h3 className="font-bold text-lg text-gray-900 mb-1">{path.title}</h3>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{path.subtitle}</p>

        <div className="flex items-center gap-3 text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
            <span className="flex items-center gap-1"><BookOpen size={14} /> {path.courses} Courses</span>
            <span className="flex items-center gap-1"><Briefcase size={14} /> {path.partner}</span>
        </div>
    </div>
);

// --- Main Application ---

export default function TseaXApp() {
    const [activeTab, setActiveTab] = useState("Sustainable Development");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800 selection:bg-[#6C5948] selection:text-white font-sans">

            {/* Inject Lato Font */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap');
        body, html { font-family: 'Lato', sans-serif; }
      `}</style>

            {/* Header - Clean Enterprise Style */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Logo />

                        <nav className="hidden lg:flex items-center gap-8">
                            <NavItem label="Hexahelix Model" />
                            <NavItem label="Career Pathways" />
                            <NavItem label="Enterprise" />
                            <NavItem label="Government" />
                        </nav>
                    </div>

                    <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm mx-8">
                        <div className="relative w-full group">
                            <input
                                className="w-full bg-gray-100 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:border-[#6C5948]/50 focus:ring-2 focus:ring-[#6C5948]/10 outline-none transition-all font-medium"
                                placeholder="Search courses, skills, or mentors..."
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6C5948]" size={18} />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <button className="text-gray-600 text-sm font-bold hover:text-[#6C5948] px-2">Log In</button>
                        <button className="bg-[#6C5948] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#5a4a3b] transition-all shadow-lg shadow-[#6C5948]/20 flex items-center gap-2">
                            Join T6 <ChevronRight size={16} />
                        </button>
                    </div>

                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-600">
                        {isMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </header>

            {/* Hero Section - "Polished T6" Aesthetic */}
            <section className="pt-24 pb-16 px-4 relative overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-[#663399]/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/4" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[#6C5948]/5 to-transparent rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 translate-y-1/4" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-[#663399] shadow-sm tracking-wide">
                            <Zap size={14} fill="currentColor" />
                            THE FIRST HEXAHELIX LEARNING PLATFORM
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.1]">
                            Uniting the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5948] via-[#663399] to-[#969696]">
                                Six Sectors
                            </span> of Innovation.
                        </h1>

                        <p className="text-xl text-gray-600 leading-relaxed max-w-xl font-medium">
                            Enterprise-grade education bridging Government, Business, and Civil Society. Powered by Tsinghua SEA & United in Diversity.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button className="px-8 py-4 bg-[#6C5948] text-white rounded-xl font-bold text-base hover:bg-[#5a4a3b] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                                Start Learning <ChevronRight size={20} />
                            </button>
                            <button className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-base hover:border-[#6C5948] hover:text-[#6C5948] transition-all flex items-center justify-center gap-2">
                                <PlayCircle size={20} /> Demo for Enterprise
                            </button>
                        </div>
                    </div>

                    {/* 3D Abstract Visualizer */}
                    <div className="relative flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-md aspect-square animate-float-slow">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#6C5948]/10 to-[#663399]/10 rounded-full blur-2xl" />

                            {/* Floating Cards */}
                            <div className="relative z-10 grid gap-4 p-6">
                                <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transform translate-x-8 translate-y-8 z-20">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#6C5948] text-white flex items-center justify-center">
                                            <Briefcase size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Track</p>
                                            <p className="font-bold text-gray-900">Business Executive</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[#6C5948] w-3/4 h-full rounded-full" />
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-100 transform -translate-x-4 z-10">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#663399] text-white flex items-center justify-center">
                                            <Cpu size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Technology</p>
                                            <p className="font-bold text-gray-900">AI Governance</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg w-fit uppercase tracking-wide">
                                        <CheckCircle size={12} /> Verifiable Credential
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted Marquee - Clean Version */}
            <div className="border-y border-gray-200 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 py-10 flex flex-wrap justify-center md:justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-default">
                    <span className="text-xl font-serif font-bold text-[#663399]">Tsinghua University</span>
                    <span className="text-xl font-sans font-black text-[#1a1a1a] tracking-tighter">MIT<span className="font-light">Sloan</span></span>
                    <span className="text-xl font-bold text-[#6C5948]">United in Diversity</span>
                    <span className="text-xl font-mono font-bold text-gray-600">GOVTECH</span>
                    <span className="text-xl font-bold text-green-700 tracking-tight">UN SDSN</span>
                </div>
            </div>

            {/* Content Section 1: Pathways (The "Why") */}
            <section className="py-20 max-w-7xl mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">Structured for Impact.</h2>
                    <p className="text-gray-600 text-lg font-medium">Don't just take courses. Embark on curated career pathways designed by world-class institutions to solve real-world challenges.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {PATHWAYS.map((path, i) => (
                        <PathwayCard key={i} path={path} />
                    ))}
                </div>
            </section>

            {/* Content Section 2: Broad Selection (The "Udemy" Density) */}
            <section className="py-16 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">Expand your expertise.</h2>

                        {/* Category Pills */}
                        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === cat
                                            ? 'bg-[#1a1a1a] text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Course Grid for Active Tab */}
                    <div className="border border-gray-200 rounded-2xl p-8 bg-gray-50/50">
                        <div className="mb-8 max-w-2xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Lead the {activeTab} revolution</h3>
                            <p className="text-gray-600 font-medium">
                                Equip yourself with the frameworks, tools, and verification needed to drive change in the {activeTab} sector. Verified by blockchain.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {(TABBED_COURSES[activeTab] || TABBED_COURSES["Sustainable Development"]).map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <button className="bg-white border border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-bold text-sm hover:border-[#6C5948] hover:text-[#6C5948] transition-colors uppercase tracking-wide">
                                View all {activeTab} courses
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section 3: Live Rain Classroom (XuetangX) */}
            <section className="py-20 max-w-7xl mx-auto px-4">
                <div className="bg-[#1a1a1a] rounded-3xl p-10 md:p-16 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-16">
                    {/* Background Glows */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#663399] rounded-full blur-[128px] opacity-40 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#6C5948] rounded-full blur-[128px] opacity-30 pointer-events-none" />

                    <div className="relative z-10 flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 text-[#D4AF37] font-bold text-xs uppercase tracking-widest">
                            <Video size={14} /> Live Rain Classroom
                        </div>
                        <h2 className="text-4xl font-black font-serif">Synchronized Learning across Borders.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed font-medium">
                            Experience the hybrid learning model pioneered by XuetangX. Join live classrooms connecting Bali, Beijing, and Singapore with real-time AI translation.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <button className="bg-white text-[#1a1a1a] px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                                View Schedule
                            </button>
                            <button className="text-white border border-white/20 px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors">
                                How it Works
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 w-full md:w-[45%]">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 mt-8">
                                <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80" className="rounded-2xl shadow-2xl border border-white/10 opacity-90" alt="Online" />
                                <div className="bg-[#2A2A2A] p-4 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                        <span className="text-xs font-bold uppercase text-gray-400">Live Now</span>
                                    </div>
                                    <p className="font-bold text-sm">Global Innovation Summit</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-[#6C5948] p-4 rounded-2xl text-white flex flex-col justify-between h-32 relative overflow-hidden">
                                    <Hexagon className="absolute -bottom-4 -right-4 text-white opacity-20" size={80} />
                                    <p className="font-bold text-2xl">12k+</p>
                                    <p className="text-xs font-medium opacity-80">Active Learners Online</p>
                                </div>
                                <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80" className="rounded-2xl shadow-2xl border border-white/10 opacity-90" alt="Classroom" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Section 4: Social Proof (Testimonials) */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-black text-gray-900 mb-12 text-center">Empowering the Hexahelix.</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-8 bg-[#FAFAFA] rounded-2xl border border-gray-100 hover:border-[#6C5948]/20 transition-colors">
                            <div className="mb-6 text-[#6C5948]"><Layers size={32} /></div>
                            <p className="text-gray-600 mb-6 leading-relaxed italic font-medium">"The blockchain verification allowed our Ministry to instantly validate candidates for the Smart City task force. T6 is the new standard."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">AB</div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">Ahmed B.</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Ministry of Communication</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-[#FAFAFA] rounded-2xl border border-gray-100 hover:border-[#663399]/20 transition-colors">
                            <div className="mb-6 text-[#663399]"><Cpu size={32} /></div>
                            <p className="text-gray-600 mb-6 leading-relaxed italic font-medium">"The AI Governance course by Tsinghua SEA gave me the framework to implement ethical AI at my startup. Practical, rigorous, and visionary."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">JL</div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">Jessica L.</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Tech Founder, Singapore</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-[#FAFAFA] rounded-2xl border border-gray-100 hover:border-green-600/20 transition-colors">
                            <div className="mb-6 text-green-600"><Coffee size={32} /></div>
                            <p className="text-gray-600 mb-6 leading-relaxed italic font-medium">"UID's Happy Digital X helped me balance digital transformation with human wellbeing. A must for any modern executive."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">KS</div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900">Kartika S.</p>
                                    <p className="text-xs text-gray-500 font-bold uppercase">HR Director, Bali</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Footer (Populated like Udemy, Styled like T6) */}
            <footer className="bg-[#1a1a1a] text-gray-400 pt-20 pb-10 border-t-4 border-[#6C5948]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        <div>
                            <h4 className="font-bold text-white mb-6">T6 Business</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">T6 for Enterprise</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">T6 for Government</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Executive Education</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Employee Training</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Strategic Partnerships</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6">Teach & Connect</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Become an Instructor</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Partner with T6</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">T6 Studios</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Alumni Network</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Events</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6">About TSEA-X</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Tsinghua Southeast Asia</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">United in Diversity</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Our Mission</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6">Support</h4>
                            <ul className="space-y-3 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Help & Support</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Credential Verification</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blockchain Validator</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
                        <Logo dark={true} />
                        <div className="flex flex-col md:flex-row items-center gap-4 text-xs">
                            <span>© 2025 T6 (TSEA-X). Powered by Tsinghua SEA & UID.</span>
                            <div className="flex gap-4">
                                <a href="#" className="hover:text-white">Privacy Policy</a>
                                <a href="#" className="hover:text-white">Cookie Settings</a>
                                <a href="#" className="hover:text-white">Terms</a>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 border border-gray-600 rounded px-4 py-2 text-sm font-bold text-white hover:border-white transition-colors">
                            <Globe size={16} /> English
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}