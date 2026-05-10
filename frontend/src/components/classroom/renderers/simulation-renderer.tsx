'use client';

import { useState, useCallback } from 'react';
import { Send, User, Bot, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SimulationContent, SimulationTurn } from '@/lib/classroom/types';

interface SimulationRendererProps {
  content: SimulationContent;
  onComplete?: () => void;
}

export function SimulationRenderer({ content, onComplete }: SimulationRendererProps) {
  const [turns, setTurns] = useState<SimulationTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const systemTurns = content.turns.filter((t) => t.speaker === 'system' || t.speaker === 'persona');
  const currentSystemTurn = systemTurns[currentTurnIndex];

  const handleSend = useCallback(() => {
    if (!userInput.trim()) return;

    // Add user turn
    const userTurn: SimulationTurn = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      content: userInput,
    };

    setTurns((prev) => [...prev, userTurn]);
    setUserInput('');

    // Simulate persona response (in real implementation, this would call AI)
    setTimeout(() => {
      const nextSystemTurn = systemTurns[currentTurnIndex];
      if (nextSystemTurn) {
        setTurns((prev) => [...prev, nextSystemTurn]);
        setCurrentTurnIndex((prev) => prev + 1);
      }

      // Check if simulation is complete
      if (currentTurnIndex >= systemTurns.length - 1) {
        setIsComplete(true);
        onComplete?.();
      }
    }, 1000);
  }, [userInput, currentTurnIndex, systemTurns, onComplete]);

  const startSimulation = () => {
    const firstTurn = systemTurns[0];
    if (firstTurn) {
      setTurns([firstTurn]);
      setCurrentTurnIndex(1);
    }
  };

  if (turns.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{content.scenario}</CardTitle>
          <CardDescription>
            Practice your skills in this realistic scenario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Your Role</h4>
            <p className="text-sm">{content.persona.background}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Objectives</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {content.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <Button onClick={startSimulation} className="w-full">
            Start Simulation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <h3 className="font-medium">{content.scenario}</h3>
        <p className="text-sm text-muted-foreground">
          Speaking with: {content.persona.name} ({content.persona.role})
        </p>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {turns.map((turn) => (
          <div
            key={turn.id}
            className={`flex gap-3 ${
              turn.speaker === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <Avatar>
              <AvatarFallback>
                {turn.speaker === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                turn.speaker === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              {turn.content}
            </div>
          </div>
        ))}

        {isComplete && (
          <div className="flex items-center justify-center gap-2 p-4 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Simulation Complete!</span>
          </div>
        )}
      </div>

      {/* Input */}
      {!isComplete && (
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1"
            />
            <Button type="submit" disabled={!userInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      {isComplete && (
        <div className="p-4 border-t">
          <Button onClick={onComplete} className="w-full">
            Continue to Next Lesson
          </Button>
        </div>
      )}
    </div>
  );
}
