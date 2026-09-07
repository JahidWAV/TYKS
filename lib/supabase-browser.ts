import { createClient } from "@supabase/supabase-js";

// Client "public" : n'utilise que la clé anon. Grâce à la Row Level Security
// définie dans supabase/schema.sql, il ne peut lire que les événements
// publiés, et ne peut rien écrire. Sûr à utiliser dans des composants client.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);
