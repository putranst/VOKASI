"use client";

import { useState } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function StudentTutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI Tutor. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulated AI response
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me explain...",
        "I understand you're curious about this topic. Here's what I think...",
        "Based on your learning progress, I'd suggest focusing on the fundamentals first.",
        "Let me break this down into simpler concepts for you."
      ];
      const aiMessage: Message = { 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">AI Tutor</h2>
      
      <div className="bg-slate-900 rounded-xl border border-slate-800 h-[500px] flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-800 text-slate-200'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 rounded-lg p-3">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Topics */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Suggested Topics</h3>
        <div className="flex flex-wrap gap-2">
          {['AI Ethics', 'Prompt Engineering', 'Machine Learning Basics', 'Critical Thinking'].map(topic => (
            <button
              key={topic}
              onClick={() => setInput(`Tell me about ${topic}`)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
