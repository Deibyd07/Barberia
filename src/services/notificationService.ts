import { NOTIFICATION_CONFIG } from '../config/notificationConfig';

class NotificationService {
  private static isSupported(): boolean {
    return 'Notification' in window;
  }

  private static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async initialize(): Promise<boolean> {
    if (!NOTIFICATION_CONFIG.ENABLED) {
      console.log('⚠️ Notificaciones deshabilitadas en configuración');
      return false;
    }

    if (!this.isSupported()) {
      console.log('❌ Notificaciones no soportadas en este navegador');
      return false;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log('❌ Permisos de notificación denegados');
      return false;
    }

    console.log('✅ Notificaciones configuradas correctamente');
    return true;
  }

  static async showAppointmentNotification(appointment: any, type: 'created' | 'cancelled'): Promise<void> {
    if (!this.isSupported() || !NOTIFICATION_CONFIG.ENABLED) return;

    const config = NOTIFICATION_CONFIG.MESSAGES[type === 'created' ? 'appointmentCreated' : 'appointmentCancelled'];
    
    const title = config.title;
    const body = `${config.body}\n\nCliente: ${appointment.clientName}\nServicio: ${appointment.service}\nFecha: ${appointment.date}\nHora: ${appointment.time}`;

    try {
      const notification = new Notification(title, {
        body,
        icon: NOTIFICATION_CONFIG.ICONS.appointment,
        badge: NOTIFICATION_CONFIG.ICONS.appointment,
        tag: `appointment-${appointment.id}`,
        requireInteraction: true
        // Removido: actions: NOTIFICATION_CONFIG.ACTIONS (no compatible con Notification constructor)
      });

      // Auto-cerrar después del tiempo configurado
      setTimeout(() => {
        notification.close();
      }, NOTIFICATION_CONFIG.DURATION);

      // Manejar click en la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
        // Navegar a la página de administración
        window.location.href = '/admin';
      };

    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
    }
  }

  static async showTestNotification(): Promise<void> {
    if (!this.isSupported() || !NOTIFICATION_CONFIG.ENABLED) return;

    const config = NOTIFICATION_CONFIG.MESSAGES.test;
    
    try {
      const notification = new Notification(config.title, {
        body: config.body,
        icon: NOTIFICATION_CONFIG.ICONS.test,
        tag: 'test-notification'
      });

      setTimeout(() => {
        notification.close();
      }, NOTIFICATION_CONFIG.DURATION);

    } catch (error) {
      console.error('❌ Error mostrando notificación de prueba:', error);
    }
  }
}

export default NotificationService;
