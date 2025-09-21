import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, XCircle, Settings } from 'lucide-react';
import pushNotificationService from '../../services/pushNotificationService';

const NotificationSettings: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({
    supported: false,
    hasPermission: false,
    serviceWorkerRegistered: false
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = () => {
    const currentStatus = pushNotificationService.getStatus();
    setStatus(currentStatus);
    setIsInitialized(currentStatus.supported && currentStatus.serviceWorkerRegistered);
  };

  const handleInitialize = async () => {
    setIsLoading(true);
    try {
      const success = await pushNotificationService.initialize();
      if (success) {
        checkStatus();
        alert('✅ Notificaciones configuradas correctamente. Ahora recibirás notificaciones de citas en tu celular.');
      } else {
        alert('❌ Error configurando las notificaciones. Verifica que tu navegador soporte notificaciones.');
      }
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
      alert('❌ Error configurando las notificaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    console.log('🔔 Intentando enviar notificación de prueba...');
    console.log('🔍 Estado actual:', { isInitialized, status });
    
    if (!isInitialized) {
      console.warn('⚠️ Notificaciones no inicializadas');
      alert('❌ Primero debes configurar las notificaciones');
      return;
    }

    try {
      console.log('📤 Enviando notificación local...');
      await pushNotificationService.sendLocalNotification(
        '🔔 Prueba de Notificación',
        {
          body: 'Esta es una notificación de prueba. Si ves esto, las notificaciones están funcionando correctamente.',
          tag: 'test-notification'
        }
      );
      console.log('✅ Notificación enviada exitosamente');
    } catch (error) {
      console.error('❌ Error enviando notificación de prueba:', error);
      alert('❌ Error enviando notificación de prueba: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-barber-xl border border-barber-gold/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-barber-gold to-barber-copper rounded-xl shadow-lg glow-gold animate-pulse-slow">
            <Settings className="h-5 w-5 text-barber-black" />
          </div>
          <h2 className="text-xl font-bold text-barber-cream font-display">
            Configuración de Notificaciones
          </h2>
        </div>

        <div className="space-y-4">
          {/* Estado de soporte */}
          <div className="flex items-center justify-between p-4 bg-barber-dark/30 rounded-lg border border-barber-gold/20">
            <div className="flex items-center space-x-3">
              {status.supported ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="text-barber-cream font-barber">
                Soporte de notificaciones
              </span>
            </div>
            <span className={`text-sm font-bold ${
              status.supported ? 'text-green-400' : 'text-red-400'
            }`}>
              {status.supported ? 'Soportado' : 'No soportado'}
            </span>
          </div>

          {/* Estado de permisos */}
          <div className="flex items-center justify-between p-4 bg-barber-dark/30 rounded-lg border border-barber-gold/20">
            <div className="flex items-center space-x-3">
              {status.hasPermission ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="text-barber-cream font-barber">
                Permisos otorgados
              </span>
            </div>
            <span className={`text-sm font-bold ${
              status.hasPermission ? 'text-green-400' : 'text-red-400'
            }`}>
              {status.hasPermission ? 'Permitido' : 'No permitido'}
            </span>
          </div>

          {/* Estado del Service Worker */}
          <div className="flex items-center justify-between p-4 bg-barber-dark/30 rounded-lg border border-barber-gold/20">
            <div className="flex items-center space-x-3">
              {status.serviceWorkerRegistered ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <span className="text-barber-cream font-barber">
                Service Worker registrado
              </span>
            </div>
            <span className={`text-sm font-bold ${
              status.serviceWorkerRegistered ? 'text-green-400' : 'text-red-400'
            }`}>
              {status.serviceWorkerRegistered ? 'Registrado' : 'No registrado'}
            </span>
          </div>


          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {!isInitialized ? (
              <button
                onClick={handleInitialize}
                disabled={isLoading || !status.supported}
                className="flex-1 bg-gradient-to-r from-barber-gold to-barber-copper text-barber-black py-3 px-6 rounded-lg font-bold hover:from-barber-gold-dark hover:to-barber-bronze focus:outline-none focus:ring-2 focus:ring-barber-gold/50 transition-all duration-300 shadow-gold-glow transform hover:scale-105 hover:shadow-neon-gold font-barber text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-barber-black border-t-transparent"></div>
                    <span>Configurando...</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>Configurar Notificaciones</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleTestNotification}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 shadow-lg hover:shadow-green-500/50 transform hover:scale-105 font-barber text-sm flex items-center justify-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span>Probar Notificación</span>
              </button>
            )}

            <button
              onClick={checkStatus}
              className="px-4 py-3 text-barber-gold hover:text-barber-white font-bold transition-all duration-300 flex items-center justify-center space-x-2 hover:bg-barber-gold/10 rounded-lg border border-barber-gold/30 hover:border-barber-gold text-sm"
            >
              <Settings className="h-4 w-4" />
              <span>Actualizar Estado</span>
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-4 p-4 bg-barber-gold/10 rounded-lg border border-barber-gold/30">
            <h4 className="text-sm font-bold text-barber-cream mb-2 font-barber">
              ℹ️ Información importante:
            </h4>
            <ul className="text-xs text-barber-cream/80 space-y-1 font-barber">
              <li>• Las notificaciones funcionan aunque tengas la web cerrada</li>
              <li>• Recibirás notificaciones de nuevas citas y cancelaciones</li>
              <li>• Las notificaciones aparecerán en tu celular como notificaciones nativas</li>
              <li>• Puedes desactivar las notificaciones desde la configuración de tu navegador</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
