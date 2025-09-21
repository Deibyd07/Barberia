import { EmailConfig } from '../services/emailService';

// Configuración del servicio de email
// Puedes cambiar el servicio y las credenciales según tus necesidades

export const emailConfig: EmailConfig = {
  // Servicio de email a usar
  service: 'supabase', // 'sendgrid' | 'mailgun' | 'resend' | 'supabase'
  
  // Configuración del remitente
  fromEmail: 'noreply@barberia-elite.com',
  fromName: 'Barbería Elite',
  
  // API Key del servicio (configurar en variables de entorno)
  apiKey: import.meta.env.VITE_EMAIL_API_KEY || 'your-api-key-here'
};

// Configuraciones específicas por servicio
export const emailServiceConfigs = {
  sendgrid: {
    service: 'sendgrid' as const,
    fromEmail: 'noreply@barberia-elite.com',
    fromName: 'Barbería Elite',
    apiKey: import.meta.env.VITE_SENDGRID_API_KEY || 'your-sendgrid-api-key'
  },
  
  mailgun: {
    service: 'mailgun' as const,
    fromEmail: 'noreply@barberia-elite.com',
    fromName: 'Barbería Elite',
    apiKey: import.meta.env.VITE_MAILGUN_API_KEY || 'your-mailgun-api-key'
  },
  
  resend: {
    service: 'resend' as const,
    fromEmail: 'noreply@barberia-elite.com',
    fromName: 'Barbería Elite',
    apiKey: import.meta.env.VITE_RESEND_API_KEY || 'your-resend-api-key'
  },
  
  supabase: {
    service: 'supabase' as const,
    fromEmail: 'noreply@barberia-elite.com',
    fromName: 'Barbería Elite',
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key'
  }
};

// Función para obtener la configuración según el servicio
export const getEmailConfig = (service: keyof typeof emailServiceConfigs = 'supabase'): EmailConfig => {
  return emailServiceConfigs[service];
};



