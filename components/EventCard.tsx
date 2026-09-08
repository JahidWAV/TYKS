import Link from 'next/link';
import { MapPin, ArrowUpRight } from 'lucide-react';
import type { IortiEvent } from '@/types/event';

export default function EventCard({ event }: { event: IortiEvent }) {
  return (
    <Link
      href={`/evenements/${event.id}`}
      className="group p-6 bg-onyx-raised/60 hover:bg-onyx-raised border border-onyx-line rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-6 block"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-bone-faint">
            {new Date(event.starts_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="text-[10px] font-mono text-bone-faint border border-onyx-line px-2 py-0.5 rounded">
            {event.price && parseFloat(event.price) > 0
              ? `${parseFloat(event.price).toFixed(2)} €`
              : 'Gratuit'}
          </span>
        </div>

        <h3 className="font-display text-lg font-bold text-bone tracking-tight group-hover:text-white transition-colors">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-xs text-bone-faint line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-onyx-line flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-bone-muted">
          <MapPin className="w-3.5 h-3.5 text-bone-faint" />
          <span className="truncate max-w-[140px]">{event.location}</span>
        </div>

        <span className="inline-flex items-center gap-1 bg-bone text-onyx font-semibold text-xs px-4 py-2 rounded-full transition-colors group-hover:bg-white">
          <span>Pass</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
