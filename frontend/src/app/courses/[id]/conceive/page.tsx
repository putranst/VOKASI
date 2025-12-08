'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, Lightbulb, Target, Users, Clock, Save, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { useSocraticPage } from '@/contexts/SocraticContext';
import GradingResultsModal from '@/components/GradingResultsModal';
import CDIOStepper from '@/components/ui/CDIOStepper';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { ThinkingIndicator } from '@/components/ui/ThinkingIndicator';
import { useTypewriter } from '@/hooks/useTypewriter';

interface ProjectCharter {
    id: number;
    project_id: number;
    problem_statement: string;
    success_metrics: string;
    target_outcome?: string;
    constraints?: string;
    stakeholders?: string;
    suggested_tools: string[];
    estimated_duration?: string;
    difficulty_level?: string;
    reasoning?: string;  // AI explanation for suggestions
    created_at: string;
    updated_at: string;
}

export default function ConceivePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const { user } = useAuth();

    const [projectId, setProjectId] = useState<number | null>(null);
    const [charter, setCharter] = useState<ProjectCharter | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [grading, setGrading] = useState(false);
    const [gradingResult, setGradingResult] = useState<any>(null);
    const [showGradingModal, setShowGradingModal] = useState(false);
    const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'generating' | 'refining'>('idle');

    // Typewriter effect for AI reasoning
    const { displayedText: aiReasoningText } = useTypewriter(charter?.reasoning || '', 30);

    // Form state
    const [problemStatement, setProblemStatement] = useState('');
    const [successMetrics, setSuccessMetrics] = useState('');
    const [targetOutcome, setTargetOutcome] = useState('');
    const [constraints, setConstraints] = useState('');
    const [stakeholders, setStakeholders] = useState('');

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Register with Socratic context for AI Companion integration
    useSocraticPage(
        projectId?.toString() || '0',
        'conceive',
        { problemStatement, successMetrics, targetOutcome }
    );

    // On load: Create or fetch existing project
    useEffect(() => {
        async function initializeProject() {
            // Validate required data before proceeding
            if (!user || !courseId || isNaN(parseInt(courseId))) {
                setLoading(false);
                return;
            }

            try {
                // Check if project already exists for this course+user
                const { data: projects, error: projectsError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('course_id', courseId)
                    .eq('user_id', user.id);

                if (projectsError) throw projectsError;

                if (projects && projects.length > 0) {
                    // Use existing project
                    const project = projects[0];
                    setProjectId(project.id);

                    // Try to fetch existing charter
                    const { data: charterData, error: charterError } = await supabase
                        .from('project_charters')
                        .select('*')
                        .eq('project_id', project.id)
                        .single();

                    if (charterData) {
                        setCharter(charterData);
                        // Populate form with existing data
                        setProblemStatement(charterData.problem_statement || '');
                        setSuccessMetrics(charterData.success_metrics || '');
                        setTargetOutcome(charterData.target_outcome || '');
                        setConstraints(charterData.constraints || '');
                        setStakeholders(charterData.stakeholders || '');
                    }
                } else {
                    // Create new project
                    const { data: newProject, error: createError } = await supabase
                        .from('projects')
                        .insert({
                            course_id: parseInt(courseId),
                            user_id: user.id,
                            title: 'My Project', // Default title
                            current_phase: 'conceive',
                            overall_status: 'in_progress'
                        })
                        .select()
                        .single();

                    if (createError) throw createError;

                    if (newProject) {
                        setProjectId(newProject.id);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize project:', error);
            } finally {
                setLoading(false);
            }
        }

        initializeProject();
    }, [courseId, user]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (problemStatement.length < 50) {
            newErrors.problemStatement = 'Problem statement must be at least 50 characters';
        }

        if (successMetrics.length < 20) {
            newErrors.successMetrics = 'Success metrics must be at least 20 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveCharter = async () => {
        if (!validateForm() || !projectId) return;

        setSaving(true);
        setSuccess(false);
        setAiStatus('analyzing');

        try {
            // Call backend API which handles both saving and AI suggestions
            const response = await fetch(`http://localhost:8000/api/v1/projects/${projectId}/charter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    problem_statement: problemStatement,
                    success_metrics: successMetrics,
                    target_outcome: targetOutcome || null,
                    constraints: constraints || null,
                    stakeholders: stakeholders || null
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to save charter: ${response.statusText}`);
            }

            const savedCharter = await response.json();

            // Update local state with the charter including AI suggestions
            setCharter(savedCharter);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save charter:', error);
            alert('Failed to save charter. Please try again.');
        } finally {
            setSaving(false);
            setAiStatus('idle');
        }
    };

    const handleProceedToDesign = () => {
        if (!charter) {
            alert('Please save your charter first');
            return;
        }
        // Navigate to design phase (we'll create this next)
        router.push(`/courses/${courseId}/design?project=${projectId}`);
    };

    const handleRequestFeedback = async () => {
        if (!projectId || !charter) {
            alert('Please save your charter first before requesting feedback');
            return;
        }

        setGrading(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/grading/charter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: projectId,
                    problem_statement: charter.problem_statement,
                    success_metrics: charter.success_metrics,
                    target_outcome: charter.target_outcome,
                    constraints: charter.constraints,
                    stakeholders: charter.stakeholders
                })
            });

            if (response.ok) {
                const result = await response.json();
                setGradingResult(result);
                setShowGradingModal(true);
            } else {
                alert('Failed to get feedback. Please try again.');
            }
        } catch (error) {
            console.error('Grading request failed:', error);
            alert('Network error. Please check your connection.');
        } finally {
            setGrading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing your project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Conceive Phase</h1>
                            <p className="text-sm text-gray-600">Define your project vision</p>
                        </div>
                    </div>

                    {/* CDIO Progress Bar */}
                    <div className="mt-6 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-medium">
                        <span className="text-primary">Conceive</span>
                        <span className="text-gray-400">Design</span>
                        <span className="text-gray-400">Implement</span>
                        <span className="text-gray-400">Operate</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* CDIO Stepper Navigation */}
                <CDIOStepper courseId={parseInt(courseId)} currentPhase="conceive" />

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-green-800 font-medium">Charter saved successfully!</p>
                    </div>
                )}

                {/* Instructions Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">📋 Project Charter Instructions</h2>
                    <p className="text-gray-600 mb-4">
                        The Conceive phase is where you transform a vague idea into a concrete project scope.
                        Think of this as creating a business case for your solution.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                            <Target className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-gray-900">Problem Statement</p>
                                <p className="text-sm text-gray-600">What challenge needs solving?</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-gray-900">Success Metrics</p>
                                <p className="text-sm text-gray-600">How will you measure success?</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="space-y-6">
                        {/* Problem Statement */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                1. Problem Statement *
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Describe the business problem or challenge you want to solve. Be specific about who is affected and why it matters.
                            </p>
                            <textarea
                                value={problemStatement}
                                onChange={(e) => setProblemStatement(e.target.value)}
                                className={`w-full p-4 border ${errors.problemStatement ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none`}
                                rows={5}
                                placeholder="Example: I spend 2 hours daily replying to leads who can't afford my services, preventing me from focusing on high-value clients."
                            />
                            {errors.problemStatement && (
                                <p className="text-sm text-red-600 mt-1">{errors.problemStatement}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{problemStatement.length} / 50 characters minimum</p>
                        </div>

                        {/* Success Metrics */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                2. Success Metrics *
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                How will you measure if your solution worked? Use quantifiable metrics.
                            </p>
                            <textarea
                                value={successMetrics}
                                onChange={(e) => setSuccessMetrics(e.target.value)}
                                className={`w-full p-4 border ${errors.successMetrics ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none`}
                                rows={3}
                                placeholder="Example: Reduce lead response time by 80%, filter 90% of unqualified leads automatically."
                            />
                            {errors.successMetrics && (
                                <p className="text-sm text-red-600 mt-1">{errors.successMetrics}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{successMetrics.length} / 20 characters minimum</p>
                        </div>

                        {/* Target Outcome */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                3. Target Outcome (Optional)
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                What is the end deliverable or result?
                            </p>
                            <input
                                type="text"
                                value={targetOutcome}
                                onChange={(e) => setTargetOutcome(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Example: A working AI agent that triages leads based on budget."
                            />
                        </div>

                        {/* Constraints */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                4. Constraints (Optional)
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                List any budget, time, or resource limitations.
                            </p>
                            <input
                                type="text"
                                value={constraints}
                                onChange={(e) => setConstraints(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Example: Must be built in 2 weeks, budget under $100/month."
                            />
                        </div>

                        {/* Stakeholders */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                5. Stakeholders (Optional)
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Who is affected by or involved in this project?
                            </p>
                            <input
                                type="text"
                                value={stakeholders}
                                onChange={(e) => setStakeholders(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Example: Sales team, potential customers, business owner."
                            />
                        </div>
                    </div>

                    {/* AI Suggestions (if charter saved) */}
                    {charter && charter.suggested_tools.length > 0 && (
                        <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-purple-50 rounded-xl border border-primary/20">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-primary" />
                                AI-Generated Suggestions
                            </h3>

                            <div className="mb-6">
                                <ThinkingIndicator status={aiStatus} />
                            </div>

                            {/* AI Reasoning */}
                            {charter.reasoning && aiStatus === 'idle' && (
                                <div className="mb-4 p-3 bg-white/50 rounded-lg">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">💡 Why these tools?</p>
                                    <p className="text-sm text-gray-600 min-h-[60px]">{aiReasoningText}</p>
                                </div>
                            )}

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Suggested Tools</p>
                                    <div className="flex flex-wrap gap-2">
                                        {charter.suggested_tools.map((tool, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-700 border border-gray-200">
                                                {tool}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {charter.estimated_duration && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700">Estimated Time</p>
                                            <p className="text-sm text-gray-600">{charter.estimated_duration}</p>
                                        </div>
                                    </div>
                                )}
                                {charter.difficulty_level && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-1">Difficulty</p>
                                        <p className="text-sm text-gray-600">{charter.difficulty_level}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handleSaveCharter}
                                disabled={saving}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Saving...' : 'Save Charter'}
                            </button>

                            {charter && (
                                <button
                                    onClick={handleProceedToDesign}
                                    className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    Proceed to Design
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {charter && (
                            <button
                                onClick={handleRequestFeedback}
                                disabled={grading}
                                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Star className="w-5 h-5" />
                                {grading ? 'Getting AI Feedback...' : 'Request AI Feedback'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Example Card */}
                <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 mb-3">💡 Example Project Charter</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                        <p><strong>Problem:</strong> "Our customer service team receives 200+ repetitive questions daily, preventing them from handling complex issues."</p>
                        <p><strong>Success:</strong> "Reduce repetitive tickets by 70%, freeing up 10 hours/week of agent time."</p>
                        <p><strong>Outcome:</strong> "AI-powered FAQ chatbot integrated with our help desk."</p>
                    </div>
                </div>
            </div>



            <GradingResultsModal
                isOpen={showGradingModal}
                onClose={() => setShowGradingModal(false)}
                result={gradingResult}
                title="Charter Evaluation"
            />
        </div>
    );
}
