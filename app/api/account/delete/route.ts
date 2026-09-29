import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// À placer dans : app/api/account/delete/route.ts
// Appelée par l'app iOS (Réglages > Supprimer mon compte) avec le header "Authorization: Bearer <token>".
// supabaseServer doit utiliser la clé service_role (nécessaire pour auth.admin.deleteUser).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Identifier l'utilisateur à partir de son token : on ne supprime jamais un compte passé en paramètre
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { data: authData, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }
    const userId = authData.user.id;

    // 2. Photo de profil (bucket "avatars", dossier = id de l'utilisateur). Une erreur ici ne bloque pas la suppression.
    try {
      const { data: files } = await supabaseServer.storage.from('avatars').list(userId);
      if (files && files.length > 0) {
        await supabaseServer.storage.from('avatars').remove(files.map((f) => `${userId}/${f.name}`));
      }
    } catch (e) {
      console.error('Suppression avatar échouée (ignorée):', e);
    }

    // 3. Données liées à l'utilisateur.
    // Si tes clés étrangères sont en ON DELETE CASCADE, ces deux suppressions sont redondantes mais sans danger.
    // Si tu dois conserver les billets vendus (comptabilité), rends tickets.user_id nullable
    // et remplace la suppression par : .update({ user_id: null }).eq('user_id', userId)
    const { error: ticketsError } = await supabaseServer.from('tickets').delete().eq('user_id', userId);
    if (ticketsError) {
      console.error('Suppression billets échouée:', ticketsError);
      return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
    }

    const { error: profileError } = await supabaseServer.from('profiles').delete().eq('id', userId);
    if (profileError) {
      console.error('Suppression profil échouée:', profileError);
      return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
    }

    // 4. Suppression de l'utilisateur d'authentification
    const { error: deleteError } = await supabaseServer.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('Suppression utilisateur échouée:', deleteError);
      return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erreur suppression de compte:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
