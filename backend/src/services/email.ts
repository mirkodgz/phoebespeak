import nodemailer from 'nodemailer';

// Configuración del transporter de email
// Puedes usar Gmail, SendGrid, o cualquier servicio SMTP
const createTransporter = () => {
  // Si tienes variables de entorno para SMTP, úsalas aquí
  // Por defecto, usaremos Gmail (requiere configuración de "App Password")
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Configuración para Gmail (requiere App Password)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  // Si no hay configuración, usar un transporter de prueba (solo para desarrollo)
  // En producción, esto fallará
  console.warn('[email] No SMTP configuration found. Using test account (emails will not be sent).');
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'test@ethereal.email',
      pass: 'test',
    },
  });
};

export const sendOTPEmail = async (
  email: string,
  code: string,
): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Phoebe App <noreply@phoebe.app>',
    to: email,
    subject: 'Codice di verifica - Reimposta password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #0B3D4D; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Phoebe</h1>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #0B3D4D; margin-top: 0;">Reimposta la tua password</h2>
            
            <p>Ciao,</p>
            
            <p>Hai richiesto di reimpostare la password per il tuo account Phoebe.</p>
            
            <p><strong>Il tuo codice di verifica è:</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px 30px; background-color: #f0f7fa; border: 3px solid #0B3D4D; border-radius: 8px; color: #0B3D4D;">
                ${code}
              </div>
            </div>
            
            <p>Inserisci questo codice nell'app Phoebe per completare il processo di reimpostazione password.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <strong>Importante:</strong> Questo codice scadrà tra 10 minuti. Se non hai richiesto questo reset, ignora questa email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Reimposta la tua password - Phoebe

Ciao,

Hai richiesto di reimpostare la password per il tuo account Phoebe.

Il tuo codice di verifica è: ${code}

Inserisci questo codice nell'app Phoebe per completare il processo.

Importante: Questo codice scadrà tra 10 minuti. Se non hai richiesto questo reset, ignora questa email.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.info('[email] OTP email sent successfully:', info.messageId);
  } catch (error) {
    console.error('[email] Error sending OTP email:', error);
    throw new Error('Impossibile inviare l\'email. Verifica la configurazione SMTP.');
  }
};


