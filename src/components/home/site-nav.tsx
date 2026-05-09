"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { getBrowserSupabase } from "@/lib/supabase";

type SiteNavProps = {
  onLoginClick: () => void;
};

const linkClass =
  "rounded-xl px-3 py-2 text-sm text-[#6f3f45] transition duration-200 ease-out hover:scale-[1.02] hover:bg-white/70 active:scale-95 sm:px-4";

export function SiteNav({ onLoginClick }: SiteNavProps) {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
    if (!mobileOpen) return;
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mobileOpen]);

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link href="/" className={linkClass} onClick={onNavigate}>
        Home
      </Link>
      <Link href="/history" className={linkClass} onClick={onNavigate}>
        History
      </Link>
      <Link href="/chat" className={linkClass} onClick={onNavigate}>
        AI Chat
      </Link>
      {loggedIn === false && (
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLoginClick();
          }}
          className="rounded-xl bg-[#6f3f45] px-3 py-2 text-sm text-white shadow-md transition duration-200 ease-out hover:scale-[1.02] hover:bg-[#5d343a] hover:shadow-lg active:scale-95 sm:px-4"
        >
          Login
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 sm:pt-5">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition duration-300 ease-out sm:flex-nowrap sm:gap-4 sm:py-2">
        <div className="glass-panel rounded-2xl px-2 py-1.5 sm:px-3 sm:py-2">
          <BrandLogo compact />
        </div>

        <nav className="glass-panel hidden items-center gap-1 rounded-2xl p-1.5 md:flex md:gap-2 md:p-2">
          <NavLinks />
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/70 text-[#6f3f45] shadow-sm transition hover:bg-white md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="glass-panel mt-2 flex flex-col gap-1 rounded-2xl p-3 shadow-lg md:hidden"
          aria-label="Mobile navigation"
        >
          <NavLinks onNavigate={() => setMobileOpen(false)} />
        </nav>
      )}
    </header>
  );
}
