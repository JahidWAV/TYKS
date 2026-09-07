import "server-only";
import { supabaseServer } from "./supabase-server";

export type OrgRole = "owner" | "editor" | "viewer";

export interface Membership {
  organizationId: string;
  organizationName: string;
  role: OrgRole;
}

/**
 * Renvoie l'appartenance d'un utilisateur Privy à une organisation, ou null
 * s'il n'en a aucune. (Un utilisateur = un seul workspace organisateur pour
 * l'instant, comme un compte pro Shotgun classique.)
 */
export async function getMembership(privyUserId: string): Promise<Membership | null> {
  const { data, error } = await supabaseServer
    .from("organization_members")
    .select("organization_id, role, organizations(name)")
    .eq("privy_user_id", privyUserId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    organizationId: data.organization_id,
    // @ts-expect-error -- la relation Supabase renvoie un objet, pas un tableau, en .maybeSingle()
    organizationName: data.organizations?.name ?? "Organisation",
    role: data.role as OrgRole,
  };
}

/** true si le rôle a le droit de créer/modifier des événements. */
export function canEdit(role: OrgRole): boolean {
  return role === "owner" || role === "editor";
}

/** true si le rôle a le droit de supprimer des événements ou gérer l'équipe. */
export function canDelete(role: OrgRole): boolean {
  return role === "owner";
}
