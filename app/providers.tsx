"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        loginMethods: ["email", "google"],
        appearance: {
          theme: "dark",
          accentColor: "#FFFFFF",
          walletChainType: "solana-only",
          showWalletLoginFirst: false,
          // Insère l'URL de ton logo iorti pour remplacer le titre générique si souhaité
          // logo: "https://votre-domaine.com/logo.png",
        },
        legal: {
          termsAndConditionsUrl: "/cgu",
          privacyPolicyUrl: "/politique-de-confidentialite",
        },
        embeddedWallets: {
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
