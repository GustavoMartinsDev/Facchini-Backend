import type { NextApiRequest, NextApiResponse } from "next";
import { MailerSend, EmailParams, Recipient } from "mailersend";

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "",
});

const FACCHINI_COLOR = "#F5B301";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const API_KEY = process.env.CONTACT_API_KEY;
  const clientKey = req.headers["x-api-key"];
  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") return res.status(405).end();

  const { name, phone, email, message, isArchitect } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const to = [{ email: "gutofm10@gmail.com", name: "Facchini Lead" }];
  if (isArchitect) {
    to.push({
      email: "gustavomartins.developer@gmail.com",
      name: "Facchini Arquiteto",
    });
  }

  const html = `
    <div style="background: #111; color: #fff; font-family: Arial, sans-serif; border-radius: 12px; padding: 32px; max-width: 500px; margin: auto;">
      <h2 style="color: ${FACCHINI_COLOR}; margin-bottom: 24px;">Novo contato Facchini</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Telefone:</strong> ${phone}</p>
      <p><strong>E-mail:</strong> ${email}</p>
      <p><strong>Mensagem:</strong><br/>${message}</p>
      <p><strong>Tipo de lead:</strong> ${
        isArchitect ? "Arquiteto(a)" : "Cliente"
      }</p>
      <hr style="border-color: ${FACCHINI_COLOR}; margin: 24px 0;" />
      <p style="font-size: 12px; color: #aaa;">Facchini Engenharia - contato gerado pelo site</p>
    </div>
  `;

  const emailParams = new EmailParams()
    .setFrom({
      email: "no-reply@facchiniengenharia.com.br",
      name: "Facchini Site",
    })
    .setTo(to)
    .setSubject("Novo contato recebido pelo site")
    .setHtml(html);

  try {
    await mailersend.email.send(emailParams);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Falha ao enviar e-mail." });
  }
}
