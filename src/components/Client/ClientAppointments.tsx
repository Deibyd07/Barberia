import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../context/AppointmentContext';
import { createLocalDate } from '../../utils/dateUtils';

const ClientAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { appointments, getClientAppointments, cancelAppointment, refreshAppointments } = useAppointments();
  const [clientAppointments, setClientAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const loadAppointments = () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const clientApps = getClientAppointments(user.id);
        setClientAppointments(clientApps);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setClientAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
  }, [user, appointments, getClientAppointments]);

  // Escuchar eventos de nueva cita creada
  useEffect(() => {
    const handleAppointmentCreated = (event: CustomEvent) => {
      console.log('🔄 ClientAppointments: Nueva cita creada detectada', event.detail);
      // Recargar citas del cliente
      if (user) {
        const clientApps = getClientAppointments(user.id);
        setClientAppointments(clientApps);
        console.log('✅ ClientAppointments: Citas actualizadas en tiempo real');
      }
    };

    window.addEventListener('appointmentCreated', handleAppointmentCreated as EventListener);
    
    return () => {
      window.removeEventListener('appointmentCreated', handleAppointmentCreated as EventListener);
    };
  }, [user, getClientAppointments]);

  const formatDate = (dateString: string) => {
    const date = createLocalDate(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    try {
      // Convertir formato HH:MM a formato legible
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      // Formatear a 12 horas con AM/PM
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // Fallback al formato original
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'completed':
        return 'text-barber-gold';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const canCancelAppointment = (appointment: any) => {
    // Solo se puede cancelar si está confirmada
    if (appointment.status !== 'confirmed') {
      return false;
    }

    try {
      // Crear fecha y hora de la cita
      const appointmentDate = createLocalDate(appointment.date);
      const [hours, minutes] = appointment.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Obtener fecha y hora actual
      const now = new Date();

      // Verificar si la cita ya pasó
      if (appointmentDate <= now) {
        return false;
      }

      // Calcular diferencia en minutos
      const diffInMinutes = Math.floor((appointmentDate.getTime() - now.getTime()) / (1000 * 60));

      // Solo se puede cancelar si faltan más de 30 minutos
      return diffInMinutes > 30;
    } catch (error) {
      console.error('Error checking if appointment can be cancelled:', error);
      return false;
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      console.log('🔄 Cancelando cita:', appointmentId);
      
      // Confirmar cancelación
      const confirmed = window.confirm('¿Estás seguro de que quieres cancelar esta cita?');
      if (!confirmed) {
        return;
      }

      // Usar la función del contexto para cancelar la cita
      await cancelAppointment(appointmentId);
      
      console.log('✅ Cita cancelada exitosamente');
      alert('Cita cancelada exitosamente. El horario está ahora disponible para otros clientes.');
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error);
      alert('Error al cancelar la cita. Por favor, intenta nuevamente.');
    }
  };

  const getTimeUntilAppointment = (appointment: any) => {
    try {
      const appointmentDate = createLocalDate(appointment.date);
      const [hours, minutes] = appointment.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const now = new Date();
      const diffInMinutes = Math.floor((appointmentDate.getTime() - now.getTime()) / (1000 * 60));

      if (diffInMinutes <= 0) {
        return 'Ya pasó';
      } else if (diffInMinutes < 60) {
        return `En ${diffInMinutes} min`;
      } else {
        const hours = Math.floor(diffInMinutes / 60);
        const mins = diffInMinutes % 60;
        return `En ${hours}h ${mins}m`;
      }
    } catch (error) {
      return 'Error';
    }
  };

  const filteredAppointments = clientAppointments.filter(appointment => {
    return filter === 'all' || appointment.status === filter;
  });

  const handleRefresh = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('🔄 Refrescando citas desde base de datos...');
      // Usar refreshAppointments del contexto para recargar desde la base de datos
      await refreshAppointments();
      console.log('✅ Citas refrescadas exitosamente');
    } catch (error) {
      console.error('❌ Error refreshing appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-barber-gold mx-auto mb-4"></div>
          <p className="text-barber-cream font-body">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 relative z-10">
        {/* Header simplificado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/client/dashboard')}
                className="p-2 hover:bg-barber-gold/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-barber-cream" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-barber-gold font-display">Mis Citas</h1>
                <p className="text-barber-cream/60 font-body">Gestiona tus citas programadas</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-barber-gold/10 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-5 w-5 text-barber-cream ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'confirmed', label: 'Confirmadas' },
              { key: 'completed', label: 'Completadas' },
              { key: 'cancelled', label: 'Canceladas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-gradient-to-r from-barber-gold to-barber-copper text-barber-dark font-display'
                    : 'bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl text-barber-cream hover:bg-barber-gold/20 border border-barber-gold/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de citas */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-6">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-6 shadow-barber-xl border border-barber-gold/20 overflow-hidden animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(appointment.status)}
                        <span className={`text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-barber-cream mb-2">
                      {appointment.service}
                    </h3>
                    
                    <div className="space-y-3 text-sm text-barber-cream/80">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-barber-gold" />
                        <span className="font-medium">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-barber-gold" />
                        <span className="font-medium">{formatTime(appointment.time)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-barber-gold font-medium">Precio:</span>
                        <span className="font-bold text-barber-white">${appointment.price?.toLocaleString() || '12,000'}</span>
                      </div>
                      {appointment.notes && (
                        <div className="flex items-start space-x-2">
                          <User className="h-4 w-4 mt-0.5 text-barber-gold" />
                          <span className="text-barber-cream/90">{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {appointment.status === 'confirmed' && (
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      {canCancelAppointment(appointment) ? (
                        <button 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="btn-barber btn-barber-danger text-sm"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Cancelar</span>
                        </button>
                      ) : (
                        <div className="text-right">
                          <div className="flex items-center space-x-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <div className="text-right">
                              <p className="text-xs font-medium text-red-400">
                                {getTimeUntilAppointment(appointment) === 'Ya pasó' 
                                  ? 'Cita ya pasó'
                                  : 'Menos de 30 min'
                                }
                              </p>
                              <p className="text-xs text-red-400/70">
                                No se puede cancelar
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-16 text-center shadow-barber-xl border border-barber-gold/20 overflow-hidden animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <Calendar className="h-16 w-16 text-barber-gold/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-barber-gold font-display mb-2">
                {filter === 'all' ? 'No tienes citas' : `No hay citas ${filter === 'confirmed' ? 'confirmadas' : filter === 'completed' ? 'completadas' : 'canceladas'}`}
              </h3>
              <p className="text-barber-cream/60 mb-6 font-body">
                {filter === 'all' 
                  ? 'Reserva tu primera cita para comenzar'
                  : 'Cambia el filtro para ver más citas'
                }
              </p>
              <button
                onClick={() => navigate('/client/book')}
                className="btn-barber btn-barber-primary"
              >
                Reservar Cita
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAppointments;

