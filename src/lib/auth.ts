import { NextRequest } from "next/server";
import { getUserFromToken } from "@/lib/supabase";

export function getAccessToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length);
}

export async function requireUser(request: NextRequest) {
  const token = getAccessToken(request);
  if (!token) return null;
  return getUserFromToken(token);
}
