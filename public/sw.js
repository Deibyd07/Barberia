// Service Worker para notificaciones push
const CACHE_NAME = 'barberia-notifications-v1';

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(self.clients.claim());
});

// Escuchar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('📨 Service Worker recibió mensaje:', event.data);
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    console.log('🔔 Mostrando notificación:', { title, options });
    
    // Mostrar notificación con opciones simplificadas
    const notificationOptions = {
      body: options.body || 'Notificación de prueba',
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag || 'barberia-notification',
      requireInteraction: false, // Cambiado a false para que no requiera interacción
      data: options.data || {}
    };
    
    console.log('📋 Opciones de notificación:', notificationOptions);
    
    self.registration.showNotification(title, notificationOptions)
      .then(() => {
        console.log('✅ Notificación mostrada exitosamente');
      })
      .catch((error) => {
        console.error('❌ Error mostrando notificación:', error);
      });
  }
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Push recibido:', event);
  
  let notificationData = {
    title: 'Nueva Notificación',
    body: 'Tienes una nueva notificación de la barbería',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'barberia-notification',
    requireInteraction: true,
    actions: [
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
    ]
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        data: data
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Abrir la aplicación
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// Manejar notificaciones cerradas
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event);
});
