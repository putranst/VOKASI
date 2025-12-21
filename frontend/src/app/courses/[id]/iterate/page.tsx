'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import IRISStepper from '@/components/ui/IRISStepper';
import { useAuth } from '@/lib/AuthContext';
import { RefreshCw, Lightbulb, BarChart3, Code, FileText, Send, CheckCircle, Plus } from 'lucide-react';


interface Iteration {
    number: number;
    hypothesis: string;
    learnings: string;
    completed: boolean;
}

export default function IteratePage() {
    const params = useParams();
    const courseId = Number(params.id);
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [iterations, setIterations] = useState<Iteration[]>([
        { number: 1, hypothesis: '', learnings: '', completed: false }
    ]);
    const [currentIteration, setCurrentIteration] = useState(0);
    const [formData, setFormData] = useState({
        hypothesis: '',
        prototype_url: '',
        code_snapshot: '',
        learnings: '',
        next_hypothesis: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/projects/${courseId}/iteration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    iteration_number: currentIteration + 1,
                    ...formData,
                    user_id: user?.id
                })
            });

            if (response.ok) {
                // Mark current iteration complete
                setIterations(prev => prev.map((it, i) =>
                    i === currentIteration ? { ...it, hypothesis: formData.hypothesis, learnings: formData.learnings, completed: true } : it
                ));

                if (formData.next_hypothesis) {
                    // Add new iteration
                    setIterations(prev => [...prev, {
                        number: prev.length + 1,
                        hypothesis: formData.next_hypothesis,
                        learnings: '',
                        completed: false
                    }]);
                    setCurrentIteration(prev => prev + 1);
                    setFormData({
                        hypothesis: formData.next_hypothesis,
                        prototype_url: '',
                        code_snapshot: '',
                        learnings: '',
                        next_hypothesis: ''
                    });
                } else {
                    setSubmitted(true);
                }
            }
        } catch (error) {
            console.error('Failed to submit iteration:', error);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <IRISStepper courseId={courseId} currentPhase="iterate" completedPhases={['immerse', 'realize', 'iterate']} />

                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Iterate Phase Complete!</h2>
                        <p className="text-gray-600 mb-2">
                            You completed {iterations.filter(i => i.completed).length} Build-Measure-Learn cycles.
                        </p>
                        <p className="text-gray-600 mb-6">
                            Time to scale your solution to the institution!
                        </p>
                        <a
                            href={`/courses/${courseId}/scale`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            Continue to Scale →
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <IRISStepper courseId={courseId} currentPhase="iterate" completedPhases={['immerse', 'realize']} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                    <RefreshCw size={24} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Iterate Phase</h1>
                                    <p className="text-gray-500 text-sm">Days 10-25: Build-Measure-Learn cycles</p>
                                </div>
                            </div>

                            {/* Iteration Progress */}
                            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                                {iterations.map((it, i) => (
                                    <button
                                        key={i}
                                        onClick={() => !it.completed && setCurrentIteration(i)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${i === currentIteration
                                            ? 'bg-primary text-white'
                                            : it.completed
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}
                                    >
                                        {it.completed ? '✓' : ''} BML Cycle {it.number}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                                <h3 className="font-bold text-amber-900 mb-2">Build-Measure-Learn Cycle</h3>
                                <p className="text-sm text-amber-800">
                                    Each iteration follows the BML framework: formulate a hypothesis, build a prototype,
                                    measure results, and learn from outcomes. You can run multiple cycles before scaling.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Hypothesis */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Lightbulb size={16} />
                                        Hypothesis for Cycle {currentIteration + 1} *
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="What are you testing this iteration? What do you expect to happen?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.hypothesis}
                                        onChange={(e) => setFormData(prev => ({ ...prev, hypothesis: e.target.value }))}
                                    />
                                </div>

                                {/* Prototype URL */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Code size={16} />
                                        Prototype URL
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://github.com/... or deployed URL"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        value={formData.prototype_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, prototype_url: e.target.value }))}
                                    />
                                </div>

                                {/* Code Snapshot */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <FileText size={16} />
                                        Key Code Snippet (optional)
                                    </label>
                                    <textarea
                                        rows={6}
                                        placeholder="Paste a key code snippet from your prototype..."
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none font-mono text-sm"
                                        value={formData.code_snapshot}
                                        onChange={(e) => setFormData(prev => ({ ...prev, code_snapshot: e.target.value }))}
                                    />
                                </div>

                                {/* Learnings */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <BarChart3 size={16} />
                                        What Did You Learn? *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="What worked? What didn't? What did you measure? What surprised you?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.learnings}
                                        onChange={(e) => setFormData(prev => ({ ...prev, learnings: e.target.value }))}
                                    />
                                </div>

                                {/* Next Hypothesis */}
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                        <Plus size={16} />
                                        Next Hypothesis (optional)
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">Leave empty if ready to move to Scale phase</p>
                                    <textarea
                                        rows={2}
                                        placeholder="Based on learnings, what will you test in the next cycle?"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        value={formData.next_hypothesis}
                                        onChange={(e) => setFormData(prev => ({ ...prev, next_hypothesis: e.target.value }))}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !formData.hypothesis || !formData.learnings}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Submitting...' : (
                                        <>
                                            <Send size={18} />
                                            {formData.next_hypothesis ? 'Complete & Start Next Cycle' : 'Complete Iteration Phase'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* IRIS Guidance */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Guiding Questions</h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    What hypothesis are you testing?
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    How will you measure effectiveness?
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-600">•</span>
                                    What did you learn from this iteration?
                                </li>
                            </ul>
                        </div>

                        {/* BML Cycle Guide */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">BML Cycle Guide</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">B</div>
                                    <div>
                                        <div className="font-medium">Build</div>
                                        <div className="text-gray-500">Create a minimal prototype</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">M</div>
                                    <div>
                                        <div className="font-medium">Measure</div>
                                        <div className="text-gray-500">Collect data & feedback</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">L</div>
                                    <div>
                                        <div className="font-medium">Learn</div>
                                        <div className="text-gray-500">Extract insights, adjust</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
