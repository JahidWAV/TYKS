import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = supabaseServer
    // @ts-ignore
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirection propre vers l'espace organisateur
  return NextResponse.redirect(`${origin}/organisateur`)
}
