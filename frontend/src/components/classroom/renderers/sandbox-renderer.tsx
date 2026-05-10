'use client';

import { useState, useCallback } from 'react';
import { Play, RotateCcw, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import type { SandboxContent } from '@/lib/classroom/types';

interface SandboxRendererProps {
  content: SandboxContent;
  onComplete?: () => void;
}

export function SandboxRenderer({ content, onComplete }: SandboxRendererProps) {
  const [code, setCode] = useState(content.templateCode);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; description: string }> | null>(null);

  const runCode = useCallback(async () => {
    setIsRunning(true);
    setOutput(null);
    setTestResults(null);

    try {
      // Use existing sandbox execution endpoint
      const response = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language: content.language,
          testCases: content.testCases,
        }),
      });

      const result = await response.json();

      if (result.error) {
        setOutput(`Error: ${result.error}`);
      } else {
        setOutput(result.output || 'No output');

        if (result.testResults) {
          setTestResults(result.testResults);
          
          // Auto-complete if all tests pass
          const allPassed = result.testResults.every((r: { passed: boolean }) => r.passed);
          if (allPassed) {
            onComplete?.();
          }
        }
      }
    } catch (error) {
      setOutput(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  }, [code, content, onComplete]);

  const resetCode = () => {
    setCode(content.templateCode);
    setOutput(null);
    setTestResults(null);
  };

  const allTestsPassed = testResults?.every((r) => r.passed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Instructions Panel */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Instructions</CardTitle>
            <Badge variant="outline">{content.language}</Badge>
          </div>
          <CardDescription>{content.instructions}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          {/* Hints */}
          {content.hints && content.hints.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHints(!showHints)}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </Button>
              {showHints && (
                <div className="space-y-2">
                  {content.hints.map((hint, i) => (
                    <div key={i} className="p-3 bg-muted rounded-lg text-sm">
                      <strong>Hint {i + 1}:</strong> {hint}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Test Results */}
          {testResults && (
            <div className="space-y-2">
              <h4 className="font-medium">Test Results</h4>
              {testResults.map((result, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded ${
                    result.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">{result.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Success message */}
          {allTestsPassed && (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">All tests passed!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Editor Panel */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Code Editor</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetCode}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={runCode} disabled={isRunning}>
                <Play className="h-4 w-4 mr-1" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 font-mono text-sm min-h-[300px] resize-none"
            spellCheck={false}
          />

          {/* Output */}
          <div className="flex-1 min-h-[100px]">
            <h4 className="text-sm font-medium mb-2">Output</h4>
            <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-auto max-h-[150px]">
              {output || 'Run your code to see output...'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
