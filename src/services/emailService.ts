// Servicio de email para envío de correos de recuperación
export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  service: 'sendgrid' | 'mailgun' | 'resend' | 'supabase';
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  // Enviar email de recuperación de contraseña
  async sendPasswordRecoveryEmail(
    toEmail: string, 
    recoveryLink: string, 
    userName?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('📧 Enviando email de recuperación a:', toEmail);

      const template = this.createRecoveryEmailTemplate(recoveryLink, userName);

      switch (this.config.service) {
        case 'sendgrid':
          return await this.sendWithSendGrid(toEmail, template);
        case 'mailgun':
          return await this.sendWithMailgun(toEmail, template);
        case 'resend':
          return await this.sendWithResend(toEmail, template);
        case 'supabase':
          return await this.sendWithSupabase(toEmail, template);
        default:
          return {
            success: false,
            message: 'Servicio de email no configurado'
          };
      }
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return {
        success: false,
        message: 'Error interno al enviar el email'
      };
    }
  }

  // Crear template de email de recuperación
  private createRecoveryEmailTemplate(recoveryLink: string, userName?: string): EmailTemplate {
    const displayName = userName || 'Usuario';
    
    return {
      subject: '🔐 Recuperación de Contraseña - Barbería Elite',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de Contraseña</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperación de Contraseña</h1>
              <p>Barbería Elite - Experiencia Premium</p>
            </div>
            <div class="content">
              <h2>Hola ${displayName},</h2>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Barbería Elite.</p>
              <p>Para crear una nueva contraseña, haz clic en el botón de abajo:</p>
              
              <div style="text-align: center;">
                <a href="${recoveryLink}" class="button">🔑 Restablecer Contraseña</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este enlace expira en <strong>1 hora</strong></li>
                  <li>Solo puedes usarlo <strong>una vez</strong></li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                </ul>
              </div>
              
              <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px; font-family: monospace;">
                ${recoveryLink}
              </p>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <p>Saludos,<br>El equipo de Barbería Elite</p>
            </div>
            <div class="footer">
              <p>Este email fue enviado automáticamente. Por favor, no respondas a este mensaje.</p>
              <p>© 2024 Barbería Elite. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Recuperación de Contraseña - Barbería Elite
        
        Hola ${displayName},
        
        Recibimos una solicitud para restablecer la contraseña de tu cuenta en Barbería Elite.
        
        Para crear una nueva contraseña, visita este enlace:
        ${recoveryLink}
        
        IMPORTANTE:
        - Este enlace expira en 1 hora
        - Solo puedes usarlo una vez
        - Si no solicitaste este cambio, ignora este email
        
        Si tienes alguna pregunta, no dudes en contactarnos.
        
        Saludos,
        El equipo de Barbería Elite
        
        ---
        Este email fue enviado automáticamente. Por favor, no respondas a este mensaje.
        © 2024 Barbería Elite. Todos los derechos reservados.
      `
    };
  }

  // Envío con SendGrid
  private async sendWithSendGrid(toEmail: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: toEmail }],
            subject: template.subject
          }],
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName
          },
          content: [
            {
              type: 'text/plain',
              value: template.text
            },
            {
              type: 'text/html',
              value: template.html
            }
          ]
        })
      });

      if (response.ok) {
        console.log('✅ Email enviado con SendGrid');
        return { success: true, message: 'Email enviado exitosamente' };
      } else {
        const error = await response.text();
        console.error('❌ Error SendGrid:', error);
        return { success: false, message: 'Error enviando email con SendGrid' };
      }
    } catch (error) {
      console.error('❌ Error SendGrid:', error);
      return { success: false, message: 'Error de conexión con SendGrid' };
    }
  }

  // Envío con Mailgun
  private async sendWithMailgun(toEmail: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    try {
      const formData = new FormData();
      formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
      formData.append('to', toEmail);
      formData.append('subject', template.subject);
      formData.append('text', template.text);
      formData.append('html', template.html);

      const response = await fetch(`https://api.mailgun.net/v3/${this.config.fromEmail.split('@')[1]}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`api:${this.config.apiKey}`)}`
        },
        body: formData
      });

      if (response.ok) {
        console.log('✅ Email enviado con Mailgun');
        return { success: true, message: 'Email enviado exitosamente' };
      } else {
        const error = await response.text();
        console.error('❌ Error Mailgun:', error);
        return { success: false, message: 'Error enviando email con Mailgun' };
      }
    } catch (error) {
      console.error('❌ Error Mailgun:', error);
      return { success: false, message: 'Error de conexión con Mailgun' };
    }
  }

  // Envío con Resend
  private async sendWithResend(toEmail: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.config.fromEmail,
          to: [toEmail],
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      });

      if (response.ok) {
        console.log('✅ Email enviado con Resend');
        return { success: true, message: 'Email enviado exitosamente' };
      } else {
        const error = await response.text();
        console.error('❌ Error Resend:', error);
        return { success: false, message: 'Error enviando email con Resend' };
      }
    } catch (error) {
      console.error('❌ Error Resend:', error);
      return { success: false, message: 'Error de conexión con Resend' };
    }
  }

  // Envío con Supabase (usando Edge Functions)
  private async sendWithSupabase(toEmail: string, template: EmailTemplate): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: toEmail,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      });

      if (response.ok) {
        console.log('✅ Email enviado con Supabase');
        return { success: true, message: 'Email enviado exitosamente' };
      } else {
        const error = await response.text();
        console.error('❌ Error Supabase:', error);
        return { success: false, message: 'Error enviando email con Supabase' };
      }
    } catch (error) {
      console.error('❌ Error Supabase:', error);
      return { success: false, message: 'Error de conexión con Supabase' };
    }
  }
}

// Instancia global del servicio de email
let emailService: EmailService | null = null;

export const initializeEmailService = (config: EmailConfig) => {
  emailService = new EmailService(config);
  return emailService;
};

export const getEmailService = (): EmailService | null => {
  return emailService;
};



