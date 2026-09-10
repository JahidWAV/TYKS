import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    // Initialisation de Stripe sans apiVersion explicite pour utiliser la version par défaut du SDK
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié ou session expirée." }, { status: 401 });
    }

    const { data: member } = await supabaseServer
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: "Organisation introuvable." }, { status: 404 });
    }

    const orgId = member.organization_id;

    const { data: org } = await supabaseServer
      .from("organizations")
      .select("stripe_account_id")
      .eq("id", orgId)
      .single();

    let stripeAccountId = org?.stripe_account_id;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;

      await supabaseServer
        .from("organizations")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", orgId);
    }

    const origin = req.headers.get("origin") || "https://tyks.app";

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
