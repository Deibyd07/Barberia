import React from 'react';
import NotificationService from '../../services/notificationService';

const NotificationTest: React.FC = () => {
  const handleTestNotification = async () => {
    try {
      await NotificationService.showTestNotification();
    } catch (error) {
      console.error('Error testing notification:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🔔 Prueba de Notificaciones
      </h3>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Prueba las notificaciones para verificar que funcionan correctamente en tu dispositivo.
        </p>
        
        <button
          onClick={handleTestNotification}
          className="w-full bg-barber-gold text-white px-4 py-2 rounded-lg hover:bg-barber-gold/90 transition-colors duration-200 font-medium"
        >
          🔔 Probar Notificación
        </button>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Las notificaciones aparecerán cuando:</p>
          <p>  - Un cliente reserve una cita</p>
          <p>  - Un cliente cancele una cita</p>
          <p>• Asegúrate de permitir notificaciones en tu navegador</p>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;


