"use client";

import React, { useState } from "react";
import { Brain, X, ChevronRight, Sparkles, RefreshCw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemoryFact {
  /** Short human-readable label for the fact. */
  text: string;
  /** ISO timestamp of when this fact was recorded. */
  recorded_at?: string;
  /** Category tag for grouping (e.g. "gaya_belajar", "pemahaman", "tujuan"). */
  category?: "gaya_belajar" | "pemahaman" | "tujuan" | "lainnya";
}

export interface MemoryBadgeProps {
  /** Total number of memory facts stored for this student. */
  memoryCount: number;
  /** Optional array of individual facts to display in the drawer. */
  facts?: MemoryFact[];
  /** Called when the badge/button is clicked (can be used instead of internal drawer). */
  onClick?: () => void;
  /** When true, renders the memory drawer inline (controlled externally). */
  drawerOpen?: boolean;
  onDrawerClose?: () => void;
  /** When true, shows a loading spinner inside the badge. */
  loading?: boolean;
  /** Class names appended to the root element. */
  className?: string;
}

// ─── Category Config ──────────────────────────────────────────────────────────

interface CategoryConfig {
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const CATEGORY_CONFIG: Record<
  NonNullable<MemoryFact["category"]>,
  CategoryConfig
> = {
  gaya_belajar: {
    label: "Gaya Belajar",
    emoji: "🎓",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-100",
  },
  pemahaman: {
    label: "Pemahaman",
    emoji: "💡",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-100",
  },
  tujuan: {
    label: "Tujuan",
    emoji: "🎯",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-100",
  },
  lainnya: {
    label: "Lainnya",
    emoji: "📌",
    bgColor: "bg-gray-50",
    textColor: "text-gray-600",
    borderColor: "border-gray-100",
  },
};

const DEFAULT_CATEGORY: CategoryConfig = {
  label: "Lainnya",
  emoji: "📌",
  bgColor: "bg-gray-50",
  textColor: "text-gray-600",
  borderColor: "border-gray-100",
};

function getCategoryConfig(category?: MemoryFact["category"]): CategoryConfig {
  if (!category) return DEFAULT_CATEGORY;
  return CATEGORY_CONFIG[category] ?? DEFAULT_CATEGORY;
}

// ─── Timestamp Formatter ──────────────────────────────────────────────────────

function formatRelativeTime(iso?: string): string {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return "baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return "kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

// ─── Memory Count Label ───────────────────────────────────────────────────────

function getCountLabel(count: number): string {
  if (count === 0) return "Belum ada memori";
  if (count === 1) return "1 hal tentang kamu";
  return `${count} hal tentang kamu`;
}

// ─── Pulse Ring (animation when new memory is added) ─────────────────────────

function PulseRing() {
  return (
    <span className="absolute inset-0 rounded-full animate-ping bg-cyan-400 opacity-30 pointer-events-none" />
  );
}

// ─── Inline Memory Drawer ─────────────────────────────────────────────────────

interface MemoryDrawerProps {
  facts: MemoryFact[];
  memoryCount: number;
  onClose: () => void;
}

function MemoryDrawer({ facts, memoryCount, onClose }: MemoryDrawerProps) {
  // Group facts by category for display
  const grouped: Map<string, MemoryFact[]> = new Map();

  for (const fact of facts) {
    const key = fact.category ?? "lainnya";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(fact);
  }

  const categoryOrder: Array<NonNullable<MemoryFact["category"]>> = [
    "tujuan",
    "gaya_belajar",
    "pemahaman",
    "lainnya",
  ];

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Memori Tutor"
    >
      {/* Click-outside overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative z-10 w-full sm:w-80 bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[70vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <Brain className="text-white" size={18} />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">Memori Tutor</p>
              <p className="text-xs text-gray-500">{getCountLabel(memoryCount)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup panel memori"
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Explanation banner */}
        <div className="px-5 py-3 bg-cyan-50 border-b border-cyan-100 flex-shrink-0">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-cyan-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-700 leading-relaxed">
              Tutor menyimpan hal-hal ini tentang kamu agar setiap sesi makin
              personal. Memori diperbarui otomatis setelah setiap sesi.
            </p>
          </div>
        </div>

        {/* Facts list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {facts.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Brain className="text-gray-300" size={28} />
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Belum ada memori
              </p>
              <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                Mulai berdiskusi di AI Classroom — Tutor akan mulai mengenalmu
                setelah beberapa sesi.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {categoryOrder
                .filter((cat) => grouped.has(cat))
                .map((cat) => {
                  const catFacts = grouped.get(cat)!;
                  const config = getCategoryConfig(cat);
                  return (
                    <div key={cat}>
                      {/* Category header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{config.emoji}</span>
                        <span
                          className={`text-xs font-bold ${config.textColor}`}
                        >
                          {config.label}
                        </span>
                        <span
                          className={`
                            ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full
                            ${config.bgColor} ${config.textColor} border ${config.borderColor}
                          `}
                        >
                          {catFacts.length}
                        </span>
                      </div>

                      {/* Fact items */}
                      <div className="space-y-2">
                        {catFacts.map((fact, idx) => (
                          <div
                            key={idx}
                            className={`
                              flex items-start gap-2.5 p-3 rounded-xl border
                              ${config.bgColor} ${config.borderColor}
                            `}
                          >
                            <ChevronRight
                              size={14}
                              className={`flex-shrink-0 mt-0.5 ${config.textColor}`}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-xs leading-relaxed ${config.textColor} font-medium`}
                              >
                                {fact.text}
                              </p>
                              {fact.recorded_at && (
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {formatRelativeTime(fact.recorded_at)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p className="text-[10px] text-gray-400 text-center leading-relaxed">
            Memori disimpan secara privat dan hanya digunakan untuk
            mempersonalisasi sesi belajarmu.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── MemoryBadge ──────────────────────────────────────────────────────────────

export const MemoryBadge: React.FC<MemoryBadgeProps> = ({
  memoryCount,
  facts = [],
  onClick,
  drawerOpen,
  onDrawerClose,
  loading = false,
  className = "",
}) => {
  // Internal open state (used when no external control is provided)
  const [internalOpen, setInternalOpen] = useState(false);
  // Show pulse ring briefly when memoryCount increases
  const [showPulse, setShowPulse] = React.useState(false);
  const prevCountRef = React.useRef(memoryCount);

  React.useEffect(() => {
    if (memoryCount > prevCountRef.current) {
      setShowPulse(true);
      const t = setTimeout(() => setShowPulse(false), 2000);
      prevCountRef.current = memoryCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = memoryCount;
  }, [memoryCount]);

  // Determine whether the drawer is open (externally controlled or internal)
  const isDrawerOpen = drawerOpen !== undefined ? drawerOpen : internalOpen;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setInternalOpen(true);
    }
  };

  const handleClose = () => {
    if (onDrawerClose) {
      onDrawerClose();
    } else {
      setInternalOpen(false);
    }
  };

  const hasMemory = memoryCount > 0;

  return (
    <>
      {/* Badge button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={`Tutor ingat ${memoryCount} hal tentang kamu. Klik untuk lihat detail.`}
        aria-haspopup="dialog"
        aria-expanded={isDrawerOpen}
        className={`
          relative inline-flex items-center gap-2 px-3.5 py-2 rounded-full
          border transition-all duration-200 select-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2
          ${
            hasMemory
              ? "bg-cyan-50 border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300 text-cyan-800 shadow-sm hover:shadow-md"
              : "bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-500"
          }
          ${loading ? "opacity-60 pointer-events-none" : ""}
          ${className}
        `}
      >
        {/* Pulse animation ring */}
        {showPulse && <PulseRing />}

        {/* Brain icon */}
        <div className="relative flex-shrink-0">
          {loading ? (
            <RefreshCw
              size={15}
              className="text-cyan-500 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Brain
              size={15}
              className={hasMemory ? "text-cyan-600" : "text-gray-400"}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Label */}
        <span className="text-xs font-bold whitespace-nowrap leading-none">
          {loading ? (
            "Memuat memori..."
          ) : hasMemory ? (
            <>
              Tutor ingat{" "}
              <span
                className={`
                  inline-flex items-center justify-center
                  min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black
                  bg-cyan-500 text-white ml-0.5
                `}
              >
                {memoryCount}
              </span>{" "}
              hal
            </>
          ) : (
            "Belum ada memori"
          )}
        </span>
      </button>

      {/* Drawer — rendered in a portal-like fixed overlay */}
      {isDrawerOpen && (
        <MemoryDrawer
          facts={facts}
          memoryCount={memoryCount}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default MemoryBadge;
