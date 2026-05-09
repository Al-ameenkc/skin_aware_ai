import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, requireUser } from "@/lib/auth";
import { getSupabaseForUser } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = getAccessToken(request);
  const user = await requireUser(request);
  if (!user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseForUser(token);
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, message, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data ?? [] });
}
