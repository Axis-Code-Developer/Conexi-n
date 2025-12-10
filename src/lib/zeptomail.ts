import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/";
const token = process.env.ZEPTO_MAIL_TOKEN!;

if (!token) {
  console.warn("⚠️ ZEPTO_MAIL_TOKEN is not defined in environment variables.");
}

const client = new SendMailClient({ url, token });

export async function sendInvitationEmail(
  toEmail: string, 
  toName: string, 
  inviteLink: string
) {
  try {
    const response = await client.sendMail({
      "from": {
        "address": process.env.ZEPTO_FROM_EMAIL!,
        "name": process.env.ZEPTO_FROM_NAME!
      },
      "to": [
        {
          "email_address": {
            "address": toEmail,
            "name": toName
          }
        }
      ],
      "subject": "Invitación a Ministerio Conexión",
      "htmlbody": `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hola ${toName},</h2>
          <p>Has sido invitado a formar parte del equipo en <strong>Ministerio Conexión</strong>.</p>
          <p>Para aceptar la invitación y configurar tu cuenta, haz clic en el siguiente enlace:</p>
          <a href="${inviteLink}" style="display: inline-block; background-color: #313131; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Aceptar Invitación
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Este enlace expira en 48 horas.
          </p>
        </div>
      `
    });
    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending email via ZeptoMail:", error);
    return { success: false, error };
  }
}
