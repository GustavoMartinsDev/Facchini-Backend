import type { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

const FACCHINI_COLOR = "#F5B301";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const API_KEY = process.env.CONTACT_API_KEY || "";
  const clientKey = req.headers["x-api-key"];
  if (!clientKey || clientKey !== API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") return res.status(405).end();

  const { name, phone, email, message, isArchitect } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const to = ["g.hildebrand@w2gcreative.com.br"];
  const cc = ["gutofm10@gmail.com"];

  if (isArchitect) {
    cc.push("gustavomartins.developer@gmail.com");
  }

  const html = `
    <div style="background: #111; color: #fff; font-family: Arial, sans-serif; border-radius: 12px; padding: 32px; max-width: 500px; margin: auto;">
      <h2 style="color: ${FACCHINI_COLOR}; margin-bottom: 24px;">Novo contato Facchini</h2>
      <p style="background: #111; color: #fff;"><strong style="background: #111; color: #fff;">Nome:</strong> ${name}</p>
      <p style="background: #111; color: #fff;"><strong style="background: #111; color: #fff;">Telefone:</strong> ${phone}</p>
      <p style="background: #111; color: #fff;"><strong style="background: #111; color: #fff;">E-mail:</strong> ${email}</p>
      <p style="background: #111; color: #fff;"><strong style="background: #111; color: #fff;">Mensagem:</strong><br/>${message}</p>
      <p style="background: #111; color: #fff;"><strong style="background: #111; color: #fff;">Tipo de lead:</strong> ${
        isArchitect ? "Arquiteto(a)" : "Cliente"
      }</p>
      <hr style="border-color: ${FACCHINI_COLOR}; margin: 24px 0;" />
      <p style="font-size: 12px; color: #aaa;">Facchini Engenharia - contato gerado pelo site</p>
    </div>
  `;

  try {
    await sgMail.send({
      from: "contato@facchiniengenharia.com.br",
      to,
      cc,
      subject: "Novo contato recebido pelo site",
      html,
    });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("SendGrid error:", error);
    return res.status(500).json({
      error: error?.message || "Falha ao enviar e-mail.",
      details: error,
    });
  }
}
