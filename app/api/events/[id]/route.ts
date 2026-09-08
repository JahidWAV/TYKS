import { NextResponse } from 'next/server';
import { supabaseBrowser } from '@/lib/supabase-browser';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();

    const { data, error } = await supabaseBrowser
      .from('events')
      .update(body)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ event: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const { error } = await supabaseBrowser
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
