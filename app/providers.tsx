"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        // Seuls Google et Email sont proposés : aucune mention de wallet
        // ou de "crypto" n'est jamais montrée à l'utilisateur.
        loginMethods: ["google", "email"],
        appearance: {
          theme: "dark",
          accentColor: "#6366f1",
        },
        embeddedWallets: {
          // Configuration spécifique Solana : cette clé indique à Privy de
          // provisionner uniquement un wallet Solana (pas de wallet Ethereum)
          // pour tout utilisateur qui n'en possède pas encore, dès sa
          // première connexion — le tout en arrière-plan, sans jamais
          // exposer de UI de wallet à l'écran.
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
