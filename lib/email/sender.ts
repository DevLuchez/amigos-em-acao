import nodemailer from 'nodemailer';

// Cria o transporter utilizando Gmail genérico
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface SendEmailOptions {
  to?: string | string[];
  bcc?: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, bcc, subject, html }: SendEmailOptions) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('⚠️ EMAIL_USER e EMAIL_PASS não estão configurados no seu .env.local');
    throw new Error('As variáveis de e-mail não estão configuradas.');
  }

  try {
    const info = await transporter.sendMail({
      from: `"Amigos em Ação" <${process.env.EMAIL_USER}>`,
      to,
      bcc,
      subject,
      html,
    });
    
    console.log('[Email Sender] Mensagem enviada com sucesso: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email Sender] Erro ao disparar e-mail:', error);
    return { success: false, error };
  }
}
