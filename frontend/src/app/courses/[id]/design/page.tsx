'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Pencil, Save, CheckCircle2, ArrowRight, ArrowLeft, Lightbulb, MessageSquare, Layers, GitBranch, Star, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSocraticPage } from '@/contexts/SocraticContext';
import GradingResultsModal from '@/components/GradingResultsModal';
import CDIOStepper from '@/components/ui/CDIOStepper';
import { Navbar } from '@/components/Navbar';

interface DesignBlueprint {
    id: number;
    project_id: number;
    architecture_diagram?: any;
    logic_flow?: string;
    component_list: string[];
    data_flow?: string;
    ai_validation_score?: number;
    validation_notes?: string;
    created_at: string;
    updated_at: string;
}

interface ProjectCharter {
    problem_statement: string;
    success_metrics: string;
    target_outcome?: string;
}

export default function DesignPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = params.id as string;
    const projectId = searchParams.get('project');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [charter, setCharter] = useState<ProjectCharter | null>(null);
    const [blueprint, setBlueprint] = useState<DesignBlueprint | null>(null);
    const [grading, setGrading] = useState(false);
    const [gradingResult, setGradingResult] = useState<any>(null);
    const [showGradingModal, setShowGradingModal] = useState(false);

    // Form state
    const [logicFlow, setLogicFlow] = useState('');
    const [components, setComponents] = useState<string[]>([]);
    const [newComponent, setNewComponent] = useState('');
    const [dataFlow, setDataFlow] = useState('');

    // Register with Socratic context for AI Companion integration
    useSocraticPage(
        projectId || '',
        'design',
        { logic_flow: logicFlow, components, data_flow: dataFlow }
    );

    useEffect(() => {
        async function loadData() {
            if (!projectId) {
                alert('No project ID found. Please start from the Conceive phase.');
                router.push(`/courses/${courseId}/conceive`);
                return;
            }

            try {
                // Load charter for context
                const { data: charterData, error: charterError } = await supabase
                    .from('project_charters')
                    .select('*')
                    .eq('project_id', projectId)
                    .single();

                if (charterData) {
                    setCharter(charterData);
                }

                // Try to load existing blueprint
                const { data: blueprintData, error: blueprintError } = await supabase
                    .from('design_blueprints')
                    .select('*')
                    .eq('project_id', projectId)
                    .single();

                if (blueprintData) {
                    setBlueprint(blueprintData);
                    setLogicFlow(blueprintData.logic_flow || '');
                    setComponents(blueprintData.component_list || []);
                    setDataFlow(blueprintData.data_flow || '');
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [projectId, courseId, router]);

    const handleAddComponent = () => {
        if (newComponent.trim()) {
            setComponents([...components, newComponent.trim()]);
            setNewComponent('');
        }
    };

    const handleRemoveComponent = (index: number) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    const handleSaveBlueprint = async () => {
        if (!projectId) return;

        setSaving(true);
        setSuccess(false);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/blueprints?project_id=${projectId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    architecture_diagram: null,
                    logic_flow: logicFlow,
                    component_list: components,
                    data_flow: dataFlow
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to save blueprint: ${response.statusText}`);
            }

            const savedBlueprint = await response.json();
            setBlueprint(savedBlueprint);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save blueprint:', error);
            alert('Failed to save blueprint. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleProceedToImplement = () => {
        if (!blueprint) {
            alert('Please save your design blueprint first');
            return;
        }
        router.push(`/courses/${courseId}/implement?project=${projectId}`);
    };

    const handleBackToConceive = () => {
        router.push(`/courses/${courseId}/conceive`);
    };

    const handleRequestFeedback = async () => {
        if (!projectId || !blueprint) {
            alert('Please save your design blueprint first before requesting feedback');
            return;
        }

        setGrading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/grading/blueprint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    project_id: parseInt(projectId),
                    logic_flow: logicFlow,
                    component_list: components,
                    data_flow: dataFlow
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
                    <p className="text-gray-600">Loading your project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Top Navigation */}
            <Navbar />

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Pencil className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Design Phase</h1>
                            <p className="text-sm text-gray-600">Architect your solution logic</p>
                        </div>
                    </div>

                    {/* CDIO Progress Bar */}
                    <div className="mt-6 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-primary rounded-full"></div>
                        <div className="flex-1 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs font-medium">
                        <span className="text-primary">Conceive</span>
                        <span className="text-blue-600">Design</span>
                        <span className="text-gray-400">Implement</span>
                        <span className="text-gray-400">Operate</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* CDIO Stepper Navigation */}
                <CDIOStepper courseId={parseInt(courseId)} currentPhase="design" />

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Design Tools */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Success Message */}
                        {success && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <p className="text-green-800 font-medium">Design blueprint saved!</p>
                            </div>
                        )}

                        {/* Problem Context Card */}
                        {charter && (
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-purple-600" />
                                    Your Problem (from Conceive Phase)
                                </h3>
                                <p className="text-sm text-gray-700 mb-2"><strong>Problem:</strong> {charter.problem_statement}</p>
                                <p className="text-sm text-gray-700"><strong>Success Metrics:</strong> {charter.success_metrics}</p>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">📐 Design Phase Instructions</h2>
                            <p className="text-gray-600 mb-4">
                                Before writing code, you must design the architecture and logic. This ensures you're solving the right problem the right way.
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div className="flex gap-2">
                                    <GitBranch className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Logic Flow</p>
                                        <p className="text-gray-600">Map decision points and processes</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Layers className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Components</p>
                                        <p className="text-gray-600">Identify modules and functions</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logic Flow */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                1. Logic Flow Description
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Describe how your solution will process information step-by-step. Include decision points, conditionals, and the flow of data.
                            </p>
                            <textarea
                                value={logicFlow}
                                onChange={(e) => setLogicFlow(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                rows={8}
                                placeholder="Example:&#10;1. User sends message via WhatsApp&#10;2. Extract budget amount using NLP (entity extraction)&#10;3. IF budget > $5,000 THEN&#10;     - Check business hours&#10;     - Send high-priority alert to owner&#10;   ELSE&#10;     - Send automated Calendly link&#10;4. Log interaction to CRM"
                            />
                        </div>

                        {/* Components List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                2. System Components
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                List the modules, functions, or services your solution will need.
                            </p>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newComponent}
                                    onChange={(e) => setNewComponent(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComponent()}
                                    className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    placeholder="e.g., WhatsApp API Handler, Budget Extractor, Calendar Scheduler"
                                />
                                <button
                                    onClick={handleAddComponent}
                                    className="px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="space-y-2">
                                {components.map((comp, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">{comp}</span>
                                        <button
                                            onClick={() => handleRemoveComponent(idx)}
                                            className="text-red-600 hover:text-red-700 text-sm font-semibold"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {components.length === 0 && (
                                    <p className="text-sm text-gray-400 italic">No components added yet</p>
                                )}
                            </div>
                        </div>

                        {/* Data Flow */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                3. Data Flow (Optional)
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                How does data move through your system? What APIs or databases are involved?
                            </p>
                            <input
                                type="text"
                                value={dataFlow}
                                onChange={(e) => setDataFlow(e.target.value)}
                                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                placeholder="e.g., WhatsApp Webhook → Python Backend → OpenAI API → Calendar API → Database"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBackToConceive}
                                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Conceive
                            </button>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSaveBlueprint}
                                    disabled={saving}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {saving ? 'Saving...' : 'Save Design'}
                                </button>

                                {blueprint && (
                                    <button
                                        onClick={handleProceedToImplement}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                                    >
                                        Proceed to Implement
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Request AI Feedback Button */}
                        {blueprint && (
                            <button
                                onClick={handleRequestFeedback}
                                disabled={grading}
                                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Star className="w-5 h-5" />
                                {grading ? 'Getting AI Feedback...' : 'Request AI Design Review'}
                            </button>
                        )}
                    </div>
                </div>
            </div>



            <GradingResultsModal
                isOpen={showGradingModal}
                onClose={() => setShowGradingModal(false)}
                result={gradingResult}
                title="Design Blueprint Review"
            />
        </div>
    );
}
