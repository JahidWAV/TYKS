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

  const { data: { user }, error } = await supabase.auth.getUser()
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  const isDashboard = hostname.startsWith('dashboard.')
  const isMarketingPro = hostname.startsWith('pro.')

  // 1. Gestion du Dashboard (dashboard.tyks.app)
  if (isDashboard) {
    const isAuthRoute = url.pathname.startsWith('/auth')
    if ((error || !user) && !isAuthRoute) {
      return NextResponse.redirect(new URL('https://pro.tyks.app', request.url))
    }
    url.pathname = `/dashboard${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // 2. Gestion de la Landing Pro (pro.tyks.app)
  if (isMarketingPro) {
    url.pathname = `/pro${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // 3. Site Public par défaut (tyks.app)
  url.pathname = `/public${url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}
