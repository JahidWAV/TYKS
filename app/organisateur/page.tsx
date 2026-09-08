'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { IortiEvent } from '@/types/event';
import type { OrgRole } from '@/lib/organizer';
import CustomAuthModal from '@/components/CustomAuthModal';

export default function OrganizerDashboard() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // ... garde tes states et fonctions loadDashboard / handleOnboard / handleDelete ...

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-onyx text-bone flex flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-bone-muted text-sm max-w-xs">
          Connecte-toi pour accéder à l&apos;espace organisateur.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="inline-flex items-center gap-2.5 bg-cobalt hover:bg-cobalt-soft text-bone font-semibold px-7 py-3.5 rounded-full transition-colors"
        >
          <span>Se connecter</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <CustomAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // ... reste du composant
}
