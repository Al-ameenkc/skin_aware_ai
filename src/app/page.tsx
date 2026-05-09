"use client";

import { useState } from "react";
import { LoginModal } from "@/components/auth/login-modal";
import { FloralBackground } from "@/components/home/floral-background";
import { HeroSection } from "@/components/home/hero-section";
import { SiteNav } from "@/components/home/site-nav";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <main className="relative min-h-screen pb-20">
      <FloralBackground />
      <SiteNav onLoginClick={() => setShowLogin(true)} />
      <HeroSection />
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </main>
  );
}
