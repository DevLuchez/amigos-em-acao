"use server"

import { sendEmail } from "@/lib/email/sender"

const SUPPORT_EMAILS = [
  "laura.luchez@gmail.com",
  "danielfercope@gmail.com",
]

export async function sendSupportEmail(formData: FormData) {
  const tipo = formData.get("tipo") as string
  const mensagem = formData.get("mensagem") as string
  const remetente = formData.get("remetente") as string
  const emailRemetente = formData.get("emailRemetente") as string
  const imagem = formData.get("imagem") as File | null

  const tipoLabels: Record<string, string> = {
    duvida: "Dúvida",
    erro: "Erro / Bug",
    sugestao: "Sugestão",
    outro: "Outro",
  }

  const htmlEmail = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #3b82f6; padding: 24px 30px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">📩 NOVO CHAMADO DE SUPORTE</h1>
      </div>

      <div style="padding: 30px; background-color: #fcfcfc;">
        <table style="width: 100%; border-collapse: collapse; font-size: 15px; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Tipo:</strong></td>
            <td style="padding: 8px 0; color: #111;">${tipoLabels[tipo] ?? tipo}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Enviado por:</strong></td>
            <td style="padding: 8px 0; color: #111;">${remetente || "Não informado"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>E-mail:</strong></td>
            <td style="padding: 8px 0; color: #111;">${emailRemetente || "Não informado"}</td>
          </tr>
        </table>

        <div style="background-color: #fff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin-bottom: 24px; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; font-weight: bold; color: #333; margin-bottom: 8px;">Mensagem:</p>
          <p style="margin: 0; white-space: pre-wrap; color: #555; line-height: 1.6;">${mensagem}</p>
        </div>

        ${imagem && imagem.size > 0 ? '<p style="color: #666; font-size: 13px;">📎 Uma imagem foi anexada a este e-mail.</p>' : ""}
      </div>

      <div style="background-color: #eee; padding: 15px; text-align: center; font-size: 12px; color: #999;">
        <p>Este e-mail foi enviado pelo sistema de suporte da plataforma Amigos em Ação.</p>
      </div>
    </div>
  `

  try {
    const attachments: { filename: string; content: Buffer; contentType: string }[] = []

    if (imagem && imagem.size > 0) {
      const buffer = Buffer.from(await imagem.arrayBuffer())
      attachments.push({
        filename: imagem.name || "imagem-anexada",
        content: buffer,
        contentType: imagem.type,
      })
    }

    // sendEmail via nodemailer com suporte a attachments
    const nodemailer = (await import("nodemailer")).default
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Amigos em Ação - Suporte" <${process.env.EMAIL_USER}>`,
      to: SUPPORT_EMAILS,
      subject: `[Suporte] ${tipoLabels[tipo] ?? tipo} — ${remetente || "Usuário"}`,
      html: htmlEmail,
      attachments,
    })

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    return { success: false, error: message }
  }
}
