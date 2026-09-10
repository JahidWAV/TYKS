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
          response.cookies.set({ name, value, ...options })
        },
      },
    }
  )

  await supabase.auth.getUser()

  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Laisser passer directement toutes les requêtes vers les routes API
  if (url.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const isDashboard = hostname.startsWith('dashboard.')
  const isMarketingPro = hostname.startsWith('pro.')

  // 1. Dashboard (`dashboard.tyks.app`) -> Réécriture prioritaire vers le dossier physique /dashboard[cite: 4]
  // Cela garantit que /events/cc-g945 ou /events/cc-g945/edit sur le dashboard pointent bien vers /dashboard/events/...
  if (isDashboard) {
    url.pathname = `/dashboard${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // 2. Landing Pro (`pro.tyks.app`) -> Réécriture vers le dossier physique /pro[cite: 4]
  if (isMarketingPro) {
    url.pathname = `/pro${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // 3. Site Public (`tyks.app`) : Si on est sur le domaine principal et qu'on va sur /events, on laisse passer directement
  if (url.pathname.startsWith('/events')) {
    return NextResponse.next()
  }

  // 4. Site Public (`tyks.app`) par défaut -> Réécriture vers le dossier physique /public[cite: 4]
  url.pathname = `/public${url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}
