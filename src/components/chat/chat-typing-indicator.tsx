"use client";

export function ChatTypingIndicator() {
  return (
    <div
      className="inline-flex max-w-[88%] items-center gap-1 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-sm"
      aria-hidden
    >
      <span className="chat-dot bg-[#d88ca9]" />
      <span className="chat-dot bg-[#d88ca9]" />
      <span className="chat-dot bg-[#d88ca9]" />
    </div>
  );
}
