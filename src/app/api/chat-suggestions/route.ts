import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { pickThreeRandomFromPool } from "@/lib/chat-suggestion-prompts";

const responseSchema = z.object({
  questions: z.array(z.string().min(8).max(120)).length(3),
});

export async function GET() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ questions: pickThreeRandomFromPool() });
  }

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You help PetalSense AI. Reply with ONLY valid JSON: {"questions":["...","...","..."]}.
Exactly 3 strings. Each is a short natural question (under 14 words) about skincare someone might ask a chat assistant.
Topics should vary: routines, SPF, acne, dryness, sensitivity, ingredients, habits. No numbering or quotes inside strings.`,
        },
        {
          role: "user",
          content:
            "Generate 3 fresh, distinct questions. Make them feel conversational. Randomize themes so repeat calls differ.",
        },
      ],
      max_tokens: 220,
      temperature: 1.15,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ questions: pickThreeRandomFromPool() });
    }

    const parsed = JSON.parse(raw) as unknown;
    const validated = responseSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json({ questions: pickThreeRandomFromPool() });
    }

    return NextResponse.json({ questions: validated.data.questions });
  } catch {
    return NextResponse.json({ questions: pickThreeRandomFromPool() });
  }
}
