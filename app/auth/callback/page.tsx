"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Supabase gère automatiquement les tokens présents dans le hash (#access_token=...) 
    // et met à jour la session dans le localStorage/cookies du navigateur.
    const handleAuth = async () => {
      const { data, error } = await supabaseBrowser.auth.getSession();
      
      if (error) {
        console.error("Erreur lors de la récupération de la session :", error.message);
      }

      // Redirige l'utilisateur vers son espace pro une fois connecté
      router.replace("/organisateur");
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0e] text-[#f1ead9]">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#f1ead9] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-[#f1ead9]/60">Finalisation de la connexion...</p>
      </div>
    </div>
  );
}
