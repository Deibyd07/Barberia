import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from '../../hooks/useDevice';
import { Calendar, Crown, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../context/AppointmentContext';
import { getTodayString, formatDateShort } from '../../utils/dateUtils';
// Componente simple para móvil
const ClientDashboardMobile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getClientAppointments } = useAppointments();
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [clientStats, setClientStats] = useState({
    totalAppointments: 0,
    completedServices: 0,
    totalSpent: 0
  });

  useEffect(() => {
    if (user) {
      const appointments = getClientAppointments(user.id);
      
      // Filtrar citas confirmadas y futuras
      const todayString = getTodayString();
      const upcoming = appointments.filter(apt => 
        apt.status === 'confirmed' && apt.date >= todayString
      ).slice(0, 3); // Mostrar máximo 3 citas
      setUpcomingAppointments(upcoming);

      // Calcular estadísticas reales
      const totalAppointments = appointments.length;
      const completedServices = appointments.filter(apt => apt.status === 'completed').length;
      const totalSpent = appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      setClientStats({
        totalAppointments,
        completedServices,
        totalSpent
      });
    }
  }, [user, getClientAppointments]);

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateShort(dateString);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber relative ">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="w-full px-4 pt-6 pb-24 space-y-6 relative z-10">
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-5 shadow-barber-xl border border-barber-gold/20  animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-barber-cream font-display">¡Hola, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-barber-cream/80 font-body">Bienvenido a tu barbería premium</p>
              </div>
              <div className="flex space-x-2">
                <Crown className="h-6 w-6 text-barber-gold animate-pulse" />
                <Sparkles className="h-5 w-5 text-barber-copper animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-4 text-center shadow-barber-xl border border-barber-gold/20 ">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="text-2xl font-bold text-barber-cream font-display">{clientStats.totalAppointments}</div>
              <div className="text-sm text-barber-cream/60 font-body">Citas</div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-4 text-center shadow-barber-xl border border-barber-gold/20 ">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="text-2xl font-bold text-barber-cream font-display">{clientStats.completedServices}</div>
              <div className="text-sm text-barber-cream/60 font-body">Servicios</div>
            </div>
          </div>
        </div>
        
        {/* Botón de Agendar Citas */}
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-6 shadow-barber-xl border border-barber-gold/20  mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Calendar className="h-6 w-6 text-barber-copper animate-pulse" />
              <h3 className="text-lg font-semibold text-barber-copper font-display">¿Necesitas una cita?</h3>
            </div>
            <p className="text-barber-cream/80 text-sm font-body mb-4">
              Reserva tu próxima cita de barbería premium
            </p>
            <button
              onClick={() => {
                // Navegación ultra-suave sin transiciones
                navigate('/client/book');
              }}
              className="btn-barber btn-barber-primary w-full sm:w-auto button-professional booking-button-mobile"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Cita
            </button>
          </div>
        </div>
        
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-5 shadow-barber-xl border border-barber-gold/20 ">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10">
            <h2 className="text-lg font-semibold text-barber-cream font-display mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5 animate-pulse" />
              <span>Próximas Citas</span>
            </h2>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-barber-dark/30 p-3 rounded-lg border border-barber-gold/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-barber-cream">{appointment.service}</p>
                        <p className="text-xs text-barber-copper/80 flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(appointment.date)}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>{formatTime(appointment.time)}</span>
                        </p>
                      </div>
                      <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/50">
                        Confirmada
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-barber-cream/60 font-body">No tienes citas programadas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente simple para desktop
const ClientDashboardOptimized: React.FC = () => {
  const { user } = useAuth();
  const { getClientAppointments } = useAppointments();
  const [clientStats, setClientStats] = useState({
    totalAppointments: 0,
    completedServices: 0,
    totalSpent: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const appointments = getClientAppointments(user.id);
      
      // Filtrar citas confirmadas y futuras
      const todayString = getTodayString();
      const upcoming = appointments.filter(apt => 
        apt.status === 'confirmed' && apt.date >= todayString
      );
      setUpcomingAppointments(upcoming);
      
      // Calcular estadísticas reales
      const totalAppointments = appointments.length;
      const completedServices = appointments.filter(apt => apt.status === 'completed').length;
      const totalSpent = appointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.price || 0), 0);

      setClientStats({
        totalAppointments,
        completedServices,
        totalSpent
      });
    }
  }, [user, getClientAppointments]);

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    return formatDateShort(dateString);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber relative ">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-8 mb-8 shadow-barber-xl border border-barber-gold/20  animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-barber-cream font-display">¡Bienvenido, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-barber-cream/80 text-lg font-body">Gestiona tus citas de barbería premium</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-6 text-center shadow-barber-xl border border-barber-gold/20 ">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="text-3xl font-bold text-barber-cream mb-2 font-display">{clientStats.totalAppointments}</div>
              <div className="text-barber-cream font-body">Citas Programadas</div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-6 text-center shadow-barber-xl border border-barber-gold/20 ">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="text-3xl font-bold text-barber-cream mb-2 font-display">{clientStats.completedServices}</div>
              <div className="text-barber-cream font-body">Servicios Completados</div>
            </div>
          </div>
          <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-6 text-center shadow-barber-xl border border-barber-gold/20 ">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="text-3xl font-bold text-barber-cream mb-2 font-display">${clientStats.totalSpent.toLocaleString()}</div>
              <div className="text-barber-cream font-body">Total Gastado</div>
            </div>
          </div>
        </div>
        
        {/* Botón de Mis Citas */}
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl p-8 shadow-barber-xl border border-barber-gold/20  mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Calendar className="h-8 w-8 text-barber-copper animate-pulse" />
              <h3 className="text-2xl font-semibold text-barber-copper font-display">Mis Citas</h3>
            </div>
            <p className="text-barber-cream/80 text-lg font-body mb-6">
              Gestiona y visualiza todas tus citas
            </p>
            <button
              onClick={() => window.location.href = '/client/appointments'}
              className="btn-barber btn-barber-primary text-lg px-8 py-4 button-professional"
            >
              <Calendar className="h-5 w-5 mr-3" />
              Ver Mis Citas
            </button>
          </div>
        </div>
        
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-8 shadow-barber-xl border border-barber-gold/20 ">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-semibold text-barber-gold mb-8 font-display flex items-center space-x-2">
              <Calendar className="h-6 w-6 animate-pulse" />
              <span>Próximas Citas</span>
            </h2>
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-barber-dark/30 p-6 rounded-xl border border-barber-gold/20 hover:border-barber-gold/40 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-barber-cream mb-2">{appointment.service}</h3>
                        <p className="text-sm text-barber-gold/80 flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(appointment.date)}</span>
                        </p>
                        <p className="text-sm text-barber-copper/80 flex items-center space-x-2 mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(appointment.time)}</span>
                        </p>
                      </div>
                      <div className="text-xs text-green-400">
                        Confirmada
                      </div>
                    </div>
                    {appointment.price && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-barber-white">${appointment.price.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-barber-gold/20 to-barber-copper/20 rounded-2xl mx-auto mb-6 border border-barber-gold/30">
                  <Calendar className="h-10 w-10 text-barber-gold animate-pulse" />
                </div>
                <p className="text-barber-cream/60 text-lg font-body mb-6">No tienes citas programadas</p>
                <button 
                  onClick={() => window.location.href = '/client/book'}
                  className="btn-barber btn-barber-primary button-professional"
                >
                  Reservar Nueva Cita
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientDashboardResponsive: React.FC = () => {
  const { isMobile } = useDevice();

  // Usar el dashboard móvil para dispositivos pequeños
  if (isMobile) {
    return <ClientDashboardMobile />;
  }

  // Usar el dashboard optimizado para desktop
  return <ClientDashboardOptimized />;
};

export default ClientDashboardResponsive;
