import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Distinction des sous-domaines
  const isDashboard = hostname.startsWith('dashboard.')
  const isMarketingPro = hostname.startsWith('pro.')

  // 1. Si on est sur dashboard.tyks.app : tout le site est protégé (sauf auth/callback)
  if (isDashboard) {
    const isAuthRoute = url.pathname.startsWith('/auth')
    
    if ((error || !user) && !isAuthRoute) {
      // S'il n'est pas connecté sur le dashboard, on le renvoie vers la landing pro (ou vers la page de login)
      const loginUrl = new URL('https://pro.tyks.app', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 2. Si on est sur pro.tyks.app (Landing page marketing), pas besoin de bloquer l'accès public,
  // la Navbar s'affichera grâce au layout marketing.

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}
