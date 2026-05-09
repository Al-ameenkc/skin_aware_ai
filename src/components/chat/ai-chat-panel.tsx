"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Flower2,
  History as HistoryIcon,
  LogOut,
  MessageCircle,
  MessageSquarePlus,
  SendHorizontal,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { CustomSelect } from "@/components/custom-select";
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator";
import { MarkdownMessage } from "@/components/chat/markdown-message";
import { analysisRecordToChatMessages, type AnalysisRecord } from "@/lib/analysis-format";
import { getBrowserSupabase } from "@/lib/supabase";

type Message = {
  role: "user" | "assistant";
  text: string;
  /** Data URL shown with this user message after send */
  imageSrc?: string;
};

type HistoryEntry = {
  key: string;
  kind: "conversation" | "analysis";
  entityId: string;
  label: string;
  sub: string;
  sortTime: number;
};

type ProfilePayload = {
  email: string | null;
  fullName: string | null;
  profile: {
    skin_type: string | null;
    sensitivity: string | null;
    goals: string[] | null;
  };
};

type AiChatPanelProps = {
  onRequireLogin?: () => void;
  /** Open a saved thread from `/chat?conversation=…` */
  initialConversationId?: string | null;
};

async function fetchHistoryEntries(): Promise<HistoryEntry[]> {
  const supabase = getBrowserSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const headers = { Authorization: `Bearer ${session.access_token}` };
  const [anRes, convRes] = await Promise.all([
    fetch("/api/analyses", { headers }),
    fetch("/api/conversations", { headers }),
  ]);
  const anPayload = (await anRes.json()) as {
    analyses?: Array<{ id: string; raw_model_output?: string; created_at: string }>;
  };
  const convPayload = (await convRes.json()) as {
    conversations?: Array<{ id: string; title: string; updated_at: string }>;
  };
  const analyses = anPayload.analyses ?? [];
  const conversations = convPayload.conversations ?? [];

  const merged: HistoryEntry[] = [
    ...conversations.map((c) => ({
      key: `conv-${c.id}`,
      kind: "conversation" as const,
      entityId: c.id,
      label: c.title,
      sub: `Chat · ${new Date(c.updated_at).toLocaleString()}`,
      sortTime: new Date(c.updated_at).getTime(),
    })),
    ...analyses.map((a) => ({
      key: `analysis-${a.id}`,
      kind: "analysis" as const,
      entityId: a.id,
      label: (a.raw_model_output ?? "Skin analysis").slice(0, 72),
      sub: `Photo check · ${new Date(a.created_at).toLocaleString()}`,
      sortTime: new Date(a.created_at).getTime(),
    })),
  ].sort((a, b) => b.sortTime - a.sortTime);

  return merged.slice(0, 35);
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export function AiChatPanel({ onRequireLogin, initialConversationId = null }: AiChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfilePayload | null>(null);
  const [editSkinType, setEditSkinType] = useState("combination");
  const [editSensitivity, setEditSensitivity] = useState("moderate");
  const [editGoals, setEditGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);
  const [welcomeFirstName, setWelcomeFirstName] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevConversationUrlRef = useRef<string | null>(null);
  const [composerPreviewUrl, setComposerPreviewUrl] = useState<string | null>(null);

  const suggestedQuestions = useMemo(
    () => ["How can I fade dark spots safely?", "What is a simple acne routine?", "How do I fix dry flaky skin?"],
    [],
  );

  const chatStarted = messages.length > 0;

  const refreshHistory = useCallback(async () => {
    setHistoryItems(await fetchHistoryEntries());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchHistoryEntries().then((items) => {
      if (!cancelled) setHistoryItems(items);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setConversationId(initialConversationId ?? null);
  }, [initialConversationId]);

  useEffect(() => {
    const supabase = getBrowserSupabase();

    const resolveWelcomeName = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setWelcomeFirstName(null);
        return;
      }
      const meta = session.user.user_metadata as { full_name?: string } | undefined;
      const fromMeta = meta?.full_name?.trim();
      if (fromMeta) {
        setWelcomeFirstName(fromMeta.split(/\s+/)[0] ?? null);
        return;
      }
      const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (!res.ok) {
        setWelcomeFirstName(session.user.email?.split("@")[0] ?? null);
        return;
      }
      const data = (await res.json()) as { fullName?: string | null };
      const fn = data.fullName?.trim();
      setWelcomeFirstName(fn ? (fn.split(/\s+/)[0] ?? null) : session.user.email?.split("@")[0] ?? null);
    };

    void resolveWelcomeName();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void resolveWelcomeName();
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const id = initialConversationId?.trim() || null;
    if (!id) {
      prevConversationUrlRef.current = null;
      setMessages([]);
      return;
    }

    const prev = prevConversationUrlRef.current;
    prevConversationUrlRef.current = id;
    if (prev !== null && prev !== id) {
      setMessages([]);
    }

    let cancelled = false;
    void (async () => {
      const supabase = getBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || cancelled) return;

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/chat-transcript?conversationId=${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = (await res.json()) as { messages?: Message[]; error?: string };
        if (!res.ok) {
          if (!cancelled) {
            setMessages([]);
            setError(json.error ?? "Could not load this conversation.");
          }
          return;
        }
        if (!cancelled) setMessages(json.messages ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!selectedFile) {
      setComposerPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setComposerPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const loadProfile = useCallback(async () => {
    const supabase = getBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    setProfileLoading(true);
    const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${session.access_token}` } });
    const data = (await res.json()) as ProfilePayload & { error?: string };
    setProfileLoading(false);
    if (!res.ok) {
      setProfileData(null);
      return;
    }
    setProfileData(data);
    setEditSkinType(data.profile?.skin_type ?? "combination");
    setEditSensitivity(data.profile?.sensitivity ?? "moderate");
    setEditGoals((data.profile?.goals ?? []).join(", "));
  }, []);

  const loadHistoryThread = useCallback(
    async (entry: HistoryEntry) => {
      const supabase = getBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        onRequireLogin?.();
        return;
      }
      setSidebarOpen(false);
      setError(null);
      if (entry.kind === "conversation") {
        router.replace(`/chat?conversation=${encodeURIComponent(entry.entityId)}`, { scroll: false });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/analyses/${entry.entityId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const json = (await res.json()) as { analysis?: AnalysisRecord };
        if (json.analysis) setMessages(analysisRecordToChatMessages(json.analysis));
        else setError("Could not load this analysis.");
      } finally {
        setLoading(false);
      }
    },
    [onRequireLogin, router],
  );

  const startNewChat = useCallback(() => {
    setSidebarOpen(false);
    setError(null);
    router.replace("/chat", { scroll: false });
  }, [router]);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const openProfileOrLogin = async () => {
    const supabase = getBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      onRequireLogin?.();
      return;
    }
    setProfileOpen(true);
    void loadProfile();
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim() && !selectedFile) return;

    const supabase = getBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError(null);
      onRequireLogin?.();
      return;
    }

    const caption = input.trim();
    const displayLine =
      caption || (selectedFile ? "Skin photo for analysis." : "Analyze this uploaded skin image.");
    const userText = caption || (selectedFile ? "Skin photo for analysis." : "Analyze this uploaded skin image.");

    let outgoingImageSrc: string | undefined;
    if (selectedFile) {
      outgoingImageSrc = await readFileAsDataURL(selectedFile);
    }

    setMessages((prev) => [...prev, { role: "user", text: displayLine, imageSrc: outgoingImageSrc }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      if (selectedFile) {
        const dataUrl = outgoingImageSrc!;
        const imageBase64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : "";
        const analyzeResponse = await fetch("/api/analyze-skin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageBase64,
            ...(caption ? { userNotes: caption } : {}),
            ...(conversationId ? { conversationId } : {}),
          }),
        });
        const analyzePayload = (await analyzeResponse.json()) as {
          error?: string;
          assistantMarkdown?: string;
          conversationId?: string;
        };

        if (!analyzeResponse.ok || !analyzePayload.assistantMarkdown) {
          setMessages((prev) => prev.slice(0, -1));
          setError(
            typeof analyzePayload.error === "string"
              ? analyzePayload.error
              : "Failed to analyze image. Please try another photo.",
          );
          return;
        }
        clearSelectedFile();
        if (analyzePayload.conversationId) {
          setConversationId(analyzePayload.conversationId);
          router.replace(`/chat?conversation=${encodeURIComponent(analyzePayload.conversationId)}`, { scroll: false });
        }
        setMessages((prev) => [...prev, { role: "assistant", text: analyzePayload.assistantMarkdown! }]);
        await refreshHistory();
        return;
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: userText,
          ...(conversationId ? { conversationId } : {}),
        }),
      });
      const payload = (await response.json()) as { reply?: string; conversationId?: string; error?: string };

      if (!response.ok || !payload.reply) {
        setMessages((prev) => prev.slice(0, -1));
        setError(payload.error ?? "Failed to get AI reply.");
        return;
      }

      if (payload.conversationId) {
        setConversationId(payload.conversationId);
        router.replace(`/chat?conversation=${encodeURIComponent(payload.conversationId)}`, { scroll: false });
      }

      setMessages((prev) => [...prev, { role: "assistant", text: payload.reply ?? "" }]);
      await refreshHistory();
    } finally {
      setLoading(false);
    }
  };

  const onPickFile = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const openSnapPicker = async () => {
    const supabase = getBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError(null);
      onRequireLogin?.();
      return;
    }
    uploadRef.current?.click();
  };

  const saveProfile = async () => {
    const supabase = getBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;
    setProfileSaving(true);
    const goals = editGoals
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        skinType: editSkinType,
        sensitivity: editSensitivity,
        goals,
      }),
    });
    setProfileSaving(false);
    if (res.ok) await loadProfile();
  };

  const logout = async () => {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    setProfileOpen(false);
    setProfileData(null);
    setMessages([]);
    setHistoryItems([]);
    router.replace("/chat", { scroll: false });
  };

  return (
    <div className="relative flex w-full flex-col" style={{ minHeight: "min(78vh, calc(100dvh - 9rem))", maxHeight: "calc(100dvh - 9rem)" }}>
      <header className="flex shrink-0 items-center justify-between gap-4 pb-3">
        <BrandLogo />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => startNewChat()}
            className="group rounded-full border border-white/70 bg-white/80 px-3 py-2 text-sm font-medium text-[#6f3f45] transition duration-200 ease-out hover:scale-[1.02] hover:border-[#e8b8c8] hover:bg-white hover:shadow-md active:scale-95"
            title="Start a fresh conversation"
          >
            <span className="inline-flex items-center gap-1.5">
              <MessageSquarePlus size={17} className="transition duration-200 group-hover:scale-110" />
              New chat
            </span>
          </button>
          <button
            type="button"
            onClick={() => void openProfileOrLogin()}
            className="group rounded-full border border-white/70 bg-white/80 p-2 text-[#6f3f45] transition duration-200 ease-out hover:scale-110 hover:border-[#e8b8c8] hover:bg-white hover:shadow-md active:scale-95"
          >
            <UserRound size={18} className="transition duration-200 group-hover:scale-110" />
          </button>
        </div>
      </header>

      {!chatStarted && (
        <div className="mx-auto mb-4 max-w-3xl shrink-0 text-center">
          <h1 className="section-title text-4xl text-[#5d3439] md:text-5xl">
            {welcomeFirstName ? `Hi ${welcomeFirstName}, welcome back` : "Hi, welcome back"}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[#6c4b51]">
            Ask anything about your skin routine, concerns, and next steps. Tap Snap skin to add a photo for analysis.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {suggestedQuestions.map((question) => (
              <button
                type="button"
                key={question}
                onClick={() => setInput(question)}
                className="rounded-3xl border border-white/70 bg-white/75 p-4 text-left text-[#5f3e44] shadow-md transition duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:border-[#e8b0c4] hover:bg-white/90 hover:shadow-lg active:scale-[0.99]"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/70 bg-white/62 px-3 py-3">
        {!chatStarted && (
          <p className="text-sm text-[#7f5b62]">Tip: ask a question or upload an image to begin analysis.</p>
        )}
        {messages.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`mb-3 rounded-2xl px-4 py-3 transition duration-200 ease-out hover:scale-[1.005] ${
              message.role === "user"
                ? "ml-auto max-w-[min(92%,20rem)] bg-[#6f3f45] text-white hover:shadow-lg sm:max-w-[min(88%,22rem)]"
                : "max-w-[92%] border border-white/70 bg-white/95 text-[#5d3c42] hover:border-[#e8c4d0] hover:shadow-md sm:max-w-[88%]"
            }`}
          >
            {message.role === "user" ? (
              <div className="space-y-2">
                {message.imageSrc ? (
                  <img
                    src={message.imageSrc}
                    alt="Your skin photo"
                    className="max-h-60 w-full max-w-[min(100%,260px)] rounded-xl object-cover object-center shadow-md ring-1 ring-white/25"
                  />
                ) : null}
                <p className="whitespace-pre-wrap text-sm">{message.text}</p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Flower2 className="mt-0.5 h-4 w-4 shrink-0 text-[#d88ca9]" aria-hidden />
                <MarkdownMessage content={message.text} />
              </div>
            )}
          </article>
        ))}
        {loading && (
          <div className="mb-3">
            <ChatTypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex shrink-0 items-end gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="group/toggle mb-[5px] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/90 text-[#6f3f45] shadow-md transition duration-300 ease-out hover:scale-105 hover:border-[#e8c4d0] hover:bg-white hover:shadow-lg active:scale-95"
          title="Conversation history"
        >
          <HistoryIcon className="transition duration-300 ease-out group-hover/toggle:text-[#5d343a]" size={18} />
        </button>

        <div className="flex min-w-0 flex-1 justify-end">
          <form
            onSubmit={send}
            className="flex w-full max-w-[85%] min-w-[10.5rem] flex-col gap-2 rounded-2xl border border-white/70 bg-white/88 p-2 transition duration-300 ease-out hover:border-[#e8c4d0] hover:bg-white/95 hover:shadow-md md:max-w-[50%]"
          >
            {selectedFile && composerPreviewUrl ? (
              <div className="flex items-center gap-2 px-0.5 pt-0.5">
                <img
                  src={composerPreviewUrl}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-[#e8c4d0]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-[#7a5158]">{selectedFile.name}</p>
                  <button
                    type="button"
                    onClick={() => clearSelectedFile()}
                    className="mt-0.5 text-xs font-medium text-[#9b5d62] underline-offset-2 hover:underline"
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            ) : null}
            {selectedFile ? (
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Describe what you want analyzed (optional)…"
                rows={2}
                className="min-h-[2.75rem] w-full resize-none rounded-xl border border-white/60 bg-white px-3 py-2.5 text-sm text-[#5d4146] outline-none transition duration-200 hover:border-[#e8b8c8] focus:ring-2 focus:ring-[#d88ca9]"
              />
            ) : (
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask PetalSense AI anything…"
                className="w-full rounded-xl border border-white/60 bg-white px-3 py-2.5 text-sm outline-none transition duration-200 hover:border-[#e8b8c8] focus:ring-2 focus:ring-[#d88ca9]"
              />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void openSnapPicker()}
                className="group/snap inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#efc6d5] bg-[#fff0f5] px-3 py-2 text-sm font-medium text-[#6f3f45] transition duration-200 ease-out hover:scale-[1.02] hover:border-[#e8a8be] hover:bg-[#ffe4ef] hover:shadow-md active:scale-95"
                title="Snap or upload a skin photo"
              >
                <Camera size={17} className="transition duration-200 group-hover/snap:scale-110 group-hover/snap:-rotate-6" aria-hidden />
                <span>Snap skin</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group/send ml-auto shrink-0 rounded-xl bg-[#d88ca9] px-4 py-2 text-sm font-semibold text-white shadow-md transition duration-200 ease-out hover:scale-[1.02] hover:bg-[#c97a9a] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="inline-flex items-center gap-1">
                  Send{" "}
                  <SendHorizontal size={14} className="transition duration-200 group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5" />
                </span>
              </button>
            </div>
            <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          </form>
        </div>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#2f1f23]/25 backdrop-blur-[2px]"
          aria-label="Close history"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[min(100vw,19rem)] flex-col border-r border-white/70 bg-[#fffaf8]/98 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="section-title flex items-center gap-2 text-xl text-[#5f343a]">
            <MessageCircle size={18} className="text-[#d88ca9]" />
            History
          </h3>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-2 text-[#6f3f45] hover:bg-[#fff0f4]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-xs text-[#8a656b]">Tap an item to load it into the chat and keep messaging.</p>
        <div className="mt-3 flex-1 space-y-2 overflow-y-auto text-sm text-[#6c4a50]">
          {historyItems.length === 0 && <p>No history yet — send a message or analyze a photo.</p>}
          {historyItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => void loadHistoryThread(item)}
              className="w-full rounded-xl bg-[#fff4f8] px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              <p className="font-medium text-[#5d3c42]">{item.label}</p>
              <p className="mt-0.5 text-xs text-[#8a656b]">{item.sub}</p>
            </button>
          ))}
        </div>
      </aside>

      {error && <p className="mt-2 shrink-0 text-center text-sm text-red-600">{error}</p>}

      {profileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2f1f23]/45 px-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-[#f0ccd8] bg-gradient-to-b from-[#fff8fb] to-[#ffeef5] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2 text-2xl text-[#6f3f45]">
                <Sparkles className="h-6 w-6 text-[#d88ca9]" />
                Your profile
              </h3>
              <button type="button" onClick={() => setProfileOpen(false)} className="rounded-full p-2 text-[#6f3f45] transition hover:bg-[#fff0f4]">
                <X size={20} />
              </button>
            </div>
            {profileLoading ? (
              <p className="text-sm text-[#6a4a50]">Loading…</p>
            ) : !profileData ? (
              <p className="text-sm text-[#6a4a50]">Could not load your profile. Close and try again.</p>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/80 bg-white/80 p-3 text-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9b5d62]">Email</p>
                  <p className="mt-1 break-all text-[#5d3c42]">{profileData.email}</p>
                  {profileData.fullName && (
                    <>
                      <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[#9b5d62]">Name</p>
                      <p className="mt-1 text-[#5d3c42]">{profileData.fullName}</p>
                    </>
                  )}
                </div>
                <CustomSelect
                  label="Skin type"
                  value={editSkinType}
                  onChange={setEditSkinType}
                  options={[
                    { value: "dry", label: "Dry" },
                    { value: "oily", label: "Oily" },
                    { value: "combination", label: "Combination" },
                    { value: "normal", label: "Normal" },
                  ]}
                />
                <CustomSelect
                  label="Sensitivity"
                  value={editSensitivity}
                  onChange={setEditSensitivity}
                  options={[
                    { value: "low", label: "Low sensitivity" },
                    { value: "moderate", label: "Moderate sensitivity" },
                    { value: "high", label: "High sensitivity" },
                  ]}
                />
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[#7a5158]">Skin goals (comma separated)</p>
                  <input
                    value={editGoals}
                    onChange={(e) => setEditGoals(e.target.value)}
                    className="w-full rounded-xl border border-[#f1c5d3] bg-white px-4 py-3 text-[#5d4146] outline-none focus:ring-2 focus:ring-[#d88ca9]"
                    placeholder="e.g. reduce redness, even tone"
                  />
                </div>
                <button
                  type="button"
                  disabled={profileSaving}
                  onClick={() => void saveProfile()}
                  className="w-full rounded-xl bg-[#6f3f45] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#5d343a] disabled:opacity-60"
                >
                  {profileSaving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e8b8c8] bg-white/90 py-3 text-sm font-medium text-[#6f3f45] transition hover:bg-[#fff0f5]"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
