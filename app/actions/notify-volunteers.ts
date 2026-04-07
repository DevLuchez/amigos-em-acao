"use server"

import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/email/sender"

export async function notifyVolunteersAboutEvent(
  evento: {
    id: string
    titulo: string
    descricao: string
    categoria: string
    data: string
  },
  tipoAcao: "criado" | "atualizado" | "excluido" = "criado"
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Busca os e-mails apenas dos perfis que continuam ATIVOS na ONG (tabela local)
    const { data: perfis, error } = await supabaseAdmin.from("profiles").select("email")

    if (error) {
      console.error("[notifyVolunteers] Erro ao buscar usuários: ", error)
      return { success: false, error: error.message }
    }

    if (!perfis || perfis.length === 0) {
      console.log("[notifyVolunteers] Nenhum usuário ativo encontrado para notificar.")
      return { success: true }
    }

    // 2. Transforma na lista final de e-mails
    const emails = perfis.map(u => u.email).filter(Boolean) as string[]
    
    if (emails.length === 0) {
      return { success: true }
    }

    // 2. Formata a data para ficar bonita no Email (ex: 15/04/2026 às 14:00)
    const dataFormatada = new Date(evento.data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // 3. Define as Cores e os Textos baseados na Ação
    let tituloEmail = ""
    let saudacaoEmail = ""
    let corBanner = ""
    let assuntoEmail = ""

    switch (tipoAcao) {
      case "atualizado":
        tituloEmail = "EVENTO ATUALIZADO"
        corBanner = "#f59e0b" // Laranja
        saudacaoEmail = "Olá, Amigo(a)! Um evento abaixo acaba de ser atualizado, confira as novas informações:"
        assuntoEmail = `🔄 Evento Atualizado: ${evento.titulo}`
        break
      case "excluido":
        tituloEmail = "EVENTO CANCELADO"
        corBanner = "#ef4444" // Vermelho
        saudacaoEmail = "Olá, Amigo(a)! Infelizmente o evento abaixo foi cancelado pela gestão. Agradecemos a sua disponibilidade de sempre, fique atento para entrar em ação em novas oportunidades!"
        assuntoEmail = `❌ Evento Cancelado: ${evento.titulo}`
        break
      case "criado":
      default:
        tituloEmail = "NOVO EVENTO: Amigos em Ação"
        corBanner = "#000" // Preto
        saudacaoEmail = "Olá, Amigo(a)! Temos uma nova oportunidade de entrar em ação!"
        assuntoEmail = `🚨 Novo Evento Criado: ${evento.titulo}`
        break
    }

    // 4. Monta o corpo do e-mail em HTML
    const htmlEmail = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${corBanner}; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">${tituloEmail}</h1>
        </div>
        
        <div style="padding: 30px; background-color: #fcfcfc;">
          <p style="font-size: 16px; line-height: 1.5;">${saudacaoEmail}</p>
          
          <div style="background-color: #fff; border-left: 4px solid ${corBanner}; padding: 20px; margin: 25px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <h2 style="margin-top: 0; color: #000;">${evento.titulo}</h2>
            <p style="margin: 5px 0; color: #666;"><strong>Data e Hora:</strong> ${dataFormatada}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Categoria:</strong> ${evento.categoria}</p>
            <p style="margin-top: 15px; line-height: 1.6;"><strong>Descrição:</strong> ${evento.descricao}</p>
          </div>
          
          <p style="font-size: 16px;">Acesse a plataforma utilizando a sua conta para conferir os detalhes completos e se inscrever nas vagas limitadas!</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://www.amigos-em-acao.online/auth/login" style="background-color: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block;">Acessar Plataforma</a>
          </div>
        </div>
        
        <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 12px; color: #999;">
          <p>Você está recebendo este e-mail pois está cadastrado como voluntário na Associação Amigos em Ação de Jaraguá do Sul.</p>
        </div>
      </div>
    `

    // 5. Dispara o E-mail
    console.log('[notifyVolunteers] Disparando e-mail para', emails.length, 'voluntários com ação:', tipoAcao)
    await sendEmail({
      to: process.env.EMAIL_USER,
      bcc: emails,
      subject: assuntoEmail,
      html: htmlEmail
    })

    return { success: true }
  } catch (error: any) {
    console.error("[notifyVolunteers] Erro catastrófico: ", error)
    return { success: false, error: error.message }
  }
}
