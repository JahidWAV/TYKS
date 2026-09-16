import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Nom de fichier unique
    const filename = `events/${Date.now()}-${file.name}`;

    // Upload vers Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({ url: blob.url }, { status: 200 });
  } catch (err: any) {
    console.error("Erreur upload blob:", err);
    return NextResponse.json({ error: err.message || "Erreur lors de l'upload" }, { status: 500 });
  }
}
