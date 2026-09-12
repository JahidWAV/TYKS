"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { X, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

interface CustomAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function CustomAuthModal({ isOpen, onClose }: CustomAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState<'email' | 'signin' | 'signup'>('email');

  if (!isOpen) return null;

  const handleLoginWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion Google");
      setLoading(false);
    }
  };

  const handleLoginWithApple = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabaseBrowser.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion Apple");
      setLoading(false);
    }
  };

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Veuillez entrer une adresse e-mail valide.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpCheckError } = await supabaseBrowser.auth.signUp({
        email,
        password: "TempPassword123!",
      });

      const userExists = 
        (signUpCheckError && signUpCheckError.message.includes("already registered")) ||
        (data?.user && data.user.identities && data.user.identities.length === 0);

      if (userExists) {
        setStep('signin');
      } else {
        setStep('signup');
      }
    } catch (err: any) {
      setStep('signin');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (step === 'signin') {
        const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onClose();
      } else if (step === 'signup') {
        if (password !== confirmPassword) {
          setError("Les mots de passe ne correspondent pas.");
          setLoading(false);
          return;
        }

        const { error: signUpError } = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });

        if (signUpError) throw signUpError;

        alert("Compte créé avec succès ! Vérifiez vos e-mails pour valider votre inscription.");
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'authentification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#14171f] border border-neutral-800 p-8 shadow-2xl text-white font-sans rounded-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 border border-neutral-800 bg-[#101319] text-neutral-400 flex items-center justify-center hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer rounded-xl"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6 space-y-2">
          <div className="inline-block h-8 w-8 border border-neutral-800 bg-[#E5D4B4] text-black font-mono font-bold text-xs flex items-center justify-center mx-auto mb-2 rounded-lg">T</div>
          <h2 className="font-mono text-lg font-bold uppercase tracking-widest text-white">TYKS Live</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-400">
            {step === 'email' && "Entrez votre e-mail pour continuer"}
            {step === 'signin' && "Bon retour ! Entrez votre mot de passe"}
            {step === 'signup' && "Première visite ? Créez votre mot de passe"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-red-900 bg-red-950/50 text-red-400 text-xs font-mono uppercase tracking-wider text-center rounded-xl">
            {error}
          </div>
        )}

        {/* Boutons Sociaux affichés uniquement à la racine */}
        {step === 'email' && (
          <>
            <div className="space-y-3 mb-6">
              <button
                onClick={handleLoginWithGoogle}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 px-4 border border-neutral-800 bg-[#101319] hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer rounded-xl shadow-lg"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continuer avec Google
              </button>

              <button
                onClick={handleLoginWithApple}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 px-4 border border-neutral-800 bg-[#101319] hover:bg-neutral-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer rounded-xl shadow-lg"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.01c.65-.79 1.09-1.89.97-2.99-.96.04-2.13.64-2.82 1.43-.6.68-1.13 1.78-.99 2.85 1.08.08 2.19-.53 2.84-1.29z"/>
                </svg>
                Continuer avec Apple
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>
              <span className="relative px-3 font-mono text-[10px] uppercase tracking-widest bg-[#14171f] text-neutral-400 font-bold">
                ou par e-mail
              </span>
            </div>
          </>
        )}

        {/* Formulaire étape e-mail */}
        {step === 'email' ? (
          <form onSubmit={handleCheckEmail} className="space-y-4">
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 border border-neutral-800 bg-[#101319] font-mono text-xs uppercase placeholder:text-neutral-500 focus:outline-none focus:border-[#E5D4B4] text-white rounded-xl"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 px-4 border border-neutral-800 bg-[#E5D4B4] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer rounded-xl shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Continuer avec l&apos;e-mail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitAuth} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="flex items-center justify-between px-4 py-3 border border-neutral-800 bg-[#101319] font-mono text-xs rounded-xl text-white">
              <span className="font-bold truncate max-w-[220px]">{email}</span>
              <button
                type="button"
                onClick={() => { setStep('email'); setPassword(''); setConfirmPassword(''); setError(null); }}
                className="inline-flex items-center gap-1 font-bold underline text-[#E5D4B4] hover:opacity-70 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Changer
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                placeholder={step === 'signin' ? "Votre mot de passe" : "Créer un mot de passe"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                className="w-full h-12 px-4 border border-neutral-800 bg-[#101319] font-mono text-xs uppercase placeholder:text-neutral-500 focus:outline-none focus:border-[#E5D4B4] text-white rounded-xl"
              />

              {step === 'signup' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-12 px-4 border border-neutral-800 bg-[#101319] font-mono text-xs uppercase placeholder:text-neutral-500 focus:outline-none focus:border-[#E5D4B4] text-white rounded-xl"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 px-4 border border-neutral-800 bg-[#E5D4B4] hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer mt-2 rounded-xl shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{step === 'signin' ? "Se connecter" : "Créer mon compte"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
