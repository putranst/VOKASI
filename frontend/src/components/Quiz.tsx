'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Award, Clock, ChevronRight } from 'lucide-react';

interface QuizQuestion {
    id: number;
    text: string;
    options: string[];
    correct_answer: number;
}

interface Quiz {
    id: number;
    course_id: number;
    title: string;
    duration: string;
    questions: QuizQuestion[];
}

interface QuizSubmissionResult {
    score: number;
    total_questions: number;
    passed: boolean;
}

interface QuizComponentProps {
    courseId: number;
    onComplete?: () => void;
}

export default function QuizComponent({ courseId, onComplete }: QuizComponentProps) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<QuizSubmissionResult | null>(null);

    useEffect(() => {
        fetchQuiz();
    }, [courseId]);

    const fetchQuiz = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/quizzes`);
            const quizzes = await res.json();
            if (quizzes.length > 0) {
                setQuiz(quizzes[0]);
            }
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId: number, answerIndex: number) => {
        if (!submitted) {
            setSelectedAnswers({
                ...selectedAnswers,
                [questionId]: answerIndex
            });
        }
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/quizzes/${quiz.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    answers: selectedAnswers
                })
            });

            const submissionResult = await res.json();
            setResult(submissionResult);
            setSubmitted(true);
        } catch (error) {
            console.error('Failed to submit quiz:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-gray-600">Loading quiz...</div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="text-center p-12">
                <p className="text-gray-600">No quiz available for this course.</p>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((Object.keys(selectedAnswers).length / quiz.questions.length) * 100).toFixed(0);

    if (submitted && result) {
        const percentage = ((result.score / result.total_questions) * 100).toFixed(0);

        return (
            <div className="p-12 space-y-8">
                <div className="text-center">
                    <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                        {result.passed ? <Award className="text-green-600" size={48} /> : <XCircle className="text-red-600" size={48} />}
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">{result.passed ? 'Congratulations!' : 'Keep Learning!'}</h2>
                    <p className="text-gray-600">{result.passed ? 'You passed the quiz!' : 'You need 70% to pass. Review the material and try again.'}</p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
                    <div className="text-6xl font-black text-primary mb-2">{percentage}%</div>
                    <div className="text-lg text-gray-700 font-bold">{result.score} out of {result.total_questions} correct</div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Answer Review</h3>
                    {quiz.questions.map((question, index) => {
                        const userAnswer = selectedAnswers[question.id];
                        const isCorrect = userAnswer === question.correct_answer;
                        return (
                            <div key={question.id} className="bg-white rounded-xl p-4 border-2 border-gray-200">
                                <div className="flex items-start gap-3">
                                    {isCorrect ? <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={20} /> : <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />}
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 mb-2">{index + 1}. {question.text}</p>
                                        <p className="text-sm text-gray-600"><span className="font-bold">Your answer: </span>{question.options[userAnswer]} {isCorrect && '✓'}</p>
                                        {!isCorrect && <p className="text-sm text-green-700 mt-1"><span className="font-bold">Correct answer: </span>{question.options[question.correct_answer]}</p>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex gap-4">
                    <button onClick={() => { setSubmitted(false); setSelectedAnswers({}); setCurrentQuestionIndex(0); setResult(null); }} className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all">Retake Quiz</button>
                    {result.passed && onComplete && <button onClick={onComplete} className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-[#5a4a3b] transition-all">Continue Learning</button>}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black text-gray-900">{quiz.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock size={16} />
                        <span>{quiz.duration}</span>
                        <span className="mx-2">•</span>
                        <span>{quiz.questions.length} questions</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-primary">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 space-y-6">
                <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">{currentQuestionIndex + 1}</span>
                    <p className="text-lg font-bold text-gray-900 flex-1">{currentQuestion.text}</p>
                </div>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswers[currentQuestion.id] === index;
                        return (
                            <button key={index} onClick={() => handleAnswerSelect(currentQuestion.id, index)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-primary bg-primary/10 font-bold' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className="text-gray-900">{option}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0} className="px-6 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all">Previous</button>
                <span className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-[#5a4a3b] transition-all flex items-center gap-2">Next<ChevronRight size={18} /></button>
                ) : (
                    <button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== quiz.questions.length} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">Submit Quiz</button>
                )}
            </div>
        </div>
    );
}
