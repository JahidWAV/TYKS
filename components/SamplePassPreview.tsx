import QRCode from 'qrcode.react';
import { ShieldCheck, MapPin, Calendar } from 'lucide-react';

/**
 * Illustration statique utilisée uniquement sur la landing (visiteurs non
 * connectés) pour montrer concrètement à quoi ressemble un pass TYKS.
 * Aucune donnée réelle, aucun wallet : c'est un exemple, explicitement
 * labellisé comme tel.
 */
export default function SamplePassPreview() {
  return (
    <div className="hero-settle w-full max-w-[280px] mx-auto lg:mx-0 -rotate-6">
      <div className="metal-card relative bg-gradient-to-br from-onyx-raised via-[#131217] to-onyx border border-bone/10 border-b-0 rounded-t-[24px] pt-6 px-6 pb-7 shadow-2xl shadow-black/70">
        <div className="absolute -top-16 -left-12 w-44 h-44 bg-cobalt/20 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative flex items-center justify-between pb-4 mb-5 border-b border-bone/10">
          <div className="leading-none">
            <p className="font-display text-base font-extrabold tracking-tightest text-bone">TYKS</p>
            <p className="text-[9px] tracking-[0.14em] text-bone-faint mt-1">Exemple de pass</p>
          </div>
          <div
            className="ink-stamp flex items-center justify-center w-9 h-9 text-cobalt-soft shrink-0"
            aria-hidden="true"
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="relative space-y-1.5 mb-5">
          <h3 className="font-display text-lg font-bold text-bone leading-tight">Nuits Fauves</h3>
          <p className="flex items-center gap-1.5 text-[11px] text-bone-muted">
            <Calendar className="w-3 h-3" /> Sam. 14 déc · 23:00
          </p>
          <p className="flex items-center gap-1.5 text-[11px] text-bone-muted">
            <MapPin className="w-3 h-3" /> Le Consulat, Paris
          </p>
        </div>

        <div className="relative bg-stub p-4 rounded-xl flex items-center justify-center">
          <QRCode value="TYKS-APERCU" size={120} level="H" includeMargin={false} fgColor="#0B0B0E" bgColor="#F1EAD9" />
        </div>
      </div>

      <div className="ticket-seam bg-onyx-raised border border-bone/10 rounded-b-[24px] px-6 py-3 flex items-center justify-between">
        <span className="font-mono text-[10px] tracking-[0.08em] text-bone-faint">N° APERÇU</span>
        <span className="font-mono text-[10px] text-bone-faint">45 €</span>
      </div>
    </div>
  );
}
