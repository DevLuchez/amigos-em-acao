import { createClient } from "@supabase/supabase-js"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // Verificar se o solicitante é gestor
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ success: false, error: "Não autenticado" }, { status: 401 })
  }

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single()

  if (requesterProfile?.tipo !== "gestor") {
    return NextResponse.json({ success: false, error: "Apenas gestores podem criar gestores" }, { status: 403 })
  }

  const { nome, email, telefone, senha } = await request.json()

  if (!nome || !email || !senha || senha.length < 8) {
    return NextResponse.json({ success: false, error: "Dados inválidos" }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Criar usuário no auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, telefone, tipo: "gestor" },
  })

  if (authError) {
    return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
  }

  if (!authData.user) {
    return NextResponse.json({ success: false, error: "Erro ao criar usuário" }, { status: 500 })
  }

  // Criar profile
  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: authData.user.id,
    nome,
    email,
    telefone: telefone || null,
    tipo: "gestor",
  })

  if (profileError) {
    // Rollback: deletar do auth
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
