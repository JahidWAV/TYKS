import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, eventTitle, quantity, totalPrice } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "E-mail manquant" }, { status: 400 });
    }

    await resend.emails.send({
      from: 'TYKS <support@tyks.app>',
      to: [email],
      replyTo: 'support@tyks.app',
      subject: `Vos billets pour ${eventTitle}`,
      html: `
        <div style="font-family: monospace; background: #111110; color: #F7F5F0; padding: 32px; border-radius: 16px;">
          <h2 style="color: #F7F5F0; font-size: 20px; margin-bottom: 16px;">Réservation confirmée !</h2>
          <p style="color: #F7F5F0; opacity: 0.8; font-size: 14px;">Merci pour votre achat sur TYKS. Pour toute question, vous pouvez directement répondre à cet e-mail.</p>
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 4px 0;"><strong>Événement :</strong> ${eventTitle}</p>
            <p style="margin: 4px 0;"><strong>Quantité :</strong> ${quantity} place(s)</p>
            <p style="margin: 4px 0;"><strong>Total payé :</strong> ${totalPrice} €</p>
          </div>
          <p style="color: #F7F5F0; opacity: 0.5; font-size: 12px;">Présentez cet e-mail à l'entrée.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur d'envoi d'email:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'e-mail" }, { status: 500 });
  }
}
