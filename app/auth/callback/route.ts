import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set(name, value, options);
            } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set(name, "", options);
            } catch {}
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 1. Récupérer l'utilisateur connecté fraîchement authentifié
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Vérifier s'il a déjà une organisation liée
        const { data: existingMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        // 3. Si aucune organisation n'existe, on la crée automatiquement
        if (!existingMember) {
          const emailPrefix = user.email ? user.email.split("@")[0] : "Mon Organisation";
          const orgName = `Organisation de ${emailPrefix}`;
          const baseSlug = slugify(orgName);
          const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

          // Création de l'organisation
          const { data: org, error: orgError } = await supabase
            .from("organizations")
            .insert({
              name: orgName,
              slug: uniqueSlug,
            })
            .select()
            .single();

          if (!orgError && org) {
            // Association de l'utilisateur en tant que owner
            await supabase
              .from("organization_members")
              .insert({
                organization_id: org.id,
                user_id: user.id,
                role: "owner",
              });
          }
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // En cas d'échec ou d'absence de code
  return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin));
}
