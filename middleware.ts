import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  await supabase.auth.getUser()

  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Laisser passer directement toutes les requêtes vers les routes API et les fichiers statiques gérés par le matcher
  if (url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Détection des domaines (en gérant aussi le préfixe 'www.' par sécurité)
  const isAppDomain = hostname.includes('tyks.app')
  const isFrDomain = hostname.includes('tyks.fr')

  // 1. Sur tyks.app -> Tout va directement dans le dossier /dashboard (ou les pages de gestion connectées)
  if (isAppDomain) {
    // Si on tape la racine de tyks.app, on l'envoie sur /dashboard
    if (url.pathname === '/') {
      url.pathname = '/dashboard'
      return NextResponse.rewrite(url)
    }
    
    // Si l'URL n'est pas déjà préfixée par /dashboard, on l'ajoute pour correspondre à ton arborescence
    if (!url.pathname.startsWith('/dashboard')) {
      url.pathname = `/dashboard${url.pathname}`
    }
    return NextResponse.rewrite(url)
  }

  // 2. Sur tyks.fr (Vitrine / Site Public)
  // On route vers ton dossier /public pour la home, ou on laisse passer /events et /settings
  if (url.pathname.startsWith('/events') || url.pathname.startsWith('/settings') || url.pathname.startsWith('/pro')) {
    return NextResponse.next()
  }

  if (url.pathname === '/') {
    url.pathname = '/public'
    return NextResponse.rewrite(url)
  }

  // Par défaut sur la vitrine, si l'URL n'est pas déjà dans /public
  if (!url.pathname.startsWith('/public')) {
    url.pathname = `/public${url.pathname}`
  }
  
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, auth/callback
     * - Any file with an extension (e.g. .svg, .png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\..*).*)',
  ],
}
