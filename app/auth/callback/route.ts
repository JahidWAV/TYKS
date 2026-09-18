import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
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
  const selectedPlan = requestUrl.searchParams.get("plan") ?? "standard";

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

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && sessionData?.user) {
      const user = sessionData.user;

      const isProSubdomain = requestUrl.hostname.startsWith("pro.");

      if (isProSubdomain) {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          }
        );

        const { data: existingMember } = await supabaseAdmin
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingMember) {
          const emailPrefix = user.email ? user.email.split("@")[0] : "Mon Organisation";
          const orgName = `Organisation de ${emailPrefix}`;
          const baseSlug = slugify(orgName);
          const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

          const { data: org, error: orgError } = await supabaseAdmin
            .from("organizations")
            .insert({
              name: orgName,
              slug: uniqueSlug,
              plan: selectedPlan,
            })
            .select()
            .single();

          if (!orgError && org) {
            await supabaseAdmin
              .from("organization_members")
              .insert({
                organization_id: org.id,
                user_id: user.id,
                role: "owner",
              });
          }
        }

        // Si l'utilisateur a choisi le plan pro, on peut l'aiguiller vers les paramètres de facturation/paiement
        if (selectedPlan === 'pro') {
          return NextResponse.redirect(new URL("/dashboard/settings/billing", requestUrl.origin));
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin));
}
