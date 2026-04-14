'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquare, Send, Sparkles, Trash2, ChevronDown,
    Lightbulb, Target, CheckCircle2, AlertCircle, BookOpen,
    Brain, HelpCircle, ArrowRight, Zap
} from 'lucide-react';

// Scaffolding Levels based on SocraticAI research
type ScaffoldingLevel = 'exploration' | 'guided' | 'independent';

interface SocraticMessage {
    role: 'user' | 'ai';
    text: string;
    type?: 'question' | 'hint' | 'reflection' | 'challenge' | 'praise';
    timestamp?: number;
}

interface ReflectionPrompt {
    id: string;
    prompt: string;
    answered: boolean;
    response?: string;
}

interface EnhancedSocraticTutorProps {
    courseId?: string;
    moduleId?: string;
    phase?: string;
    context?: any;
    userRole?: 'student' | 'instructor';
    onReflectionComplete?: (reflections: ReflectionPrompt[]) => void;
    className?: string;
}

// Socratic questioning strategies based on research
const SOCRATIC_STRATEGIES = {
    clarifying: [
        "What do you mean by that?",
        "Can you give me an example?",
        "How would you explain this to someone new to the topic?"
    ],
    probing: [
        "Why do you think that's the case?",
        "What evidence supports your thinking?",
        "What would happen if we looked at this differently?"
    ],
    assumptionTesting: [
        "What are you assuming here?",
        "Is that always true, or are there exceptions?",
        "What if the opposite were true?"
    ],
    consequenceExploring: [
        "What might be the implications of this?",
        "How does this connect to what you learned before?",
        "What could be the unintended consequences?"
    ],
    viewpointShifting: [
        "How might someone else see this situation?",
        "What would a skeptic say about this?",
        "From a different perspective, what might we notice?"
    ]
};

// Phase-specific reflection prompts
const PHASE_REFLECTIONS: Record<string, string[]> = {
    immerse: [
        "What surprised you most about the problem context?",
        "Who are the stakeholders most affected by this problem?",
        "What assumptions have you identified that need testing?"
    ],
    realize: [
        "What knowledge gaps have you identified?",
        "How does this connect to concepts you already understand?",
        "What would success look like for this phase?"
    ],
    iterate: [
        "What hypothesis are you testing in this iteration?",
        "What metrics will tell you if you're on the right track?",
        "What will you do differently in the next iteration?"
    ],
    scale: [
        "How will you ensure the solution is sustainable?",
        "Who needs to be trained or onboarded?",
        "What documentation is essential for handoff?"
    ]
};

export function EnhancedSocraticTutor({
    courseId,
    moduleId,
    phase = 'immerse',
    context,
    userRole = 'student',
    onReflectionComplete,
    className = ''
}: EnhancedSocraticTutorProps) {
    const [messages, setMessages] = useState<SocraticMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [scaffoldingLevel, setScaffoldingLevel] = useState<ScaffoldingLevel>('guided');
    const [reflectionPrompts, setReflectionPrompts] = useState<ReflectionPrompt[]>([]);
    const [showReflections, setShowReflections] = useState(false);
    const [questionQuality, setQuestionQuality] = useState<'needs_work' | 'good' | 'excellent'>('good');
    const [dailyInteractions, setDailyInteractions] = useState(0);
    const [showLimitWarning, setShowLimitWarning] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const storageKey = `socratic_enhanced_${courseId}_${moduleId || 'general'}`;

    // Initialize with welcome message and reflections
    useEffect(() => {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                setMessages(data.messages || []);
                setReflectionPrompts(data.reflections || []);
                setDailyInteractions(data.dailyInteractions || 0);
            } catch (e) {
                initializeConversation();
            }
        } else {
            initializeConversation();
        }
    }, [courseId, moduleId, phase]);

    const initializeConversation = () => {
        const phaseReflections = PHASE_REFLECTIONS[phase] || PHASE_REFLECTIONS.immerse;
        const reflections: ReflectionPrompt[] = phaseReflections.map((prompt, idx) => ({
            id: `ref-${idx}`,
            prompt,
            answered: false
        }));
        setReflectionPrompts(reflections);

        const roleGreetings = {
            student: `👋 I'm your Socratic Tutor for the **${phase.charAt(0).toUpperCase() + phase.slice(1)}** phase.

I won't give you answers directly—instead, I'll guide you through questions to help you discover insights yourself.

**How to get the most from our conversation:**
• Ask specific, well-formulated questions
• Share your current thinking so I can guide you
• Reflect on my questions before responding

What would you like to explore?`,
            instructor: `👋 Hello! I'm here to assist you with course development for the **${phase.charAt(0).toUpperCase() + phase.slice(1)}** phase.

I can help you:
• Design effective learning outcomes
• Create engaging activities
• Develop assessment strategies
• Ensure alignment with IRIS framework

What aspect of your course would you like to work on?`
        };

        setMessages([{
            role: 'ai',
            text: roleGreetings[userRole],
            type: 'question',
            timestamp: Date.now()
        }]);
    };

    // Save to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify({
                messages,
                reflections: reflectionPrompts,
                dailyInteractions
            }));
        }
    }, [messages, reflectionPrompts, dailyInteractions]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Check question quality for scaffolding
    const analyzeQuestionQuality = (question: string): 'needs_work' | 'good' | 'excellent' => {
        const words = question.toLowerCase().split(' ');
        const hasSpecificity = question.length > 30;
        const hasContext = words.some(w => ['because', 'since', 'when', 'how', 'why'].includes(w));
        const hasOwnThinking = words.some(w => ['think', 'believe', 'understand', 'confused', 'wondering'].includes(w));

        if (hasSpecificity && hasContext && hasOwnThinking) return 'excellent';
        if (hasSpecificity || hasContext) return 'good';
        return 'needs_work';
    };

    // Generate scaffolded response
    const generateScaffoldedResponse = async (userMessage: string): Promise<string> => {
        const quality = analyzeQuestionQuality(userMessage);
        setQuestionQuality(quality);

        // If question is vague, prompt for clarification first
        if (quality === 'needs_work' && scaffoldingLevel === 'guided') {
            const clarifyingPrompts = [
                "I'd love to help! To guide you effectively, could you tell me more about what specifically you're trying to understand?",
                "Let me help you refine that question. What aspect is most challenging for you right now?",
                "Good start! Can you share what you already know about this, so I can build on your understanding?"
            ];
            return clarifyingPrompts[Math.floor(Math.random() * clarifyingPrompts.length)];
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/ai/socratic-enhanced`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_message: userMessage,
                    phase,
                    context,
                    user_role: userRole,
                    scaffolding_level: scaffoldingLevel,
                    conversation_history: messages.slice(-6),
                    question_quality: quality
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.response;
            }
        } catch (error) {
            console.error('Enhanced Socratic API error:', error);
        }

        // Fallback Socratic response
        return generateFallbackResponse(userMessage, quality);
    };

    const generateFallbackResponse = (userMessage: string, quality: string): string => {
        const strategies = Object.values(SOCRATIC_STRATEGIES);
        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        const randomQuestion = randomStrategy[Math.floor(Math.random() * randomStrategy.length)];

        if (userRole === 'instructor') {
            return `That's an interesting approach for your course design.

**Let me ask you to reflect:**
${randomQuestion}

Additionally, consider how this aligns with the ${phase} phase of the IRIS framework. What specific learning outcomes are you targeting?`;
        }

        return `🤔 ${randomQuestion}

Think about this carefully before responding. The goal isn't to find the "right" answer immediately—it's to deepen your understanding through reflection.

*Tip: Try explaining your reasoning out loud or writing it down before you respond.*`;
    };

    // Handle message send
    const handleSend = async () => {
        if (!input.trim()) return;

        // Check daily limit (based on SocraticAI research)
        if (dailyInteractions >= 20 && userRole === 'student') {
            setShowLimitWarning(true);
            return;
        }

        const userMessage = input;
        setInput('');
        setMessages(prev => [...prev, {
            role: 'user',
            text: userMessage,
            timestamp: Date.now()
        }]);
        setLoading(true);
        setDailyInteractions(prev => prev + 1);

        const response = await generateScaffoldedResponse(userMessage);

        setMessages(prev => [...prev, {
            role: 'ai',
            text: response,
            type: 'question',
            timestamp: Date.now()
        }]);
        setLoading(false);
    };

    // Handle reflection submission
    const handleReflectionSubmit = (id: string, response: string) => {
        setReflectionPrompts(prev => prev.map(r =>
            r.id === id ? { ...r, answered: true, response } : r
        ));

        const updatedReflections = reflectionPrompts.map(r =>
            r.id === id ? { ...r, answered: true, response } : r
        );

        if (updatedReflections.every(r => r.answered)) {
            onReflectionComplete?.(updatedReflections);
            setMessages(prev => [...prev, {
                role: 'ai',
                text: "🎉 Excellent work completing all your reflections! This kind of deliberate thinking accelerates your learning. Would you like to discuss any of your reflections further?",
                type: 'praise',
                timestamp: Date.now()
            }]);
        }
    };

    const handleClear = () => {
        if (confirm('Clear conversation? This will reset your progress.')) {
            localStorage.removeItem(storageKey);
            initializeConversation();
            setDailyInteractions(0);
        }
    };

    return (
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold flex items-center gap-2">
                            <Brain className="w-5 h-5" />
                            Socratic Tutor
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                {phase.charAt(0).toUpperCase() + phase.slice(1)}
                            </span>
                        </h3>
                        <p className="text-xs opacity-90 mt-1">
                            {userRole === 'instructor' ? 'Course Development Assistant' : 'Guiding you to discover answers'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Scaffolding Level Selector */}
                        <select
                            value={scaffoldingLevel}
                            onChange={(e) => setScaffoldingLevel(e.target.value as ScaffoldingLevel)}
                            className="text-xs bg-white/20 border-none rounded-lg text-white px-2 py-1"
                        >
                            <option value="exploration" className="text-gray-800">Exploration</option>
                            <option value="guided" className="text-gray-800">Guided</option>
                            <option value="independent" className="text-gray-800">Independent</option>
                        </select>
                        {messages.length > 1 && (
                            <button
                                onClick={handleClear}
                                className="p-2 hover:bg-white/10 rounded-lg"
                                title="Clear history"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Reflection Progress */}
                {reflectionPrompts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/20">
                        <button
                            onClick={() => setShowReflections(!showReflections)}
                            className="w-full flex items-center justify-between text-sm"
                        >
                            <span className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Reflection Progress
                            </span>
                            <span className="flex items-center gap-2">
                                {reflectionPrompts.filter(r => r.answered).length}/{reflectionPrompts.length}
                                <ChevronDown className={`w-4 h-4 transition-transform ${showReflections ? 'rotate-180' : ''}`} />
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Reflections Panel */}
            {showReflections && (
                <div className="bg-emerald-50 p-4 border-b border-emerald-100 max-h-60 overflow-y-auto">
                    <div className="space-y-3">
                        {reflectionPrompts.map(ref => (
                            <div key={ref.id} className="bg-white rounded-lg p-3 border border-emerald-100">
                                <div className="flex items-start gap-2">
                                    {ref.answered ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1" />
                                    ) : (
                                        <HelpCircle className="w-4 h-4 text-amber-500 mt-1" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700">{ref.prompt}</p>
                                        {ref.answered ? (
                                            <p className="text-xs text-gray-500 mt-1 italic">"{ref.response}"</p>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="Your reflection..."
                                                className="mt-2 w-full text-sm p-2 border border-gray-200 rounded-lg"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && e.currentTarget.value) {
                                                        handleReflectionSubmit(ref.id, e.currentTarget.value);
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[280px] max-h-[400px] bg-gray-50">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-white border border-gray-100 shadow-sm rounded-bl-none'
                            }`}>
                            {msg.role === 'ai' && (
                                <div className="flex items-center gap-2 mb-2 text-emerald-600">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-xs font-semibold">
                                        {msg.type === 'praise' ? '🌟 Great Progress!' : 'Socratic Tutor'}
                                    </span>
                                </div>
                            )}
                            <p className={`text-sm whitespace-pre-wrap ${msg.role === 'ai' ? 'text-gray-700' : ''}`}>
                                {msg.text}
                            </p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2 p-3 bg-white rounded-xl mr-auto shadow-sm border border-gray-100">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-75" />
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-150" />
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Question Quality Indicator */}
            {input.length > 10 && (
                <div className={`px-4 py-2 flex items-center gap-2 text-xs ${questionQuality === 'excellent' ? 'bg-green-50 text-green-700' :
                    questionQuality === 'good' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                    }`}>
                    <Zap className="w-3 h-3" />
                    {questionQuality === 'excellent' && "Excellent question! Clear context and specific."}
                    {questionQuality === 'good' && "Good question. Adding more context helps me guide you better."}
                    {questionQuality === 'needs_work' && "Tip: Try adding what you already know or what specifically confuses you."}
                </div>
            )}

            {/* Daily Limit Warning */}
            {showLimitWarning && (
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-amber-700">
                        You've reached your daily interaction limit. This limit encourages independent thinking. Try again tomorrow!
                    </p>
                    <button onClick={() => setShowLimitWarning(false)} className="ml-auto text-amber-600 hover:text-amber-700">
                        ✕
                    </button>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setQuestionQuality(analyzeQuestionQuality(e.target.value));
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-sm"
                        placeholder={userRole === 'instructor' ? "Ask about course design..." : "What are you trying to understand?"}
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className={`px-4 py-2 rounded-xl font-semibold text-white transition-all ${loading || !input.trim() ? 'bg-gray-300' : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {userRole === 'student' ? (
                        <>
                            <button
                                onClick={() => setInput("I'm confused about ")}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                            >
                                I'm confused about...
                            </button>
                            <button
                                onClick={() => setInput("Can you help me understand why ")}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                            >
                                Help me understand why...
                            </button>
                            <button
                                onClick={() => setInput("What should I consider when ")}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                            >
                                What should I consider...
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setInput("How can I improve the learning outcomes for ")}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                            >
                                Improve outcomes
                            </button>
                            <button
                                onClick={() => setInput("Suggest engaging activities for ")}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                            >
                                Activity ideas
                            </button>
                            <button
                                onClick={() => setInput("How should I assess ")}
                                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600"
                            >
                                Assessment design
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EnhancedSocraticTutor;
