export const NOTIFICATION_CONFIG = {
  // Configuración de notificaciones
  ENABLED: true,
  
  // Tiempo de duración de las notificaciones (en milisegundos)
  DURATION: 10000, // 10 segundos
  
  // Configuración de iconos
  ICONS: {
    appointment: '/favicon.ico',
    test: '/favicon.ico'
  },
  
  // Mensajes personalizados
  MESSAGES: {
    appointmentCreated: {
      title: '🆕 Nueva Cita Reservada',
      body: 'Un cliente ha reservado una nueva cita'
    },
    appointmentCancelled: {
      title: '❌ Cita Cancelada',
      body: 'Un cliente ha cancelado su cita'
    },
    test: {
      title: '🔔 Notificación de Prueba',
      body: 'Las notificaciones están funcionando correctamente'
    }
  },
  
  // Configuración de acciones (no compatible con Notification constructor)
  // ACTIONS: [
  //   {
  //     action: 'view',
  //     title: 'Ver Cita'
  //   }
  // ],
  
  // Configuración de sonido (opcional)
  SOUND: {
    enabled: false,
    url: '/notification-sound.mp3'
  }
};

export default NOTIFICATION_CONFIG;
