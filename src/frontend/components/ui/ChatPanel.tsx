"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/frontend/context/AppContext";
import { fetchApi } from "@/frontend/lib/config";
import type { ChatMessage } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRecognitionCtor = new () => any;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionCtor;
    webkitSpeechRecognition: SpeechRecognitionCtor;
  }
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_{2}(.+?)_{2}/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ""))
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[ \t]*[-*+]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const SUGGESTED = [
  "What is an index fund?",
  "How risky are bonds?",
  "What should a beginner learn first?",
  "Explain 401(k) vs IRA",
  "What is compound interest?",
  "How does diversification reduce risk?",
];

/* ── Animated typing dots ── */
function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              animation: `chatBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Avatar for assistant ── */
function BotAvatar() {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black shadow-sm"
      style={{ background: "linear-gradient(135deg,#059669,#047857)" }}
    >
      HF
    </div>
  );
}

/* ── Single message bubble ── */
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && <BotAvatar />}
      <div
        className={[
          "max-w-[80%] px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-2xl rounded-br-sm text-white shadow-md"
            : "rounded-2xl rounded-bl-sm text-slate-800 bg-white border border-slate-100 shadow-sm",
        ].join(" ")}
        style={isUser ? { background: "linear-gradient(135deg,#059669,#047857)" } : {}}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>{isUser ? msg.content : stripMarkdown(msg.content)}</p>
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-emerald-400/30">
            <p className="text-xs opacity-70 mb-1 font-medium">Sources</p>
            {msg.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs underline opacity-70 hover:opacity-100 truncate"
              >
                {s.source}: {s.topic}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── SVG send icon ── */
function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ── SVG mic icon ── */
function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: active ? "#fff" : "#64748b" }}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}

/* ── SVG trash/clear icon ── */
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

/* ── SVG close icon ── */
function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ── FAB chat icon ── */
function ChatBubbleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

/* ── Empty state illustration ── */
function EmptyState({ onSuggest }: { onSuggest: (s: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 pt-6">
      {/* Animated chart illustration */}
      <div className="relative mb-5" style={{ width: 80, height: 64 }}>
        <svg width="80" height="64" viewBox="0 0 80 64" fill="none">
          {/* Grid lines */}
          {[0,1,2,3].map(i => (
            <line key={i} x1="8" y1={8 + i*14} x2="76" y2={8 + i*14}
              stroke="#e2e8f0" strokeWidth="1" />
          ))}
          {/* Animated bars */}
          {[
            { x: 12, h: 28, delay: "0s",   color: "#10b981" },
            { x: 24, h: 42, delay: "0.1s", color: "#059669" },
            { x: 36, h: 20, delay: "0.2s", color: "#34d399" },
            { x: 48, h: 50, delay: "0.3s", color: "#10b981" },
            { x: 60, h: 36, delay: "0.4s", color: "#059669" },
          ].map((b) => (
            <rect key={b.x} x={b.x} y={58 - b.h} width="10" height={b.h} rx="3"
              fill={b.color} opacity="0.85"
              style={{ animation: `chartGrow 1.1s cubic-bezier(.2,.8,.4,1) ${b.delay} both`,
                transformOrigin: `${b.x + 5}px 58px` }} />
          ))}
          {/* Trend line */}
          <polyline
            points="17,30 29,16 41,38 53,8 65,22"
            fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ strokeDasharray: 120, strokeDashoffset: 120,
              animation: "lineDraw 1.4s ease-out 0.6s forwards" }}
          />
        </svg>
      </div>

      <p className="text-slate-800 font-semibold text-sm mb-1 text-center">
        Ask me anything about finance
      </p>
      <p className="text-slate-400 text-xs mb-5 text-center leading-relaxed">
        I can explain investing concepts, help you understand the simulator, or answer general money questions.
      </p>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        {SUGGESTED.slice(0, 4).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggest(s)}
            className="text-left text-xs text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl px-3 py-2.5 transition-all duration-150 font-medium"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function ChatPanel() {
  const { user } = useApp();

  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [listening, setListening] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const speechSupported = typeof window !== "undefined" &&
    !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  useEffect(() => {
    if (open && user && !historyLoaded) {
      fetchApi("/api/chat")
        .then((r) => r.json())
        .then((data: ChatMessage[]) => {
          if (Array.isArray(data)) setMessages(data);
          setHistoryLoaded(true);
        })
        .catch(() => setHistoryLoaded(true));
    }
  }, [open, user, historyLoaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      role: "user", content: trimmed, createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res  = await fetchApi("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.error
            ? "Sorry, I couldn't get a response. Please try again."
            : data.message,
          sources: data.sources,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please check your network and try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  async function handleClear() {
    if (user) {
      await fetchApi("/api/chat", { method: "DELETE" });
    }
    setMessages([]);
    setHistoryLoaded(false);
  }

  function toggleListening() {
    if (listening) { recognitionRef.current?.stop(); return; }
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      setInput((prev) => (prev ? prev + " " + t : t));
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <style>{`
        @keyframes chatBounce {
          0%,80%,100% { transform:translateY(0); }
          40%          { transform:translateY(-6px); }
        }
        @keyframes chartGrow {
          from { transform:scaleY(0); opacity:0; }
          to   { transform:scaleY(1); opacity:1; }
        }
        @keyframes lineDraw {
          to { stroke-dashoffset:0; }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fabPop {
          0%  { transform:scale(1); }
          40% { transform:scale(1.12); }
          70% { transform:scale(0.96); }
          100%{ transform:scale(1); }
        }
      `}</style>

      {/* ── Floating action button ── */}
      <button
        type="button"
        aria-label="Open finance assistant"
        onClick={() => setOpen((v) => !v)}
        className={[
          "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50",
          "w-14 h-14 rounded-full shadow-xl flex items-center justify-center",
          "transition-all duration-200",
          open
            ? "bg-slate-700 text-white scale-95"
            : "text-white hover:scale-105",
        ].join(" ")}
        style={!open ? {
          background: "linear-gradient(135deg,#10b981,#059669)",
          boxShadow: "0 8px 24px rgba(5,150,105,0.45)",
          animation: "fabPop 0.4s ease-out",
        } : {}}
      >
        {open ? <CloseIcon /> : <ChatBubbleIcon />}
      </button>

      {/* ── Unread dot ── */}
      {!open && messages.length > 0 && (
        <div className="fixed bottom-32 right-4 md:bottom-18 md:right-6 z-50 w-3 h-3 rounded-full bg-amber-400 border-2 border-white"
          style={{ bottom: "calc(5rem + 40px)" }} />
      )}

      {/* ── Chat panel ── */}
      {open && (
        <>
          <style>{`
            .hf-chat-panel {
              position: fixed;
              z-index: 50;
              display: flex;
              flex-direction: column;
              background: #f8fafc;
              box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10);
              border: 1px solid rgba(0,0,0,0.07);
              animation: slideUp 0.22s cubic-bezier(.2,.8,.3,1) both;
              /* Mobile: full screen */
              top: 0; bottom: 0; left: 0; right: 0;
              border-radius: 0;
            }
            @media (min-width: 768px) {
              .hf-chat-panel {
                top: auto;
                left: auto;
                bottom: 88px;
                right: 24px;
                width: 400px;
                height: calc(100vh - 120px);
                max-height: 780px;
                border-radius: 20px;
              }
            }
          `}</style>
          <div className="hf-chat-panel">

            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#047857 0%,#059669 100%)",
                borderRadius: "inherit",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <div className="flex items-center gap-3">
                {/* Logo mark */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
                  style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
                  HF
                </div>
                <div>
                  <p className="font-bold text-white text-sm leading-tight">HighFin Assistant</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <p className="text-xs text-emerald-200">Online · Not financial advice</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-200 hover:text-white hover:bg-white/15 transition-colors"
                    aria-label="Clear chat"
                  >
                    <TrashIcon />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-emerald-200 hover:text-white hover:bg-white/15 transition-colors"
                  aria-label="Close"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0" style={{ scrollbarWidth: "thin" }}>
              {isEmpty ? (
                <EmptyState onSuggest={(s) => send(s)} />
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} />
                  ))}
                  {loading && <TypingIndicator />}
                  <div ref={bottomRef} />
                </>
              )}
              {!isEmpty && <div ref={bottomRef} />}
            </div>

            {/* ── Input bar ── */}
            <div
              className="flex-shrink-0 px-3 pb-4 pt-3 bg-white"
              style={{
                borderTop: "1px solid #e2e8f0",
                borderRadius: "0 0 inherit inherit",
              }}
            >
              {!user && (
                <p className="text-xs text-slate-400 mb-2 text-center">
                  Chat history isn&rsquo;t saved until you{" "}
                  <a href="/register" className="text-emerald-600 hover:underline font-medium">create an account</a>.
                </p>
              )}
              <div className="flex items-center gap-2">
                {/* Mic */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={loading}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                    style={{
                      background: listening
                        ? "linear-gradient(135deg,#ef4444,#dc2626)"
                        : "#f1f5f9",
                      animation: listening ? "pulse 1s ease-in-out infinite" : "none",
                    }}
                    aria-label={listening ? "Stop listening" : "Speak"}
                  >
                    <MicIcon active={listening} />
                  </button>
                )}

                {/* Text input */}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={listening ? "Listening…" : "Ask a finance question…"}
                  disabled={loading}
                  className="flex-1 text-sm focus:outline-none disabled:opacity-60 bg-slate-50"
                  style={{
                    border: listening ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
                    borderRadius: 14,
                    padding: "10px 14px",
                    transition: "border-color 0.15s",
                  }}
                />

                {/* Send */}
                <button
                  type="button"
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white transition-all disabled:opacity-35 hover:scale-105 active:scale-95"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg,#10b981,#059669)"
                      : "#cbd5e1",
                    boxShadow: input.trim()
                      ? "0 4px 12px rgba(5,150,105,0.35)"
                      : "none",
                    transition: "background 0.15s, box-shadow 0.15s",
                  }}
                  aria-label="Send"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
