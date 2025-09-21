import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, Phone, Scissors, Eye, X, CheckCircle, AlertCircle, XCircle, Crown, Sparkles, MessageSquare } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import { Appointment } from '../../types';

const AppointmentList: React.FC = () => {
  const { appointments, updateAppointment } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedAppointment) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedAppointment]);

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.clientPhone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'completed': return 'text-green-500';
      case 'cancelled': return 'text-red-400';
      default: return 'text-barber-gold/80';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    updateAppointment(appointmentId, { status: newStatus as any });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="bg-gradient-to-br from-barber-black via-barber-dark to-barber-black rounded-2xl shadow-2xl shadow-barber-gold/20 border border-barber-gold/30 glow-border mb-16 sm:mb-20 mx-2 sm:mx-4">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-barber-gold/20 bg-gradient-to-r from-barber-gold/10 to-barber-copper/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-barber-gold to-barber-copper rounded-xl shadow-lg glow-gold animate-pulse-slow">
              <Crown className="h-6 w-6 text-barber-black" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-barber-gold to-barber-copper bg-clip-text text-transparent font-barber">
              Todas las Citas
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-barber-copper animate-pulse" />
              <input
                type="text"
                placeholder="Buscar cliente o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border border-barber-gold/30 rounded-xl bg-barber-dark/50 text-barber-white font-barber backdrop-blur-sm focus:border-barber-gold focus:ring-2 focus:ring-barber-gold/20 transition-all duration-300 text-sm w-full sm:w-64 placeholder-barber-gold/50 hover:glow-subtle"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-barber-gold/30 rounded-xl bg-barber-dark/50 text-barber-white font-barber backdrop-blur-sm focus:border-barber-gold focus:ring-2 focus:ring-barber-gold/20 transition-all duration-300 text-sm hover:glow-subtle"
            >
              <option value="all">Todos los estados</option>
              <option value="confirmed">Confirmadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="p-4 sm:p-6">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-barber-gold/20 to-barber-copper/20 rounded-2xl mx-auto mb-6 border border-barber-gold/30">
              <Calendar className="h-10 w-10 text-barber-gold animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-barber-cream mb-3 font-barber">
              No se encontraron citas
            </h3>
            <p className="text-barber-cream/80 font-barber">
              {searchTerm || statusFilter !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Aún no hay citas programadas'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto custom-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-barber-gold/30">
                    <th className="text-left py-4 px-6 font-bold text-barber-cream font-barber">Cliente</th>
                    <th className="text-left py-4 px-6 font-bold text-barber-cream font-barber">Fecha & Hora</th>
                    <th className="text-left py-4 px-6 font-bold text-barber-cream font-barber">Servicio</th>
                    <th className="text-left py-4 px-6 font-bold text-barber-cream font-barber">Estado</th>
                    <th className="text-left py-4 px-6 font-bold text-barber-cream font-barber">Precio</th>
                    <th className="text-center py-4 px-6 font-bold text-barber-cream font-barber">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments
                    .sort((a, b) => {
                      const dateA = new Date(`${a.date}T${a.time}`);
                      const dateB = new Date(`${b.date}T${b.time}`);
                      return dateB.getTime() - dateA.getTime();
                    })
                    .map((appointment) => (
                      <tr key={appointment.id} className="border-b border-barber-gold/20 hover:bg-barber-gold/5 transition-all duration-300 hover:scale-[1.01]">
                        <td className="py-5 px-6">
                          <div>
                            <div className="flex items-center space-x-3">
                              <User className="h-5 w-5 text-barber-copper animate-pulse" />
                              <span className="font-bold text-barber-white font-barber">
                                {appointment.clientName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Phone className="h-4 w-4 text-barber-cream/80" />
                              <span className="text-sm text-barber-cream/80 font-barber">
                                {appointment.clientPhone}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-5 px-6">
                          <div>
                            <div className="flex items-center space-x-3">
                              <Calendar className="h-5 w-5 text-barber-gold animate-bounce-slow" />
                              <span className="text-sm font-bold text-barber-gold capitalize font-barber">
                                {formatDate(appointment.date)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <Clock className="h-4 w-4 text-barber-gold animate-spin-slow" />
                              <span className="text-sm text-barber-gold font-barber">
                                {formatTime(appointment.time)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-2">
                            <Scissors className="h-4 w-4 text-barber-cream/80 animate-pulse" />
                            <span className="text-sm text-barber-cream/80 font-barber font-medium">
                              {appointment.service}
                            </span>
                          </div>
                        </td>

                        <td className="py-5 px-6">
                          <div className={`inline-flex items-center text-xs font-bold ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-2 font-barber">{getStatusText(appointment.status)}</span>
                          </div>
                        </td>

                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="h-4 w-4 text-green-500 animate-pulse" />
                            <span className="text-sm font-bold text-barber-white font-barber">
                              ${appointment.price.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        <td className="py-5 px-6">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => setSelectedAppointment(appointment)}
                              className="p-2 text-barber-gold hover:text-barber-white hover:bg-barber-gold/20 transition-all duration-300 rounded-xl border border-barber-gold/30 hover:border-barber-gold hover:scale-110 hover:glow-subtle"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {appointment.status === 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 transition-all duration-300 rounded-xl border border-green-500/30 hover:border-green-500/50 hover:scale-110 hover:glow-green"
                                title="Marcar como completada"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}

                            {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 rounded-xl border border-red-500/30 hover:border-red-500/50 hover:scale-110 hover:glow-red"
                                title="Cancelar cita"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredAppointments
                .sort((a, b) => {
                  const dateA = new Date(`${a.date}T${a.time}`);
                  const dateB = new Date(`${b.date}T${b.time}`);
                  return dateB.getTime() - dateA.getTime();
                })
                .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-gradient-to-br from-barber-dark/50 to-barber-black/50 rounded-xl border border-barber-gold/30 p-3 hover:border-barber-gold/50 transition-all duration-300 hover:scale-[1.02] glow-subtle"
                  >
                    {/* Header with client info and status */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <User className="h-5 w-5 text-barber-gold animate-pulse flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-barber-white font-barber text-sm truncate">
                            {appointment.clientName}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Phone className="h-3 w-3 text-barber-cream/80 flex-shrink-0" />
                            <span className="text-xs text-barber-cream/80 font-barber truncate">
                              {appointment.clientPhone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`inline-flex items-center text-xs font-bold ${getStatusColor(appointment.status)} flex-shrink-0 ml-2`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1 font-barber">{getStatusText(appointment.status)}</span>
                      </div>
                    </div>

                    {/* Date, time, and service info */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-barber-dark/30 p-2 rounded-lg border border-barber-gold/20">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="h-4 w-4 text-barber-gold animate-bounce-slow flex-shrink-0" />
                          <span className="text-xs font-bold text-barber-gold font-barber">Fecha</span>
                        </div>
                        <p className="text-xs text-barber-white capitalize font-barber">
                          {formatDate(appointment.date)}
                        </p>
                      </div>
                      <div className="bg-barber-dark/30 p-2 rounded-lg border border-barber-gold/20">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-barber-gold animate-spin-slow flex-shrink-0" />
                          <span className="text-xs font-bold text-barber-gold font-barber">Hora</span>
                        </div>
                        <p className="text-xs text-barber-white font-barber">
                          {formatTime(appointment.time)}
                        </p>
                      </div>
                    </div>

                    {/* Service and price */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-barber-dark/30 p-2 rounded-lg border border-barber-gold/20">
                        <div className="flex items-center space-x-2 mb-1">
                          <Scissors className="h-4 w-4 text-barber-cream/80 animate-pulse flex-shrink-0" />
                          <span className="text-xs font-bold text-barber-cream/80 font-barber">Servicio</span>
                        </div>
                        <p className="text-xs text-barber-white font-barber font-medium">
                          {appointment.service}
                        </p>
                      </div>
                      <div className="bg-barber-dark/30 p-2 rounded-lg border border-barber-gold/20">
                        <div className="flex items-center space-x-2 mb-1">
                          <Sparkles className="h-4 w-4 text-green-500 animate-pulse flex-shrink-0" />
                          <span className="text-xs font-bold text-green-500 font-barber">Precio</span>
                        </div>
                        <p className="text-xs font-bold text-barber-white font-barber">
                          ${appointment.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-center space-x-2 pt-2 border-t border-barber-gold/20">
                      <button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="flex-1 p-2 text-barber-gold hover:text-barber-white hover:bg-barber-gold/20 transition-all duration-300 rounded-lg border border-barber-gold/30 hover:border-barber-gold hover:scale-105 hover:glow-subtle text-xs font-barber font-medium"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4 mx-auto mb-1" />
                        Ver
                      </button>
                      
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="flex-1 p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 transition-all duration-300 rounded-lg border border-green-500/30 hover:border-green-500/50 hover:scale-105 hover:glow-green text-xs font-barber font-medium"
                          title="Marcar como completada"
                        >
                          <CheckCircle className="h-4 w-4 mx-auto mb-1" />
                          Completar
                        </button>
                      )}

                      {(appointment.status === 'confirmed' || appointment.status === 'completed') && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="flex-1 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 rounded-lg border border-red-500/30 hover:border-red-500/50 hover:scale-105 hover:glow-red text-xs font-barber font-medium"
                          title="Cancelar cita"
                        >
                          <XCircle className="h-4 w-4 mx-auto mb-1" />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-barber-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in overflow-y-auto">
          <div className="bg-gradient-to-br from-barber-black via-barber-dark to-barber-black border border-barber-gold/30 rounded-2xl shadow-2xl shadow-barber-gold/20 max-w-md w-full my-4 sm:my-8 glow-border pop-in">
            <div className="p-6 border-b border-barber-gold/20 bg-gradient-to-r from-barber-gold/10 to-barber-copper/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-barber-gold to-barber-copper rounded-xl shadow-lg glow-gold">
                    <Crown className="h-5 w-5 text-barber-black" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-barber-gold to-barber-copper bg-clip-text text-transparent font-barber">
                    Detalles de la Cita
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-barber-gold hover:text-barber-white hover:bg-barber-gold/20 transition-all duration-300 rounded-xl p-2 hover:scale-110 hover:rotate-90"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 bg-gradient-to-b from-transparent to-barber-gold/5">
              <div className="bg-gradient-to-r from-barber-gold/10 to-barber-copper/10 p-4 rounded-xl border border-barber-gold/30">
                <h4 className="text-sm font-bold text-barber-cream mb-2 font-barber flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Cliente</span>
                </h4>
                <p className="text-barber-white font-bold font-barber">{selectedAppointment.clientName}</p>
                <p className="text-sm text-barber-cream/80 font-barber flex items-center space-x-1 mt-1">
                  <Phone className="h-3 w-3" />
                  <span>{selectedAppointment.clientPhone}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-barber-dark/30 p-4 rounded-xl border border-barber-gold/20">
                  <h4 className="text-sm font-bold text-barber-cream mb-2 font-barber flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Fecha</span>
                  </h4>
                  <p className="text-barber-gold capitalize font-barber">
                    {formatDate(selectedAppointment.date)}
                  </p>
                </div>
                <div className="bg-barber-dark/30 p-4 rounded-xl border border-barber-gold/20">
                  <h4 className="text-sm font-bold text-barber-cream mb-2 font-barber flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Hora</span>
                  </h4>
                  <p className="text-barber-gold font-barber">
                    {formatTime(selectedAppointment.time)}
                  </p>
                </div>
              </div>

              <div className="bg-barber-dark/30 p-4 rounded-xl border border-barber-gold/20">
                  <h4 className="text-sm font-bold text-barber-cream mb-2 font-barber flex items-center space-x-2">
                    <Scissors className="h-4 w-4" />
                    <span>Servicio</span>
                  </h4>
                <p className="text-barber-white font-barber">{selectedAppointment.service}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-barber-dark/30 p-4 rounded-xl border border-barber-gold/20">
                  <h4 className="text-sm font-bold text-barber-cream mb-2 font-barber">Estado</h4>
                  <div className={`inline-flex items-center text-xs font-bold ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusIcon(selectedAppointment.status)}
                    <span className="ml-2 font-barber">{getStatusText(selectedAppointment.status)}</span>
                  </div>
                </div>
                <div className="bg-barber-dark/30 p-4 rounded-xl border border-barber-gold/20">
                  <h4 className="text-sm font-bold text-barber-cream mb-2 font-barber flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Precio</span>
                  </h4>
                  <p className="text-green-400 font-bold font-barber text-lg">
                    ${selectedAppointment.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedAppointment.notes && (
                <div className="bg-gradient-to-r from-barber-gold/10 to-barber-copper/10 p-4 rounded-xl border border-barber-gold/30">
                  <h4 className="text-sm font-bold text-barber-gold mb-2 font-barber flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Notas</span>
                  </h4>
                  <p className="text-barber-white text-sm font-barber bg-barber-dark/50 p-3 rounded-lg border border-barber-gold/20">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}

              <div className="bg-barber-dark/30 p-4 rounded-xl border border-barber-gold/20">
                <h4 className="text-sm font-bold text-barber-cream mb-2 font-barber flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Creada</span>
                </h4>
                <p className="text-sm text-barber-gold font-barber">
                  {new Date(selectedAppointment.createdAt).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;