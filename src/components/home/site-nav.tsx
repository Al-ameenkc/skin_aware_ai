"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { getBrowserSupabase } from "@/lib/supabase";

type SiteNavProps = {
  onLoginClick: () => void;
};

export function SiteNav({ onLoginClick }: SiteNavProps) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    void supabase.auth.getSession().then(({ data: { session } }) => setLoggedIn(!!session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-5">
      <div className="glass-panel rounded-2xl px-3 py-2 transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg">
        <BrandLogo compact />
      </div>
      <nav className="glass-panel flex items-center gap-2 rounded-2xl p-2 transition duration-300 ease-out hover:shadow-md">
        <Link
          href="/"
          className="rounded-xl px-4 py-2 text-sm text-[#6f3f45] transition duration-200 ease-out hover:scale-105 hover:bg-white/70 active:scale-95"
        >
          Home
        </Link>
        <Link
          href="/history"
          className="rounded-xl px-4 py-2 text-sm text-[#6f3f45] transition duration-200 ease-out hover:scale-105 hover:bg-white/70 active:scale-95"
        >
          History
        </Link>
        <Link
          href="/chat"
          className="rounded-xl px-4 py-2 text-sm text-[#6f3f45] transition duration-200 ease-out hover:scale-105 hover:bg-white/70 active:scale-95"
        >
          AI Chat
        </Link>
        {loggedIn === false && (
          <button
            type="button"
            onClick={onLoginClick}
            className="rounded-xl bg-[#6f3f45] px-4 py-2 text-sm text-white shadow-md transition duration-200 ease-out hover:scale-105 hover:bg-[#5d343a] hover:shadow-lg active:scale-95"
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
}
