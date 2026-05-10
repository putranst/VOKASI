'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Clock, Trophy, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { QuizContent, QuizQuestion, LessonSettings } from '@/lib/classroom/types';

interface QuizRendererProps {
  content: QuizContent;
  settings?: LessonSettings;
  onComplete?: (score: number) => void;
}

export function QuizRenderer({ content, settings, onComplete }: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(settings?.timeLimitSeconds);

  const questions = content.questions;
  const question = questions[currentIndex];
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const calculateScore = useCallback(() => {
    let earnedPoints = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q.id];
      if (userAnswer === q.correctAnswer) {
        earnedPoints += q.points;
      }
    });
    return (earnedPoints / totalPoints) * 100;
  }, [questions, answers, totalPoints]);

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setShowExplanation(false);
  };

  const handleSubmitAnswer = () => {
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      const score = calculateScore();
      setShowResults(true);
      onComplete?.(score);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setShowExplanation(false);
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score >= (settings?.passingScore || 70);

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {passed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <Clock className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </CardTitle>
          <CardDescription>{content.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{score.toFixed(0)}%</div>
            <p className="text-muted-foreground">Your Score</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(answers).filter((id) => {
                  const q = questions.find((q) => q.id === id);
                  return q && answers[id] === q.correctAnswer;
                }).length}
              </div>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {questions.length -
                  Object.keys(answers).filter((id) => {
                    const q = questions.find((q) => q.id === id);
                    return q && answers[id] === q.correctAnswer;
                  }).length}
              </div>
              <p className="text-sm text-muted-foreground">Incorrect</p>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {settings?.allowRetry && (
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button onClick={() => onComplete?.(score)}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const userAnswer = answers[question.id];
  const isCorrect = userAnswer === question.correctAnswer;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-medium">{question.points} points</span>
      </div>

      {/* Progress */}
      <Progress value={((currentIndex + 1) / questions.length) * 100} />

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === 'multiple-choice' && question.options && (
            <RadioGroup
              value={userAnswer?.toString()}
              onValueChange={handleAnswer}
              disabled={showExplanation}
            >
              {question.options.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                  <Label
                    htmlFor={`option-${i}`}
                    className={`flex-1 cursor-pointer ${
                      showExplanation
                        ? i.toString() === question.correctAnswer.toString()
                          ? 'text-green-600 font-medium'
                          : userAnswer === i.toString()
                          ? 'text-red-600'
                          : ''
                        : ''
                    }`}
                  >
                    {option}
                  </Label>
                  {showExplanation && i.toString() === question.correctAnswer.toString() && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {showExplanation &&
                    userAnswer === i.toString() &&
                    userAnswer !== question.correctAnswer.toString() && (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'true-false' && (
            <RadioGroup
              value={userAnswer?.toString()}
              onValueChange={handleAnswer}
              disabled={showExplanation}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false">False</Label>
              </div>
            </RadioGroup>
          )}

          {showExplanation && question.explanation && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Explanation:</strong> {question.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {!showExplanation ? (
          <Button onClick={handleSubmitAnswer} disabled={!userAnswer}>
            Check Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        )}
      </div>
    </div>
  );
}
