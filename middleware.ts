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

  // 1. Récupérer l'utilisateur courant auprès de Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser()

  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // 2. Si l'utilisateur est sur une page protégée (ex: /organisateur, /new, etc.) 
  // mais que son compte a été supprimé ou que le token est invalide
  const isProtectedPath = url.pathname.startsWith('/organisateur') || url.pathname.startsWith('/new') || url.pathname.startsWith('/api/events')

  if (isProtectedPath && (error || !user)) {
    // Rediriger vers la page de connexion / accueil avec un nettoyage des cookies de session
    const redirectUrl = new URL('/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (callback route)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}
