'use client';

import React, { useState, useCallback } from 'react';
import {
    Sparkles, BookOpen, Brain, Users, MessageCircle,
    Lightbulb, Target, CheckCircle2, Loader2, Send,
    ChevronDown, ChevronRight, Wand2, GraduationCap,
    BarChart3, Accessibility, RefreshCw
} from 'lucide-react';

// Agent Types
type AgentType = 'alexandria' | 'sme' | 'pedagogy';

interface Agent {
    id: AgentType;
    name: string;
    title: string;
    avatar: string;
    color: string;
    bgColor: string;
    icon: React.ElementType;
    capabilities: string[];
    systemPrompt: string;
}

interface Message {
    id: string;
    agent: AgentType;
    content: string;
    timestamp: Date;
    type: 'suggestion' | 'question' | 'analysis' | 'recommendation';
}

interface CourseContext {
    title?: string;
    description?: string;
    level?: string;
    topics?: string[];
    modules?: any[];
    learningObjectives?: string[];
}

interface CourseCreationAgentsProps {
    courseContext?: CourseContext;
    onApplySuggestion?: (suggestion: string, type: string) => void;
}

// Define the AI Agents based on MAIC research
const AGENTS: Record<AgentType, Agent> = {
    alexandria: {
        id: 'alexandria',
        name: 'Alexandria',
        title: 'Curriculum Designer',
        avatar: '📚',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        icon: BookOpen,
        capabilities: [
            'Analyze course structure and flow',
            'Suggest learning outcomes aligned with Bloom\'s Taxonomy',
            'Recommend IRIS phase distribution',
            'Generate module sequences and dependencies'
        ],
        systemPrompt: `You are Alexandria, an expert curriculum designer AI. You help instructors create well-structured, internationally-aligned course curricula. You focus on:
- Course structure and logical flow
- Learning outcomes using Bloom's Taxonomy
- IRIS (Immerse-Realize-Iterate-Scale) framework alignment
- Assessment strategies and rubrics
- International standards like MIT OCW structure

Provide specific, actionable suggestions. Be concise but thorough.`
    },
    sme: {
        id: 'sme',
        name: 'Dr. Insight',
        title: 'Subject Matter Expert',
        avatar: '🧠',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: Brain,
        capabilities: [
            'Deep dive into topic content',
            'Suggest relevant examples and case studies',
            'Recommend practical exercises',
            'Identify knowledge prerequisites'
        ],
        systemPrompt: `You are Dr. Insight, a subject matter expert AI. You help instructors develop deep, accurate, and engaging content for their courses. You focus on:
- Deep domain knowledge and accuracy
- Real-world examples and case studies
- Industry-relevant practical exercises
- Cutting-edge developments in the field
- Knowledge prerequisites and learning pathways

Provide expert-level insights that add depth to course content.`
    },
    pedagogy: {
        id: 'pedagogy',
        name: 'Professor Engage',
        title: 'Pedagogy Advisor',
        avatar: '🎓',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: GraduationCap,
        capabilities: [
            'Optimize for learner engagement',
            'Suggest interactive activities',
            'Ensure accessibility and inclusivity',
            'Recommend differentiation strategies'
        ],
        systemPrompt: `You are Professor Engage, a pedagogy expert AI. You help instructors create engaging, inclusive, and effective learning experiences. You focus on:
- Active learning and engagement strategies
- Differentiated instruction for diverse learners
- Accessibility and inclusive design
- Formative assessment integration
- Learner motivation and retention

Provide pedagogically sound recommendations that enhance learning outcomes.`
    }
};

export function CourseCreationAgents({ courseContext, onApplySuggestion }: CourseCreationAgentsProps) {
    const [selectedAgent, setSelectedAgent] = useState<AgentType>('alexandria');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userMessage, setUserMessage] = useState('');
    const [showCapabilities, setShowCapabilities] = useState<AgentType | null>(null);
    const [autoAnalyzeMode, setAutoAnalyzeMode] = useState(false);

    const generateId = () => Math.random().toString(36).substring(2, 9);

    // Get agent response from API
    const getAgentResponse = useCallback(async (agent: AgentType, query: string) => {
        setIsLoading(true);

        try {
            const response = await fetch('/api/v1/ai/agent-consult', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agent_type: agent,
                    query,
                    course_context: courseContext,
                    system_prompt: AGENTS[agent].systemPrompt
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response;
            } else {
                // Fallback responses
                return getFallbackResponse(agent, query);
            }
        } catch (error) {
            console.error('Agent API error:', error);
            return getFallbackResponse(agent, query);
        } finally {
            setIsLoading(false);
        }
    }, [courseContext]);

    // Fallback responses for each agent
    const getFallbackResponse = (agent: AgentType, query: string): string => {
        const context = courseContext?.title || 'your course';

        switch (agent) {
            case 'alexandria':
                return `Based on my analysis of ${context}, I recommend:

**Structure Suggestions:**
1. Begin with a clear "Immerse" phase focusing on context and stakeholder analysis
2. Progress to "Realize" where learners design their approach
3. Include hands-on "Iterate" activities with feedback loops
4. Conclude with "Scale" focusing on deployment and measurement

**Learning Outcomes:**
- Use action verbs from Bloom's Taxonomy appropriate to the level
- Align each objective with specific assessments
- Ensure outcomes are measurable and observable

Would you like me to generate specific learning outcomes for any module?`;

            case 'sme':
                return `For ${context}, here are my expert recommendations:

**Content Depth:**
1. Include real-world case studies from leading organizations
2. Add industry-standard frameworks and methodologies
3. Reference current research and emerging trends

**Practical Applications:**
- Design hands-on exercises that mirror workplace scenarios
- Include code samples or templates learners can adapt
- Create project components that build toward the capstone

**Prerequisites:**
- Ensure foundational concepts are covered or linked
- Provide resources for learners who need to fill knowledge gaps

What specific topic would you like me to elaborate on?`;

            case 'pedagogy':
                return `To maximize engagement and learning outcomes for ${context}:

**Engagement Strategies:**
1. Add Socratic AI checkpoints for reflection
2. Include collaborative discussion prompts
3. Use varied content formats (video, text, interactive)

**Accessibility:**
- Ensure all videos have captions
- Provide text alternatives for visual content
- Use clear, consistent navigation

**Differentiation:**
- Offer extension activities for advanced learners
- Include scaffolding for those who need support
- Provide multiple pathways to demonstrate mastery

Which aspect would you like me to focus on?`;

            default:
                return 'How can I assist you with your course development?';
        }
    };

    // Send message to agent
    const sendMessage = useCallback(async () => {
        if (!userMessage.trim()) return;

        const response = await getAgentResponse(selectedAgent, userMessage);

        const newMessage: Message = {
            id: generateId(),
            agent: selectedAgent,
            content: response,
            timestamp: new Date(),
            type: 'suggestion'
        };

        setMessages(prev => [...prev, newMessage]);
        setUserMessage('');
    }, [userMessage, selectedAgent, getAgentResponse]);

    // Quick action - get initial analysis
    const requestAnalysis = useCallback(async (agent: AgentType) => {
        const analysisQueries: Record<AgentType, string> = {
            alexandria: 'Analyze my course structure and suggest improvements based on IRIS framework and international standards.',
            sme: 'Review my course content and suggest ways to add more depth, examples, and practical applications.',
            pedagogy: 'Evaluate my course for engagement, accessibility, and pedagogical effectiveness.'
        };

        setSelectedAgent(agent);
        const response = await getAgentResponse(agent, analysisQueries[agent]);

        const newMessage: Message = {
            id: generateId(),
            agent,
            content: response,
            timestamp: new Date(),
            type: 'analysis'
        };

        setMessages(prev => [...prev, newMessage]);
    }, [getAgentResponse]);

    // Auto-analyze with all agents
    const runFullAnalysis = useCallback(async () => {
        setAutoAnalyzeMode(true);

        for (const agentId of Object.keys(AGENTS) as AgentType[]) {
            await requestAnalysis(agentId);
            // Small delay between agents
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setAutoAnalyzeMode(false);
    }, [requestAnalysis]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <Users size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">AI Course Advisors</h3>
                            <p className="text-sm text-gray-500">MAIC-inspired multi-agent assistance</p>
                        </div>
                    </div>
                    <button
                        onClick={runFullAnalysis}
                        disabled={autoAnalyzeMode}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm"
                    >
                        {autoAnalyzeMode ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} />
                                Full Analysis
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Agent Selector */}
            <div className="flex border-b border-gray-100">
                {Object.values(AGENTS).map(agent => {
                    const Icon = agent.icon;
                    const isSelected = selectedAgent === agent.id;

                    return (
                        <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent.id)}
                            onMouseEnter={() => setShowCapabilities(agent.id)}
                            onMouseLeave={() => setShowCapabilities(null)}
                            className={`flex-1 p-4 relative transition-all ${isSelected
                                ? `${agent.bgColor} border-b-2 border-current ${agent.color}`
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isSelected ? 'bg-white shadow-sm' : agent.bgColor
                                    }`}>
                                    {agent.avatar}
                                </div>
                                <div className="text-center">
                                    <p className={`font-semibold text-sm ${isSelected ? agent.color : 'text-gray-700'}`}>
                                        {agent.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{agent.title}</p>
                                </div>
                            </div>

                            {/* Capabilities Tooltip */}
                            {showCapabilities === agent.id && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20 w-64 p-3 bg-white rounded-xl shadow-xl border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">Capabilities:</p>
                                    <ul className="space-y-1">
                                        {agent.capabilities.map((cap, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                                <CheckCircle2 size={12} className={`mt-0.5 ${agent.color}`} />
                                                {cap}
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); requestAnalysis(agent.id); }}
                                        className={`mt-3 w-full px-3 py-1.5 ${agent.bgColor} ${agent.color} rounded-lg text-xs font-medium hover:opacity-80`}
                                    >
                                        Get Analysis
                                    </button>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Messages Area */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <MessageCircle size={28} className="text-gray-400" />
                        </div>
                        <h4 className="font-semibold text-gray-700 mb-1">Start a conversation</h4>
                        <p className="text-sm text-gray-500 max-w-sm">
                            Ask any of our AI advisors for help with your course design, content, or pedagogy.
                        </p>
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={() => requestAnalysis('alexandria')}
                                className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                            >
                                Structure Analysis
                            </button>
                            <button
                                onClick={() => requestAnalysis('sme')}
                                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                                Content Review
                            </button>
                            <button
                                onClick={() => requestAnalysis('pedagogy')}
                                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            >
                                Engagement Tips
                            </button>
                        </div>
                    </div>
                ) : (
                    messages.map(msg => {
                        const agent = AGENTS[msg.agent];
                        return (
                            <div key={msg.id} className="flex gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${agent.bgColor}`}>
                                    {agent.avatar}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-semibold text-sm ${agent.color}`}>{agent.name}</span>
                                        <span className="text-xs text-gray-400">{agent.title}</span>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => onApplySuggestion?.(msg.content, 'suggestion')}
                                            className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                        >
                                            <CheckCircle2 size={12} />
                                            Apply Suggestion
                                        </button>
                                        <button
                                            onClick={() => {
                                                setUserMessage('Can you elaborate on that?');
                                                setSelectedAgent(msg.agent);
                                            }}
                                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                        >
                                            <RefreshCw size={12} />
                                            Ask Follow-up
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${AGENTS[selectedAgent].bgColor}`}>
                            {AGENTS[selectedAgent].avatar}
                        </div>
                        <div className="flex-1">
                            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="text-sm">{AGENTS[selectedAgent].name} is thinking...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${AGENTS[selectedAgent].bgColor}`}>
                        {AGENTS[selectedAgent].avatar}
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder={`Ask ${AGENTS[selectedAgent].name}...`}
                            className="w-full px-4 py-2.5 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!userMessage.trim() || isLoading}
                        className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Quick prompts:</span>
                    <button
                        onClick={() => setUserMessage('How can I improve the learning outcomes?')}
                        className="hover:text-purple-600"
                    >
                        Learning outcomes
                    </button>
                    <button
                        onClick={() => setUserMessage('Suggest interactive activities')}
                        className="hover:text-purple-600"
                    >
                        Activities
                    </button>
                    <button
                        onClick={() => setUserMessage('How to make this more engaging?')}
                        className="hover:text-purple-600"
                    >
                        Engagement
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CourseCreationAgents;
