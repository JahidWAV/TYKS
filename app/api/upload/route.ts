import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.FormData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string; // On récupère le slug envoyé par le front

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Si on a un slug, on l'utilise pour nommer l'image proprement
    const filename = slug 
      ? `events/${slug}-${Date.now()}.jpg` 
      : `events/${Date.now()}-${file.name}`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
