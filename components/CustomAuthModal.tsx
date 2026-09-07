"use client";

import { useState } from "react";
import { useLoginWithOAuth, useLoginWithEmail } from "@privy-io/react-auth";

interface CustomAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomAuthModal({ isOpen, onClose }: CustomAuthModalProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email-input" | "code-input">("email-input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hook Google OAuth
  const { initOAuth } = useLoginWithOAuth({
    onComplete: () => onClose(),
  });

  // Hook Email Login
  const { sendCode, loginWithCode } = useLoginWithEmail();

  if (!isOpen) return null;

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    try {
      await sendCode({ email });
      setStep("code-input");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'envoi du code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setError(null);
    try {
      // Correction ici : transmission unique du code
      await loginWithCode({ code });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Code invalide ou expiré");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl glass-panel p-6 border border-[#f1ead9]/10 shadow-2xl bg-[#131217]">
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#f1ead9]/40 hover:text-[#f1ead9] transition-colors"
        >
          ✕
        </button>

        {/* Branding iorti */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-[#f1ead9] uppercase">iorti</h2>
          <p className="text-sm text-[#f1ead9]/60 mt-1">Connectez-vous pour accéder à votre pass</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        {/* Connexion Google */}
        <button
          onClick={() => initOAuth({ provider: "google" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#0b0b0e] border border-[#f1ead9]/15 text-[#f1ead9] font-medium hover:bg-[#1c1b22] transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continuer avec Google
        </button>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#f1ead9]/10"></div>
          </div>
          <span className="relative px-3 text-xs uppercase tracking-wider bg-[#131217] text-[#f1ead9]/40">
            ou par e-mail
          </span>
        </div>

        {/* Connexion Email */}
        {step === "email-input" ? (
          <form onSubmit={handleSendEmail} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 rounded-xl bg-[#0b0b0e] border border-[#f1ead9]/15 text-[#f1ead9] placeholder-[#f1ead9]/30 focus:outline-none focus:border-[#7a81ff]"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#f1ead9] text-[#0b0b0e] font-semibold hover:bg-white transition-all disabled:opacity-50"
            >
              {loading ? "Envoi du code..." : "Recevoir un code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code reçu par mail"
              className="w-full px-4 py-3 rounded-xl bg-[#0b0b0e] border border-[#f1ead9]/15 text-[#f1ead9] text-center tracking-widest placeholder-[#f1ead9]/30 focus:outline-none focus:border-[#7a81ff]"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#f1ead9] text-[#0b0b0e] font-semibold hover:bg-white transition-all disabled:opacity-50"
            >
              {loading ? "Vérification..." : "Valider le code"}
            </button>
          </form>
        )}

        {/* CGU */}
        <p className="text-center text-xs text-[#f1ead9]/40 mt-6">
          En continuant, vous acceptez nos{" "}
          <a href="/cgu" className="underline hover:text-[#f1ead9]">
            CGU
          </a>{" "}
          et notre{" "}
          <a href="/politique-de-confidentialite" className="underline hover:text-[#f1ead9]">
            Politique de confidentialité
          </a>
          .
        </p>
      </div>
    </div>
  );
}
