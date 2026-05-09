import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, requireUser } from "@/lib/auth";
import { getSupabaseForUser } from "@/lib/supabase";

function imageSrcFromAnalysis(url: string | null | undefined): string | undefined {
  if (!url || url === "uploaded-via-base64") return undefined;
  if (url.startsWith("data:") || url.startsWith("http://") || url.startsWith("https://")) return url;
  return undefined;
}

export async function GET(request: NextRequest) {
  const token = getAccessToken(request);
  const user = await requireUser(request);
  if (!user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId query parameter is required" }, { status: 400 });
  }

  const supabase = getSupabaseForUser(token);

  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (convErr || !conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("chat_messages")
    .select(
      `
      message,
      response,
      created_at,
      analysis_id,
      analyses (
        image_url
      )
    `,
    )
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type AnalysisEmbed = { image_url: string | null };
  type Row = {
    message: string;
    response: string;
    analysis_id: string | null;
    analyses: AnalysisEmbed | AnalysisEmbed[] | null;
  };

  type Msg = { role: "user" | "assistant"; text: string; imageSrc?: string };
  const messages: Msg[] = [];
  for (const row of (data ?? []) as unknown as Row[]) {
    const embed = row.analyses;
    const imgUrl = Array.isArray(embed) ? embed[0]?.image_url : embed?.image_url;
    const imageSrc = row.analysis_id ? imageSrcFromAnalysis(imgUrl) : undefined;
    messages.push({ role: "user", text: row.message, ...(imageSrc ? { imageSrc } : {}) });
    messages.push({ role: "assistant", text: row.response });
  }

  return NextResponse.json({ messages, conversationId });
}
