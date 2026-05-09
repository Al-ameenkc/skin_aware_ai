"use client";

import { useState } from "react";
import { AnalysisResult } from "@/components/analysis-result";
import { getBrowserSupabase } from "@/lib/supabase";
import type { ConditionConfidence, RecommendationSet } from "@/lib/types";

type AnalysisApiResponse = {
  conditions: ConditionConfidence[];
  recommendations: RecommendationSet;
  disclaimer: string;
  error?: string;
};

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisApiResponse | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const fileData = await file.arrayBuffer();
    const bytes = new Uint8Array(fileData);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const imageBase64 = btoa(binary);
    const supabase = getBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      setError("Please sign in first.");
      return;
    }

    const response = await fetch("/api/analyze-skin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ imageBase64 }),
    });

    const payload = (await response.json()) as AnalysisApiResponse;
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Failed to analyze image");
      return;
    }
    setResult(payload);
  };

  return (
    <section className="space-y-4">
      <div className="glass-panel glass-panel-hover cursor-default rounded-3xl p-5">
        <h3 className="section-title text-2xl text-[#5f343a]">Upload Skin Image</h3>
        <p className="mt-2 text-sm text-[#6a4a50]">Use a clear, well-lit face image for better confidence scores.</p>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="mt-4 w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 transition duration-200 hover:border-[#e8c4d0] hover:bg-white"
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!file || loading}
          className="mt-4 rounded-2xl bg-[#6f3f45] px-5 py-3 text-white shadow-md transition duration-200 hover:scale-[1.02] hover:bg-[#5d343a] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "Analyzing..." : "Analyze My Skin"}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {result && <AnalysisResult {...result} />}
    </section>
  );
}
