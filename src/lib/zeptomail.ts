import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/";
const token = process.env.ZEPTO_MAIL_TOKEN!;

if (!token) {
  console.warn("⚠️ ZEPTO_MAIL_TOKEN is not defined in environment variables.");
}

const client = new SendMailClient({ url, token });

function getEmailTemplate(toName: string, inviteLink: string, baseUrl: string): string {
  // Image URLs - these must be publicly accessible
  // In production, NEXTAUTH_URL should be the public domain
  const logoIGC = `${baseUrl}/email-assets/c23685c66edfbd1dff757a3f2f1751471bc0b761.png`;
  const logoMinistry = `${baseUrl}/email-assets/dfa02e6b4fceba0492082722d28e044ff7e3c1fe.png`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Bienvenido a Ministerio Conexión</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px;">
        <!-- Main Container -->
        <table cellpadding="0" cellspacing="0" border="0" width="400" style="background-color: #ffffff; padding: 32px;">
          
          <!-- Header with Logos -->
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="left" style="width: 70px;">
                    <img src="${logoIGC}" alt="IGC Logo" width="70" height="42" style="display: block; object-fit: cover;" />
                  </td>
                  <td align="right" style="width: 46px;">
                    <img src="${logoMinistry}" alt="Ministry Logo" width="46" height="46" style="display: block; border-radius: 8px; object-fit: cover;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td style="height: 32px;"></td></tr>
          
          <!-- Content -->
          <tr>
            <td align="center">
              <!-- Greeting -->
              <p style="font-family: Tahoma, sans-serif; font-size: 24px; color: #000000; margin: 0; text-align: center;">
                👋¡Hola!
              </p>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-top: 8px;">
              <!-- Name -->
              <p style="font-family: Tahoma, sans-serif; font-size: 24px; font-weight: bold; color: #000000; margin: 0; text-align: center;">
                ${toName}
              </p>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-top: 24px;">
              <!-- Message -->
              <p style="font-family: Tahoma, sans-serif; font-size: 14px; color: #000000; margin: 0; text-align: justify; width: 280px; max-width: 280px;">
                Es un honor tenerte en nuestro ministerio en la Iglesia Gran Comisión. Estamos emocionados de ver lo que Dios hará a través de tu vida en este equipo.
              </p>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-top: 16px;">
              <p style="font-family: Tahoma, sans-serif; font-size: 14px; color: #000000; margin: 0; text-align: justify; width: 280px; max-width: 280px;">
                ¡Bienvenido/a a la familia! 🙌
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-top: 24px; padding-bottom: 24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #313131; border-radius: 8px; padding: 12px 24px;">
                    <a href="${inviteLink}" style="font-family: Tahoma, sans-serif; font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; display: inline-block;">
                      Ingresar
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0" width="280">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <p style="font-family: Tahoma, sans-serif; font-size: 12px; color: #7e7e7e; margin: 0; text-align: justify;">
                      5 Pero tú sé sobrio en todo, soporta las aflicciones, haz obra de evangelista, cumple tu ministerio.
                    </p>
                    <p style="font-family: Tahoma, sans-serif; font-size: 12px; font-weight: bold; color: #313131; margin: 8px 0 0 0;">
                      2 Timoteo 4:5
                    </p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="font-family: Tahoma, sans-serif; font-size: 12px; color: #7e7e7e; margin: 0;">
                      Post data: Los quiero mucho equipo 🤗
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendInvitationEmail(
  toEmail: string,
  toName: string,
  inviteLink: string
) {
  // Get base URL from environment - in production this should be your public domain
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const htmlBody = getEmailTemplate(toName, inviteLink, baseUrl);

  try {
    const response = await client.sendMail({
      from: {
        address: process.env.ZEPTO_FROM_EMAIL!,
        name: process.env.ZEPTO_FROM_NAME!
      },
      to: [
        {
          email_address: {
            address: toEmail,
            name: toName
          }
        }
      ],
      subject: "¡Bienvenido a Ministerio Conexión!",
      htmlbody: htmlBody
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Error sending email via ZeptoMail:", error);
    return { success: false, error };
  }
}
