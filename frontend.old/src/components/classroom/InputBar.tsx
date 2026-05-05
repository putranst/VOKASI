"use client";

import React, { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send, AtSign, Loader2 } from "lucide-react";

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface InputBarProps {
  onSend: (text: string) => void;
  /** Disables the input and send button (e.g. while waiting for agent response). */
  disabled?: boolean;
  /** Placeholder text shown in the textarea. */
  placeholder?: string;
  /** Maximum allowed characters. Default: 500. */
  maxChars?: number;
  /** When true, shows a spinner on the send button instead of the arrow icon. */
  isSending?: boolean;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_MAX_CHARS = 500;
const TA_PREFIX = "@TA ";

// ─── InputBar ─────────────────────────────────────────────────────────────────

export const InputBar: React.FC<InputBarProps> = ({
  onSend,
  disabled = false,
  placeholder = "Ketik pertanyaan atau topikmu... (Enter untuk kirim, Shift+Enter untuk baris baru)",
  maxChars = DEFAULT_MAX_CHARS,
  isSending = false,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const isOverLimit = charCount > maxChars;
  const isEmpty = text.trim().length === 0;
  const canSend = !disabled && !isSending && !isEmpty && !isOverLimit;

  // Auto-resize textarea height based on content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    // Cap at ~6 lines (approx 144px)
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [text]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter (without Shift) sends the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  /** Prepend "@TA " to the current text if not already present, then focus. */
  const handleAtTA = () => {
    if (disabled || isSending) return;

    setText((prev) => {
      if (prev.startsWith(TA_PREFIX)) return prev;
      return TA_PREFIX + prev;
    });

    // Focus and move cursor to end
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    });
  };

  // ── Colour helpers ──────────────────────────────────────────────────────────

  const charCountColor =
    isOverLimit
      ? "text-red-500 font-bold"
      : charCount > maxChars * 0.85
        ? "text-yellow-600"
        : "text-gray-400";

  const borderColor = isOverLimit
    ? "border-red-300 focus-within:ring-red-200"
    : "border-gray-200 focus-within:ring-primary/20";

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      {/* Over-limit warning */}
      {isOverLimit && (
        <p className="text-xs text-red-500 mb-2 font-medium">
          Pesan terlalu panjang. Harap persingkat hingga {maxChars} karakter.
        </p>
      )}

      <div
        className={`
          flex items-end gap-2 bg-gray-50 rounded-2xl border
          focus-within:ring-2 focus-within:bg-white
          transition-all duration-200
          ${borderColor}
          ${disabled || isSending ? "opacity-60 pointer-events-none" : ""}
        `}
      >
        {/* @TA quick-button */}
        <button
          type="button"
          onClick={handleAtTA}
          disabled={disabled || isSending}
          title="Panggil TA untuk bantuan"
          className="
            flex-shrink-0 ml-3 mb-3 flex items-center gap-1
            text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100
            border border-purple-200 px-2.5 py-1.5 rounded-xl
            transition-colors disabled:opacity-50 disabled:pointer-events-none
          "
        >
          <AtSign size={13} />
          TA
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          rows={1}
          className="
            flex-1 bg-transparent resize-none outline-none
            text-sm text-gray-800 placeholder:text-gray-400
            py-3 pr-2 leading-relaxed
            disabled:cursor-not-allowed
            min-h-[44px] max-h-[144px]
          "
          aria-label="Pesan ke AI Classroom"
          aria-describedby="char-counter"
        />

        {/* Right-side controls */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 pr-3 pb-2.5">
          {/* Character counter */}
          <span
            id="char-counter"
            className={`text-[10px] tabular-nums ${charCountColor}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount}/{maxChars}
          </span>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            title="Kirim pesan (Enter)"
            aria-label="Kirim pesan"
            className={`
              w-9 h-9 rounded-xl flex items-center justify-center
              transition-all duration-200 font-bold
              ${
                canSend
                  ? "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-[10px] text-gray-400 mt-1.5 text-center">
        <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[9px] border border-gray-200">Enter</kbd> kirim
        &nbsp;·&nbsp;
        <kbd className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[9px] border border-gray-200">Shift+Enter</kbd> baris baru
      </p>
    </div>
  );
};

export default InputBar;
