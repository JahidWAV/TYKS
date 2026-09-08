import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié ou session expirée." }, { status: 401 });
    }

    let body: { name?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    const { name } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Le nom de l'organisation est requis." },
        { status: 400 }
      );
    }

    const baseSlug = slugify(name);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const { data: org, error: orgError } = await supabaseServer
      .from("organizations")
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
      })
      .select()
      .single();

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    const { error: memberError } = await supabaseServer
      .from("organization_members")
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, organization: org }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
