import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // En production, si on tape sur pro.tyks.app
  if (hostname === 'pro.tyks.app') {
    // On réécrit l'URL en interne vers ton dossier /organisateur
    return NextResponse.rewrite(new URL(`/organisateur${request.nextUrl.pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
