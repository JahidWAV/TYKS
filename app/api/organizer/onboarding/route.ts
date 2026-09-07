import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getPrivyUserId } from "@/lib/privy-server";

// POST /api/organizer/onboarding
export async function POST(req: NextRequest) {
  try {
    const privyUserId = await getPrivyUserId(req);
    if (!privyUserId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
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

    // 1. Créer la nouvelle organisation dans la base Supabase
    const { data: org, error: orgError } = await supabaseServer
      .from("organizations")
      .insert({ name: name.trim() })
      .select()
      .single();

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // 2. Lier l'utilisateur connecté comme "owner" dans organization_members
    const { error: memberError } = await supabaseServer
      .from("organization_members")
      .insert({
        organization_id: org.id,
        privy_user_id: privyUserId,
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
