"use client";

import { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AiChatPanel } from "@/components/chat/ai-chat-panel";
import { BackToHomeButton } from "@/components/back-to-home-button";
import { LoginModal } from "@/components/auth/login-modal";

function ChatPageInner() {
  const searchParams = useSearchParams();
  const conversation = searchParams.get("conversation");

  const [showLogin, setShowLogin] = useState(false);
  const [sessionVersion, setSessionVersion] = useState(0);

  const handleLoggedIn = useCallback(() => {
    setSessionVersion((v) => v + 1);
  }, []);

  return (
    <>
      <AiChatPanel key={sessionVersion} initialConversationId={conversation} onRequireLogin={() => setShowLogin(true)} />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onLoggedIn={handleLoggedIn} />
    </>
  );
}

export default function ChatPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <BackToHomeButton className="mb-5" />
      <Suspense fallback={<p className="text-sm text-[#6a4a50]">Loading chat…</p>}>
        <ChatPageInner />
      </Suspense>
    </main>
  );
}
