import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rotas protegidas: /dashboard/*
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    // Verifica tipo do usuário via profile no banco (não confia em user_metadata)
    const { data: profile } = await supabase
      .from("profiles")
      .select("tipo")
      .eq("id", user.id)
      .single()

    const tipo = profile?.tipo

    // Gestor tentando acessar rota de voluntário
    if (
      request.nextUrl.pathname.startsWith("/dashboard/voluntario") &&
      tipo === "gestor"
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard/gestor"
      return NextResponse.redirect(url)
    }

    // Voluntário tentando acessar rota de gestor
    if (
      request.nextUrl.pathname.startsWith("/dashboard/gestor") &&
      tipo !== "gestor"
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard/voluntario"
      return NextResponse.redirect(url)
    }
  }

  // Redireciona usuários autenticados para fora das páginas de auth
  // Ignora POST (server actions) e a página de cadastro-sucesso
  if (
    request.nextUrl.pathname.startsWith("/auth") &&
    user &&
    request.method === "GET" &&
    !request.nextUrl.pathname.includes("/cadastro-sucesso")
  ) {
    // Só redireciona se o profile já existe (fluxo de cadastro pode ainda não ter criado)
    const { data: profile } = await supabase
      .from("profiles")
      .select("tipo")
      .eq("id", user.id)
      .single()

    if (profile) {
      const url = request.nextUrl.clone()
      url.pathname = profile.tipo === "gestor" ? "/dashboard/gestor" : "/dashboard/voluntario"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
