"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Shield, Check } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
// Ne plus importer Navbar ici

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      
      if (!session) {
        router.push("/");
        return;
      }

      setUser(session.user);
      setEmail(session.user.email || "");
      setFullName(session.user.user_metadata?.full_name || "");
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabaseBrowser.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;
      setSuccessMessage("Profil mis à jour avec succès.");
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110]">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin opacity-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] selection:bg-[#111110] selection:text-[#F7F5F0]">
      {/* Navbar retirée d'ici pour éviter le doublon */}

      <main className="mx-auto max-w-4xl px-6 py-12 md:px-12">
        <div className="space-y-2 mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight">Paramètres du compte</h1>
          <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Gérez vos informations personnelles et préférences</p>
        </div>

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-xs text-emerald-600">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-xs text-red-600">
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-8">
          <section className="rounded-3xl border border-[#111110]/15 bg-white/40 p-6 md:p-8 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
              <User className="h-4 w-4 opacity-60" />
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Informations personnelles</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono opacity-60">Nom complet / Prénom</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/60 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono opacity-60">Adresse email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 h-4 w-4 opacity-30 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full rounded-2xl border border-[#111110]/10 bg-[#111110]/5 px-4 py-3 pl-11 text-xs opacity-60 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-6 py-2.5 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-[#111110]/15 bg-white/40 p-6 md:p-8 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
              <Shield className="h-4 w-4 opacity-60" />
              <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Sécurité et Préférences</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">Notifications des événements</p>
                  <p className="text-[11px] opacity-60 font-mono">Recevoir les alertes de nos nouvelles soirées</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#111110] w-4 h-4 rounded cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">Newsletter indépendante</p>
                  <p className="text-[11px] opacity-60 font-mono">Un récapitulatif culturel hebdomadaire</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-[#111110] w-4 h-4 rounded cursor-pointer" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
