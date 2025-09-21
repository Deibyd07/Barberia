// Servicio para manejar notificaciones push
class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Verificar si las notificaciones están soportadas
  isNotificationSupported(): boolean {
    return this.isSupported;
  }

  // Verificar si ya se tienen permisos
  async hasPermission(): Promise<boolean> {
    if (!this.isSupported) return false;
    return Notification.permission === 'granted';
  }

  // Solicitar permisos de notificación
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Las notificaciones no están soportadas en este navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error solicitando permisos de notificación:', error);
      return false;
    }
  }

  // Registrar el Service Worker
  async registerServiceWorker(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', this.registration);
      return true;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return false;
    }
  }

  // Inicializar el servicio de notificaciones
  async initialize(): Promise<boolean> {
    if (!this.isSupported) return false;

    try {
      // Registrar Service Worker
      const swRegistered = await this.registerServiceWorker();
      if (!swRegistered) return false;

      // Verificar permisos
      const hasPermission = await this.hasPermission();
      if (!hasPermission) {
        console.log('Solicitando permisos de notificación...');
        const permissionGranted = await this.requestPermission();
        if (!permissionGranted) {
          console.warn('Permisos de notificación denegados');
          return false;
        }
      }

      console.log('Servicio de notificaciones inicializado correctamente');
      return true;
    } catch (error) {
      console.error('Error inicializando servicio de notificaciones:', error);
      return false;
    }
  }

  // Enviar notificación local (para pruebas)
  async sendLocalNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    console.log('🔔 sendLocalNotification called:', { title, options });
    console.log('🔍 Service Worker registration:', this.registration);
    console.log('🔍 Has permission:', await this.hasPermission());
    
    if (!this.registration || !await this.hasPermission()) {
      console.warn('❌ No se puede enviar notificación: sin permisos o Service Worker no registrado');
      throw new Error('No se puede enviar notificación: sin permisos o Service Worker no registrado');
    }

    try {
      console.log('📤 Enviando mensaje al Service Worker...');
      // Enviar mensaje al Service Worker
      if (this.registration.active) {
        const message = {
          type: 'SHOW_NOTIFICATION',
          title,
          options: {
            body: options.body || '',
            icon: options.icon || '/favicon.ico',
            badge: options.badge || '/favicon.ico',
            tag: options.tag || 'barberia-notification',
            requireInteraction: options.requireInteraction || true,
            actions: options.actions || [
              {
                action: 'view',
                title: 'Ver detalles',
                icon: '/favicon.ico'
              },
              {
                action: 'close',
                title: 'Cerrar',
                icon: '/favicon.ico'
              }
            ],
            data: options.data || {}
          }
        };
        console.log('📨 Mensaje a enviar:', message);
        this.registration.active.postMessage(message);
        console.log('✅ Mensaje enviado al Service Worker');
      } else {
        console.warn('⚠️ Service Worker no está activo');
        throw new Error('Service Worker no está activo');
      }
    } catch (error) {
      console.error('❌ Error enviando notificación local:', error);
      throw error;
    }
  }

  // Notificar nueva cita
  async notifyNewAppointment(appointment: any): Promise<void> {
    const title = '📅 Nueva Cita Programada';
    const body = `${appointment.clientName} - ${appointment.service} - ${appointment.time}`;
    
    await this.sendLocalNotification(title, {
      body,
      tag: `new-appointment-${appointment.id}`,
      data: {
        type: 'new_appointment',
        appointmentId: appointment.id,
        clientName: appointment.clientName,
        service: appointment.service,
        time: appointment.time,
        date: appointment.date
      }
    });
  }

  // Notificar cita cancelada
  async notifyCancelledAppointment(appointment: any): Promise<void> {
    const title = '❌ Cita Cancelada';
    const body = `${appointment.clientName} - ${appointment.service} - ${appointment.time}`;
    
    await this.sendLocalNotification(title, {
      body,
      tag: `cancelled-appointment-${appointment.id}`,
      data: {
        type: 'cancelled_appointment',
        appointmentId: appointment.id,
        clientName: appointment.clientName,
        service: appointment.service,
        time: appointment.time,
        date: appointment.date
      }
    });
  }

  // Notificar cita confirmada
  async notifyConfirmedAppointment(appointment: any): Promise<void> {
    const title = '✅ Cita Confirmada';
    const body = `${appointment.clientName} - ${appointment.service} - ${appointment.time}`;
    
    await this.sendLocalNotification(title, {
      body,
      tag: `confirmed-appointment-${appointment.id}`,
      data: {
        type: 'confirmed_appointment',
        appointmentId: appointment.id,
        clientName: appointment.clientName,
        service: appointment.service,
        time: appointment.time,
        date: appointment.date
      }
    });
  }

  // Obtener estado del servicio
  getStatus(): {
    supported: boolean;
    hasPermission: boolean;
    serviceWorkerRegistered: boolean;
  } {
    return {
      supported: this.isSupported,
      hasPermission: Notification.permission === 'granted',
      serviceWorkerRegistered: !!this.registration
    };
  }
}

// Instancia singleton
const pushNotificationService = new PushNotificationService();

export default pushNotificationService;
