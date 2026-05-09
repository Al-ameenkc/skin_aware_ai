import { NextRequest, NextResponse } from "next/server";
import { analyzeSkinImage, formatSkinAnalysisMarkdown } from "@/lib/openai";
import { buildRecommendations } from "@/lib/recommendation-engine";
import { getAccessToken, requireUser } from "@/lib/auth";
import { conversationTitleFromMessage } from "@/lib/conversation-title";
import { getSupabaseForUser } from "@/lib/supabase";
import { analyzeSchema } from "@/lib/validators";

function persistedAnalysisImageUrl(payload: {
  imageBase64?: string;
  imageUrl?: string;
}): string {
  if (payload.imageUrl) return payload.imageUrl;
  if (payload.imageBase64) return `data:image/jpeg;base64,${payload.imageBase64}`;
  return "uploaded-via-base64";
}

export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    const user = await requireUser(request);
    if (!user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const payload = analyzeSchema.parse(body);
    const result = await analyzeSkinImage({
      imageBase64: payload.imageBase64,
      imageUrl: payload.imageUrl,
      userNotes: payload.userNotes,
    });
    const recommendations = buildRecommendations(result.conditions, payload.profileContext);
    const supabase = getSupabaseForUser(token);

    const imageUrlForRow = persistedAnalysisImageUrl(payload);

    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        user_id: user.id,
        image_url: imageUrlForRow,
        detected_conditions: result.conditions,
        confidence: result.conditions.reduce<Record<string, number>>((acc, item) => {
          acc[item.condition] = item.confidence;
          return acc;
        }, {}),
        raw_model_output: result.summary,
      })
      .select("id")
      .single();

    if (analysisError) {
      return NextResponse.json({ error: analysisError.message }, { status: 500 });
    }

    const { error: recommendationError } = await supabase.from("recommendations").insert({
      analysis_id: analysis.id,
      morning_routine: recommendations.morning,
      evening_routine: recommendations.evening,
      caution_notes: recommendations.caution,
    });

    if (recommendationError) {
      return NextResponse.json({ error: recommendationError.message }, { status: 500 });
    }

    const assistantMarkdown = formatSkinAnalysisMarkdown(result.summary, result.conditions);

    const userLine = payload.userNotes?.trim() || "Skin photo for analysis.";

    let conversationId = payload.conversationId ?? null;

    if (conversationId) {
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existingConv) {
        return NextResponse.json({ error: "Invalid conversation" }, { status: 403 });
      }
    } else {
      const title = conversationTitleFromMessage(userLine);
      const { data: insertedConv, error: convInsertErr } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();

      if (convInsertErr || !insertedConv) {
        return NextResponse.json({ error: convInsertErr?.message ?? "Could not start conversation" }, { status: 500 });
      }
      conversationId = insertedConv.id;
    }

    const { error: msgErr } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      conversation_id: conversationId,
      analysis_id: analysis.id,
      message: userLine,
      response: assistantMarkdown,
    });

    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 });
    }

    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return NextResponse.json({
      analysisId: analysis.id,
      conversationId,
      conditions: result.conditions,
      confidence: result.conditions.reduce<Record<string, number>>((acc, item) => {
        acc[item.condition] = item.confidence;
        return acc;
      }, {}),
      recommendations,
      assistantMarkdown,
      disclaimer:
        "This is an AI-supported skincare guide and not a medical diagnosis. Please consult a dermatologist for persistent concerns.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
