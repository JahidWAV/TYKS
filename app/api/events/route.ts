import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: events, error } = await supabase
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
    // 1. Récupérer le token d'authentification envoyé par le front-end
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: "Non autorisé (token manquant)" }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // 2. Instancier un client Supabase lié au contexte de l'utilisateur
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // 3. Vérifier et récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    const body = await request.json();

    // 4. Insérer l'événement en associant explicitement created_by à l'UID de l'utilisateur
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          ...body,
          created_by: user.id, // C'est cette ligne qui satisfait la règle RLS
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la création' }, { status: 500 });
  }
}
