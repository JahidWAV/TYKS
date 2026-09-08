import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { getPrivyUserId } from "@/lib/privy-server";
import { getMembership, canEdit } from "@/lib/organizer";

// GET : Récupérer les événements
export async function GET(req: NextRequest) {
  try {
    const privyUserId = await getPrivyUserId(req);
    if (!privyUserId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const membership = await getMembership(privyUserId);
    if (!membership) return NextResponse.json({ error: "Aucun espace organisateur." }, { status: 403 });

    const { data: events, error } = await supabaseServer
      .from("events")
      .select("*")
      .eq("organization_id", membership.organizationId)
      .order("starts_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      role: membership.role,
      organizationName: membership.organizationName,
      events: events ?? [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erreur serveur." }, { status: 500 });
  }
}

// POST : Créer un nouvel événement
export async function POST(req: NextRequest) {
  try {
    const privyUserId = await getPrivyUserId(req);
    if (!privyUserId) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const membership = await getMembership(privyUserId);
    if (!membership || !canEdit(membership.role)) {
      return NextResponse.json({ error: "Droits insuffisants pour créer un événement." }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, location, starts_at, ends_at, price, capacity, image_url } = body;

    if (!title || !starts_at || !location) {
      return NextResponse.json({ error: "Titre, lieu et date de début sont requis." }, { status: 400 });
    }

    const parsedPrice = price ? parseFloat(price) : 0;

    const { data: event, error } = await supabaseServer
      .from("events")
      .insert({
        organization_id: membership.organizationId,
        title,
        description: description || null,
        location,
        starts_at,
        ends_at: ends_at || null,
        price: parsedPrice,
        price_cents: Math.round(parsedPrice * 100),
        capacity: capacity ? parseInt(capacity, 10) : null,
        image_url: image_url || null,
        created_by: privyUserId, // <-- Injections de l'ID pour corriger l'erreur NOT NULL
        status: "draft",
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erreur serveur." }, { status: 500 });
  }
}
