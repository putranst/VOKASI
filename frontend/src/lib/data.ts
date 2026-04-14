import { Globe, Hexagon, Users } from 'lucide-react';
import { Pathway } from '@/components/ui/PathwayCard';
import { Course } from '@/components/ui/CourseCard';

export const CATEGORIES = [
    "Sustainable Development", "Public Policy", "Data & AI", "Business Leadership", "Urban Planning", "Green Finance"
];

export const TABBED_COURSES: Record<string, Course[]> = {
    "Sustainable Development": [
        {
            id: 1,
            title: "Circular Economy Models for SMEs",
            instructor: "UID Expert Panel",
            org: "United in Diversity",
            rating: 4.8,
            students_count: "12k",
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
            students_count: "8.5k",
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
            students_count: "15k",
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
            students_count: "22k",
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
            students_count: "9k",
            image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=600&q=80",
            tag: "Updated",
            level: "Executive"
        },
        {
            id: 6,
            title: "Smart City Infrastructure Planning",
            instructor: "Urban Planning Dept",
            org: "Tsinghua Architecture",
            rating: 4.6,
            students_count: "7.2k",
            image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80",
            tag: "Popular",
            level: "Advanced"
        },
        {
            id: 7,
            title: "Digital Identity & Sovereign Data",
            instructor: "Blockchain Taskforce",
            org: "T6 Tech",
            rating: 4.8,
            students_count: "5.5k",
            image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
            tag: "Critical",
            level: "Executive"
        },
        {
            id: 8,
            title: "Crisis Management in the Digital Age",
            instructor: "National Resilience Council",
            org: "GovTech",
            rating: 4.7,
            students_count: "11k",
            image: "https://images.unsplash.com/photo-1504384308090-c54be3855833?auto=format&fit=crop&w=600&q=80",
            tag: "New",
            level: "Intermediate"
        }
    ],
    "Data & AI": [
        {
            id: 10,
            title: "AI for SMEs: Practical Implementation",
            instructor: "Tech Innovation Lab",
            org: "T6 Business",
            rating: 4.8,
            students_count: "18k",
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80",
            tag: "Bestseller",
            level: "Beginner"
        },
        {
            id: 11,
            title: "Data Analytics for Decision Makers",
            instructor: "Data Science Faculty",
            org: "MIT Sloan",
            rating: 4.9,
            students_count: "14k",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
            tag: "Essential",
            level: "Intermediate"
        },
        {
            id: 12,
            title: "Cyber Security Fundamentals",
            instructor: "Cyber Defense Unit",
            org: "T6 Security",
            rating: 4.7,
            students_count: "25k",
            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
            tag: "Critical",
            level: "Beginner"
        },
        {
            id: 9,
            title: "Advanced Machine Learning Ops",
            instructor: "AI Research Center",
            org: "Tsinghua SEA",
            rating: 4.9,
            students_count: "6k",
            image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80",
            tag: "Advanced",
            level: "Advanced"
        }
    ],
    "Business Leadership": [
        {
            id: 14,
            title: "Digital Transformation Strategy",
            instructor: "Executive Education",
            org: "MIT Sloan",
            rating: 4.9,
            students_count: "10k",
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
            tag: "Executive",
            level: "Executive"
        },
        {
            id: 15,
            title: "Agile Leadership for Government",
            instructor: "Public Service Institute",
            org: "GovTech",
            rating: 4.7,
            students_count: "5k",
            image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80",
            tag: "Niche",
            level: "Advanced"
        },
        {
            id: 16,
            title: "Sustainable Supply Chain Management",
            instructor: "Logistics Expert Panel",
            org: "T6 Business",
            rating: 4.8,
            students_count: "9.5k",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
            tag: "Green",
            level: "Intermediate"
        },
        {
            id: 17,
            title: "Financial Modeling for Startups",
            instructor: "Venture Capital Group",
            org: "Tsinghua SEA",
            rating: 4.8,
            students_count: "13k",
            image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
            tag: "Practical",
            level: "Beginner"
        }
    ],
    "Urban Planning": [
        {
            id: 18,
            title: "Smart Mobility Systems",
            instructor: "Transport Authority",
            org: "GovTech",
            rating: 4.7,
            students_count: "6.5k",
            image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80",
            tag: "Future",
            level: "Advanced"
        },
        {
            id: 19,
            title: "Green Building Certifications",
            instructor: "Sustainability Council",
            org: "T6 Green",
            rating: 4.6,
            students_count: "4k",
            image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
            tag: "Technical",
            level: "Intermediate"
        }
    ],
    "Green Finance": [
        {
            id: 20,
            title: "Carbon Credits Trading 101",
            instructor: "Carbon Exchange",
            org: "T6 Finance",
            rating: 4.9,
            students_count: "16k",
            image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&w=600&q=80",
            tag: "Hot",
            level: "Beginner"
        },
        {
            id: 21,
            title: "Impact Investing Strategies",
            instructor: "Global Impact Fund",
            org: "United in Diversity",
            rating: 4.8,
            students_count: "7k",
            image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=600&q=80",
            tag: "Executive",
            level: "Executive"
        }
    ]
};

export const PATHWAYS: Pathway[] = [
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
        color: "text-accent",
        bg: "bg-purple-50"
    },
    {
        title: "Tri-Sector Mediator",
        subtitle: "Bridge Govt, Business & Civil Society.",
        courses: 5,
        duration: "2.5 Months",
        partner: "United in Diversity",
        icon: Users,
        color: "text-primary",
        bg: "bg-primary/10"
    }
];
