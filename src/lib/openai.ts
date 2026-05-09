import OpenAI from "openai";
import type { ConditionConfidence } from "@/lib/types";
import { skinResponseSchema } from "@/lib/validators";

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Set it in your environment before using AI routes.");
  }
  return new OpenAI({ apiKey });
}

function parseJsonFromModelText(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence?.[1]) {
      try {
        return JSON.parse(fence[1].trim());
      } catch {
        /* fall through */
      }
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model did not return valid JSON");
  }
}

export function formatSkinAnalysisMarkdown(
  summary: string,
  conditions: ConditionConfidence[],
): string {
  const lines = [
    "🌸 **Skin check overview**",
    "",
    summary,
    "",
    "**What we’re seeing:**",
    "",
    ...conditions.map(
      (c) =>
        `- **${c.condition}** — *${Math.round(c.confidence * 100)}% confidence*, ${c.severity} severity — ${c.notes}`,
    ),
    "",
    "> **Remember:** This is guidance only, not a medical diagnosis.",
  ];
  return lines.join("\n");
}

export async function analyzeSkinImage(input: {
  imageBase64?: string;
  imageUrl?: string;
  userNotes?: string;
}) {
  const client = getOpenAiClient();
  const imageUrl = input.imageUrl ?? `data:image/jpeg;base64,${input.imageBase64}`;
  const notes = input.userNotes?.trim();
  const visionPrompt = notes
    ? `Analyze this skin photo for visible concerns. The user added this context—take it into account: ${notes}`
    : "Analyze this skin photo for visible concerns.";

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a skincare image assistant. Reply with ONLY valid JSON (no markdown fence) matching this shape:
{"conditions":[{"condition":"acne"|"dryness"|"hyperpigmentation"|"sensitivity"|"oiliness","confidence":number 0-1,"severity":"low"|"moderate"|"high","notes":"string at least 5 chars"}],"summary":"string at least 20 chars"}
Include 1-5 conditions you can justify from the image. Never claim a medical diagnosis.`,
      },
      {
        role: "user",
        content: [
          { type: "text", text: visionPrompt },
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "auto" },
          },
        ],
      },
    ],
    max_tokens: 800,
  });

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText) throw new Error("Empty model response for skin analysis");

  const parsed = parseJsonFromModelText(rawText);
  return skinResponseSchema.parse(parsed) as {
    conditions: ConditionConfidence[];
    summary: string;
  };
}

export async function getSkincareChatReply(
  message: string,
  context: string,
  profileHint: string,
) {
  const client = getOpenAiClient();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are PetalSense AI, a warm skincare guide. ${profileHint}

Always answer in **GitHub-flavored Markdown**:
- Start the first line with a single 🌸 when giving a friendly tip or overview.
- Use **bold** for important takeaway words (product types, key ingredients, warnings).
- Use *italics* for gentle emphasis or softer notes (renders in a rose tone).
- Use bullet lists (-) for steps or options; use numbered lists for routines in order.
- Use > blockquotes for safety / “patch test” / “see a dermatologist” notes.
- Keep paragraphs short and readable.

Context from the user’s latest analysis or chat (may be empty): ${context}`,
      },
      {
        role: "user",
        content: message,
      },
    ],
    max_tokens: 1200,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("Empty chat response");
  return text.trim();
}
