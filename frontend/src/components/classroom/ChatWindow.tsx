"use client";

import React, { useEffect, useRef } from "react";
import { AgentBubble, AgentType } from "./AgentBubble";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  agent: AgentType;
  agentName?: string;
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface TypingAgent {
  agent: AgentType;
  agentName?: string;
}

export interface ChatWindowProps {
  messages: Message[];
  /** When set, renders a typing indicator bubble for the given agent. */
  typingAgent?: TypingAgent | null;
  /** When true, renders a "TA dipanggil untuk membantu kamu" notice. */
  taActivated?: boolean;
  className?: string;
}

// ─── System Notice ────────────────────────────────────────────────────────────

function SystemNotice({ text, icon }: { text: string; icon: string }) {
  return (
    <div className="flex justify-center my-3">
      <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-4 py-2 rounded-full shadow-sm">
        <span>{icon}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}

// ─── Date Divider ─────────────────────────────────────────────────────────────

function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <span className="text-3xl">🧑‍🏫</span>
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-2">
        Selamat datang di AI Classroom!
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
        Kelas ini dihadiri oleh{" "}
        <span className="font-semibold text-blue-600">Tutor AI</span>,{" "}
        <span className="font-semibold text-green-600">teman sekelas</span>, dan{" "}
        <span className="font-semibold text-purple-600">TA</span> yang siap
        membantu. Mulailah dengan mengetik pertanyaan atau topik yang ingin kamu
        diskusikan!
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3 w-full max-w-sm">
        {[
          { emoji: "👨‍🏫", label: "Tutor", color: "bg-blue-50 border-blue-100 text-blue-700" },
          { emoji: "🙋", label: "Dika / Sari", color: "bg-green-50 border-green-100 text-green-700" },
          { emoji: "🔍", label: "TA", color: "bg-purple-50 border-purple-100 text-purple-700" },
        ].map((a) => (
          <div
            key={a.label}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold ${a.color}`}
          >
            <span className="text-xl">{a.emoji}</span>
            <span>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffMs = today.getTime() - msgDay.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ─── ChatWindow ───────────────────────────────────────────────────────────────

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  typingAgent,
  taActivated = false,
  className = "",
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change or typing indicator appears
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, typingAgent]);

  if (messages.length === 0 && !typingAgent) {
    return (
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto ${className}`}
      >
        <EmptyState />
      </div>
    );
  }

  // Build render list with optional date dividers injected between messages
  const renderItems: Array<
    | { kind: "message"; message: Message }
    | { kind: "divider"; label: string; key: string }
  > = [];

  let lastDate: Date | null = null;

  for (const message of messages) {
    const msgDate = message.timestamp;
    if (!lastDate || !isSameDay(lastDate, msgDate)) {
      renderItems.push({
        kind: "divider",
        label: formatDateLabel(msgDate),
        key: `divider-${msgDate.toDateString()}`,
      });
      lastDate = msgDate;
    }
    renderItems.push({ kind: "message", message });
  }

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth ${className}`}
    >
      {renderItems.map((item) => {
        if (item.kind === "divider") {
          return <DateDivider key={item.key} label={item.label} />;
        }

        const { message } = item;
        return (
          <AgentBubble
            key={message.id}
            agent={message.agent}
            agentName={message.agentName}
            text={message.text}
            timestamp={message.timestamp.toISOString()}
            messageId={message.id}
            isTyping={false}
          />
        );
      })}

      {/* TA-activated system notice */}
      {taActivated && (
        <SystemNotice
          icon="🔍"
          text="TA dipanggil untuk membantu kamu"
        />
      )}

      {/* Typing indicator */}
      {typingAgent && (
        <AgentBubble
          key="typing-indicator"
          agent={typingAgent.agent}
          agentName={typingAgent.agentName}
          text=""
          isTyping
        />
      )}

      {/* Scroll anchor */}
      <div ref={bottomRef} className="h-1" aria-hidden="true" />
    </div>
  );
};

export default ChatWindow;
