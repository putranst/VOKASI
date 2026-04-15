"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentType = "teacher" | "classmate" | "ta" | "student";

export interface AgentBubbleProps {
  agent: AgentType;
  text: string;
  /** Display name — required for classmate agents, optional for others. */
  agentName?: string;
  /** When true, renders an animated typing indicator instead of text. */
  isTyping?: boolean;
  /** ISO timestamp string for display. */
  timestamp?: string;
  /** Unique message id (used as React key by parent). */
  messageId?: string;
}

// ─── Agent Config ─────────────────────────────────────────────────────────────

interface AgentConfig {
  label: string;
  /** Avatar initials or emoji. */
  avatar: string;
  /** Tailwind classes for the avatar circle background. */
  avatarBg: string;
  /** Tailwind classes for the message bubble. */
  bubbleBg: string;
  /** Tailwind classes for the bubble text colour. */
  bubbleText: string;
  /** Tailwind classes for the bubble border. */
  bubbleBorder: string;
  /** Tailwind classes for the badge pill. */
  badgeBg: string;
  badgeText: string;
  /** Which side the bubble appears on. */
  align: "left" | "right";
}

function getAgentConfig(agent: AgentType, agentName?: string): AgentConfig {
  switch (agent) {
    case "teacher":
      return {
        label: "Tutor",
        avatar: "T",
        avatarBg: "bg-blue-500",
        bubbleBg: "bg-blue-50",
        bubbleText: "text-blue-900",
        bubbleBorder: "border-blue-100",
        badgeBg: "bg-blue-100",
        badgeText: "text-blue-700",
        align: "left",
      };
    case "classmate":
      return {
        label: agentName ?? "Teman",
        avatar: (agentName ?? "T")[0].toUpperCase(),
        avatarBg: "bg-green-500",
        bubbleBg: "bg-green-50",
        bubbleText: "text-green-900",
        bubbleBorder: "border-green-100",
        badgeBg: "bg-green-100",
        badgeText: "text-green-700",
        align: "left",
      };
    case "ta":
      return {
        label: "TA",
        avatar: "TA",
        avatarBg: "bg-purple-500",
        bubbleBg: "bg-purple-50",
        bubbleText: "text-purple-900",
        bubbleBorder: "border-purple-100",
        badgeBg: "bg-purple-100",
        badgeText: "text-purple-700",
        align: "left",
      };
    case "student":
      return {
        label: "Kamu",
        avatar: "K",
        avatarBg: "bg-gray-400",
        bubbleBg: "bg-gray-100",
        bubbleText: "text-gray-800",
        bubbleBorder: "border-gray-200",
        badgeBg: "bg-gray-200",
        badgeText: "text-gray-600",
        align: "right",
      };
  }
}

// ─── Typing Dots ──────────────────────────────────────────────────────────────

function TypingDots({ color }: { color: string }) {
  return (
    <span className="flex items-center gap-1 py-0.5" aria-label="Sedang mengetik">
      <span
        className={`w-2 h-2 rounded-full ${color} animate-bounce`}
        style={{ animationDelay: "0ms", animationDuration: "900ms" }}
      />
      <span
        className={`w-2 h-2 rounded-full ${color} animate-bounce`}
        style={{ animationDelay: "180ms", animationDuration: "900ms" }}
      />
      <span
        className={`w-2 h-2 rounded-full ${color} animate-bounce`}
        style={{ animationDelay: "360ms", animationDuration: "900ms" }}
      />
    </span>
  );
}

// ─── Typed Typing Dot Color Map ───────────────────────────────────────────────

const typingDotColor: Record<AgentType, string> = {
  teacher: "bg-blue-400",
  classmate: "bg-green-400",
  ta: "bg-purple-400",
  student: "bg-gray-400",
};

// ─── Simple Markdown-ish Renderer ─────────────────────────────────────────────
// Converts a small subset of Markdown to HTML for TA structured content.
// Handles: **bold**, *italic*, `code`, numbered/bulleted lists, blank-line paragraphs.

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line → vertical spacer
    if (line.trim() === "") {
      nodes.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Numbered list item: "1. text"
    if (/^\d+\.\s/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const content = lines[i].replace(/^\d+\.\s/, "");
        listItems.push(
          <li key={`li-${i}`} className="ml-4 list-decimal">
            {inlineMarkdown(content)}
          </li>
        );
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="space-y-1 my-1">
          {listItems}
        </ol>
      );
      continue;
    }

    // Bulleted list item: "- text" or "* text"
    if (/^[-*]\s/.test(line)) {
      const listItems: React.ReactNode[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        const content = lines[i].replace(/^[-*]\s/, "");
        listItems.push(
          <li key={`li-${i}`} className="ml-4 list-disc">
            {inlineMarkdown(content)}
          </li>
        );
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="space-y-1 my-1">
          {listItems}
        </ul>
      );
      continue;
    }

    // Plain paragraph
    nodes.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {inlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

/** Processes inline Markdown: **bold**, *italic*, `code`. */
function inlineMarkdown(text: string): React.ReactNode {
  // Split on bold, italic, or inline-code spans
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="font-mono text-xs bg-black/10 px-1.5 py-0.5 rounded"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ─── Timestamp Formatter ──────────────────────────────────────────────────────

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ─── AgentBubble Component ────────────────────────────────────────────────────

export const AgentBubble: React.FC<AgentBubbleProps> = ({
  agent,
  text,
  agentName,
  isTyping = false,
  timestamp,
  messageId,
}) => {
  const config = getAgentConfig(agent, agentName);
  const isLeft = config.align === "left";

  return (
    <div
      className={`flex gap-2.5 items-end w-full ${isLeft ? "flex-row" : "flex-row-reverse"}`}
      data-message-id={messageId}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          text-white text-xs font-black shadow-sm
          ${config.avatarBg}
        `}
        aria-label={`Pesan dari ${config.label}`}
      >
        {config.avatar}
      </div>

      {/* Content column */}
      <div
        className={`flex flex-col gap-1 max-w-[75%] ${isLeft ? "items-start" : "items-end"}`}
      >
        {/* Agent name / badge */}
        <div className={`flex items-center gap-1.5 ${isLeft ? "" : "flex-row-reverse"}`}>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}
          >
            {config.label}
          </span>
          {timestamp && (
            <span className="text-[10px] text-gray-400">{formatTime(timestamp)}</span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`
            relative px-4 py-3 rounded-2xl border text-sm
            ${config.bubbleBg} ${config.bubbleText} ${config.bubbleBorder}
            ${isLeft ? "rounded-bl-sm" : "rounded-br-sm"}
            shadow-sm
          `}
        >
          {isTyping ? (
            <TypingDots color={typingDotColor[agent]} />
          ) : agent === "ta" ? (
            // TA messages support richer markdown (structured content)
            <div className="space-y-1.5 prose-sm">
              {renderMarkdown(text)}
            </div>
          ) : (
            <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentBubble;
