import { Globe, Hexagon, Users } from 'lucide-react';
import { Pathway } from '@/components/ui/PathwayCard';
import { Course } from '@/components/ui/CourseCard';

export const CATEGORIES = [
    "Sustainable Development", "Public Policy", "Data & AI", "Business Leadership", "Urban Planning", "Green Finance"
];

export const TABBED_COURSES: Record<string, Course[]> = {
    "Sustainable Development": [
        {
            id: 101,
            title: "Circular Economy Models for SMEs",
            instructor: "VOKASI Expert Panel",
            org: "VOKASI",
            rating: 4.8,
            students_count: "12k",
            image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Beginner",
            category: "Sustainable Development"
        },
        {
            id: 102,
            title: "Blue Carbon: Marine Conservation Strategies",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.9,
            students_count: "8.5k",
            image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Advanced",
            category: "Sustainable Development"
        },
        {
            id: 103,
            title: "Renewable Energy Transitions",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.7,
            students_count: "15k",
            image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Intermediate",
            category: "Sustainable Development"
        },
        {
            id: 104,
            title: "ESG Reporting Standards 2025",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.9,
            students_count: "22k",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Executive",
            category: "Sustainable Development"
        }
    ],
    "Public Policy": [
        {
            id: 105,
            title: "AI Governance for Policymakers",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.9,
            students_count: "9k",
            image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Executive",
            category: "Public Policy"
        },
        {
            id: 106,
            title: "Smart City Infrastructure Planning",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.6,
            students_count: "7.2k",
            image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Advanced",
            category: "Public Policy"
        },
        {
            id: 107,
            title: "Digital Identity & Sovereign Data",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.8,
            students_count: "5.5k",
            image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Executive",
            category: "Public Policy"
        },
        {
            id: 108,
            title: "Crisis Management in the Digital Age",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.7,
            students_count: "11k",
            image: "https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Intermediate",
            category: "Public Policy"
        }
    ],
    "Data & AI": [
        {
            id: 109,
            title: "Cyber Security Fundamentals",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.7,
            students_count: "25k",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Beginner",
            category: "Data & AI"
        },
        {
            id: 110,
            title: "Advanced Machine Learning Ops",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.9,
            students_count: "6k",
            image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Advanced",
            category: "Data & AI"
        }
    ],
    "Business Leadership": [
        {
            id: 111,
            title: "Agile Leadership for Government",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.7,
            students_count: "5k",
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Advanced",
            category: "Business Leadership"
        },
        {
            id: 112,
            title: "Sustainable Supply Chain Management",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.8,
            students_count: "9.5k",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Intermediate",
            category: "Business Leadership"
        },
        {
            id: 113,
            title: "Financial Modeling for Startups",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.8,
            students_count: "13k",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Beginner",
            category: "Business Leadership"
        }
    ],
    "Urban Planning": [
        {
            id: 114,
            title: "Smart Mobility Systems",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.7,
            students_count: "6.5k",
            image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Advanced",
            category: "Urban Planning"
        },
        {
            id: 115,
            title: "Green Building Certifications",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.6,
            students_count: "4k",
            image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Intermediate",
            category: "Urban Planning"
        }
    ],
    "Green Finance": [
        {
            id: 116,
            title: "Carbon Credits Trading 101",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.9,
            students_count: "16k",
            image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Beginner",
            category: "Green Finance"
        },
        {
            id: 117,
            title: "Impact Investing Strategies",
            instructor: "VOKASI Faculty",
            org: "VOKASI",
            rating: 4.8,
            students_count: "7k",
            image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=600&q=80",
            tag: "Coming Soon",
            level: "Executive",
            category: "Green Finance"
        }
    ]
};

export const PATHWAYS: Pathway[] = [
    {
        title: "Chief Sustainability Officer",
        subtitle: "Orchestrate green transformation.",
        courses: 6,
        duration: "3 Months",
        partner: "VOKASI & UN SDSN",
        icon: Globe,
        color: "text-green-600",
        bg: "bg-green-50"
    },
    {
        title: "Smart City Architect",
        subtitle: "Design the cities of tomorrow.",
        courses: 8,
        duration: "4 Months",
        partner: "VOKASI & ITB",
        icon: Hexagon,
        color: "text-accent",
        bg: "bg-purple-50"
    },
    {
        title: "Tri-Sector Mediator",
        subtitle: "Bridge Govt, Business & Civil Society.",
        courses: 5,
        duration: "2.5 Months",
        partner: "VOKASI & Kemendikbud",
        icon: Users,
        color: "text-primary",
        bg: "bg-primary/10"
    }
];
