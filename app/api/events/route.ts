import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getPrivyUserId } from "@/lib/privy-server";
import { getMembership } from "@/lib/organizer";

export async function GET(req: NextRequest) {
  try {
    const privyUserId = await getPrivyUserId(req);
    if (!privyUserId) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const membership = await getMembership(privyUserId);
    if (!membership) {
      return NextResponse.json({ error: "Aucun espace organisateur." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const mineOnly = searchParams.get("mine") === "1";

    let query = supabaseServer.from("events").select("*");

    if (mineOnly) {
      query = query.eq("organization_id", membership.organizationId);
    }

    const { data: events, error } = await query.order("starts_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      role: membership.role,
      organizationName: membership.organizationName,
      events: events ?? [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erreur serveur." },
      { status: 500 }
    );
  }
}
