import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Phone, MessageSquare, Scissors, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppointments } from '../../context/AppointmentContext';
import { useSchedule } from '../../context/ScheduleContext';
import SlotSelector from './SlotSelector';
import { getTodayString, getDateString, formatDateForDisplay } from '../../utils/dateUtils';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addAppointment } = useAppointments();
  const { generateSlotsForDate, isSlotAvailable } = useSchedule();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);


  // Función para manejar la selección de tiempo
  const handleTimeSelect = (time: string) => {
    try {
      console.log('🔄 Seleccionando horario:', time);
      setError(null); // Limpiar errores previos
      setSelectedTime(time); // Selección directa
      console.log('✅ Horario seleccionado:', time);
    } catch (error) {
      console.error('❌ Error al seleccionar horario:', error);
      setError('Error al seleccionar el horario. Por favor, intenta nuevamente.');
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return getTodayString();
  };

  // Get maximum date (3 months from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    return getDateString(maxDate);
  };

  // Manejo de errores globales
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('❌ Error global capturado:', event.error);
      setError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('❌ Promise rechazada:', event.reason);
      setError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Update available slots when date changes
  React.useEffect(() => {
    const loadSlots = async () => {
      if (selectedDate) {
        try {
          setError(null); // Limpiar errores previos
          const slots = await generateSlotsForDate(selectedDate);
          // Los slots ya vienen con el estado correcto de la base de datos
          const availableTimes = slots
            .filter(slot => !slot.isBooked)
            .map(slot => slot.time);

          setAvailableSlots(availableTimes);
          setSelectedTime(''); // Reset selected time when date changes
        } catch (error) {
          console.error('Error loading slots:', error);
          setError('Error al cargar los horarios disponibles. Por favor, intenta nuevamente.');
          setAvailableSlots([]);
        }
      } else {
        setAvailableSlots([]);
      }
    };

    loadSlots();
  }, [selectedDate, generateSlotsForDate]);

  // Check if a time slot is available
  const isTimeSlotAvailable = (time: string) => {
    if (!selectedDate) return false;
    
    // Si es el mismo día, verificar que el horario no haya pasado
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate === today) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      const slotTime = time;
      
      // Comparar horarios (formato HH:MM)
      if (slotTime <= currentTime) {
        return false; // El horario ya pasó
      }
    }
    
    return availableSlots.includes(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
      if (!user || !selectedDate || !selectedTime) {
        setError('Por favor, completa todos los campos requeridos.');
        return;
      }

    // Feedback visual inmediato
    setIsSubmitting(true);

    try {
      // Optimización: Ejecutar operaciones en paralelo cuando sea posible
      const [isAvailable] = await Promise.all([
        isSlotAvailable(selectedDate, selectedTime)
      ]);

      if (!isAvailable) {
        setError('Lo sentimos, este horario ya no está disponible. Por favor, selecciona otro.');
        return;
      }

      // Crear la cita sin delay adicional
      await addAppointment({
        clientId: user.id,
        clientName: user.name,
        clientPhone: user.phone,
        date: selectedDate,
        time: selectedTime,
        status: 'confirmed',
        service: 'Corte de cabello',
        price: 12000,
        notes: notes.trim() || undefined
      });

      // Limpiar selección
      setSelectedTime('');
      console.log('🧹 Selección limpiada');
      
      // Navegación inmediata sin delay
      navigate('/client/dashboard');
    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      setError('Error al reservar la cita. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const formatTimeForDisplay = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber relative booking-page-mobile">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 sm:left-20 w-48 h-48 sm:w-72 sm:h-72 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 sm:right-20 w-64 h-64 sm:w-96 sm:h-96 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="max-w-4xl mx-auto py-8 pb-24 px-4 relative z-10">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 text-barber-cream mb-6 sm:mb-10 shadow-barber-xl border border-barber-gold/20 overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="absolute top-4 right-4">
            <div className="flex space-x-2">
              <Sparkles className="h-6 w-6 text-barber-gold animate-pulse" />
              <Crown className="h-5 w-5 text-barber-copper animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // Limpiar selección al cancelar
                  setSelectedTime('');
                  navigate('/client/dashboard');
                }}
                className="group relative overflow-hidden flex items-center space-x-2 px-4 py-2 bg-barber-slate/30 backdrop-blur-md border border-barber-gold/30 text-barber-gold hover:text-barber-midnight hover:bg-barber-gold rounded-lg transition-all duration-300 font-display font-medium transform hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4 group-hover:animate-bounce" />
                <span className="text-sm">Volver</span>
              </button>
              <div className="relative">
                <div className="absolute inset-0 bg-barber-gold/30 rounded-full blur-lg animate-glow"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-barber-gold via-barber-copper to-barber-bronze rounded-full shadow-neon-gold border-2 border-barber-gold/50 animate-float">
                  <Calendar className="h-8 w-8 text-barber-midnight" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold mb-2 tracking-wide">
                  <span className="bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold bg-clip-text text-transparent">
                    Reservar Cita
                  </span>
                </h1>
                <p className="text-barber-cream/90 text-sm sm:text-lg font-body">
                  Selecciona fecha y hora disponible
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-charcoal backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-barber-xl border border-barber-gold/30 overflow-hidden animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10 p-6 sm:p-8 space-y-6">
              {/* Service Info */}
              <div className="bg-gradient-to-r from-barber-gold/20 to-barber-copper/20 p-4 rounded-xl border border-barber-gold/30">
                <div className="flex items-center space-x-2 mb-2">
                  <Scissors className="h-5 w-5 text-barber-bronze animate-bounce-slow" />
                  <h3 className="font-bold text-barber-bronze font-barber">Servicio Seleccionado</h3>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-barber-white font-medium">Corte de cabello profesional</span>
                  <span className="font-bold text-barber-white text-lg">$12,000</span>
                </div>
                <p className="text-xs text-barber-copper/80 mt-1 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Duración aproximada: 30 minutos</span>
                </p>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 form-group">
                <div className="form-field">
                  <label className="block text-sm font-bold text-barber-cream mb-2 font-barber form-label">
                    <User className="h-4 w-4 inline mr-1 animate-pulse" />
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 bg-barber-dark/50 backdrop-blur-sm border border-barber-gold/30 rounded-xl text-barber-white font-barber text-sm form-input"
                  />
                </div>
                <div className="form-field">
                  <label className="block text-sm font-bold text-barber-cream mb-2 font-barber form-label">
                    <Phone className="h-4 w-4 inline mr-1 animate-pulse" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={user?.phone || ''}
                    disabled
                    className="w-full px-4 py-3 bg-barber-dark/50 backdrop-blur-sm border border-barber-gold/30 rounded-xl text-barber-white font-barber text-sm form-input"
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="form-field">
                <label className="block text-sm font-bold text-barber-gold mb-2 font-barber form-label">
                  <Calendar className="h-4 w-4 inline mr-1 animate-bounce-slow" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-3 bg-barber-dark/50 backdrop-blur-sm border border-barber-gold/30 rounded-xl text-barber-white font-barber hover:border-barber-gold/50 transition-all duration-300 text-sm form-input"
                  required
                />
                {selectedDate && (
                  <p className="text-sm text-barber-gold/80 mt-2 capitalize font-barber flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>{formatDateForDisplay(selectedDate)}</span>
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div className="form-field">
                <label className="block text-sm font-bold text-barber-gold mb-2 font-barber form-label">
                  <Clock className="h-4 w-4 inline mr-1 animate-spin-slow" />
                  Hora disponible
                </label>
                    <SlotSelector
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onTimeSelect={handleTimeSelect}
                    />
                {selectedDate && selectedTime && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-500/20 to-barber-gold/20 rounded-xl border border-green-500/30">
                    <p className="text-sm text-green-400 font-barber flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>✓ Disponible el {formatDateForDisplay(selectedDate)} a las {formatTimeForDisplay(selectedTime)}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-barber-gold mb-2 font-barber">
                  <MessageSquare className="h-4 w-4 inline mr-1 animate-pulse" />
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Comentarios adicionales (opcional)"
                  rows={3}
                  className="w-full px-4 py-3 bg-barber-dark/50 backdrop-blur-sm border border-barber-gold/30 rounded-xl text-barber-white placeholder-barber-gold/50 focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold/60 transition-all duration-300 font-barber resize-none hover:border-barber-gold/50 glow-subtle text-sm"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <p className="text-red-400 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-barber-gold/20">
                <button
                  type="button"
                  onClick={() => {
                    // Limpiar selección al cancelar
                    setSelectedTime('');
                    navigate('/client/dashboard');
                  }}
                  className="px-6 py-3 text-barber-gold font-bold font-barber rounded-xl border border-barber-gold/30
                    /* Optimización móvil: sin transiciones complejas */
                    transition-none
                    sm:transition-all sm:duration-300 sm:hover:text-barber-white sm:hover:bg-barber-gold/10 sm:hover:border-barber-gold sm:hover:scale-105
                    active:opacity-80 active:scale-95
                  "
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime || isSubmitting}
                  className="group relative overflow-hidden flex-1 bg-gradient-to-r from-barber-gold to-barber-copper text-barber-midnight py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold font-barber text-sm disabled:opacity-50 disabled:cursor-not-allowed
                    /* Optimización móvil: sin transiciones complejas */
                    transition-none
                    sm:transition-all sm:duration-200 sm:hover:shadow-neon-gold
                    active:opacity-80 active:scale-95
                  "
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-barber-black"></div>
                      <span>Reservando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Crown className="h-5 w-5" />
                      <span>Confirmar Reserva</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
