// VOKASI2 — Zustand Stores (PRD v2.3)

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  Challenge,
  Submission,
  Portfolio,
  SandboxSession,
  TutorSession,
  TutorMode,
  CompetencyHeatmap,
  Artifact,
  FailureEntry,
} from "@/types";

// ─── Auth Store ────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    role: "student" | "instructor";
    institutionId?: string;
    nisn?: string;
    nim?: string;
  }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) throw new Error("Login failed");
          const data = await res.json();
          set({ user: data.user, token: data.token, isLoading: false });
          // Also store token and role for layout auth check
          if (typeof window !== "undefined") {
            localStorage.setItem("vokasi_token", data.token);
            localStorage.setItem("vokasi_role", data.user.role);
          }
          return data.user;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error("Registration failed");
          const result = await res.json();
          set({ user: result.user, token: result.token, isLoading: false });
          // Also store token and role for layout auth check
          if (typeof window !== "undefined") {
            localStorage.setItem("vokasi_token", result.token);
            localStorage.setItem("vokasi_role", result.user.role);
          }
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("vokasi_token");
          localStorage.removeItem("vokasi_role");
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "vokasi2-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// ─── Challenge Store ────────────────────────────────────────────

interface ChallengeState {
  currentChallenge: Challenge | null;
  submissions: Submission[];
  leaderboard: { userId: string; handle: string; score: number }[];
  isSubmitting: boolean;
  setCurrentChallenge: (c: Challenge | null) => void;
  fetchChallenge: (id: string) => Promise<void>;
  fetchSubmissions: (challengeId: string) => Promise<void>;
  submitChallenge: (
    challengeId: string,
    content: Submission["content"],
    reflectionText: string,
    sandboxSnapshotId?: string
  ) => Promise<AIFeedback>;
  fetchLeaderboard: (challengeId: string) => Promise<void>;
}

interface AIFeedback {
  scores: { decomposition: number; toolUsage: number; outputQuality: number; reflection: number };
  narrative: string;
  suggestedResources?: string[];
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  currentChallenge: null,
  submissions: [],
  leaderboard: [],
  isSubmitting: false,

  setCurrentChallenge: (c) => set({ currentChallenge: c }),

  fetchChallenge: async (id: string) => {
    const res = await fetch(`/api/challenges/${id}`);
    if (!res.ok) throw new Error("Failed to fetch challenge");
    const data = await res.json();
    set({ currentChallenge: data });
  },

  fetchSubmissions: async (challengeId: string) => {
    const token = useAuthStore.getState().token;
    const res = await fetch(`/api/challenges/${challengeId}/submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch submissions");
    const data = await res.json();
    set({ submissions: data });
  },

  submitChallenge: async (challengeId, content, reflectionText, sandboxSnapshotId) => {
    set({ isSubmitting: true });
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, reflection: reflectionText, sandboxSnapshotId }),
      });
      if (!res.ok) throw new Error("Submission failed");
      const data = await res.json();
      set((s) => ({ submissions: [data.submission, ...s.submissions], isSubmitting: false }));
      return data.aiFeedback;
    } finally {
      set({ isSubmitting: false });
    }
  },

  fetchLeaderboard: async (challengeId: string) => {
    const res = await fetch(`/api/challenges/${challengeId}/leaderboard`);
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    const data = await res.json();
    set({ leaderboard: data });
  },
}));

// ─── Portfolio Store ────────────────────────────────────────────

interface PortfolioState {
  portfolio: Portfolio | null;
  isLoading: boolean;
  fetchPortfolio: (userId: string) => Promise<void>;
  updatePortfolio: (data: Partial<Pick<Portfolio, "artifacts" | "failureResume" | "isPublic">>) => Promise<void>;
  addArtifact: (artifact: Artifact) => void;
  addFailureEntry: (entry: FailureEntry) => void;
  exportPortfolio: (format: "pdf" | "json") => Promise<string>; // returns URL
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolio: null,
  isLoading: false,

  fetchPortfolio: async (userId: string) => {
    set({ isLoading: true });
    const token = useAuthStore.getState().token;
    try {
      const res = await fetch(`/api/portfolio/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch portfolio");
      const data = await res.json();
      set({ portfolio: data, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updatePortfolio: async (data) => {
    const token = useAuthStore.getState().token;
    const res = await fetch("/api/portfolio", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update portfolio");
    const updated = await res.json();
    set({ portfolio: updated });
  },

  addArtifact: (artifact) =>
    set((s) => ({
      portfolio: s.portfolio
        ? { ...s.portfolio, artifacts: [...s.portfolio.artifacts, artifact] }
        : null,
    })),

  addFailureEntry: (entry) =>
    set((s) => ({
      portfolio: s.portfolio
        ? { ...s.portfolio, failureResume: [...s.portfolio.failureResume, entry] }
        : null,
    })),

  exportPortfolio: async (format) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error("Not authenticated");
    const token = useAuthStore.getState().token!;
    const res = await fetch(`/api/portfolio/${userId}/export?format=${format}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
}));

// ─── Sandbox Store ─────────────────────────────────────────────

interface SandboxState {
  activeSession: SandboxSession | null;
  isStarting: boolean;
  startSandbox: (templateId: SandboxSession["templateId"]) => Promise<SandboxSession>;
  terminateSandbox: (sessionId: string) => Promise<void>;
  saveSnapshot: (sessionId: string, content: Record<string, unknown>) => Promise<void>;
  addMistake: (sessionId: string, entry: Omit<MistakeEntry, "id" | "timestamp">) => void;
  refreshSession: (sessionId: string) => Promise<void>;
}

interface MistakeEntry {
  id: string;
  errorType: string;
  errorMessage: string;
  reflection?: string;
  timestamp: string;
}

export const useSandboxStore = create<SandboxState>((set, get) => ({
  activeSession: null,
  isStarting: false,

  startSandbox: async (templateId) => {
    set({ isStarting: true });
    const token = useAuthStore.getState().token!;
    try {
      const res = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) throw new Error("Failed to start sandbox");
      const session = await res.json();
      set({ activeSession: session, isStarting: false });
      return session;
    } finally {
      set({ isStarting: false });
    }
  },

  terminateSandbox: async (sessionId) => {
    const token = useAuthStore.getState().token!;
    await fetch(`/api/sandbox/${sessionId}/terminate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ activeSession: null });
  },

  saveSnapshot: async (sessionId, content) => {
    const token = useAuthStore.getState().token!;
    await fetch(`/api/sandbox/${sessionId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
  },

  addMistake: (sessionId, entry) =>
    set((s) => {
      if (!s.activeSession || s.activeSession.id !== sessionId) return s;
      return {
        activeSession: {
          ...s.activeSession,
          mistakeLog: [
            ...s.activeSession.mistakeLog,
            { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
          ],
        },
      };
    }),

  refreshSession: async (sessionId) => {
    const token = useAuthStore.getState().token!;
    const res = await fetch(`/api/sandbox/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to refresh sandbox");
    const session = await res.json();
    set({ activeSession: session });
  },
}));

// ─── Tutor Store ───────────────────────────────────────────────

interface TutorState {
  currentSession: TutorSession | null;
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  setMode: (mode: TutorMode) => void;
  createSession: (mode: TutorMode, context?: TutorSession["context"]) => Promise<void>;
  loadHistory: (sessionId: string) => Promise<void>;
}

export const useTutorStore = create<TutorState>((set, get) => ({
  currentSession: null,
  isTyping: false,

  createSession: async (mode, context) => {
    const token = useAuthStore.getState().token!;
    const res = await fetch("/api/tutor/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mode, context }),
    });
    if (!res.ok) throw new Error("Failed to create session");
    const session = await res.json();
    set({ currentSession: session });
  },

  setMode: (mode) => {
    const s = get();
    if (s.currentSession) {
      set({ currentSession: { ...s.currentSession, mode } });
    }
  },

  sendMessage: async (message: string) => {
    const { currentSession } = get();
    if (!currentSession) throw new Error("No active tutor session");

    const token = useAuthStore.getState().token!;
    set({ isTyping: true });

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          message,
          mode: currentSession.mode,
          context: currentSession.context,
        }),
      });
      if (!res.ok) throw new Error("Tutor request failed");
      const data = await res.json();

      const userMsg = {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: message,
        createdAt: new Date().toISOString(),
      };
      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: data.response,
        mode: currentSession.mode,
        createdAt: new Date().toISOString(),
      };

      set((s) => ({
        currentSession: s.currentSession
          ? {
              ...s.currentSession,
              messages: [...s.currentSession.messages, userMsg, assistantMsg],
            }
          : null,
        isTyping: false,
      }));
    } finally {
      set({ isTyping: false });
    }
  },

  loadHistory: async (sessionId: string) => {
    const token = useAuthStore.getState().token!;
    const res = await fetch(`/api/tutor/history/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to load history");
    const session = await res.json();
    set({ currentSession: session });
  },
}));

// ─── Analytics Store ────────────────────────────────────────────

interface AnalyticsState {
  studentData: StudentAnalytics | null;
  instructorData: InstructorAnalytics | null;
  isLoading: boolean;
  fetchStudentAnalytics: (userId: string) => Promise<void>;
  fetchInstructorAnalytics: (courseId: string) => Promise<void>;
}

interface StudentAnalytics {
  userId: string;
  competencyHeatmap: CompetencyHeatmap;
  competencyVelocity: number;
  reflectionDepthScore: number;
  challengeHistory: { challengeId: string; attempts: number; bestScore: number; lastAttemptAt: string }[];
  sandboxHours: number;
  socraticCirclesAttended: number;
}

interface InstructorAnalytics {
  courseId: string;
  cohortHeatmap: CompetencyHeatmap;
  competencyGaps: { dimension: string; gap: number }[];
  commonFailureModes: { mode: string; frequency: number }[];
  engagementRate: number;
  averageReflectionDepth: number;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  studentData: null,
  instructorData: null,
  isLoading: false,

  fetchStudentAnalytics: async (userId: string) => {
    set({ isLoading: true });
    const token = useAuthStore.getState().token!;
    try {
      const res = await fetch(`/api/analytics/student/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch student analytics");
      const data = await res.json();
      set({ studentData: data, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchInstructorAnalytics: async (courseId: string) => {
    set({ isLoading: true });
    const token = useAuthStore.getState().token!;
    try {
      const res = await fetch(`/api/analytics/instructor/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch instructor analytics");
      const data = await res.json();
      set({ instructorData: data, isLoading: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
