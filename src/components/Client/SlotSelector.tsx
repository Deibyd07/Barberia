import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';
import { useAppointments } from '../../context/AppointmentContext';
import { getTodayString } from '../../utils/dateUtils';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';

interface SlotSelectorProps {
  selectedDate: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
  selectedDate,
  selectedTime,
  onTimeSelect
}) => {
  const { generateSlotsForDate } = useSchedule();
  const { appointments } = useAppointments();
  const { isMobile } = useMobileOptimization();
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  // Eliminar estado temporal - usar solo selectedTime

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

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) {
        setSlots([]);
        return;
      }

      // Feedback visual mínimo
      setIsLoading(true);
      
      try {
        const availableSlots = await generateSlotsForDate(selectedDate);
        setSlots(availableSlots);
      } catch (error) {
        console.error('❌ SlotSelector: Error loading slots:', error);
        setSlots([]);
      } finally {
        // Sin delay - feedback inmediato
        setIsLoading(false);
      }
    };

    // Cargar inmediatamente sin delay
    loadSlots();
  }, [selectedDate, generateSlotsForDate, appointments]);

  // Lógica simple - solo usar selectedTime

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 text-barber-copper" style={{animation: 'spin 0.5s linear infinite'}} />
        <span className="ml-2 text-barber-cream font-body">Cargando horarios...</span>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-barber-copper/50 mx-auto mb-4" />
        <p className="text-barber-cream/60 font-body">
          No hay horarios disponibles para esta fecha
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-barber-cream font-display">
        Horarios Disponibles
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {slots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const isBooked = slot.isBooked;
          
          // Verificar si es el mismo día y el horario ya pasó
          const todayString = getTodayString();
          const isPastTime = selectedDate === todayString && (() => {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            return slot.time <= currentTime;
          })();
          
          const isAvailable = !isBooked && !isPastTime;
          
          return (
            <button
              key={slot.time}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (isSelecting || !isAvailable) return;
                
                setIsSelecting(true);
                
                try {
                  if (isAvailable && onTimeSelect) {
                    onTimeSelect(slot.time);
                  }
                } catch (error) {
                  console.error('❌ SlotSelector: Error al seleccionar horario:', error);
                } finally {
                  setIsSelecting(false);
                }
              }}
              disabled={!isAvailable || isSelecting}
              className={`
                group relative overflow-hidden rounded-lg p-3 border transition-all duration-200 transform hover:scale-105
                ${isSelected 
                  ? 'border-barber-cream/30 bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 text-green-400 hover:border-barber-cream/50 hover:bg-barber-cream/10' 
                  : isAvailable
                    ? 'border-barber-cream/30 bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 text-barber-cream hover:border-barber-cream/50 hover:bg-barber-cream/10'
                    : 'border-red-500/30 bg-gradient-to-br from-red-900/40 via-red-800/30 to-red-700/40 text-red-300 opacity-50 cursor-not-allowed'
                }
                button-professional
                ${isSelecting ? 'opacity-70' : ''}
                ${isSelected ? 'active' : ''}
              `}
            >
              {isAvailable ? (
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className={`h-4 w-4 ${isSelected ? 'text-green-400' : 'text-green-400'}`} />
                  <span className={`font-medium ${isSelected ? 'text-green-400' : 'text-barber-cream'}`}>{formatTime(slot.time)}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="font-medium text-xs">{formatTime(slot.time)}</span>
                  <span className="text-xs font-medium text-red-300">No disponible</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="text-sm text-barber-cream/60">
        {slots.filter(slot => {
          const todayString = getTodayString();
          const isPastTime = selectedDate === todayString && (() => {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5);
            return slot.time <= currentTime;
          })();
          return !slot.isBooked && !isPastTime;
        }).length} de {slots.length} horarios disponibles
      </div>
    </div>
  );
};

export default SlotSelector;
