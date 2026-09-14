"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, User, Mail, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      
      if (!session?.user) {
        router.push("/");
        return;
      }

      setUser(session.user);

      // Récupération des infos du profil depuis Supabase
      const { data } = await supabaseBrowser
        .from("profiles")
        .select("first_name")
        .eq("id", session.user.id)
        .single();

      if (data?.first_name) {
        setFirstName(data.first_name);
        setProfile(data);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabaseBrowser
      .from("profiles")
      update({ first_name: firstName })
      .eq("id", user.id);

    if (error) {
      setMessage("Erreur lors de la mise à jour.");
    } else {
      setMessage("Profil mis à jour avec succès !");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center text-[#1e3932]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-[#1e3932] font-sans">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Lien de retour */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-[#1e3932]/60 hover:text-[#1e3932] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1e3932]">
              Paramètres du compte
            </h1>
            <p className="text-xs text-[#1e3932]/60 mt-1">
              Gérez vos informations personnelles et les préférences de votre profil.
            </p>
          </div>

          {/* Formulaire de profil */}
          <div className="bg-white border border-[#1e3932]/10 rounded-3xl p-8 shadow-sm">
            <h2 className="text-sm font-medium text-[#1e3932] flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-[#1e3932]" />
              Informations personnelles
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#1e3932]/70 mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 w-full h-11 bg-[#f8faf9] border border-[#1e3932]/10 px-4 text-xs text-[#1e3932]/50 rounded-full select-none">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1e3932]/70 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                  className="w-full h-11 bg-white border border-[#1e3932]/15 px-4 text-xs text-[#1e3932] rounded-full focus:outline-none focus:border-[#1e3932] transition-colors shadow-inner"
                />
              </div>

              {message && (
                <p className="text-xs font-medium text-emerald-600">
                  {message}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center h-11 px-6 bg-[#1e3932] hover:bg-[#152a25] text-white text-xs font-medium tracking-wide rounded-full shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>

          {/* Section Sécurité / Déconnexion */}
          <div className="bg-white border border-[#1e3932]/10 rounded-3xl p-8 shadow-sm flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-[#1e3932] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#1e3932]" />
                Session
              </h2>
              <p className="text-xs text-[#1e3932]/60 mt-1">
                Fermer votre session active sur cet appareil.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 h-11 px-6 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium tracking-wide rounded-full transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
