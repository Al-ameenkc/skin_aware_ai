type Rec = {
  morning_routine?: unknown;
  evening_routine?: unknown;
  caution_notes?: unknown;
};

export type AnalysisRecord = {
  raw_model_output?: string | null;
  detected_conditions?: unknown;
  recommendations?: Rec | Rec[] | null;
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export function analysisRecordToChatMessages(analysis: AnalysisRecord): Array<{ role: "user" | "assistant"; text: string }> {
  const lines: string[] = ["🌸 **Saved skin check**", ""];

  if (analysis.raw_model_output) {
    lines.push(analysis.raw_model_output);
    lines.push("");
  }

  const conditions = Array.isArray(analysis.detected_conditions)
    ? (analysis.detected_conditions as Array<{ condition?: string; confidence?: number; severity?: string; notes?: string }>)
    : [];
  if (conditions.length) {
    lines.push("**Detected concerns:**");
    lines.push("");
    for (const c of conditions) {
      const conf = typeof c.confidence === "number" ? `${Math.round(c.confidence * 100)}%` : "?";
      lines.push(`- **${c.condition ?? "concern"}** (${conf}, ${c.severity ?? "—"}) — ${c.notes ?? ""}`);
    }
    lines.push("");
  }

  const rec = analysis.recommendations;
  const r = Array.isArray(rec) ? rec[0] : rec;
  if (r) {
    const morning = asStringArray(r.morning_routine);
    const evening = asStringArray(r.evening_routine);
    const caution = asStringArray(r.caution_notes);
    if (morning.length) {
      lines.push("**Morning**");
      lines.push(...morning.map((x) => `- ${x}`));
      lines.push("");
    }
    if (evening.length) {
      lines.push("**Evening**");
      lines.push(...evening.map((x) => `- ${x}`));
      lines.push("");
    }
    if (caution.length) {
      lines.push("> **Note:**");
      lines.push(...caution.map((x) => `> ${x}`));
    }
  }

  const assistantText = lines.join("\n").trim() || "No saved details for this analysis.";
  return [
    { role: "user", text: "Opened from history — saved analysis." },
    { role: "assistant", text: assistantText },
  ];
}

export function normalizeDetectedConditions(raw: unknown): Array<{ condition: string; confidence: number; severity: string }> {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .filter((x): x is Record<string, unknown> => x !== null && typeof x === "object")
      .map((x) => ({
        condition: String(x.condition ?? ""),
        confidence: typeof x.confidence === "number" ? x.confidence : 0,
        severity: String(x.severity ?? ""),
      }))
      .filter((x) => x.condition);
  }
  if (typeof raw === "string") {
    try {
      const p = JSON.parse(raw) as unknown;
      return normalizeDetectedConditions(p);
    } catch {
      return [];
    }
  }
  return [];
}
