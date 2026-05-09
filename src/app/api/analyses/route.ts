import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, requireUser } from "@/lib/auth";
import { getSupabaseForUser } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const token = getAccessToken(request);
  const user = await requireUser(request);
  if (!user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseForUser(token);
  const { data, error } = await supabase
    .from("analyses")
    .select("id, created_at, detected_conditions, raw_model_output, recommendations(morning_routine, evening_routine, caution_notes)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ analyses: data ?? [] });
}
