"use server"

import { createClient } from "@supabase/supabase-js"
import { notifyGestoresNovaSolicitacao } from "./notify-solicitacoes"

export async function createBeneficiado(data: {
  nome: string
  email: string
  telefone: string
  endereco: string
  bairro: string
  cidade: string
  complemento: string
  necessidade: string
  descricao: string
}) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { data: beneficiado, error: beneficiadoError } = await supabaseAdmin
      .from("beneficiados")
      .insert({
        nome: data.nome,
        email: data.email || null,
        telefone: data.telefone,
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: data.cidade,
        complemento: data.complemento || null,
        necessidade: data.necessidade,
        descricao: data.descricao,
      })
      .select()
      .single()

    if (beneficiadoError) {
      return { success: false, error: `Erro ao cadastrar: ${beneficiadoError.message}` }
    }

    const { error: solicitacaoError } = await supabaseAdmin
      .from("solicitacoes_ajuda")
      .insert({
        beneficiado_id: beneficiado.id,
        status: "nova",
        prioridade: "media",
      })

    if (solicitacaoError) {
      // Beneficiado criado mas solicitação falhou - não é crítico
    }

    // Notificar gestores (fire-and-forget)
    notifyGestoresNovaSolicitacao(data.nome, data.necessidade).catch(() => {})

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return { success: false, error: message }
  }
}
