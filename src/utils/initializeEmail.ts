import { initializeEmailService as initEmailService, getEmailService } from '../services/emailService';
import { getEmailConfig } from '../config/emailConfig';

// Inicializar el servicio de email
export const initializeEmailService = () => {
  try {
    console.log('🔧 Inicializando servicio de email...');
    
    // Verificar si hay configuración de email disponible
    const hasEmailConfig = import.meta.env.VITE_EMAIL_API_KEY || 
                          import.meta.env.VITE_SENDGRID_API_KEY || 
                          import.meta.env.VITE_MAILGUN_API_KEY || 
                          import.meta.env.VITE_RESEND_API_KEY;
    
    if (!hasEmailConfig) {
      console.log('⚠️ No hay configuración de email disponible, usando modo desarrollo');
      console.log('📧 Para configurar email real, lee CONFIGURACION-EMAIL.md');
      return true; // No es un error, solo modo desarrollo
    }
    
    // Obtener configuración del servicio de email
    const emailConfig = getEmailConfig('supabase'); // Cambiar por el servicio que prefieras
    
    // Inicializar el servicio
    const emailService = initEmailService(emailConfig);
    
    if (emailService) {
      console.log('✅ Servicio de email inicializado correctamente');
      console.log('📧 Configuración:', {
        service: emailConfig.service,
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName
      });
      return true;
    } else {
      console.log('⚠️ Servicio de email no disponible, usando modo desarrollo');
      return true; // No es un error crítico
    }
  } catch (error) {
    console.error('❌ Error en inicialización de email:', error);
    console.log('⚠️ Continuando en modo desarrollo sin email real');
    return true; // No bloquear la aplicación
  }
};


// Verificar si el servicio de email está disponible
export const isEmailServiceAvailable = (): boolean => {
  const emailService = getEmailService();
  return emailService !== null;
};

// Obtener información del servicio de email
export const getEmailServiceInfo = () => {
  const emailService = getEmailService();
  
  if (emailService) {
    return {
      available: true,
      service: 'Email service initialized',
      status: 'ready'
    };
  } else {
    return {
      available: false,
      service: 'Email service not initialized',
      status: 'not_ready'
    };
  }
};
