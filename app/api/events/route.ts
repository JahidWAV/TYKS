import { NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase-browser'; // ou ton client serveur Supabase

export async function GET() {
  try {
    const { data: events, error } = await supabaseBrowser
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
    const body = await request.json();

    const { data, error } = await supabaseBrowser
      .from('events')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur lors de la création' }, { status: 500 });
  }
}
