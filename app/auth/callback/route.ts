import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    // supabaseServer est un client direct, pas une fonction
    await supabaseServer.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}`);
}
