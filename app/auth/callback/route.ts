import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    // Si supabaseServer est déjà une instance configurée, on l'utilise sans les parentheses `()`, 
    // ou si c'est une fonction asynchrone/factory, adapte selon ton fichier lib/supabase-server.ts.
    const supabase = supabaseServer
    // @ts-ignore
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/organisateur`)
}
