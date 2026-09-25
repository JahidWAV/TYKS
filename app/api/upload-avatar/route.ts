import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string; // On récupère l'ID utilisateur ou son @username

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Nommage de l'image dans le dossier "pp/" de ton Blob
    const filename = userId 
      ? `pp/${userId}-${Date.now()}.jpg` 
      : `pp/${Date.now()}-${file.name}`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
