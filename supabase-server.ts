import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client "admin" : utilise la clé service_role, qui contourne la Row Level
// Security. Ne doit JAMAIS être importé depuis un fichier "use client" ni
// exposé au navigateur — uniquement depuis les routes /app/api/**/route.ts.
// Le paquet "server-only" fait planter le build si ce fichier finit par
// erreur dans un bundle client.
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: { persistSession: false, autoRefreshToken: false },
  }
);
