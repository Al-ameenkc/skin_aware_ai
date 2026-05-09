import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, requireUser } from "@/lib/auth";
import { getSupabaseForUser } from "@/lib/supabase";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const token = getAccessToken(request);
  const user = await requireUser(request);
  if (!user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = getSupabaseForUser(token);
  const { data, error } = await supabase
    .from("analyses")
    .select("*, recommendations(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ analysis: data });
}
