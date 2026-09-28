import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { PKPass } from 'passkit-generator';
import { supabaseServer } from '@/lib/supabase-server';

// À placer dans : app/api/tickets/[id]/pass/route.ts
// Dépendance : npm install passkit-generator
// passkit-generator a besoin de Node (pas du runtime Edge).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

// Les certificats sont stockés en base64 dans les variables d'environnement.
function envBuffer(name: string): Buffer {
  return Buffer.from(env(name), 'base64');
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authentification via le token Supabase envoyé par l'app iOS
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { data: authData, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
    }

    // 2. Le billet doit appartenir à l'utilisateur connecté
    const { data: ticket, error } = await supabaseServer
      .from('tickets')
      .select('id, code, status, events(title, location, starts_at)')
      .eq('id', id)
      .eq('user_id', authData.user.id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'Billet introuvable' }, { status: 404 });
    }
    if (ticket.status !== 'valid') {
      return NextResponse.json({ error: 'Billet non valide' }, { status: 400 });
    }

    const ev: any = Array.isArray(ticket.events) ? ticket.events[0] : ticket.events;
    const startsAt: Date | null = ev?.starts_at ? new Date(ev.starts_at) : null;

    // 3. Icônes obligatoires du pass (icon.png 29x29, icon@2x.png 58x58, icon@3x.png 87x87 ; logo.png optionnel)
    const dir = path.join(process.cwd(), 'assets', 'wallet');
    const [icon, icon2x, icon3x, logo, logo2x] = await Promise.all([
      fs.readFile(path.join(dir, 'icon.png')),
      fs.readFile(path.join(dir, 'icon@2x.png')),
      fs.readFile(path.join(dir, 'icon@3x.png')),
      fs.readFile(path.join(dir, 'logo.png')).catch(() => null),
      fs.readFile(path.join(dir, 'logo@2x.png')).catch(() => null),
    ]);

    const files: Record<string, Buffer> = {
      'icon.png': icon,
      'icon@2x.png': icon2x,
      'icon@3x.png': icon3x,
    };
    if (logo) files['logo.png'] = logo;
    if (logo2x) files['logo@2x.png'] = logo2x;

    // 4. Création et signature du pass
    const pass = new PKPass(
      files,
      {
        wwdr: envBuffer('APPLE_WWDR_CERT_BASE64'),
        signerCert: envBuffer('APPLE_PASS_CERT_BASE64'),
        signerKey: envBuffer('APPLE_PASS_KEY_BASE64'),
        signerKeyPassphrase: process.env.APPLE_PASS_KEY_PASSPHRASE,
      },
      {
        formatVersion: 1,
        passTypeIdentifier: env('APPLE_PASS_TYPE_ID'),
        teamIdentifier: env('APPLE_TEAM_ID'),
        organizationName: 'TYKS',
        description: 'Billet TYKS',
        serialNumber: ticket.id,
        backgroundColor: 'rgb(24, 24, 27)', // à adapter à la couleur de tes billets
        foregroundColor: 'rgb(255, 255, 255)',
        labelColor: 'rgb(180, 180, 185)',
        ...(startsAt ? { relevantDate: startsAt.toISOString() } : {}),
      }
    );

    pass.type = 'eventTicket';

    // Le QR contient exactement la même valeur que celle affichée dans l'app (colonne code)
    pass.setBarcodes({
      message: ticket.code,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: `Réf. ${String(ticket.code).slice(0, 8).toUpperCase()}`,
    });

    pass.primaryFields.push({
      key: 'event',
      label: 'ÉVÉNEMENT',
      value: ev?.title ?? 'Événement',
    });

    if (startsAt) {
      pass.secondaryFields.push({
        key: 'date',
        label: 'DATE',
        value: startsAt.toISOString(),
        dateStyle: 'PKDateStyleMedium',
        timeStyle: 'PKDateStyleShort',
      });
    }
    if (ev?.location) {
      pass.secondaryFields.push({ key: 'location', label: 'LIEU', value: ev.location });
    }

    pass.auxiliaryFields.push({
      key: 'ref',
      label: 'RÉFÉRENCE',
      value: String(ticket.code).slice(0, 8).toUpperCase(),
    });

    const buffer = pass.getAsBuffer();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="billet-${ticket.id}.pkpass"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Erreur génération pass Wallet:', err);
    return NextResponse.json({ error: 'Erreur génération du pass' }, { status: 500 });
  }
}
