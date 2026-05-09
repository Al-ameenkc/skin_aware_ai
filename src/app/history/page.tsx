"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { BackToHomeButton } from "@/components/back-to-home-button";
import { normalizeDetectedConditions } from "@/lib/analysis-format";
import { getBrowserSupabase } from "@/lib/supabase";

type AnalysisItem = {
  id: string;
  created_at: string;
  raw_model_output: string | null;
  detected_conditions: unknown;
};

type ConversationRow = {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();

    const loadAll = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Please log in from the home page to view your history.");
        setAnalyses([]);
        setConversations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const headers = { Authorization: `Bearer ${session.access_token}` };

      const [anRes, convRes] = await Promise.all([
        fetch("/api/analyses", { headers }),
        fetch("/api/conversations", { headers }),
      ]);

      const anPayload = (await anRes.json()) as { analyses?: AnalysisItem[]; error?: string };
      const convPayload = (await convRes.json()) as { conversations?: ConversationRow[]; error?: string };

      const errs: string[] = [];
      if (!anRes.ok) errs.push(anPayload.error ?? "Could not load skin analyses.");
      if (!convRes.ok) errs.push(convPayload.error ?? "Could not load conversations.");
      setError(errs.length ? errs.join(" ") : null);

      setAnalyses(anRes.ok ? (anPayload.analyses ?? []) : []);
      setConversations(convRes.ok ? (convPayload.conversations ?? []) : []);

      setLoading(false);
    };

    void loadAll();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) void loadAll();
      else {
        setAnalyses([]);
        setConversations([]);
        setError("Please log in from the home page to view your history.");
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-16">
      <h1 className="section-title text-5xl text-[#5d3439]">Your Skin History</h1>
      <p className="mt-2 text-[#6b4b51]">Past chats and photo analyses in one place.</p>
      <BackToHomeButton className="mt-4" />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#6f3f45] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#5d343a]"
        >
          <MessageCircle size={18} />
          New chat
        </Link>
      </div>

      {loading && <p className="mt-8 text-sm text-[#7a575d]">Loading your history…</p>}
      {error && !loading && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!loading && conversations.length > 0 && (
        <section className="mt-10">
          <h2 className="section-title flex items-center gap-2 text-2xl text-[#5f343a]">
            <MessageCircle className="text-[#d88ca9]" size={22} />
            Conversations
          </h2>
          <p className="mt-1 text-sm text-[#8a656b]">Each chat is its own thread — open one to continue where you left off.</p>
          <ul className="mt-4 grid gap-3">
            {conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/chat?conversation=${encodeURIComponent(c.id)}`}
                  className="glass-panel glass-panel-hover block rounded-2xl p-4 transition-colors hover:bg-white/55"
                >
                  <p className="font-medium text-[#5d3e44]">{c.title}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-[#7f595f]">{new Date(c.updated_at).toLocaleString()}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && analyses.length > 0 && (
        <section className={`mt-10 ${conversations.length ? "border-t border-white/40 pt-10" : ""}`}>
          <h2 className="section-title flex items-center gap-2 text-2xl text-[#5f343a]">
            <Sparkles className="text-[#d88ca9]" size={22} />
            Skin analyses
          </h2>
          <p className="mt-1 text-sm text-[#8a656b]">Results from photo checks.</p>
          <div className="mt-4 grid gap-4">
            {analyses.map((item) => {
              const conditions = normalizeDetectedConditions(item.detected_conditions);
              return (
                <article
                  key={item.id}
                  className="glass-panel glass-panel-hover cursor-default rounded-3xl p-5 transition-colors hover:bg-white/55"
                >
                  <p className="text-xs uppercase tracking-wide text-[#7f595f]">{new Date(item.created_at).toLocaleString()}</p>
                  <p className="mt-2 text-[#5d3e44]">{item.raw_model_output ?? "Skin analysis saved."}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {conditions.map((condition) => (
                      <span
                        key={`${item.id}-${condition.condition}-${condition.confidence}`}
                        className="rounded-full bg-white/70 px-3 py-1 text-sm text-[#6f3f45] transition duration-200 hover:scale-105 hover:bg-white hover:shadow-sm"
                      >
                        {condition.condition}: {Math.round(condition.confidence * 100)}%
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {!loading && !error && conversations.length === 0 && analyses.length === 0 && (
        <p className="mt-10 text-[#6b4b51]">No history yet. Try an analysis or a chat message — then come back here.</p>
      )}
    </main>
  );
}
