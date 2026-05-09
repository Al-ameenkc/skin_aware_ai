"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { CustomSelect } from "@/components/custom-select";
import { getBrowserSupabase } from "@/lib/supabase";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  onLoggedIn?: () => void;
};

export function LoginModal({ open, onClose, onLoggedIn }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [skinType, setSkinType] = useState("combination");
  const [sensitivity, setSensitivity] = useState("moderate");
  const [goals, setGoals] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    setLoading(true);
    const supabase = getBrowserSupabase();
    const authResult =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
            },
          });
    const { error: authError } = authResult;
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === "signup" && authResult.data.user) {
      const goalsArray = goals
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await supabase.from("profiles").upsert({
        id: authResult.data.user.id,
        skin_type: skinType,
        sensitivity,
        goals: goalsArray,
      });
    }

    onLoggedIn?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f1f23]/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#f0ccd8] bg-gradient-to-b from-[#fff4f8] to-[#ffe7ef] p-6 shadow-xl transition duration-300 hover:shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="section-title text-2xl text-[#6f3f45]">Welcome to Skin-Aware AI</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6f3f45] transition duration-200 hover:rotate-90 hover:scale-110 hover:bg-[#fff0f4] active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-5 text-sm text-[#5d4146]">
          {mode === "login" ? "Sign in to continue your skin journey." : "Create your account to start."}
        </p>
        <div className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-[#f1c5d3] bg-white px-4 py-3 outline-none transition duration-200 hover:border-[#e8a8be] focus:ring-2 focus:ring-[#d88ca9]"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[#f1c5d3] bg-white px-4 py-3 outline-none transition duration-200 hover:border-[#e8a8be] focus:ring-2 focus:ring-[#d88ca9]"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-xl border border-[#f1c5d3] bg-white py-3 pl-4 pr-12 outline-none transition duration-200 hover:border-[#e8a8be] focus:ring-2 focus:ring-[#d88ca9]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6f3f45] transition duration-200 hover:bg-[#fff0f5] hover:text-[#5d343a] active:scale-95"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </button>
          </div>
          {mode === "signup" && (
            <>
              <CustomSelect
                label="Skin type"
                value={skinType}
                onChange={setSkinType}
                options={[
                  { value: "dry", label: "Dry" },
                  { value: "oily", label: "Oily" },
                  { value: "combination", label: "Combination" },
                  { value: "normal", label: "Normal" },
                ]}
              />
              <CustomSelect
                label="Sensitivity"
                value={sensitivity}
                onChange={setSensitivity}
                options={[
                  { value: "low", label: "Low sensitivity" },
                  { value: "moderate", label: "Moderate sensitivity" },
                  { value: "high", label: "High sensitivity" },
                ]}
              />
              <input
                type="text"
                value={goals}
                onChange={(event) => setGoals(event.target.value)}
                placeholder="Skin goals (comma separated)"
                className="w-full rounded-xl border border-[#f1c5d3] bg-white px-4 py-3 outline-none transition duration-200 hover:border-[#e8a8be] focus:ring-2 focus:ring-[#d88ca9]"
              />
            </>
          )}
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-5 w-full rounded-xl bg-[#6f3f45] px-4 py-3 text-white shadow-md transition duration-200 hover:scale-[1.02] hover:bg-[#5a3035] hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setShowPassword(false);
          }}
          className="mt-3 text-sm text-[#6f3f45] underline transition duration-200 hover:text-[#5a3035] hover:opacity-90"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
