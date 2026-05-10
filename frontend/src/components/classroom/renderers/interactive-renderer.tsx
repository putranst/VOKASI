'use client';

import { useState, useCallback } from 'react';
import { CheckCircle2, GripVertical, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { InteractiveContent, InteractiveItem } from '@/lib/classroom/types';

interface InteractiveRendererProps {
  content: InteractiveContent;
  onComplete?: () => void;
}

export function InteractiveRenderer({ content, onComplete }: InteractiveRendererProps) {
  const [items, setItems] = useState<InteractiveItem[]>(() => 
    [...content.items].sort(() => Math.random() - 0.5)
  );
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const checkOrder = useCallback(() => {
    if (!content.correctOrder) return false;
    
    const currentOrder = items.map((item) => item.id);
    return JSON.stringify(currentOrder) === JSON.stringify(content.correctOrder);
  }, [items, content.correctOrder]);

  const checkMatches = useCallback(() => {
    if (content.activityType !== 'matching') return false;
    
    return content.items.every((item) => {
      if (!item.matchId) return true;
      return matches[item.id] === item.matchId;
    });
  }, [items, matches, content.activityType]);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (!draggedItem) return;

    const dragIndex = items.findIndex((item) => item.id === draggedItem);
    if (dragIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(targetIndex, 0, removed);
    setItems(newItems);
    setDraggedItem(null);
  };

  const handleMatch = (itemId: string, matchId: string) => {
    setMatches((prev) => ({ ...prev, [itemId]: matchId }));
  };

  const handleSubmit = () => {
    const isCorrect = content.activityType === 'ordering' ? checkOrder() : checkMatches();
    setIsComplete(isCorrect);
    if (isCorrect) {
      onComplete?.();
    }
  };

  const shuffleItems = () => {
    setItems([...items].sort(() => Math.random() - 0.5));
    setIsComplete(false);
  };

  const isCorrect = content.activityType === 'ordering' ? checkOrder() : checkMatches();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{content.activityType.replace('-', ' ').toUpperCase()}</CardTitle>
        <CardDescription>{content.instructions}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ordering Activity */}
        {content.activityType === 'ordering' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={shuffleItems}>
                <Shuffle className="h-4 w-4 mr-1" />
                Shuffle
              </Button>
            </div>
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`flex items-center gap-2 p-3 bg-muted rounded-lg cursor-move hover:bg-muted/80 ${
                  isComplete ? 'border-2 border-green-500' : ''
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{item.content}</span>
                <Badge variant="outline">{index + 1}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Matching Activity */}
        {content.activityType === 'matching' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Items</h4>
              {content.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    matches[item.id] ? 'bg-primary/10' : 'bg-muted'
                  }`}
                  onClick={() => {
                    // Select first item for matching
                    setDraggedItem(item.id);
                  }}
                >
                  {item.content}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Matches</h4>
              {content.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    matches[draggedItem || ''] === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  onClick={() => {
                    if (draggedItem && draggedItem !== item.id) {
                      handleMatch(draggedItem, item.id);
                      setDraggedItem(null);
                    }
                  }}
                >
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fill-in-blank Activity */}
        {content.activityType === 'fill-blank' && (
          <div className="space-y-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: content.instructions.replace(
                  /___/g,
                  '<span class="inline-block min-w-[100px] border-b-2 border-primary"></span>'
                ),
              }}
            />
            <div className="flex flex-wrap gap-2">
              {items.map((item) => (
                <Badge
                  key={item.id}
                  variant={matches[item.id] ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    // Handle fill-blank selection
                    const nextBlank = Object.keys(matches).length;
                    handleMatch(`blank-${nextBlank}`, item.id);
                  }}
                >
                  {item.content}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Result message */}
        {isComplete && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-800 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Correct! Well done!</span>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end gap-2">
          {!isComplete && (
            <Button onClick={handleSubmit} disabled={!isCorrect && (content.activityType === 'ordering' ? items.length > 0 : Object.keys(matches).length > 0)}>
              Check Answer
            </Button>
          )}
          {isComplete && (
            <Button onClick={onComplete}>Continue</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
