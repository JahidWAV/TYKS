"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, User, Mail, Shield, Bell, Key, Check, Calendar,
  MapPin, Hash, Building2, LogOut, AlertTriangle, Eye, EyeOff
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

// ---------------------------------------------------------------------------
// Petit composant switch réutilisable, dans la charte noir/crème
// ---------------------------------------------------------------------------
function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200 ${
        checked ? "bg-[#111110]" : "bg-[#111110]/15"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-[#F7F5F0] shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

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
  const [memberSince, setMemberSince] = useState<string>("");

  // Préférences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [currency, setCurrency] = useState("EUR");

  // Section active pour la navigation latérale
  const [activeSection, setActiveSection] = useState("personal");

  // Sécurité — changement de mot de passe
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Zone de danger — confirmation par saisie
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const canDelete = deleteConfirmText.trim().toUpperCase() === "SUPPRIMER";

  const menuItems = [
    { id: "personal", title: "Informations personnelles", icon: User, desc: "Identité et coordonnées postales" },
    { id: "security", title: "Sécurité & Connexion", icon: Key, desc: "Méthodes d'authentification" },
    { id: "notifications", title: "Notifications", icon: Bell, desc: "Préférences d'alerte et devises" },
    { id: "danger", title: "Zone de danger", icon: Shield, desc: "Suppression du compte" },
  ];

  // Calcul dynamique du pourcentage de complétion du profil
  const calculateCompletion = () => {
    const fields = [firstName, lastName, birthDate, address, postalCode, city];
    const filledFields = fields.filter((field) => field && field.trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompletion = calculateCompletion();
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (profileCompletion / 100) * circumference;

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || email?.[0] || ""}`.toUpperCase() || "?";

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

      if (currentUser.created_at) {
        setMemberSince(
          new Date(currentUser.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
        );
      }

      const provider = currentUser.app_metadata?.provider;
      const identities = currentUser.identities || [];
      const isGoogle = provider === "google" || identities.some((id: any) => id.provider === "google");
      setIsGoogleProvider(isGoogle);

      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  // Synchronisation avec Supabase Auth (user_metadata)
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
        },
      });

      if (error) throw error;
      setSuccessMessage("Vos modifications ont été synchronisées avec succès.");
    } catch (err: any) {
      setErrorMessage(err.message || "Une erreur est survenue lors de la synchronisation.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await supabaseBrowser.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMessage({ type: "success", text: "Mot de passe mis à jour avec succès." });
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Impossible de mettre à jour le mot de passe." });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/");
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

        {/* En-tête de la page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#111110]/10 pb-8">
          <div className="space-y-1">
            <h1 className="font-display text-3xl font-bold tracking-tight">Paramètres du compte</h1>
            <p className="text-xs font-mono opacity-60 uppercase tracking-wider">Gérez vos données personnelles et préférences de billetterie</p>
          </div>

          {/* Jauge de complétion du profil — anneau SVG réel */}
          <div className="flex items-center gap-4 bg-white/70 border border-[#111110]/15 rounded-2xl p-4 shadow-sm backdrop-blur-md">
            <div className="relative w-12 h-12 shrink-0">
              <svg viewBox="0 0 48 48" className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r={radius} fill="none" stroke="#111110" strokeOpacity="0.1" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r={radius} fill="none"
                  stroke="#111110" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500 ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold">
                {profileCompletion}%
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold font-mono uppercase tracking-wide">Profil complété</p>
              <p className="text-[11px] opacity-60">
                {profileCompletion === 100 ? "Parfait, profil à 100% !" : "Complétez vos infos pour atteindre 100%"}
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* Barre latérale */}
          <aside className="lg:col-span-4 flex flex-col gap-4">

            {/* Mini carte d'identité */}
            <div className="rounded-3xl border border-[#111110]/15 bg-white/50 p-5 backdrop-blur-md shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 shrink-0 rounded-full bg-[#111110] text-[#F7F5F0] flex items-center justify-center font-mono text-sm font-bold">
                {initials}
              </div>
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs font-bold truncate">
                  {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Votre profil"}
                </p>
                <p className="text-[11px] font-mono opacity-60 truncate">{email}</p>
                {memberSince && (
                  <p className="text-[10px] font-mono opacity-40 uppercase tracking-wide">Membre depuis {memberSince}</p>
                )}
              </div>
            </div>

            {/* Navigation — verticale en desktop, onglets scrollables en mobile */}
            <div className="rounded-3xl border border-[#111110]/15 bg-white/50 p-3 backdrop-blur-md shadow-sm flex-1">
              <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible -mx-1 px-1 lg:mx-0 lg:px-0 pb-1 lg:pb-0">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center lg:items-start gap-3 lg:gap-3.5 px-4 py-3 lg:p-3.5 rounded-2xl transition-all text-left border shrink-0 lg:shrink whitespace-nowrap lg:whitespace-normal ${
                        isActive
                          ? "bg-[#111110] text-[#F7F5F0] border-[#111110] shadow-md"
                          : "bg-transparent border-transparent text-[#111110] hover:bg-white/80 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#F7F5F0]" : "opacity-60"}`} />
                      <div className="space-y-0.5 overflow-hidden">
                        <p className={`text-xs font-bold font-mono uppercase tracking-wide ${isActive ? "text-[#F7F5F0]" : "text-[#111110]"}`}>
                          {item.title}
                        </p>
                        <p className={`hidden lg:block text-[11px] truncate ${isActive ? "text-[#F7F5F0]/70" : "opacity-50"}`}>
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Contenu dynamique */}
          <div className="lg:col-span-8 flex flex-col">

            {/* 1. INFORMATIONS PERSONNELLES */}
            {activeSection === "personal" && (
              <section className="rounded-3xl border border-[#111110]/15 bg-white/50 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm flex-1 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                    <User className="h-4 w-4 opacity-60" />
                    <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Informations personnelles</h2>
                  </div>

                  <form onSubmit={handleUpdateProfile} id="personal-form" className="space-y-8">

                    {/* Sous-section : Identité */}
                    <div className="space-y-4">
                      <p className="text-[11px] font-mono uppercase tracking-widest opacity-40">Identité</p>
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
                      </div>
                    </div>

                    {/* Sous-section : Adresse */}
                    <div className="space-y-4 pt-2 border-t border-[#111110]/10">
                      <p className="text-[11px] font-mono uppercase tracking-widest opacity-40 pt-4">Adresse de facturation</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    </div>
                  </form>
                </div>

                <div className="flex justify-end pt-4 border-t border-[#111110]/10 mt-6">
                  <button
                    type="submit"
                    form="personal-form"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-6 py-2.5 text-xs font-semibold text-[#F7F5F0] transition-transform hover:scale-[1.02] disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Enregistrer sur Supabase
                  </button>
                </div>
              </section>
            )}

            {/* 2. SÉCURITÉ ET CONNEXION */}
            {activeSection === "security" && (
              <section className="rounded-3xl border border-[#111110]/15 bg-white/50 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                  <Key className="h-4 w-4 opacity-60" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Sécurité et Connexion</h2>
                </div>

                <div className="space-y-4">
                  {/* Méthode d'authentification */}
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
                          onClick={() => setShowPasswordForm((v) => !v)}
                          className="px-4 py-2 rounded-xl border border-[#111110]/20 bg-[#111110] text-[#F7F5F0] text-xs font-semibold hover:opacity-95 transition-opacity"
                        >
                          {showPasswordForm ? "Annuler" : "Modifier le mot de passe"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulaire mot de passe, en accordéon */}
                  {!isGoogleProvider && showPasswordForm && (
                    <form
                      onSubmit={handlePasswordUpdate}
                      className="p-5 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50 space-y-4"
                    >
                      {passwordMessage && (
                        <div
                          className={`text-xs px-4 py-2.5 rounded-xl ${
                            passwordMessage.type === "success"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-600 border border-red-500/20"
                          }`}
                        >
                          {passwordMessage.text}
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono opacity-60">Nouveau mot de passe</label>
                          <div className="relative flex items-center">
                            <input
                              type={showPwd ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="8 caractères minimum"
                              className="w-full rounded-2xl border border-[#111110]/20 bg-white px-4 py-3 pr-11 text-xs focus:outline-none focus:border-[#111110]/60"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPwd((v) => !v)}
                              className="absolute right-4 opacity-40 hover:opacity-70"
                            >
                              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono opacity-60">Confirmer</label>
                          <input
                            type={showPwd ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Retapez le mot de passe"
                            className="w-full rounded-2xl border border-[#111110]/20 bg-white px-4 py-3 text-xs focus:outline-none focus:border-[#111110]/60"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={passwordSaving}
                          className="inline-flex items-center gap-2 rounded-full bg-[#111110] px-5 py-2 text-xs font-semibold text-[#F7F5F0] hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                          {passwordSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          Mettre à jour
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Déconnexion */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-wide font-mono">Session</p>
                      <p className="text-xs opacity-70">Déconnectez-vous de cet appareil.</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#111110]/20 text-xs font-semibold hover:bg-[#111110]/5 transition-colors shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* 3. NOTIFICATIONS ET BILLETTERIE */}
            {activeSection === "notifications" && (
              <section className="rounded-3xl border border-[#111110]/15 bg-white/50 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm flex-1">
                <div className="flex items-center gap-3 border-b border-[#111110]/10 pb-4">
                  <Bell className="h-4 w-4 opacity-60" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono">Notifications et Billetterie</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Rappels par e-mail</p>
                      <p className="text-[11px] opacity-60 font-mono">Billets et horaires</p>
                    </div>
                    <ToggleSwitch checked={emailNotifs} onChange={setEmailNotifs} label="Rappels par e-mail" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Alertes SMS</p>
                      <p className="text-[11px] opacity-60 font-mono">Accès rapides</p>
                    </div>
                    <ToggleSwitch checked={smsNotifs} onChange={setSmsNotifs} label="Alertes SMS" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-[#111110]/10 bg-[#F7F5F0]/50">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Newsletter culturelle</p>
                      <p className="text-[11px] opacity-60 font-mono">Sélection hebdomadaire</p>
                    </div>
                    <ToggleSwitch checked={newsletter} onChange={setNewsletter} label="Newsletter culturelle" />
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
            )}

            {/* 4. ZONE DE DANGER */}
            {activeSection === "danger" && (
              <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 md:p-8 backdrop-blur-md space-y-6 shadow-sm flex-1">
                <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
                  <Shield className="h-4 w-4 text-red-500 opacity-80" />
                  <h2 className="text-sm font-bold uppercase tracking-wider font-mono text-red-600">Zone de danger</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-600">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-xs">Cette action est irréversible : vos billets, réservations et données personnelles seront définitivement supprimés.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono opacity-70">
                      Tapez <span className="font-bold">SUPPRIMER</span> pour confirmer
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="SUPPRIMER"
                      className="w-full md:w-64 rounded-2xl border border-red-500/30 bg-white px-4 py-3 text-xs focus:outline-none focus:border-red-500/60"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      disabled={!canDelete}
                      onClick={() => alert("Veuillez contacter le support.")}
                      className="px-5 py-2.5 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Supprimer définitivement mon compte
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
