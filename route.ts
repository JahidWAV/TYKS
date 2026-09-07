import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getPrivyUserId } from "@/lib/privy-server";
import { getMembership } from "@/lib/organizer";

// GET /api/organizer/team — liste des membres de l'organisation de l'appelant.
export async function GET(req: NextRequest) {
  const privyUserId = await getPrivyUserId(req);
  if (!privyUserId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const membership = await getMembership(privyUserId);
  if (!membership) {
    return NextResponse.json({ error: "Aucun espace organisateur." }, { status: 403 });
  }

  const { data, error } = await supabaseServer
    .from("organization_members")
    .select("id, privy_user_id, role, invited_email, created_at")
    .eq("organization_id", membership.organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ members: data });
}

// POST /api/organizer/team  { privyUserId: string, role: "editor" | "viewer" }
// Réservé au owner. Note : contrairement à Shotgun, l'invitation se fait ici
// directement par DID Privy (pas encore par e-mail avec lien d'acceptation —
// voir la limitation notée dans README-SETUP.md).
export async function POST(req: NextRequest) {
  const privyUserId = await getPrivyUserId(req);
  if (!privyUserId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const membership = await getMembership(privyUserId);
  if (!membership || membership.role !== "owner") {
    return NextResponse.json(
      { error: "Seul le owner peut inviter des membres." },
      { status: 403 }
    );
  }

  let body: { privyUserId?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body.privyUserId?.trim() || !["editor", "viewer"].includes(body.role ?? "")) {
    return NextResponse.json(
      { error: "privyUserId et role ('editor' ou 'viewer') sont requis." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("organization_members")
    .insert({
      organization_id: membership.organizationId,
      privy_user_id: body.privyUserId.trim(),
      role: body.role,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ member: data }, { status: 201 });
}
