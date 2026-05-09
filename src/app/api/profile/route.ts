import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, requireUser } from "@/lib/auth";
import { getSupabaseForUser } from "@/lib/supabase";
import { profilePatchSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const token = getAccessToken(request);
  const user = await requireUser(request);
  if (!user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabaseForUser(token);
  const { data: profile, error } = await supabase.from("profiles").select("skin_type, sensitivity, goals").eq("id", user.id).single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const meta = user.user_metadata as { full_name?: string } | undefined;

  return NextResponse.json({
    email: user.email,
    fullName: meta?.full_name ?? null,
    profile: profile ?? { skin_type: null, sensitivity: null, goals: [] },
  });
}

export async function PATCH(request: NextRequest) {
  const token = getAccessToken(request);
  const user = await requireUser(request);
  if (!user || !token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = profilePatchSchema.parse(await request.json());
  const supabase = getSupabaseForUser(token);

  const { data: current } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  const merged = {
    id: user.id,
    skin_type: body.skinType !== undefined ? body.skinType : current?.skin_type ?? "combination",
    sensitivity: body.sensitivity !== undefined ? body.sensitivity : current?.sensitivity ?? "moderate",
    goals: body.goals !== undefined ? body.goals : current?.goals ?? [],
  };

  const { error } = await supabase.from("profiles").upsert(merged);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
