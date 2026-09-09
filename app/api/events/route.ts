import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    const { data: events, error } = await supabaseServer
      .from('events')
      .select('*')
      .order('starts_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ events }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé (token manquant)" }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // 1. Valider le token et récupérer l'utilisateur via le client admin
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    // 2. Récupérer l'organisation de l'utilisateur en toute sécurité
    const { data: membership, error: memberError } = await supabaseServer
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError || !membership) {
      return NextResponse.json({ error: "Aucune organisation associée à cet utilisateur." }, { status: 400 });
    }

    const body = await request.json();

    // 3. Insérer l'événement proprement avec supabaseServer (qui contourne les blocages RLS superflus tout en garantissant l'intégrité)
    const { data, error } = await supabaseServer
      .from('events')
      .insert([
        {
          ...body,
          organization_id: membership.organization_id,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erreur insertion event Supabase:", error);
      throw error;
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (err: any) {
    console.error("Erreur route POST /api/events:", err);
    return NextResponse.json({ error: err.message || 'Erreur lors de la création' }, { status: 500 });
  }
}
