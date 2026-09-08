import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Fonction utilitaire pour générer un slug propre à partir du nom
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD") // Supprime les accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-") // Remplace les espaces par des tirets
    .replace(/[^\w\-]+/g, "") // Supprime les caractères spéciaux
    .replace(/\-\-+/g, "-"); // Évite les tirets multiples
}

export async function POST(req: NextRequest) {
  try {
    // Récupération de l'utilisateur via Supabase Auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié ou session expirée." }, { status: 401 });
    }

    let body: { name?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
    }

    const { name } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Le nom de l'organisation est requis." },
        { status: 400 }
      );
    }

    // Génération du slug + ajout d'un suffixe aléatoire léger pour éviter les doublons
    const baseSlug = slugify(name);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. Création de l'organisation avec le nom ET le slug
    const { data: org, error: orgError } = await supabaseServer
      .from("organizations")
      .insert({
        name: name.trim(),
        slug: uniqueSlug,
      })
      .select()
      .single();

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    // 2. Lier l'utilisateur connecté comme "owner" (on utilise l'UUID Supabase user.id)
    const { error: memberError } = await supabaseServer
      .from("organization_members")
      .insert({
        organization_id: org.id,
        user_id: user.id, // Adaptation pour Supabase (remplace privy_user_id si tu as renommé la colonne)
        role: "owner",
      });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, organization: org }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
```[cite: 9]

---

### 2. Correction de `app/api/organizer/team/route.ts`
*(Anciennement `route-2.ts`)*. Suppression complète des dépendances Privy pour utiliser la session Supabase et vérifier les rôles dans la table `organization_members`.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

// Fonction utilitaire pour récupérer le membre et son organisation via Supabase
async function getMembershipByToken(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
  if (userError || !user) return null;

  const { data: member, error } = await supabaseServer
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .single();

  if (error || !member) return null;
  return { userId: user.id, organizationId: member.organization_id, role: member.role };
}

// GET /api/organizer/team — liste des membres de l'organisation de l'appelant.
export async function GET(req: NextRequest) {
  const membership = await getMembershipByToken(req);
  if (!membership) {
    return NextResponse.json({ error: "Non authentifié ou aucun espace organisateur." }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from("organization_members")
    .select("id, user_id, role, invited_email, created_at")
    .eq("organization_id", membership.organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ members: data });
}

// POST /api/organizer/team  { userId: string, role: "editor" | "viewer" }
export async function POST(req: NextRequest) {
  const membership = await getMembershipByToken(req);
  if (!membership) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  if (membership.role !== "owner") {
    return NextResponse.json(
      { error: "Seul le owner peut inviter des membres." },
      { status: 403 }
    );
  }

  let body: { userId?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!body.userId?.trim() || !["editor", "viewer"].includes(body.role ?? "")) {
    return NextResponse.json(
      { error: "userId et role ('editor' ou 'viewer') sont requis." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer
    .from("organization_members")
    .insert({
      organization_id: membership.organizationId,
      user_id: body.userId.trim(),
      role: body.role,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ member: data }, { status: 201 });
}
