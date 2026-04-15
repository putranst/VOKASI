"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Send,
  User,
  GraduationCap,
  Users,
  HelpCircle,
  MessageSquare,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface Message {
  type: "student" | "agent" | "system";
  content: string;
  agent_type?: "teacher" | "classmate" | "ta";
  timestamp: string;
}

interface ClassroomSession {
  session_id: string;
  course_id: number;
  module_id: number;
  user_id: number;
  status: string;
  created_at: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8001";
const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:8001";

export default function MAIClassroom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!sessionId) return;

    // Create WebSocket connection
    const wsUrl = `${WS_BASE_URL.replace(/\/$/, "")}/ws/classroom/${sessionId}`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
      console.log("Connected to classroom");
    };
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.error) {
          setError(message.error);
          return;
        }
        
        setMessages(prev => [...prev, message]);
        
        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
    };
    
    socket.onclose = () => {
      setIsConnected(false);
      console.log("Disconnected from classroom");
    };
    
    socket.onerror = (error) => {
      setError("Connection error. Please refresh the page.");
      setIsConnected(false);
    };
    
    socketRef.current = socket;
    
    // Fetch session details
    fetchSessionDetails();
    
    return () => {
      socket.close();
    };
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL.replace(/\/$/, "")}/api/v1/classroom/sessions/${sessionId}`
      );
      if (response.ok) {
        const sessionData = await response.json();
        setSession(sessionData);
      }
    } catch (err) {
      console.error("Failed to fetch session details:", err);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;
    
    const message = {
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    socketRef.current?.send(JSON.stringify(message));
    setInputMessage("");
    setIsTyping(true);
    
    // Reset typing indicator after a delay
    setTimeout(() => setIsTyping(false), 3000);
  };

  const getAgentIcon = (agentType?: string) => {
    switch (agentType) {
      case "teacher":
        return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case "classmate":
        return <Users className="w-5 h-5 text-green-600" />;
      case "ta":
        return <HelpCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAgentName = (agentType?: string) => {
    switch (agentType) {
      case "teacher":
        return "Guru AI";
      case "classmate":
        return "Teman Kelas";
      case "ta":
        return "Asisten Pengajar";
      case "student":
        return "Saya";
      default:
        return "System";
    }
  };

  const getAgentColor = (agentType?: string) => {
    switch (agentType) {
      case "teacher":
        return "bg-blue-50 border-blue-200";
      case "classmate":
        return "bg-green-50 border-green-200";
      case "ta":
        return "bg-purple-50 border-purple-200";
      case "student":
        return "bg-indigo-50 border-indigo-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (error && !isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Classroom</h1>
              <p className="text-sm text-gray-600">
                {session ? `Module ${session.module_id}` : "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`} />
              {isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ minHeight: "calc(100vh - 200px)" }}>
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === "student" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-3xl ${message.type === "student" ? "order-2" : "order-1"}`}>
              <div className={`flex items-center space-x-2 mb-1 ${message.type === "student" ? "justify-end" : "justify-start"}`}>
                <div className="flex items-center space-x-1">
                  {getAgentIcon(message.agent_type)}
                  <span className="text-sm font-medium text-gray-700">
                    {getAgentName(message.agent_type)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <div className={`px-4 py-3 rounded-lg border ${getAgentColor(message.agent_type)} ${
                message.type === "student" ? "ml-12" : "mr-12"
              }`}>
                <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI agents are thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ketik pertanyaan kamu di sini..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Kirim</span>
          </button>
        </div>
        
        {/* Agent Status */}
        <div className="mt-3 flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <GraduationCap className="w-3 h-3 text-blue-600" />
            <span>Guru AI - Selalu aktif</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-green-600" />
            <span>Teman Kelas - Acak</span>
          </div>
          <div className="flex items-center space-x-1">
            <HelpCircle className="w-3 h-3 text-purple-600" />
            <span>Asisten - @TA atau kebingungan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
