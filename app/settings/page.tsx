'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, User, Mail, Shield, ArrowLeft, Phone, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Nouveaux champs du profil
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabaseBrowser.auth.getSession();
      
      if (!session?.user) {
        router.push('/');
        return;
      }

      setUser(session.user);

      // Récupération des informations du profil depuis Supabase
      const { data, error } = await supabaseBrowser
        .from('profiles')
        .select('first_name, phone, address, address_complement, postal_code, city')
        .eq('id', session.user.id)
        .single();

      if (data && !error) {
        setFirstName(data.first_name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setAddressComplement(data.address_complement || '');
        setPostalCode(data.postal_code || '');
        setCity(data.city || '');
      }
      setLoading(false);
    };

    fetchUserData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    setErrorMsg('');

    const { error } = await supabaseBrowser
      .from('profiles')
      .upsert({
        id: user.id,
        first_name: firstName,
        phone,
        address,
        address_complement: addressComplement,
        postal_code: postalCode,
        city,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setErrorMsg("Erreur lors de la mise à jour des paramètres.");
    } else {
      setMessage("Paramètres enregistrés avec succès !");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">
        <Loader2 className="w-6 h-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f0f] text-white selection:bg-white selection:text-black font-grotesque antialiased min-h-screen flex flex-col">
      {/* NAVBAR */}
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Lien de retour */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l&apos;accueil
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Paramètres du compte
            </h1>
            <p className="text-xs text-white/60 mt-1 uppercase tracking-wider font-semibold">
              Gérez vos informations personnelles, vos coordonnées et votre session.
            </p>
          </div>

          {/* Formulaire complet des informations */}
          <div className="bg-neutral-900 border border-white/15 rounded-[2.5rem] p-8 sm:p-10 shadow-xl space-y-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2.5 uppercase tracking-wider">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <User className="w-4 h-4" />
              </div>
              Informations personnelles
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                  Adresse Email
                </label>
                <div className="flex items-center gap-2.5 w-full h-11 bg-neutral-950 border border-white/15 px-4 text-xs text-white/50 rounded-full select-none shadow-inner">
                  <Mail className="w-3.5 h-3.5 shrink-0 text-white/40" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full h-11 bg-neutral-950 border border-white/15 px-4 text-xs text-white placeholder:text-white/30 rounded-full focus:outline-none focus:border-white transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                    Téléphone
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="w-full h-11 bg-neutral-950 border border-white/15 pl-10 pr-4 text-xs text-white placeholder:text-white/30 rounded-full focus:outline-none focus:border-white transition-colors shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                  Adresse
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-4 w-3.5 h-3.5 text-white/40" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 rue de Paris"
                    className="w-full h-11 bg-neutral-950 border border-white/15 pl-10 pr-4 text-xs text-white placeholder:text-white/30 rounded-full focus:outline-none focus:border-white transition-colors shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                  Complément d&apos;adresse
                </label>
                <input
                  type="text"
                  value={addressComplement}
                  onChange={(e) => setAddressComplement(e.target.value)}
                  placeholder="Appartement, bâtiment, étage..."
                  className="w-full h-11 bg-neutral-950 border border-white/15 px-4 text-xs text-white placeholder:text-white/30 rounded-full focus:outline-none focus:border-white transition-colors shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="75001"
                    className="w-full h-11 bg-neutral-950 border border-white/15 px-4 text-xs text-white placeholder:text-white/30 rounded-full focus:outline-none focus:border-white transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Paris"
                    className="w-full h-11 bg-neutral-950 border border-white/15 px-4 text-xs text-white placeholder:text-white/30 rounded-full focus:outline-none focus:border-white transition-colors shadow-inner"
                  />
                </div>
              </div>

              {message && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-bold">
                  {message}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-950/50 border border-red-500/30 rounded-2xl text-xs text-red-400 font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-8 bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center rounded-full shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>

          {/* Section Sécurité / Déconnexion */}
          <div className="bg-neutral-900 border border-white/15 rounded-[2.5rem] p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2.5 uppercase tracking-wider">
                <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Shield className="w-4 h-4" />
                </div>
                Session active
              </h2>
              <p className="text-xs text-white/60 mt-1 uppercase tracking-wider font-semibold">
                Fermer votre session active sur cet appareil en toute sécurité.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="h-11 px-6 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-2 rounded-full cursor-pointer shrink-0 shadow-lg"
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
