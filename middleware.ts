import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl
  
  // Si on est sur le sous-domaine pro
  if (hostname === 'pro.tyks.app') {
    // Ne pas réécrire pour les fichiers internes, les API, ou le callback d'auth
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/auth/callback') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    // Réécriture transparente vers le dossier /organisateur
    return NextResponse.rewrite(new URL(`/organisateur${url.pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
