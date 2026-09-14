"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, User, Mail, Shield, ArrowLeft, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Nouveaux champs du profil
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      
      if (!session?.user) {
        router.push("/");
        return;
      }

      setUser(session.user);

      // Récupération des informations du profil depuis Supabase
      const { data } = await supabaseBrowser
        .from("profiles")
        .select("first_name, phone, address, address_complement, postal_code, city")
        .eq("id", session.user.id)
        .single();

      if (data) {
        setFirstName(data.first_name || "");
        setPhone(data.phone || "");
        setAddress(data.address || "");
        setAddressComplement(data.address_complement || "");
        setPostalCode(data.postal_code || "");
        setCity(data.city || "");
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
      .update({
        first_name: firstName,
        phone,
        address,
        address_complement: addressComplement,
        postal_code: postalCode,
        city,
      })
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
      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Lien de retour */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-medium text-[#1e3932]/65 hover:text-[#1e3932] transition-colors mb-8"
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
              Gérez vos informations personnelles, vos coordonnées et vos préférences.
            </p>
          </div>

          {/* Formulaire complet des informations */}
          <div className="bg-white border border-[#1e3932]/10 rounded-3xl p-8 shadow-sm">
            <h2 className="text-sm font-medium text-[#1e3932] flex items-center gap-2 mb-6">
              <User className="w-4 h-4 text-[#1e3932]" />
              Informations personnelles et coordonnées
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-medium text-[#1e3932]/70 mb-2">
                    Téléphone
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 w-3.5 h-3.5 text-[#1e3932]/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full h-11 bg-white border border-[#1e3932]/15 pl-10 pr-4 text-xs text-[#1e3932] rounded-full focus:outline-none focus:border-[#1e3932] transition-colors shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1e3932]/70 mb-2">
                  Adresse
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 w-3.5 h-3.5 text-[#1e3932]/40" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 rue de Paris"
                    className="w-full h-11 bg-white border border-[#1e3932]/15 pl-10 pr-4 text-xs text-[#1e3932] rounded-full focus:outline-none focus:border-[#1e3932] transition-colors shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1e3932]/70 mb-2">
                  Complément d&apos;adresse
                </label>
                <input
                  type="text"
                  value={addressComplement}
                  onChange={(e) => setAddressComplement(e.target.value)}
                  placeholder="Appartement, bâtiment, étage..."
                  className="w-full h-11 bg-white border border-[#1e3932]/15 px-4 text-xs text-[#1e3932] rounded-full focus:outline-none focus:border-[#1e3932] transition-colors shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1e3932]/70 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="75001"
                    className="w-full h-11 bg-white border border-[#1e3932]/15 px-4 text-xs text-[#1e3932] rounded-full focus:outline-none focus:border-[#1e3932] transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1e3932]/70 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Paris"
                    className="w-full h-11 bg-white border border-[#1e3932]/15 px-4 text-xs text-[#1e3932] rounded-full focus:outline-none focus:border-[#1e3932] transition-colors shadow-inner"
                  />
                </div>
              </div>

              {message && (
                <p className="text-xs font-medium text-emerald-700">
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
