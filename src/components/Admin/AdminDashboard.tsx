import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, Clock, TrendingUp, CheckCircle, AlertCircle, Crown, Sparkles, Star, BarChart3 } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import NotificationTest from './NotificationTest';
import NotificationSettings from './NotificationSettings';
import AppointmentCompletionService from '../../services/appointmentCompletionService';
import pushNotificationService from '../../services/pushNotificationService';
import { getTodayString, createLocalDate, isPastDate, isToday as isTodayDate, isFutureDate } from '../../utils/dateUtils';

const BarberPole = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
    <rect x="18" y="6" width="12" height="36" rx="6" fill="#F8F6F2" stroke="#232323" strokeWidth="2"/>
    <rect x="18" y="6" width="12" height="36" rx="6" fill="url(#stripes)" fillOpacity="0.5"/>
    <ellipse cx="24" cy="6" rx="6" ry="3" fill="#C9A14A" />
    <ellipse cx="24" cy="42" rx="6" ry="3" fill="#B87333" />
    <defs>
      <linearGradient id="stripes" x1="18" y1="6" x2="30" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C9A14A" />
        <stop offset="0.5" stopColor="#B87333" />
        <stop offset="1" stopColor="#232323" />
      </linearGradient>
    </defs>
  </svg>
);

const AdminDashboard: React.FC = () => {
  const { appointments } = useAppointments();
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  // Inicializar servicio de notificaciones push
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await pushNotificationService.initialize();
        console.log('✅ Servicio de notificaciones push inicializado');
      } catch (error) {
        console.warn('⚠️ Error inicializando notificaciones push:', error);
      }
    };

    initializeNotifications();
  }, []);

  // Calculate statistics
  const today = getTodayString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  // Obtener citas del día seleccionado (solo las que NO están canceladas)
  const selectedDateAppointments = appointments.filter(apt => 
    apt.date === selectedDate && apt.status !== 'cancelled'
  );

  // Eliminar duplicados por cliente, fecha y hora (mantener solo la más reciente)
  const uniqueSelectedDateAppointments = selectedDateAppointments.reduce((acc, current) => {
    const existing = acc.find(apt => 
      apt.clientId === current.clientId && 
      apt.date === current.date && 
      apt.time === current.time
    );
    
    if (!existing) {
      acc.push(current);
    } else {
      // Si existe, mantener el más reciente (por createdAt)
      const currentDate = new Date(current.createdAt);
      const existingDate = new Date(existing.createdAt);
      if (currentDate > existingDate) {
        const index = acc.findIndex(apt => apt === existing);
        acc[index] = current;
      }
    }
    
    return acc;
  }, [] as typeof selectedDateAppointments);
  
  const todayAppointments = appointments.filter(apt => 
    apt.date === today && apt.status !== 'cancelled'
  );
  const confirmedToday = todayAppointments.filter(apt => apt.status === 'confirmed').length;
  
  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = createLocalDate(apt.date);
    return aptDate.getMonth() === thisMonth && aptDate.getFullYear() === thisYear && apt.status !== 'cancelled';
  });

  const completedThisMonth = monthlyAppointments.filter(apt => apt.status === 'completed');
  const confirmedThisMonth = monthlyAppointments.filter(apt => apt.status === 'confirmed');
  const monthlyRevenue = completedThisMonth.reduce((sum, apt) => sum + (apt.price || 0), 0);
  const pendingRevenue = confirmedThisMonth.reduce((sum, apt) => sum + (apt.price || 0), 0);
  const totalMonthlyRevenue = monthlyRevenue + pendingRevenue;

  const confirmedAppointments = appointments.filter(apt => 
    apt.status === 'confirmed'
  ).length;
  
  // Estadísticas de completación
  const completionStats = AppointmentCompletionService.getCompletionStats(appointments);
  const recentlyCompleted = AppointmentCompletionService.getRecentlyCompletedAppointments(appointments);

          const stats = [
            {
              title: 'Ingresos del Mes',
              value: `$${totalMonthlyRevenue.toLocaleString()}`,
              change: `$${monthlyRevenue.toLocaleString()} completados`,
              changeType: 'positive',
              icon: DollarSign,
              color: 'from-green-500 to-green-600'
            },
            {
              title: 'Citas Hoy',
              value: `${confirmedToday}/${todayAppointments.length}`,
              change: `${todayAppointments.length} total`,
              changeType: 'neutral',
              icon: Calendar,
              color: 'from-blue-500 to-blue-600'
            },
            {
              title: 'Citas Futuras',
              value: confirmedAppointments.toString(),
              change: 'Confirmadas y pendientes',
              changeType: 'positive',
              icon: CheckCircle,
              color: 'from-purple-500 to-purple-600'
            },
            {
              title: 'Clientes del Mes',
              value: new Set(monthlyAppointments.map(apt => apt.clientId)).size.toString(),
              change: `${monthlyAppointments.length} servicios`,
              changeType: 'positive',
              icon: Users,
              color: 'from-orange-500 to-orange-600'
            },
            {
              title: 'Citas Completadas',
              value: completionStats.completed.toString(),
              change: `${completionStats.completionRate}% tasa de completación`,
              changeType: 'positive',
              icon: CheckCircle,
              color: 'from-emerald-500 to-emerald-600'
            }
          ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-barber-gold/5 to-transparent rounded-full animate-pulse-slow"></div>
      
      <div className="py-2 sm:py-4 lg:py-8 px-2 sm:px-4 relative z-10">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-barber-gold mb-3 sm:mb-4 lg:mb-6 shadow-barber-xl border border-barber-gold/20 overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <div className="flex space-x-1 sm:space-x-2">
              <Crown className="h-4 w-4 sm:h-6 sm:w-6 text-barber-gold animate-pulse" />
              <Star className="h-3 w-3 sm:h-5 sm:w-5 text-barber-copper animate-pulse" style={{ animationDelay: '0.5s' }} />
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-barber-gold animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 sm:gap-4 lg:gap-6">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-barber-gold/30 rounded-full blur-lg animate-glow"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br from-barber-gold/20 via-barber-copper/20 to-barber-bronze/20 backdrop-blur-md rounded-full border-2 border-barber-gold/50 shadow-neon-gold transform group-hover:scale-110 transition-all duration-300 animate-float">
                  <BarberPole />
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                    <Crown className="h-4 w-4 sm:h-6 sm:w-6 text-barber-gold animate-bounce-slow" />
                  </div>
                </div>
              </div>
              <div>
                        <h1 className="text-lg sm:text-2xl lg:text-4xl xl:text-5xl font-display font-bold mb-1 sm:mb-2 tracking-wide">
                          <span className="text-barber-cream">
                            Panel Administrativo
                          </span>
                        </h1>
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-barber-gold animate-pulse" />
                  <p className="text-barber-cream/90 text-xs sm:text-sm lg:text-base font-body">
                    Control total de tu barbería premium
                  </p>
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-barber-gold animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="group relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-charcoal backdrop-blur-md rounded-lg sm:rounded-xl lg:rounded-2xl shadow-barber-xl p-3 sm:p-4 lg:p-6 border border-barber-gold/30 hover:shadow-neon-gold transition-all duration-500 transform hover:scale-105 animate-slide-in-left overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
                    <div className="absolute top-4 right-4">
                      <Sparkles className="h-4 w-4 text-barber-gold/60 animate-pulse" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-barber-gold/20 rounded-xl sm:rounded-2xl blur-lg animate-glow"></div>
                          <div className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r ${stat.color} rounded-xl sm:rounded-2xl shadow-gold-glow transform group-hover:rotate-12 transition-all duration-300`}>
                            <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white group-hover:animate-bounce" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-barber-gold animate-pulse" />
                            <span className="text-xs font-medium text-barber-gold/80 font-body uppercase tracking-wider">
                              Premium
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-display font-bold text-barber-gold mb-1 sm:mb-2 group-hover:text-barber-copper transition-colors duration-300">
                          {stat.value}
                        </p>
                        <p className="text-xs sm:text-sm lg:text-base font-medium text-barber-cream mb-2 sm:mb-3 font-display">
                          {stat.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${stat.changeType === 'positive' ? 'bg-green-400' : stat.changeType === 'negative' ? 'bg-red-400' : 'bg-barber-gold'} animate-pulse`}></div>
                          <p className={`text-xs sm:text-sm font-medium font-body ${stat.changeType === 'positive' ? 'text-green-400' : stat.changeType === 'negative' ? 'text-red-400' : 'text-barber-gold/80'}`}>
                            {stat.change}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>

          {/* Today's Appointments */}
          <div className="lg:col-span-3">
            <div className="relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-black rounded-2xl shadow-2xl shadow-barber-gold/20 border border-barber-gold/30 glow-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
              <div className="relative z-10 p-6 border-b border-barber-gold/20 bg-gradient-to-r from-barber-gold/10 to-barber-copper/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-barber-gold to-barber-copper rounded-xl shadow-lg glow-gold animate-pulse-slow">
                      <Crown className="h-5 w-5 text-barber-black" />
                    </div>
                    <h2 className="text-xl font-bold text-barber-cream font-barber">
                      Citas del Día
                    </h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Selector de fecha */}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-barber-cream/80" />
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-barber-dark/50 border border-barber-gold/30 rounded-lg px-3 py-2 text-barber-gold text-sm focus:outline-none focus:ring-2 focus:ring-barber-gold/50"
                        min="2020-01-01"
                        max="2030-12-31"
                      />
                    </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-5 w-5 text-barber-gold animate-spin-slow" />
                              <span className="text-sm text-barber-gold font-barber font-bold">
                                {uniqueSelectedDateAppointments.length}
                              </span>
                            </div>
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-6">
                {uniqueSelectedDateAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-barber-gold/20 to-barber-copper/20 rounded-2xl mx-auto mb-4 border border-barber-gold/30">
                      <Calendar className="h-8 w-8 text-barber-gold animate-pulse" />
                    </div>
                    <p className="text-barber-gold/80 text-sm font-barber">
                      {(() => {
                        const selectedDateObj = createLocalDate(selectedDate);
                        const today = new Date();
                        const isPast = selectedDateObj < today;
                        const isToday = selectedDateObj.toDateString() === today.toDateString();
                        const isFuture = selectedDateObj > today;
                        
                        let message = `No hay citas para el ${selectedDateObj.toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}`;
                        
                        if (isPast) message += ' (día pasado)';
                        if (isToday) message += ' (hoy)';
                        if (isFuture) message += ' (día futuro)';
                        
                        return message;
                      })()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Header del día seleccionado */}
                    <div className="flex items-center space-x-3 pb-3 border-b border-barber-gold/20">
                      <Calendar className="h-5 w-5 text-barber-gold" />
                      <h3 className="text-lg font-semibold text-barber-cream font-display">
                        {createLocalDate(selectedDate).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </h3>
                      {(() => {
                        const isPast = isPastDate(selectedDate);
                        const isToday = isTodayDate(selectedDate);
                        const isFuture = isFutureDate(selectedDate);
                        
                        if (isPast) {
                          return (
                            <span className="text-xs text-barber-copper/80 bg-barber-copper/10 px-2 py-1 rounded-full border border-barber-copper/30">
                              Día pasado
                            </span>
                          );
                        } else if (isToday) {
                          return (
                            <span className="text-xs text-barber-gold bg-barber-gold/20 px-2 py-1 rounded-full border border-barber-gold/50">
                              Hoy
                            </span>
                          );
                        } else if (isFuture) {
                          return (
                            <span className="text-xs text-barber-green/80 bg-barber-green/10 px-2 py-1 rounded-full border border-barber-green/30">
                              Día futuro
                            </span>
                          );
                        }
                        return null;
                      })()}
                      <span className="text-sm text-barber-gold bg-barber-gold/20 px-2 py-1 rounded-full border border-barber-gold/30">
                        {uniqueSelectedDateAppointments.length} cita{uniqueSelectedDateAppointments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* Citas del día */}
                    <div className="space-y-3">
                      {uniqueSelectedDateAppointments
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-4 bg-gradient-to-r from-barber-dark/50 to-barber-black/50 rounded-xl border border-barber-gold/30 hover:border-barber-gold/50 transition-all duration-300 hover:scale-[1.02] glow-subtle"
                        >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <Sparkles className="h-4 w-4 text-barber-cream/70 animate-pulse" />
                                      <span className="font-bold text-barber-white text-sm font-barber">
                                        {appointment.clientName}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Clock className="h-3 w-3 text-barber-gold" />
                                      <span className="text-xs font-bold text-barber-gold font-barber">
                                        {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('es-ES', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </span>
                                    </div>
                                  </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-3 w-3 text-barber-cream/80" />
                              <span className="text-xs text-barber-cream/80 font-barber">
                                {appointment.service}
                              </span>
                            </div>
                            <div className={`inline-flex items-center text-xs font-bold font-barber ${(() => {
          switch (appointment.status) {
            case 'confirmed': return 'text-green-400';
            case 'completed': return 'text-green-500';
            case 'cancelled': return 'text-red-400';
            default: return 'text-barber-gold/80';
          }
        })()}`}>
                              {(() => {
    switch (appointment.status) {
      case 'confirmed': return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'cancelled': return <AlertCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  })()}
                              {(() => {
    switch (appointment.status) {
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return appointment.status;
    }
  })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-black rounded-2xl shadow-2xl shadow-barber-gold/20 border border-barber-gold/30 glow-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-barber-gold to-barber-copper rounded-xl shadow-lg glow-gold animate-pulse-slow">
                    <BarChart3 className="h-5 w-5 text-barber-black" />
                  </div>
                          <h3 className="text-xl font-bold text-barber-cream font-barber">
                            Resumen Mensual
                          </h3>
                </div>
                <div className="space-y-5">
                          <div className="flex items-center justify-between p-3 bg-barber-dark/30 rounded-xl border border-barber-gold/20">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-emerald-400 animate-pulse" />
                              <span className="text-sm text-barber-cream/80 font-barber">Servicios completados</span>
                            </div>
                            <span className="font-bold text-barber-white font-barber text-lg">
                              {completedThisMonth.length}
                            </span>
                          </div>
                  <div className="flex items-center justify-between p-3 bg-barber-dark/30 rounded-xl border border-barber-gold/20">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-400 animate-pulse" />
                      <span className="text-sm text-barber-cream/80 font-barber">Citas confirmadas</span>
                    </div>
                    <span className="font-bold text-barber-white font-barber text-lg">
                      {confirmedThisMonth.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-barber-dark/30 rounded-xl border border-barber-gold/20">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-400 animate-pulse" />
                      <span className="text-sm text-barber-cream/80 font-barber">Ingresos totales</span>
                    </div>
                    <span className="font-bold text-barber-white font-barber text-lg">
                      ${totalMonthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-barber-dark/30 rounded-xl border border-barber-gold/20">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-orange-400 animate-pulse" />
                      <span className="text-sm text-barber-cream/80 font-barber">Clientes únicos</span>
                    </div>
                    <span className="font-bold text-barber-white font-barber text-lg">
                      {new Set(monthlyAppointments.map(apt => apt.clientId)).size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="mt-6 sm:mt-8">
          <NotificationSettings />
        </div>

        {/* Notification Test */}
        <div className="mt-6 sm:mt-8">
          <NotificationTest />
        </div>

        {/* Recently Completed Appointments */}
        {recentlyCompleted.length > 0 && (
          <div className="mt-6 sm:mt-8 mb-12">
            <div className="relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-black rounded-2xl shadow-2xl shadow-barber-gold/20 border border-barber-gold/30 glow-border overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
              <div className="relative z-10 p-6 border-b border-barber-gold/20 bg-gradient-to-r from-barber-gold/10 to-barber-copper/10">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-barber-gold to-barber-copper rounded-xl shadow-lg glow-gold animate-pulse-slow">
                    <CheckCircle className="h-5 w-5 text-barber-black" />
                  </div>
                          <h3 className="text-xl font-bold text-barber-cream font-barber">
                            Citas Completadas Recientemente
                          </h3>
                  <span className="text-sm text-barber-gold/60 bg-barber-gold/10 px-2 py-1 rounded-full">
                    {recentlyCompleted.length} completada{recentlyCompleted.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="relative z-10 p-6">
                <div className="space-y-3">
                  {recentlyCompleted.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-gradient-to-r from-barber-dark/50 to-barber-black/50 rounded-xl border border-barber-gold/30 hover:border-barber-gold/50 transition-all duration-300 hover:scale-[1.02] glow-subtle"
                    >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-400 animate-pulse" />
                                  <span className="font-bold text-barber-white text-sm font-barber">
                                    {appointment.clientName}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-3 w-3 text-barber-gold" />
                                  <span className="text-xs font-bold text-barber-gold font-barber">
                                    {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                                </div>
                              </div>
                      <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <TrendingUp className="h-3 w-3 text-barber-cream/80" />
                                  <span className="text-xs text-barber-cream/80 font-barber">
                                    {appointment.service}
                                  </span>
                                </div>
                        <div className="inline-flex items-center text-xs font-bold font-barber text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completada
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;