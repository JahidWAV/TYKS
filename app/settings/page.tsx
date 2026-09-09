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

  // Section active pour l'indicateur visuel du menu latéral
  const [activeSection, setActiveSection] = useState("personal");

  const menuItems = [
    { id: "personal", title: "Informations personnelles", icon: User },
    { id: "security", title: "Sécurité & Connexion", icon: Key },
    { id: "notifications", title: "Notifications & Préférences", icon: Bell },
    { id: "danger", title: "Zone de danger", icon: Shield },
  ];

  // Calcul dynamique du pourcentage de complétion du profil (sur 6 champs clés)
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

  // Synchronisation globale vers Supabase Auth
  const handleSaveAll = async (e: React.FormEvent) => {
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
      setSuccessMessage("Modifications enregistrées et synchronisées avec Supabase.");
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de la synchronisation.");
    } finally {
      setSaving(false);
    }
  };

  // Gestion du scroll pour illuminer le bon onglet dans la barre latérale
  useEffect(() => {
    const handleScroll = () => {
      const sections = menuItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 200;

      sections.forEach((section, index) => {
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(menuItems[index].id);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] text-[#111110] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin opacity-60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#111110] selection:bg-[#111110] selection:text-[#F7F5F0]">
      <main className="mx-auto max-w-6xl px-6 py-12 md:px-12 space-y-10">
        
        {/* En-tête principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#111110]/10 pb-8">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight">Paramètres du compte</h1>
            <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Gérez vos données personnelles et préférences</p>
          </div>

          {/* Jauge de complétion du profil vers 100% */}
          <div className="flex items-center gap-4 bg-white/80 border border-[#111110]/15 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-[#111110]/10 flex items-center justify-center font-mono text-xs font-bold">
                {profileCompletion}%
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold font-mono uppercase tracking-wide">Profil complété</p>
              <p className="text-[11px] opacity-60">
                {profileCompletion === 100 ? "Objectif 100% atteint !" : "Remplissez vos infos pour atteindre 100%"}
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

        {/* Formulaire unique englobant toute la page */}
        <form onSubmit={handleSaveAll}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Barre latérale fixe (navigation rapide par ancres) */}
            <aside className="lg:col-span-4 sticky top-10 space-y-4">
              <div className="rounded-3xl border border-[#111110]/15 bg-white/60 p-3 backdrop-blur-md space-y-1.5 shadow-sm">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-left border ${
                        isActive
                          ? "bg-[#111110] text-[#F7F5F0] border-[#111110] shadow-md"
                          : "bg-transparent border-transparent text-[#111110] hover:bg-white/80 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F7F5F0]" : "opacity-60"}`} />
                      <span className="text-xs font-bold font-mono tracking-wide truncate">{item.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bouton de sauvegarde global sticky */}
              <div className="rounded-3xl border border-[#111110]/15 bg-white/60 p-5 backdrop-blur-md space-y-4 shadow-sm">
                <div className="space-y-1">
                  <p className="text-xs font-bold font-mono uppercase tracking-wide">Sauvegarde</p>
                  <p className="text-[11px] opacity-60">Synchronisez vos modifications en un clic.</p>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111110] px-6 py-3 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02] disabled:opacity-50 shadow-md"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Enregistrer les modifications
                </button>
              </div>
            </aside>

            {/* Contenu principal divisé en sections fluides */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 1. INFORMATIONS PERSONNELLES */}
              <section id="personal" className="rounded-3xl border border-[#111110]/15 bg-white/50 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                  <User className="h-4 w-4 opacity-60" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Informations personnelles</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono opacity-60">Prénom</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Votre prénom"
                      className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/60 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono opacity-60">Nom</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Votre nom"
                      className="w-full rounded-2xl border border-[#111110]/20 bg-[#F7F5F0] px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/60 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
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

                  <div className="md:col-span-2 space-y-1.5">
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

                  <div className="md:col-span-2 space-y-1.5">
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

                  <div className="space-y-1.5">
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

                  <div className="space-y-1.5">
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
              </section>

              {/* 2. SÉCURITÉ ET CONNEXION */}
              <section id="security" className="rounded-3xl border border-[#111110]/15 bg-white/50 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                  <Key className="h-4 w-4 opacity-60" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Sécurité et Connexion</h2>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wide font-mono">Méthode d&apos;authentification</p>
                    <p className="text-xs opacity-70">
                      {isGoogleProvider 
                        ? "Votre compte est synchronisé et sécurisé via Google." 
                        : "Votre compte utilise une connexion e-mail classique."}
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
                        Google Connect
                      </span>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => alert("Fonctionnalité de réinitialisation")}
                        className="px-4 py-2 rounded-xl border border-[#111110]/20 bg-[#111110] text-[#F7F5F0] text-xs font-semibold hover:opacity-95 transition-opacity"
                      >
                        Modifier le mot de passe
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* 3. NOTIFICATIONS ET PRÉFÉRENCES */}
              <section id="notifications" className="rounded-3xl border border-[#111110]/15 bg-white/50 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                  <Bell className="h-4 w-4 opacity-60" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Notifications et Préférences</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Rappels par e-mail</p>
                      <p className="text-[11px] opacity-60 font-mono">Billets et horaires</p>
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
                      <p className="text-[11px] opacity-60 font-mono">Accès rapides</p>
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
                      <p className="text-[11px] opacity-60 font-mono">Sélection hebdomadaire</p>
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
                      <p className="text-[11px] opacity-60 font-mono">Affichage billetterie</p>
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

              {/* 4. ZONE DE DANGER */}
              <section id="danger" className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
                  <Shield className="h-4 w-4 text-red-500 opacity-80" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-red-600">Zone de danger</h2>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold">Suppression du compte</p>
                    <p className="text-[11px] opacity-60 font-mono">Supprimer définitivement vos données de Supabase</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => alert("Veuillez contacter le support.")}
                    className="px-4 py-2 rounded-full border border-red-500/30 text-red-600 text-xs font-semibold hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    Supprimer mon compte
                  </button>
                </div>
              </section>

            </div>

          </div>
        </form>
      </main>
    </div>
  );
}
