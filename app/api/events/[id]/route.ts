import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getPrivyUserId } from "@/lib/privy-server";
import { getMembership, canEdit, canDelete } from "@/lib/organizer";

// PUT : Modifier un événement
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const privyUserId = await getPrivyUserId(req);
    if (!privyUserId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const membership = await getMembership(privyUserId);
    if (!membership || !canEdit(membership.role)) {
      return NextResponse.json({ error: "Droits insuffisants." }, { status: 403 });
    }

    const body = await req.json();
    const { data: event, error } = await supabaseServer
      .from("events")
      .update(body)
      .eq("id", params.id)
      .eq("organization_id", membership.organizationId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ event });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erreur serveur." }, { status: 500 });
  }
}

// DELETE : Supprimer un événement
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const privyUserId = await getPrivyUserId(req);
    if (!privyUserId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const membership = await getMembership(privyUserId);
    if (!membership || !canDelete(membership.role)) {
      return NextResponse.json({ error: "Seul le propriétaire peut supprimer un événement." }, { status: 403 });
    }

    const { error } = await supabaseServer
      .from("events")
      .delete()
      .eq("id", params.id)
      .eq("organization_id", membership.organizationId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erreur serveur." }, { status: 500 });
  }
}
