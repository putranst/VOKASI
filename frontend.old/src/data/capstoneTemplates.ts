// Capstone Project Templates for TSEA-X
// Pre-built project templates aligned with IRIS framework

export interface CapstoneTemplate {
    id: string;
    title: string;
    description: string;
    type: 'development' | 'analytics' | 'research' | 'policy' | 'ai-ml' | 'business';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive';
    estimatedWeeks: number;
    deliverables: string[];
    rubricCriteria: {
        criterion: string;
        weight: number;
        description: string;
    }[];
    irisPhaseMapping: {
        immerse: string;
        realize: string;
        iterate: string;
        scale: string;
    };
    suggestedTools: string[];
    tags: string[];
}

export const CAPSTONE_TEMPLATES: CapstoneTemplate[] = [
    {
        id: 'fullstack-webapp',
        title: 'Full-Stack Web Application',
        description: 'Build a complete web application with frontend, backend, and database integration. Includes user authentication, API endpoints, and responsive UI.',
        type: 'development',
        difficulty: 'Advanced',
        estimatedWeeks: 8,
        deliverables: [
            'Working deployed application URL',
            'Source code repository (GitHub)',
            'Technical documentation (README)',
            'User guide or demo video',
            'Architecture diagram'
        ],
        rubricCriteria: [
            { criterion: 'Functionality', weight: 30, description: 'All features work as specified' },
            { criterion: 'Code Quality', weight: 25, description: 'Clean, modular, well-documented code' },
            { criterion: 'UI/UX Design', weight: 20, description: 'Intuitive, accessible, responsive design' },
            { criterion: 'Security', weight: 15, description: 'Proper authentication, input validation' },
            { criterion: 'Documentation', weight: 10, description: 'Complete README and inline comments' }
        ],
        irisPhaseMapping: {
            immerse: 'Research target users, analyze competitors, define requirements',
            realize: 'Design system architecture, create wireframes, set up tech stack',
            iterate: 'Build MVP, conduct user testing, iterate on feedback',
            scale: 'Deploy to production, document for handoff, present to stakeholders'
        },
        suggestedTools: ['React/Next.js', 'Node.js/Python', 'PostgreSQL', 'Vercel/Railway'],
        tags: ['web', 'fullstack', 'deployment']
    },
    {
        id: 'mobile-app-mvp',
        title: 'Mobile App MVP',
        description: 'Create a minimum viable product mobile application using cross-platform technology. Focus on core features and user experience.',
        type: 'development',
        difficulty: 'Intermediate',
        estimatedWeeks: 6,
        deliverables: [
            'APK or TestFlight build',
            'Source code repository',
            'App store screenshots/mockups',
            'User testing results',
            'Feature roadmap'
        ],
        rubricCriteria: [
            { criterion: 'Core Features', weight: 30, description: 'MVP features fully functional' },
            { criterion: 'Mobile UX', weight: 25, description: 'Native-feeling interactions, gestures' },
            { criterion: 'Performance', weight: 20, description: 'Fast load times, smooth animations' },
            { criterion: 'Offline Support', weight: 15, description: 'Graceful offline handling' },
            { criterion: 'Polish', weight: 10, description: 'Icons, splash screen, app icon' }
        ],
        irisPhaseMapping: {
            immerse: 'Define target audience, research app store trends',
            realize: 'Create user flows, design UI screens, choose framework',
            iterate: 'Build core features, beta test with users, fix bugs',
            scale: 'Prepare for app store submission, create marketing materials'
        },
        suggestedTools: ['React Native', 'Flutter', 'Expo', 'Firebase'],
        tags: ['mobile', 'app', 'mvp']
    },
    {
        id: 'data-analysis-report',
        title: 'Data Analysis Report',
        description: 'Conduct comprehensive data analysis on a real-world dataset. Clean, explore, visualize, and derive actionable insights.',
        type: 'analytics',
        difficulty: 'Beginner',
        estimatedWeeks: 4,
        deliverables: [
            'Jupyter notebook with analysis',
            'Executive summary (1-2 pages)',
            'Interactive dashboard (optional)',
            'Raw and cleaned dataset',
            'Presentation slides'
        ],
        rubricCriteria: [
            { criterion: 'Data Quality', weight: 20, description: 'Proper cleaning, handling missing values' },
            { criterion: 'Analysis Depth', weight: 30, description: 'Multiple perspectives, statistical rigor' },
            { criterion: 'Visualizations', weight: 25, description: 'Clear, insightful charts and graphs' },
            { criterion: 'Insights', weight: 15, description: 'Actionable recommendations' },
            { criterion: 'Presentation', weight: 10, description: 'Clear storytelling' }
        ],
        irisPhaseMapping: {
            immerse: 'Understand domain, gather datasets, define questions',
            realize: 'Clean data, exploratory analysis, hypothesis formation',
            iterate: 'Deep dive analysis, visualization refinement, validate findings',
            scale: 'Create executive summary, present findings'
        },
        suggestedTools: ['Python/Pandas', 'Jupyter', 'Matplotlib/Seaborn', 'Tableau'],
        tags: ['data', 'analytics', 'visualization']
    },
    {
        id: 'ml-model',
        title: 'Machine Learning Model',
        description: 'Develop, train, and deploy a machine learning model to solve a prediction or classification problem.',
        type: 'ai-ml',
        difficulty: 'Advanced',
        estimatedWeeks: 8,
        deliverables: [
            'Trained model (saved/exported)',
            'Training notebook with experiments',
            'API endpoint for inference',
            'Model card (documentation)',
            'Performance evaluation report'
        ],
        rubricCriteria: [
            { criterion: 'Model Performance', weight: 30, description: 'Accuracy, precision, recall metrics' },
            { criterion: 'Methodology', weight: 25, description: 'Proper train/val/test split, cross-validation' },
            { criterion: 'Feature Engineering', weight: 20, description: 'Creative, impactful feature selection' },
            { criterion: 'Deployment', weight: 15, description: 'Working API or integration' },
            { criterion: 'Documentation', weight: 10, description: 'Model card, reproducibility' }
        ],
        irisPhaseMapping: {
            immerse: 'Define problem, collect data, research SOTA models',
            realize: 'Feature engineering, baseline models, experiment tracking',
            iterate: 'Hyperparameter tuning, cross-validation, model comparison',
            scale: 'Deploy model, create inference API, monitor performance'
        },
        suggestedTools: ['Scikit-learn', 'TensorFlow/PyTorch', 'MLflow', 'FastAPI'],
        tags: ['ml', 'ai', 'model', 'deployment']
    },
    {
        id: 'business-case-study',
        title: 'Business Case Study',
        description: 'Analyze a real company or market challenge and propose data-driven strategic recommendations.',
        type: 'business',
        difficulty: 'Intermediate',
        estimatedWeeks: 4,
        deliverables: [
            'Written case analysis (10-15 pages)',
            'Financial projections (if applicable)',
            'Competitive analysis matrix',
            'Strategic recommendations deck',
            'Executive presentation'
        ],
        rubricCriteria: [
            { criterion: 'Research Quality', weight: 25, description: 'Comprehensive, credible sources' },
            { criterion: 'Analysis Framework', weight: 25, description: 'Proper use of business frameworks' },
            { criterion: 'Recommendations', weight: 25, description: 'Specific, actionable, realistic' },
            { criterion: 'Financial Reasoning', weight: 15, description: 'Sound financial logic' },
            { criterion: 'Presentation', weight: 10, description: 'Professional deliverables' }
        ],
        irisPhaseMapping: {
            immerse: 'Research company, industry, macro environment',
            realize: 'Apply frameworks (SWOT, Porter, etc.), identify issues',
            iterate: 'Develop alternatives, evaluate options, refine strategy',
            scale: 'Present to stakeholders, create implementation roadmap'
        },
        suggestedTools: ['Excel', 'PowerPoint', 'Canva', 'Market research databases'],
        tags: ['business', 'strategy', 'case-study']
    },
    {
        id: 'policy-proposal',
        title: 'Policy Proposal',
        description: 'Research and draft a policy proposal addressing a public sector challenge. Include stakeholder analysis and implementation plan.',
        type: 'policy',
        difficulty: 'Executive',
        estimatedWeeks: 6,
        deliverables: [
            'Policy brief (5-10 pages)',
            'Stakeholder mapping document',
            'Implementation roadmap',
            'Budget estimation',
            'Presentation to simulated committee'
        ],
        rubricCriteria: [
            { criterion: 'Problem Definition', weight: 20, description: 'Clear, evidence-based problem statement' },
            { criterion: 'Policy Options', weight: 25, description: 'Multiple alternatives analyzed' },
            { criterion: 'Feasibility', weight: 20, description: 'Politically and financially viable' },
            { criterion: 'Stakeholder Analysis', weight: 20, description: 'Comprehensive mapping, engagement plan' },
            { criterion: 'Communication', weight: 15, description: 'Clear, persuasive writing' }
        ],
        irisPhaseMapping: {
            immerse: 'Research issue, gather data, interview stakeholders',
            realize: 'Map stakeholders, draft policy options, analyze tradeoffs',
            iterate: 'Refine proposal based on feedback, cost-benefit analysis',
            scale: 'Prepare implementation plan, present to decision-makers'
        },
        suggestedTools: ['Microsoft Word', 'Policy analysis frameworks', 'Stakeholder mapping tools'],
        tags: ['government', 'policy', 'public-sector']
    }
];

// Helper function to get template by ID
export const getCapstoneTemplate = (id: string): CapstoneTemplate | undefined => {
    return CAPSTONE_TEMPLATES.find(t => t.id === id);
};

// Get templates by type
export const getTemplatesByType = (type: CapstoneTemplate['type']): CapstoneTemplate[] => {
    return CAPSTONE_TEMPLATES.filter(t => t.type === type);
};

// Get templates by difficulty
export const getTemplatesByDifficulty = (difficulty: CapstoneTemplate['difficulty']): CapstoneTemplate[] => {
    return CAPSTONE_TEMPLATES.filter(t => t.difficulty === difficulty);
};
