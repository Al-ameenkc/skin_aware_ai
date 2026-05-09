import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, requireUser } from "@/lib/auth";
import { conversationTitleFromMessage } from "@/lib/conversation-title";
import { getSkincareChatReply } from "@/lib/openai";
import { getSupabaseForUser } from "@/lib/supabase";
import { chatSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    const user = await requireUser(request);
    if (!user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = chatSchema.parse(await request.json());
    const supabase = getSupabaseForUser(token);

    let conversationId = payload.conversationId ?? null;

    if (conversationId) {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existing) {
        return NextResponse.json({ error: "Invalid conversation" }, { status: 403 });
      }
    } else {
      const title = conversationTitleFromMessage(payload.message);
      const { data: inserted, error: convInsertErr } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title })
        .select("id")
        .single();

      if (convInsertErr || !inserted) {
        return NextResponse.json({ error: convInsertErr?.message ?? "Could not start conversation" }, { status: 500 });
      }
      conversationId = inserted.id;
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select("skin_type, sensitivity, goals")
      .eq("id", user.id)
      .maybeSingle();

    const profileHint =
      profileRow &&
      (profileRow.skin_type || profileRow.sensitivity || (profileRow.goals && profileRow.goals.length))
        ? `User profile: skin type ${profileRow.skin_type ?? "unspecified"}, sensitivity ${profileRow.sensitivity ?? "unspecified"}, goals: ${(profileRow.goals ?? []).join(", ") || "none"}. Tailor advice to this.`
        : "No saved skin profile yet; give general guidance and suggest they set skin type in their profile.";

    let context = "No prior analysis context available.";
    if (payload.analysisId) {
      const { data } = await supabase
        .from("analyses")
        .select("detected_conditions, raw_model_output")
        .eq("id", payload.analysisId)
        .eq("user_id", user.id)
        .single();

      if (data) {
        context = JSON.stringify(data);
      }
    } else {
      const { data: latest } = await supabase
        .from("analyses")
        .select("detected_conditions, raw_model_output")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest) context = JSON.stringify(latest);
    }

    const reply = await getSkincareChatReply(payload.message, context, profileHint);

    const { error: insertErr } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      conversation_id: conversationId,
      message: payload.message,
      response: reply,
      analysis_id: payload.analysisId ?? null,
    });

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return NextResponse.json({
      reply,
      conversationId,
      suggested_next_steps: [
        "Maintain consistency for 6 to 8 weeks before changing core products.",
        "Patch-test active ingredients before full-face use.",
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
