"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/frontend/context/AppContext";
import type { ChatMessage } from "@/types";

const SUGGESTED = [
  "What is an index fund?",
  "How risky are bonds?",
  "What should a beginner learn first?",
  "Explain 401(k) vs IRA",
  "What is compound interest?",
  "How does diversification reduce risk?",
];

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={[
          "max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
          isUser
            ? "bg-emerald-600 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm",
        ].join(" ")}
      >
        <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-emerald-500/30">
            <p className="text-xs opacity-80 mb-1">Sources:</p>
            {msg.sources.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs underline opacity-80 hover:opacity-100 truncate"
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

export default function ChatPanel() {
  const { user } = useApp();

  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  // Load history when panel opens for the first time (authenticated users only)
  useEffect(() => {
    if (open && user && !historyLoaded) {
      fetch("/api/chat", { credentials: "same-origin" })
        .then((r) => r.json())
        .then((data: ChatMessage[]) => {
          if (Array.isArray(data)) setMessages(data);
          setHistoryLoaded(true);
        })
        .catch(() => setHistoryLoaded(true));
    }
  }, [open, user, historyLoaded]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      role:      "user",
      content:   trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res  = await fetch("/api/chat", {
        method:      "POST",
        credentials: "same-origin",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            role:      "assistant",
            content:   "Sorry, I couldn't get a response. Please try again.",
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role:      "assistant",
            content:   data.message,
            sources:   data.sources,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role:      "assistant",
          content:   "Connection error. Please check your network and try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        aria-label="Open finance assistant"
        onClick={() => setOpen((v) => !v)}
        className={[
          "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50",
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl",
          "transition-all duration-200",
          open
            ? "bg-slate-700 text-white scale-95"
            : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105",
        ].join(" ")}
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={[
            "fixed z-50 flex flex-col bg-slate-50 shadow-2xl border border-slate-200",
            // Mobile: full-width sheet from bottom
            "bottom-0 left-0 right-0 h-[70vh] rounded-t-2xl",
            // Desktop: right-side panel
            "md:bottom-24 md:right-6 md:left-auto md:w-96 md:h-[560px] md:rounded-2xl",
          ].join(" ")}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-700 text-white rounded-t-2xl flex-shrink-0">
            <div>
              <p className="font-semibold text-sm">HighFin Assistant</p>
              <p className="text-xs text-emerald-200">Finance education · not financial advice</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-emerald-200 hover:text-white transition-colors text-lg"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
            {isEmpty && (
              <div className="text-center mb-4">
                <p className="text-sm text-slate-500 mb-4">
                  Ask me anything about investing, saving, or personal finance.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="text-xs bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 rounded-full px-3 py-1.5 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-2 border-t border-slate-200 flex-shrink-0 bg-white rounded-b-2xl">
            {!user && (
              <p className="text-xs text-slate-400 mb-2 text-center">
                Chat history isn&rsquo;t saved until you{" "}
                <a href="/register" className="text-emerald-600 hover:underline">create an account</a>.
              </p>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a finance question…"
                disabled={loading}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => send(input)}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-emerald-700 transition-colors flex-shrink-0"
                aria-label="Send"
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
