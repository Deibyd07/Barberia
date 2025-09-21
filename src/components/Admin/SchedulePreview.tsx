import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Eye, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Star
} from 'lucide-react';
import { ScheduleService } from '../../services/scheduleService';
import { getDateString, formatDateForDisplay } from '../../utils/dateUtils';

interface SchedulePreviewProps {
  schedules: any[];
}

const SchedulePreview: React.FC<SchedulePreviewProps> = ({ schedules }) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

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

  // Generar vista previa para una fecha específica
  const generatePreview = async (date: string) => {
    if (!date) return;
    
    setIsLoading(true);
    try {
      const slots = await ScheduleService.generateSlotsForDate(date);
      const workingDay = schedules.find(s => s.isWorking);
      
      setPreviewData({
        date,
        slots,
        totalSlots: slots.length,
        availableSlots: slots.filter(slot => !slot.isBooked).length,
        bookedSlots: slots.filter(slot => slot.isBooked).length,
        workingHours: workingDay ? `${workingDay.slots[0]?.start} - ${workingDay.slots[0]?.end}` : 'No configurado'
      });
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener fecha de mañana por defecto
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = getDateString(tomorrow);
    setSelectedDate(dateString);
    generatePreview(dateString);
  }, [schedules]);

  const formatDate = (dateString: string) => {
    return formatDateForDisplay(dateString);
  };

  const getTimeSlots = () => {
    if (!previewData) return [];
    
    const slots = previewData.slots;
    const timeSlots = [];
    
    for (let i = 0; i < slots.length; i += 4) {
      timeSlots.push(slots.slice(i, i + 4));
    }
    
    return timeSlots;
  };

  return (
    <div className="card-barber">
      <div className="flex items-center space-x-3 mb-4">
        <Eye className="h-6 w-6 text-barber-gold" />
        <h3 className="text-lg font-bold text-barber-gold">Vista Previa de Horarios</h3>
      </div>

      {/* Selector de fecha */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-barber-cream mb-2">
          Fecha de prueba:
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            generatePreview(e.target.value);
          }}
          className="input-barber"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-barber-gold"></div>
          <span className="ml-2 text-barber-cream">Generando vista previa...</span>
        </div>
      ) : previewData ? (
        <div className="space-y-4">
          {/* Información general */}
          <div className="bg-barber-black/30 rounded-lg p-4">
            <h4 className="font-semibold text-barber-cream mb-2">
              {formatDate(previewData.date)}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-barber-gold">{previewData.totalSlots}</div>
                <div className="text-xs text-barber-cream/60">Total slots</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{previewData.availableSlots}</div>
                <div className="text-xs text-barber-cream/60">Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{previewData.bookedSlots}</div>
                <div className="text-xs text-barber-cream/60">Reservados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{previewData.workingHours}</div>
                <div className="text-xs text-barber-cream/60">Horario</div>
              </div>
            </div>
          </div>

          {/* Slots disponibles */}
          <div>
            <h4 className="font-semibold text-barber-cream mb-3">Horarios Disponibles:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {previewData.slots.map((slot: any, index: number) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-center text-sm font-medium transition-colors ${
                    slot.isBooked
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}
                >
                  {formatTime(slot.time)}
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-gradient-to-r from-barber-gold/10 to-barber-copper/10 rounded-lg p-4 border border-barber-gold/20">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-barber-gold" />
              <span className="font-semibold text-barber-gold">Estadísticas del Día</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-barber-cream/60">Capacidad:</span>
                <span className="ml-2 text-barber-cream font-medium">{previewData.totalSlots} citas</span>
              </div>
              <div>
                <span className="text-barber-cream/60">Disponibilidad:</span>
                <span className="ml-2 text-green-400 font-medium">
                  {Math.round((previewData.availableSlots / previewData.totalSlots) * 100)}%
                </span>
              </div>
              <div>
                <span className="text-barber-cream/60">Ocupación:</span>
                <span className="ml-2 text-red-400 font-medium">
                  {Math.round((previewData.bookedSlots / previewData.totalSlots) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-barber-gold/50 mx-auto mb-4" />
          <p className="text-barber-cream/60">Selecciona una fecha para ver la vista previa</p>
        </div>
      )}
    </div>
  );
};

export default SchedulePreview;
