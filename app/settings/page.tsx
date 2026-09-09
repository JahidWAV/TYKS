"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Shield, Bell, Key, Check, Calendar, MapPin, Hash, Building2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [isGoogleProvider, setIsGoogleProvider] = useState(false);

  // Préférences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [currency, setCurrency] = useState("EUR");

  // Section active pour la navigation par onglets latéraux
  const [activeSection, setActiveSection] = useState("personal");

  const menuItems = [
    { id: "personal", title: "Informations personnelles", icon: User },
    { id: "security", title: "Sécurité & Connexion", icon: Key },
    { id: "notifications", title: "Notifications & Billetterie", icon: Bell },
    { id: "danger", title: "Zone de danger", icon: Shield },
  ];

  // Calcul du pourcentage de complétion du profil
  const calculateCompletion = () => {
    const fields = [firstName, lastName, birthDate, address, postalCode, city];
    const filledFields = fields.filter((field) => field && field.trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateCompletion();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      
      if (!session) {
        router.push("/");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);
      setEmail(currentUser.email || "");

      const meta = currentUser.user_metadata || {};
      setFirstName(meta.first_name || meta.full_name?.split(" ")[0] || "");
      setLastName(meta.last_name || meta.full_name?.split(" ").slice(1).join(" ") || "");
      setBirthDate(meta.birth_date || "");
      setAddress(meta.address || "");
      setAddressComplement(meta.address_complement || "");
      setPostalCode(meta.postal_code || "");
      setCity(meta.city || "");

      const provider = currentUser.app_metadata?.provider;
      const identities = currentUser.identities || [];
      const isGoogle = provider === "google" || identities.some((id: any) => id.provider === "google");
      setIsGoogleProvider(isGoogle);

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
      const fullName = `${firstName} ${lastName}`.trim();
      const { error } = await supabaseBrowser.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          birth_date: birthDate,
          address: address,
          address_complement: addressComplement,
          postal_code: postalCode,
          city: city,
        }
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
      <main className="mx-auto max-w-6xl px-6 py-12 md:px-12 space-y-8">
        
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#111110]/10 pb-8">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight">Paramètres du compte</h1>
            <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Gérez vos informations personnelles et préférences de billetterie</p>
          </div>

          {/* Jauge de complétion du profil */}
          <div className="flex items-center gap-4 bg-white/60 border border-[#111110]/15 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-[#111110]/10 flex items-center justify-center font-mono text-xs font-bold">
                {profileCompletion}%
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold font-mono uppercase tracking-wide">Profil complété</p>
              <p className="text-[11px] opacity-60">
                {profileCompletion === 100 ? "Profil complet !" : "Remplissez vos infos pour atteindre 100%"}
              </p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3 text-xs text-emerald-600">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-xs text-red-600">
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MISE EN PAGE AVEC BARRE LATÉRALE */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Barre latérale de navigation */}
          <aside className="lg:col-span-1 space-y-2 sticky top-24">
            <div className="rounded-3xl border border-[#111110]/15 bg-white/40 p-3 backdrop-blur-md space-y-1 shadow-sm">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-mono font-semibold transition-all text-left ${
                      isActive
                        ? "bg-[#111110] text-[#F7F5F0] shadow-md"
                        : "text-[#111110] hover:bg-white/80 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F7F5F0]" : "opacity-60"}`} />
                    <span className="truncate">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Contenu principal selon l'onglet actif */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* INFORMATIONS PERSONNELLES */}
            {activeSection === "personal" && (
              <section className="rounded-3xl border border-[#111110]/15 bg-white/40 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                  <User className="h-4 w-4 opacity-60" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Informations personnelles</h2>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono opacity-60">Prénom</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Votre prénom"
                        className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/60 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono opacity-60">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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

                    <div className="space-y-2">
                      <label className="text-xs font-mono opacity-60">Date de naissance</label>
                      <div className="relative flex items-center">
                        <Calendar className="absolute left-4 h-4 w-4 opacity-30 pointer-events-none" />
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 pl-11 text-xs focus:outline-none focus:border-[#111110]/60 font-mono"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-mono opacity-60">Adresse postale</label>
                      <div className="relative flex items-center">
                        <MapPin className="absolute left-4 h-4 w-4 opacity-30 pointer-events-none" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Numéro et nom de rue"
                          className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 pl-11 text-xs focus:outline-none focus:border-[#111110]/60"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-mono opacity-60">Complément d&apos;adresse <span className="opacity-40">(facultatif)</span></label>
                      <div className="relative flex items-center">
                        <Building2 className="absolute left-4 h-4 w-4 opacity-30 pointer-events-none" />
                        <input
                          type="text"
                          value={addressComplement}
                          onChange={(e) => setAddressComplement(e.target.value)}
                          placeholder="Appartement, bâtiment, étage, interphone..."
                          className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 pl-11 text-xs focus:outline-none focus:border-[#111110]/60"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono opacity-60">Code postal</label>
                      <div className="relative flex items-center">
                        <Hash className="absolute left-4 h-4 w-4 opacity-30 pointer-events-none" />
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="Ex: 59100"
                          className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 pl-11 text-xs focus:outline-none focus:border-[#111110]/60 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono opacity-60">Ville</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ex: Roubaix"
                        className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/60"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#111110]/10">
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
            )}

            {/* SÉCURITÉ ET CONNEXION */}
            {activeSection === "security" && (
              <section className="rounded-3xl border border-[#111110]/15 bg-white/40 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                  <Key className="h-4 w-4 opacity-60" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Sécurité et Connexion</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wide font-mono">Méthode d&apos;authentification</p>
                      <p className="text-xs opacity-70">
                        {isGoogleProvider 
                          ? "Votre compte est associé et sécurisé via votre connexion Google." 
                          : "Votre compte utilise une connexion par e-mail / mot de passe."}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isGoogleProvider ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#111110]/20 bg-white text-xs font-mono font-semibold shadow-sm">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.13 0-5.78-2.11-6.73-4.96H1.19v3.15C3.17 21.36 7.22 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.27 14.24c-.25-.72-.38-1.5-.38-2.24s.13-1.52.38-2.24V6.6H1.19C.43 8.13 0 9.87 0 11.7s.43 3.57 1.19 5.1l4.08-2.56z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.17 2.64 1.19 6.6l4.08 3.15c.95-2.85 3.6-4.96 6.73-4.96z"/>
                          </svg>
                          Connecté avec Google
                        </span>
                      ) : (
                        <button 
                          onClick={() => alert("Fonctionnalité de réinitialisation de mot de passe")}
                          className="px-4 py-2 rounded-xl border border-[#111110]/20 bg-[#111110] text-[#F7F5F0] text-xs font-semibold hover:opacity-95 transition-opacity"
                        >
                          Modifier le mot de passe
                        </button>
                      )}
                    </div>
                  </div>

                  {isGoogleProvider && (
                    <p className="text-[11px] opacity-50 px-1 font-mono">
                      Note : Votre authentification étant gérée par Google, la sécurité et la modification de votre mot de passe s&apos;effectuent directement depuis votre espace personnel Google.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* NOTIFICATIONS ET BILLETTERIE */}
            {activeSection === "notifications" && (
              <section className="rounded-3xl border border-[#111110]/15 bg-white/40 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                  <Bell className="h-4 w-4 opacity-60" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Notifications et Billetterie</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Rappels par e-mail</p>
                      <p className="text-[11px] opacity-60 font-mono">Billets et horaires de vos événements</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailNotifs} 
                      onChange={(e) => setEmailNotifs(e.target.checked)} 
                      className="accent-[#111110] w-4 h-4 rounded cursor-pointer" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Alertes SMS</p>
                      <p className="text-[11px] opacity-60 font-mono">Dernières minutes et accès rapides</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={smsNotifs} 
                      onChange={(e) => setSmsNotifs(e.target.checked)} 
                      className="accent-[#111110] w-4 h-4 rounded cursor-pointer" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Newsletter culturelle</p>
                      <p className="text-[11px] opacity-60 font-mono">Sélection indépendante hebdomadaire</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={newsletter} 
                      onChange={(e) => setNewsletter(e.target.checked)} 
                      className="accent-[#111110] w-4 h-4 rounded cursor-pointer" 
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Devise par défaut</p>
                      <p className="text-[11px] opacity-60 font-mono">Affichage des prix billetterie</p>
                    </div>
                    <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                      className="bg-transparent text-xs font-mono font-bold border border-[#111110]/20 rounded-xl px-3 py-1.5 focus:outline-none"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {/* ZONE DE DANGER */}
            {activeSection === "danger" && (
              <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
                  <Shield className="h-4 w-4 text-red-500 opacity-80" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-red-600">Zone de danger</h2>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold">Suppression du compte</p>
                    <p className="text-[11px] opacity-60 font-mono">Supprimer définitivement vos données et historique de billets</p>
                  </div>
                  <button 
                    onClick={() => alert("Veuillez contacter le support pour supprimer votre compte.")}
                    className="px-4 py-2 rounded-full border border-red-500/30 text-red-600 text-xs font-semibold hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </section>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
