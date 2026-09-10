import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-28.acacia" as any,
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié ou session expirée." }, { status: 401 });
    }

    // 1. Récupérer l'organisation liée à l'utilisateur
    const { data: member } = await supabaseServer
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Organisation introuvable." }, { status: 404 });
    }

    const orgId = member.organization_id;

    // 2. Vérifier si l'organisation a déjà un compte Stripe Connect
    const { data: org } = await supabaseServer
      .from("organizations")
      .select("stripe_account_id")
      .eq("id", orgId)
      .single();

    let stripeAccountId = org?.stripe_account_id;

    // 3. Si non, on crée un compte Stripe Express
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;

      // Sauvegarde de l'ID Stripe dans Supabase
      await supabaseServer
        .from("organizations")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", orgId);
    }

    const origin = req.headers.get("origin") || "https://tyks.app";

    // 4. Générer le lien d'onboarding Stripe
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/dashboard/banking?refresh=true`,
      return_url: `${origin}/dashboard/banking?success=true`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
