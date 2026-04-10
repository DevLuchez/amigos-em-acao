"use server"

import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/email/sender"

export async function notifyGestoresNovaSolicitacao(beneficiadoNome: string, necessidade: string) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar emails dos gestores
    const { data: gestores, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("tipo", "gestor")

    if (error || !gestores || gestores.length === 0) {
      return { success: true }
    }

    const emails = gestores.map((g) => g.email).filter(Boolean) as string[]
    if (emails.length === 0) return { success: true }

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #3b82f6; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">NOVA SOLICITAÇÃO DE AJUDA</h1>
        </div>

        <div style="padding: 30px; background-color: #fcfcfc;">
          <p style="font-size: 16px; line-height: 1.5;">Olá, Gestor(a)! Uma nova solicitação de ajuda foi registrada na plataforma.</p>

          <div style="background-color: #fff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="margin-top: 0; color: #000;">${beneficiadoNome}</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Necessidade:</strong> ${necessidade}</p>
          </div>

          <p style="font-size: 16px;">Acesse a plataforma para analisar e aprovar ou reprovar esta solicitação.</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://www.amigos-em-acao.online/auth/login" style="background-color: #3b82f6; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">Acessar Solicitações</a>
          </div>
        </div>

        <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          <p>Você está recebendo este e-mail pois é gestor(a) da Associação Amigos em Ação de Jaraguá do Sul.</p>
        </div>
      </div>
    `

    await sendEmail({
      to: process.env.EMAIL_USER,
      bcc: emails,
      subject: `📋 Nova Solicitação de Ajuda: ${beneficiadoNome}`,
      html: htmlEmail,
    })

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return { success: false, error: message }
  }
}

export async function notifyVoluntariosSolicitacaoAprovada(
  beneficiadoNome: string,
  necessidade: string
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar emails dos voluntários
    const { data: voluntarios, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("tipo", "voluntario")

    if (error || !voluntarios || voluntarios.length === 0) {
      return { success: true }
    }

    const emails = voluntarios.map((v) => v.email).filter(Boolean) as string[]
    if (emails.length === 0) return { success: true }

    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #22c55e; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">SOLICITAÇÃO APROVADA</h1>
        </div>

        <div style="padding: 30px; background-color: #fcfcfc;">
          <p style="font-size: 16px; line-height: 1.5;">Olá, Amigo(a)! Uma nova solicitação de ajuda foi aprovada e está disponível para que um voluntário assuma a responsabilidade.</p>

          <div style="background-color: #fff; border-left: 4px solid #22c55e; padding: 20px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="margin-top: 0; color: #000;">${beneficiadoNome}</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Necessidade:</strong> ${necessidade}</p>
          </div>

          <p style="font-size: 16px;">Acesse a plataforma para conferir os detalhes e assumir esta solicitação!</p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://www.amigos-em-acao.online/auth/login" style="background-color: #22c55e; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">Ver Solicitações</a>
          </div>
        </div>

        <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          <p>Você está recebendo este e-mail pois está cadastrado como voluntário na Associação Amigos em Ação de Jaraguá do Sul.</p>
        </div>
      </div>
    `

    await sendEmail({
      to: process.env.EMAIL_USER,
      bcc: emails,
      subject: `✅ Solicitação Aprovada: ${beneficiadoNome} precisa de ajuda!`,
      html: htmlEmail,
    })

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return { success: false, error: message }
  }
}
