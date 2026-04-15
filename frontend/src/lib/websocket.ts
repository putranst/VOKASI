// ─── CENDIKIA AI Classroom WebSocket Client ───────────────────────────────────
// Typed, reconnect-aware WebSocket wrapper for real-time multi-agent classroom
// communication. Connect once per session; the class handles open/close/error
// events and exposes a clean message-sending interface.

// ─── Message Types (Server → Client) ─────────────────────────────────────────

export type AgentType = "teacher" | "classmate" | "ta";

/** A text chunk emitted by one of the AI agents. */
export interface AgentMessage {
  type: "agent_message";
  agent: AgentType;
  /** Display name for classmate agents (e.g. "Dika", "Sari"). */
  agent_name?: string;
  text: string;
  /** True while the agent is still streaming tokens. */
  streaming: boolean;
  /** Unique id that groups streaming chunks belonging to the same utterance. */
  message_id?: string;
  timestamp?: string;
}

/** Emitted when the server's confusion detector fires. */
export interface ConfusionDetected {
  type: "confusion_detected";
  /** Confidence score 0–1. */
  score: number;
  /** Whether the TA agent was automatically activated. */
  ta_activated: boolean;
}

/** Emitted when the server has committed new facts to the user's memory. */
export interface MemoryUpdated {
  type: "memory_updated";
  /** Total number of stored memory facts for this user/course pair. */
  memory_count: number;
  /** The newly added facts (plain strings). */
  new_facts: string[];
}

/** Emitted once per session when the server finishes an agent's full turn. */
export interface TurnComplete {
  type: "turn_complete";
  agent: AgentType;
  message_id: string;
}

/** Emitted when the session is ended (by client request or server timeout). */
export interface SessionEnded {
  type: "session_ended";
  session_id: string;
  reason?: "user_request" | "timeout" | "server_shutdown";
}

/** Generic server-side error frame. */
export interface ServerError {
  type: "error";
  code?: string;
  message: string;
}

/** Union of all possible frames the server may send. */
export type ServerMessage =
  | AgentMessage
  | ConfusionDetected
  | MemoryUpdated
  | TurnComplete
  | SessionEnded
  | ServerError;

// ─── Message Types (Client → Server) ─────────────────────────────────────────

export interface ClientChatMessage {
  type: "chat";
  text: string;
}

export interface ClientEndSession {
  type: "end_session";
}

export interface ClientPing {
  type: "ping";
}

export type ClientMessage = ClientChatMessage | ClientEndSession | ClientPing;

// ─── Connection State ─────────────────────────────────────────────────────────

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

// ─── Callback Types ───────────────────────────────────────────────────────────

export type OnMessageCallback = (msg: ServerMessage) => void;
export type OnConnectCallback = () => void;
export type OnDisconnectCallback = (code: number, reason: string) => void;
export type OnErrorCallback = (error: Event) => void;
export type OnStateChangeCallback = (state: ConnectionState) => void;

// ─── Configuration ────────────────────────────────────────────────────────────

export interface ClassroomWebSocketOptions {
  /** How long (ms) to wait before attempting a reconnect. Default: 3000. */
  reconnectDelayMs?: number;
  /** Maximum reconnect attempts before giving up. Default: 5. */
  maxReconnectAttempts?: number;
  /** Interval (ms) at which keep-alive pings are sent. Default: 30000. */
  pingIntervalMs?: number;
  /** Whether to log debug info to the console. Default: false. */
  debug?: boolean;
}

// ─── ClassroomWebSocket ───────────────────────────────────────────────────────

/**
 * Manages a single WebSocket connection to the CENDIKIA AI Classroom backend.
 *
 * Usage:
 * ```ts
 * const ws = new ClassroomWebSocket(sessionId, jwtToken);
 * ws.connect(
 *   (msg) => console.log("server:", msg),
 *   ()    => console.log("connected"),
 *   (code, reason) => console.log("disconnected", code, reason),
 * );
 *
 * // Later:
 * ws.sendMessage("Pak, saya bingung soal overfitting");
 * ws.endSession();
 * ws.disconnect();
 * ```
 */
export class ClassroomWebSocket {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private token: string;
  private options: Required<ClassroomWebSocketOptions>;

  private state: ConnectionState = "idle";
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  // Callbacks registered via connect()
  private onMessage: OnMessageCallback = () => {};
  private onConnect: OnConnectCallback = () => {};
  private onDisconnect: OnDisconnectCallback = () => {};
  private onError: OnErrorCallback = () => {};
  private onStateChange: OnStateChangeCallback = () => {};

  constructor(
    sessionId: string,
    token: string,
    options: ClassroomWebSocketOptions = {},
  ) {
    this.sessionId = sessionId;
    this.token = token;
    this.options = {
      reconnectDelayMs: options.reconnectDelayMs ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
      pingIntervalMs: options.pingIntervalMs ?? 30_000,
      debug: options.debug ?? false,
    };
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Open the WebSocket connection and register event callbacks.
   * Safe to call multiple times — will no-op if already connected.
   */
  connect(
    onMessage: OnMessageCallback,
    onConnect: OnConnectCallback,
    onDisconnect: OnDisconnectCallback,
    onError?: OnErrorCallback,
    onStateChange?: OnStateChangeCallback,
  ): void {
    this.onMessage = onMessage;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    if (onError) this.onError = onError;
    if (onStateChange) this.onStateChange = onStateChange;

    if (this.state === "connected" || this.state === "connecting") {
      this.log("connect() called while already connecting/connected — ignoring");
      return;
    }

    this.openSocket();
  }

  /**
   * Send a plain text chat message to the classroom.
   */
  sendMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    const frame: ClientChatMessage = { type: "chat", text: trimmed };
    this.sendFrame(frame);
  }

  /**
   * Signal the server to end the current session gracefully.
   * The server will emit a `session_ended` frame in response.
   */
  endSession(): void {
    const frame: ClientEndSession = { type: "end_session" };
    this.sendFrame(frame);
  }

  /**
   * Close the WebSocket and stop any pending reconnect timers.
   * After calling this, the instance should be discarded.
   */
  disconnect(): void {
    this.log("disconnect() called — tearing down");
    this.stopReconnect();
    this.stopPing();
    this.setState("disconnected");

    if (this.ws) {
      // Remove listeners before closing to prevent the onClose handler from
      // scheduling a reconnect after an intentional disconnect.
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;

      if (
        this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING
      ) {
        this.ws.close(1000, "Client disconnected");
      }
      this.ws = null;
    }
  }

  /** Returns the current connection state. */
  getState(): ConnectionState {
    return this.state;
  }

  /** Returns true when the socket is open and ready to send. */
  isConnected(): boolean {
    return this.state === "connected" && this.ws?.readyState === WebSocket.OPEN;
  }

  // ── Private: Socket Lifecycle ──────────────────────────────────────────────

  private buildUrl(): string {
    const base =
      (typeof process !== "undefined" &&
        process.env.NEXT_PUBLIC_WS_URL) ||
      "ws://localhost:8000";

    // Strip trailing slash to avoid double-slash in URL
    const trimmedBase = base.replace(/\/+$/, "");
    return `${trimmedBase}/ws/classroom/${this.sessionId}?token=${this.token}`;
  }

  private buildFallbackUrls(): string[] {
    const candidates = [
      "ws://localhost:8000",
      "ws://127.0.0.1:8000",
      "ws://localhost:8001",
      "ws://127.0.0.1:8001",
    ];

    const current = this.buildUrl();
    return Array.from(
      new Set(
        candidates
          .map((base) => `${base.replace(/\/+$/, "")}/ws/classroom/${this.sessionId}?token=${this.token}`)
          .filter((url) => url !== current),
      ),
    );
  }

  private openSocket(): void {
    this.setState("connecting");

    const url = this.buildUrl();
    const fallbackUrls = this.buildFallbackUrls();
    this.log(`Opening WebSocket → ${url}`);

    const openWithUrl = (targetUrl: string): void => {
      try {
        this.ws = new WebSocket(targetUrl);
      } catch (err) {
        this.log("WebSocket constructor threw:", err);
        this.setState("error");
        this.scheduleReconnect();
        return;
      }

      this.ws.onopen = () => {
        this.log("Socket opened");
        this.reconnectAttempts = 0;
        this.setState("connected");
        this.startPing();
        this.onConnect();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleRawMessage(event.data);
      };

      this.ws.onclose = (event: CloseEvent) => {
        this.log(`Socket closed — code=${event.code} reason="${event.reason}"`);
        this.stopPing();

        const shouldTryFallback =
          this.state === "connecting" &&
          event.code !== 1000 &&
          fallbackUrls.length > 0;

        if (shouldTryFallback) {
          const nextUrl = fallbackUrls.shift();
          if (nextUrl) {
            this.log(`Trying WebSocket fallback → ${nextUrl}`);
            openWithUrl(nextUrl);
            return;
          }
        }

        this.setState("disconnected");
        this.onDisconnect(event.code, event.reason);

        // 1000 = Normal Closure (intentional) — do not reconnect
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (event: Event) => {
        this.log("Socket error", event);
        this.setState("error");
        this.onError(event);
        // onclose will fire after onerror, so reconnect is handled there
      };
    };

    openWithUrl(url);
  }

  // ── Private: Message Handling ──────────────────────────────────────────────

  private handleRawMessage(data: unknown): void {
    if (typeof data !== "string") {
      this.log("Received non-string message — ignoring", data);
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      this.log("Failed to parse message as JSON:", data);
      return;
    }

    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
      this.log("Message missing 'type' field:", parsed);
      return;
    }

    const msg = parsed as ServerMessage;
    this.log("← received:", msg.type);
    this.onMessage(msg);
  }

  // ── Private: Sending ───────────────────────────────────────────────────────

  private sendFrame(frame: ClientMessage): void {
    if (!this.isConnected()) {
      this.log("sendFrame() called while not connected — dropping:", frame);
      return;
    }

    const payload = JSON.stringify(frame);
    this.log("→ sending:", frame.type);
    this.ws!.send(payload);
  }

  // ── Private: Reconnect ─────────────────────────────────────────────────────

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log(
        `Max reconnect attempts (${this.options.maxReconnectAttempts}) reached — giving up`,
      );
      this.setState("error");
      return;
    }

    // Exponential back-off: delay × 2^attempt, capped at 30 s
    const delay = Math.min(
      this.options.reconnectDelayMs * Math.pow(2, this.reconnectAttempts),
      30_000,
    );
    this.reconnectAttempts += 1;

    this.log(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.state !== "connected" && this.state !== "connecting") {
        this.openSocket();
      }
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // ── Private: Keep-Alive ────────────────────────────────────────────────────

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.isConnected()) {
        this.log("→ ping");
        this.sendFrame({ type: "ping" });
      }
    }, this.options.pingIntervalMs);
  }

  private stopPing(): void {
    if (this.pingTimer !== null) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  // ── Private: State ─────────────────────────────────────────────────────────

  private setState(state: ConnectionState): void {
    if (this.state === state) return;
    this.log(`State: ${this.state} → ${state}`);
    this.state = state;
    this.onStateChange(state);
  }

  // ── Private: Debug ─────────────────────────────────────────────────────────

  private log(...args: unknown[]): void {
    if (this.options.debug) {
      console.log("[ClassroomWS]", ...args);
    }
  }
}

// ─── Factory Helper ───────────────────────────────────────────────────────────

/**
 * Convenience factory — reads session id and token and returns a configured
 * ClassroomWebSocket instance ready to call `.connect()` on.
 *
 * @example
 * ```ts
 * const client = createClassroomSocket(sessionId, supabaseAccessToken);
 * client.connect(handleMessage, onOpen, onClose);
 * ```
 */
export function createClassroomSocket(
  sessionId: string,
  token: string,
  options?: ClassroomWebSocketOptions,
): ClassroomWebSocket {
  return new ClassroomWebSocket(sessionId, token, options);
}
