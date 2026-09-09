import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

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

    // 2. Récupérer l'organisation de l'utilisateur
    let { data: membership, error: memberError } = await supabaseServer
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .maybeSingle();

    let organizationId = membership?.organization_id;

    // 3. S'il n'en a pas encore, on lui crée une orga par défaut automatiquement
    if (!organizationId) {
      const orgName = user.email ? `Organisation de ${user.email.split('@')[0]}` : "Mon Organisation";
      const uniqueOrgSlug = `${slugify(orgName)}-${Math.random().toString(36).substring(2, 6)}`;

      const { data: newOrg, error: orgError } = await supabaseServer
        .from('organizations')
        .insert({ name: orgName, slug: uniqueOrgSlug })
        .select()
        .single();

      if (orgError || !newOrg) {
        return NextResponse.json({ error: "Impossible de créer l'organisation par défaut." }, { status: 500 });
      }

      organizationId = newOrg.id;

      await supabaseServer.from('organization_members').insert({
        organization_id: organizationId,
        user_id: user.id,
        role: 'owner',
      });
    }

    const body = await request.json();

    // 4. Générer un slug unique pour l'événement basé sur son titre
    const eventTitle = body.title || 'evenement';
    const baseSlug = slugify(eventTitle);
    const uniqueEventSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // 5. Insérer l'événement proprement avec son slug
    const { data, error } = await supabaseServer
      .from('events')
      .insert([
        {
          ...body,
          slug: uniqueEventSlug,
          organization_id: organizationId,
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
