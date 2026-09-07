import { Calendar, MapPin, ArrowUpRight } from "lucide-react";
import type { IortiEvent } from "@/types/event";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(cents: number, currency: string) {
  if (cents === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

export default function EventCard({ event }: { event: IortiEvent }) {
  return (
    <article className="group rounded-2xl overflow-hidden border border-onyx-line bg-onyx-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-cobalt/30">
      <div className="relative h-56 overflow-hidden bg-onyx">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-bone-faint text-xs">
            Visuel à venir
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
        {event.tag && (
          <div className="absolute top-3.5 left-3.5 text-[11px] font-medium text-bone/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-bone/10">
            {event.tag}
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-lg font-bold text-bone leading-tight">{event.title}</h3>
          <div className="mt-2 flex flex-col gap-1 text-xs text-bone/70">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {formatDate(event.starts_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {event.location}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-3.5 flex items-center justify-between">
        <span className="font-mono text-base font-bold text-bone">
          {formatPrice(event.price_cents, event.currency)}
        </span>
        <button
          disabled
          title="La billetterie en ligne arrive bientôt"
          className="flex items-center gap-1.5 text-bone-faint text-xs font-semibold cursor-not-allowed"
        >
          <span>Bientôt</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
}
