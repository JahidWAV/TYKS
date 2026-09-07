import "server-only";
import { PrivyClient } from "@privy-io/server-auth";
import type { NextRequest } from "next/server";

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID as string,
  process.env.PRIVY_APP_SECRET as string
);

/**
 * Lit le header "Authorization: Bearer <token>" d'une requête API, vérifie
 * sa signature auprès de Privy, et renvoie le DID de l'utilisateur
 * (ex: "did:privy:clxxxxxx") si le token est valide.
 *
 * Le front doit envoyer ce header sur chaque appel protégé :
 *   const token = await getAccessToken(); // depuis usePrivy()
 *   fetch("/api/events", { headers: { Authorization: `Bearer ${token}` } })
 *
 * Renvoie null si le token est absent, expiré ou invalide — ne lève jamais.
 */
export async function getPrivyUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length);
  if (!token) return null;

  try {
    const claims = await privy.verifyAuthToken(token);
    return claims.userId;
  } catch {
    // Token invalide, expiré, ou app mal configurée : traité comme non-authentifié.
    return null;
  }
}
