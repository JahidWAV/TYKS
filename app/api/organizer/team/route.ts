import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Fonction utilitaire pour récupérer le membre et son organisation via Supabase
async function getMembershipByToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
  if (userError || !user) return null;

  const { data: member, error } = await supabaseServer
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !member) return null;
  return { userId: user.id, organizationId: member.organization_id, role: member.role };
}

// GET /api/organizer/team — liste des membres de l'organisation de l'appelant.
export async function GET(req: NextRequest) {
  const membership = await getMembershipByToken(req);
  if (!membership) {
    return NextResponse.json({ error: "Non authentifié ou aucun espace organisateur." }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from("organization_members")
    .select("id, user_id, role, invited_email, created_at")
    .eq("organization_id", membership.organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ members: data });
}

// POST /api/organizer/team  { userId: string, role: "editor" | "viewer" }
export async function POST(req: NextRequest) {
  const membership = await getMembershipByToken(req);
  if (!membership) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (membership.role !== "owner") {
    return NextResponse.json(
      { error: "Seul le owner peut inviter des membres." },
      { status: 403 }
    );
  }

  let body: { userId?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body.userId?.trim() || !["editor", "viewer"].includes(body.role ?? "")) {
    return NextResponse.json(
      { error: "userId et role ('editor' ou 'viewer') sont requis." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("organization_members")
    .insert({
      organization_id: membership.organizationId,
      user_id: body.userId.trim(),
      role: body.role,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ member: data }, { status: 201 });
}
