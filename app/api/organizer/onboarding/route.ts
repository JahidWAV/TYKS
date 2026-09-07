import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getPrivyUserId } from "@/lib/privy-server";

// Fonction utilitaire pour générer un slug propre à partir du nom
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Supprime les accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/[^\w\-]+/g, "") // Supprime les caractères spéciaux
    .replace(/\-\-+/g, "-"); // Évite les tirets multiples
}

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

    // Génération du slug + ajout d'un suffixe aléatoire léger pour éviter les doublons
    const baseSlug = slugify(name);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. Création de l'organisation avec le nom ET le slug
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

    // 2. Lier l'utilisateur connecté comme "owner"
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
