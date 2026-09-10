"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { X, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

interface CustomAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function CustomAuthModal({ isOpen, onClose, isDarkMode = false }: CustomAuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 'email' = saisie initiale de l'email
  // 'signin' = l'email existe, on demande le mot de passe
  // 'signup' = l'email n'existe pas, on demande le mot de passe + la confirmation affichée en dessous
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

  // Étape cruciale : Interrogation de Supabase pour savoir si l'e-mail existe
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Veuillez entrer une adresse e-mail valide.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Astuce standard Supabase pour détecter si un utilisateur existe :
      // On tente un signUp avec un mot de passe temporaire ou on regarde les identités.
      // Si l'e-mail existe déjà, Supabase retourne un tableau d'identités vide ou une indication selon la configuration,
      // ou plus simplement : on tente un signIn avec un mauvais mot de passe exprès. 
      // Si l'erreur renvoyée est "Invalid login credentials", l'utilisateur existe ! 
      // S'il n'existe pas, le comportement varie, mais la méthode la plus robuste pour vérifier l'existence 
      // sans créer de compte intempestif est d'utiliser une requête de test sur l'unicité ou d'analyser le retour de signUp.
      
      // Approche alternative propre : On tente un signUp de test. Si l'utilisateur existe déjà, 
      // data.user.identities sera vide ([]), sinon il contiendra l'objet.
      const { data, error: signUpCheckError } = await supabaseBrowser.auth.signUp({
        email,
        password: "TempPassword123!", // Mot de passe jetable pour le test d'existence
      });

      // Si l'API renvoie une erreur directe "User already registered" (si les confirm emails sont désactivés)
      // OU si data.user?.identities est vide (ce qui signifie que le compte existe déjà) :
      const userExists = 
        (signUpCheckError && signUpCheckError.message.includes("already registered")) ||
        (data?.user && data.user.identities && data.user.identities.length === 0);

      if (userExists) {
        // Le compte existe -> On bascule en mode connexion (juste le mot de passe)
        setStep('signin');
      } else {
        // Le compte n'existe pas -> On bascule en mode inscription 
        // et on affiche direct le mot de passe + la confirmation juste en dessous
        setStep('signup');
      }
    } catch (err: any) {
      // Par défaut en cas de doute, on propose la connexion
      setStep('signin');
    } finally {
      setLoading(false);
    }
  };

  // Soumission finale selon le mode détecté
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

        // Inscription définitive avec le vrai mot de passe choisi par l'utilisateur
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className={`relative w-full max-w-md rounded-2xl p-8 shadow-2xl border transition-all duration-300 animate-in zoom-in-95 ${
        isDarkMode 
          ? 'bg-[#111110] border-[#F7F5F0]/15 text-[#F7F5F0]' 
          : 'bg-[#F7F5F0] border-[#111110]/15 text-[#111110]'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-full transition-colors opacity-60 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6 space-y-2">
          <h2 className="font-display text-2xl font-bold tracking-tight">TYKS</h2>
          <p className={`text-xs font-light ${isDarkMode ? 'text-[#F7F5F0]/60' : 'text-[#111110]/60'}`}>
            {step === 'email' && "Entrez votre e-mail pour continuer"}
            {step === 'signin' && "Bon retour ! Entrez votre mot de passe"}
            {step === 'signup' && "Première visite ? Créez votre mot de passe"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-mono">
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
                className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-full border text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 ${
                  isDarkMode 
                    ? 'border-[#F7F5F0]/20 bg-[#F7F5F0]/5 hover:bg-[#F7F5F0]/10 text-[#F7F5F0]' 
                    : 'border-[#111110]/20 bg-[#111110]/5 hover:bg-[#111110]/10 text-[#111110]'
                }`}
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
                className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-full border text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 ${
                  isDarkMode 
                    ? 'border-[#F7F5F0]/20 bg-[#F7F5F0]/5 hover:bg-[#F7F5F0]/10 text-[#F7F5F0]' 
                    : 'border-[#111110]/20 bg-[#111110]/5 hover:bg-[#111110]/10 text-[#111110]'
                }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.01c.65-.79 1.09-1.89.97-2.99-.96.04-2.13.64-2.82 1.43-.6.68-1.13 1.78-.99 2.85 1.08.08 2.19-.53 2.84-1.29z"/>
                </svg>
                Continuer avec Apple
              </button>
            </div>

            <div className="relative flex items-center justify-center mb-6">
              <div className={`absolute inset-0 flex items-center ${isDarkMode ? 'opacity-15' : 'opacity-20'}`}>
                <div className={`w-full border-t ${isDarkMode ? 'border-[#F7F5F0]' : 'border-[#111110]'}`} />
              </div>
              <span className={`relative px-3 text-[10px] uppercase font-mono tracking-widest ${isDarkMode ? 'bg-[#111110] text-[#F7F5F0]/50' : 'bg-[#F7F5F0] text-[#111110]/50'}`}>
                ou par e-mail
              </span>
            </div>
          </>
        )}

        {/* Formulaire étape e-mail */}
        {step === 'email' ? (
          <form onSubmit={handleCheckEmail} className="space-y-3">
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-3 rounded-xl border text-xs font-mono transition-all outline-none ${
                isDarkMode 
                  ? 'bg-black/20 border-[#F7F5F0]/20 text-[#F7F5F0] focus:border-[#F7F5F0]/60' 
                  : 'bg-white/50 border-[#111110]/20 text-[#111110] focus:border-[#111110]/60'
              }`}
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-full text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 ${
                isDarkMode ? 'bg-[#F7F5F0] text-[#111110] hover:bg-white' : 'bg-[#111110] text-[#F7F5F0] hover:opacity-90'
              }`}
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
          /* Formulaire dynamique selon l'existence ou non du compte */
          <form onSubmit={handleSubmitAuth} className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Rappel de l'e-mail avec bouton pour changer */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/5 border border-black/10 text-xs font-mono mb-3">
              <span className="opacity-70 truncate max-w-[240px]">{email}</span>
              <button
                type="button"
                onClick={() => { setStep('email'); setPassword(''); setConfirmPassword(''); setError(null); }}
                className="inline-flex items-center gap-1 text-[10px] underline opacity-60 hover:opacity-100"
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
                className={`w-full px-4 py-3 rounded-xl border text-xs font-mono transition-all outline-none ${
                  isDarkMode 
                    ? 'bg-black/20 border-[#F7F5F0]/20 text-[#F7F5F0] focus:border-[#F7F5F0]/60' 
                    : 'bg-white/50 border-[#111110]/20 text-[#111110] focus:border-[#111110]/60'
                }`}
              />

              {/* Si le compte n'existe pas (signup), la confirmation s'affiche directement en dessous */}
              {step === 'signup' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-mono transition-all outline-none ${
                      isDarkMode 
                        ? 'bg-black/20 border-[#F7F5F0]/20 text-[#F7F5F0] focus:border-[#F7F5F0]/60' 
                        : 'bg-white/50 border-[#111110]/20 text-[#111110] focus:border-[#111110]/60'
                    }`}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-full text-xs font-semibold transition-all hover:scale-[1.02] disabled:opacity-50 mt-4 ${
                isDarkMode ? 'bg-[#F7F5F0] text-[#111110] hover:bg-white' : 'bg-[#111110] text-[#F7F5F0] hover:opacity-90'
              }`}
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
