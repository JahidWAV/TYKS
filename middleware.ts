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

  if (url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const isAppDomain = hostname.includes('tyks.app')
  const isProDomain = hostname.startsWith('pro.') // Détecte pro.tyks.fr (ou pro.tyks.app)

  // 1. Landing Pro (`pro.tyks.fr`) -> Réécriture vers le dossier /pro
  if (isProDomain) {
    if (url.pathname === '/') {
      url.pathname = '/pro'
      return NextResponse.rewrite(url)
    }
    if (!url.pathname.startsWith('/pro')) {
      url.pathname = `/pro${url.pathname}`
    }
    return NextResponse.rewrite(url)
  }

  // 2. Sur tyks.app -> Dashboard
  if (isAppDomain) {
    if (url.pathname === '/') {
      url.pathname = '/dashboard'
      return NextResponse.rewrite(url)
    }
    if (!url.pathname.startsWith('/dashboard')) {
      url.pathname = `/dashboard${url.pathname}`
    }
    return NextResponse.rewrite(url)
  }

  // 3. Site Public (`tyks.fr`)
  if (url.pathname.startsWith('/events') || url.pathname.startsWith('/settings') || url.pathname.startsWith('/pro')) {
    return NextResponse.next()
  }

  if (url.pathname === '/') {
    url.pathname = '/public'
    return NextResponse.rewrite(url)
  }

  if (!url.pathname.startsWith('/public')) {
    url.pathname = `/public${url.pathname}`
  }
  
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\..*).*)',
  ],
}
