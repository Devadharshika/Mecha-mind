"use client";

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

export default function ChatConsole() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Welcome back, Pilot. How can MechaMind assist your mission today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userText = trimmed;

    const historyPayload = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/mechamind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", text);
        throw new Error("API error");
      }

      const data = (await res.json()) as { reply?: string; error?: string };

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            data.reply ??
            data.error ??
            "Systems online, but I couldn't parse that reply, Pilot.",
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            "⚠️ MechaMind encountered a connection error. Please try again in a moment, Pilot.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void sendMessage();
    }
  };

  // Prefill helpers for memory commands
  const setRememberTemplate = () => {
    setInput('remember this: I am interested in robotics and control systems');
  };

  const setForgetTemplate = () => {
    setInput('forget: robotics and control systems');
  };

  return (
    <>
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300/80">
            AI Engineering Console
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-50">
            MechaMind <span className="text-cyan-300">AI Console</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl">
            Direct uplink established. Ask MechaMind to teach concepts, design
            projects, or simulate robotic systems — all from one interface.
          </p>
        </div>

        <div className="text-right text-[11px] text-slate-400">
          <p>Mode</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 font-medium text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Session
          </p>
        </div>
      </header>

      {/* Chat container */}
      <div className="h-[65vh] rounded-3xl border border-cyan-500/30 bg-slate-950/60 p-6 sm:p-7 overflow-y-auto space-y-4 shadow-xl shadow-cyan-900/40">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                msg.sender === "user"
                  ? "bg-cyan-500 text-slate-950 font-medium shadow-md shadow-cyan-500/40"
                  : "bg-white/5 border border-cyan-400/30 text-cyan-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl text-sm bg-white/5 border border-cyan-400/30 text-cyan-100 italic">
              MechaMind is analyzing your last transmission…
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={sendMessage}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          className="flex-1 px-3 py-3 rounded-2xl bg-black/40 border border-cyan-500/40 text-slate-100 text-sm outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
          placeholder="Ask MechaMind to explain a concept, design a project, or debug your idea..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/40 transition"
        >
          {isLoading ? "Analyzing…" : "Send"}
        </button>
      </form>

      {/* Tips row */}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-slate-500">
          Tip: Be specific — e.g. “Design a beginner robotics arm project with
          Arduino and give wiring, code, and explanation.”
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={setRememberTemplate}
            className="text-[11px] px-3 py-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 transition"
          >
            remember this: ...
          </button>
          <button
            type="button"
            onClick={setForgetTemplate}
            className="text-[11px] px-3 py-1 rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 transition"
          >
            forget: ...
          </button>
        </div>
      </div>
    </>
  );
}
