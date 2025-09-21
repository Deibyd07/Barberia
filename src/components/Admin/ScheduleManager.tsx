import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Save, 
  X, 
  Check, 
  Crown, 
  Settings, 
  Copy,
  Coffee
} from 'lucide-react';
import { useSchedule } from '../../context/ScheduleContext';
import { WorkingHours } from '../../types';


const ScheduleManager: React.FC = () => {
  const { workingHours, updateWorkingHours } = useSchedule();
  const [isEditing, setIsEditing] = useState(false);
  const [editedHours, setEditedHours] = useState<WorkingHours[]>([]);
  const [slotInterval, setSlotInterval] = useState<number | null>(null); // Intervalo en minutos
  const [isLoadingInterval, setIsLoadingInterval] = useState(true);
  const [savedInterval, setSavedInterval] = useState<number | null>(null); // Intervalo guardado en BD
  const [isRegenerating, setIsRegenerating] = useState(false); // Estado de regeneración
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar re-render suave

  const daysOfWeek = [
    { id: 0, name: 'Domingo', short: 'Dom', emoji: '✂️' },
    { id: 1, name: 'Lunes', short: 'Lun', emoji: '✂️' },
    { id: 2, name: 'Martes', short: 'Mar', emoji: '✂️' },
    { id: 3, name: 'Miércoles', short: 'Mié', emoji: '✂️' },
    { id: 4, name: 'Jueves', short: 'Jue', emoji: '✂️' },
    { id: 5, name: 'Viernes', short: 'Vie', emoji: '✂️' },
    { id: 6, name: 'Sábado', short: 'Sáb', emoji: '✂️' }
  ];


  useEffect(() => {
    if (isEditing && editedHours.length === 0) {
      initializeEditedHours();
    }
  }, [isEditing]);

  // Cargar slotInterval desde la tabla settings
  useEffect(() => {
    const loadSlotInterval = async () => {
      try {
        const { ScheduleService } = await import('../../services/scheduleService');
        const interval = await ScheduleService.getSlotInterval();
        console.log('📊 Intervalo cargado desde settings:', interval);
        setSlotInterval(interval);
        setSavedInterval(interval);
      } catch (error) {
        console.error('❌ Error loading slot interval:', error);
        setSlotInterval(30); // Valor por defecto
        setSavedInterval(30);
        console.log('📊 Usando intervalo por defecto: 30 (error en BD)');
      } finally {
        setIsLoadingInterval(false);
      }
    };

    loadSlotInterval();
  }, []);


  const initializeEditedHours = () => {
    const completeHours = daysOfWeek.map(day => {
      const existing = workingHours.find(h => h.dayOfWeek === day.id);
      return existing || {
        id: `default-${day.id}`,
        dayOfWeek: day.id,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: day.id !== 0,
        breaks: []
      };
    });
    setEditedHours(completeHours);
  };


  const handleDayToggle = (dayId: number) => {
    setEditedHours(prev => 
      prev.map(day => 
        day.dayOfWeek === dayId 
          ? { ...day, isAvailable: !day.isAvailable }
          : day
      )
    );
  };

  const handleTimeChange = (dayId: number, field: 'startTime' | 'endTime', value: string) => {
    setEditedHours(prev => 
      prev.map(day => 
        day.dayOfWeek === dayId 
          ? { ...day, [field]: value }
          : day
      )
    );
  };

  const handleBreakChange = (dayId: number, breakIdx: number, field: 'start' | 'end', value: string) => {
    setEditedHours(prev => prev.map(day => {
      if (day.dayOfWeek === dayId) {
        const breaks = day.breaks ? [...day.breaks] : [];
        breaks[breakIdx] = { ...breaks[breakIdx], [field]: value };
        return { ...day, breaks };
      }
      return day;
    }));
  };

  const handleAddBreak = (dayId: number) => {
    setEditedHours(prev => prev.map(day => {
      if (day.dayOfWeek === dayId) {
        const breaks = day.breaks ? [...day.breaks] : [];
        breaks.push({ start: '14:00', end: '15:00' });
        return { ...day, breaks };
      }
      return day;
    }));
  };

  const handleRemoveBreak = (dayId: number, breakIdx: number) => {
    setEditedHours(prev => prev.map(day => {
      if (day.dayOfWeek === dayId) {
        const breaks = day.breaks ? [...day.breaks] : [];
        breaks.splice(breakIdx, 1);
        return { ...day, breaks };
      }
      return day;
    }));
  };

  const handleSave = () => {
    updateWorkingHours(editedHours);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedHours(workingHours);
    setIsEditing(false);
  };

  const handleCopyToAll = (sourceDayId: number) => {
    const sourceDay = editedHours.find(d => d.dayOfWeek === sourceDayId);
    if (sourceDay) {
      setEditedHours(prev => 
        prev.map(day => ({
          ...day,
          startTime: sourceDay.startTime,
          endTime: sourceDay.endTime,
          isAvailable: sourceDay.isAvailable,
          breaks: [...(sourceDay.breaks || [])]
        }))
      );
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDayStatus = (day: WorkingHours) => {
    if (!day.isAvailable) return { text: 'Cerrado', color: 'text-red-400', bg: '', border: '' };
    
    const start = new Date(`2000-01-01T${day.startTime}`);
    const end = new Date(`2000-01-01T${day.endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (hours >= 10) return { text: 'Extendido', color: 'text-green-400', bg: '', border: '' };
    if (hours >= 8) return { text: 'Abierto', color: 'text-green-400', bg: '', border: '' };
    if (hours >= 6) return { text: 'Parcial', color: 'text-barber-copper', bg: '', border: '' };
    return { text: 'Reducido', color: 'text-barber-bronze', bg: '', border: '' };
  };

  return (
    <div 
      key={refreshKey} // Forzar re-render suave
      className={`min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber relative overflow-hidden transition-all duration-700 ease-in-out ${isRegenerating ? 'opacity-75 scale-98' : 'opacity-100 scale-100'}`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Overlay de carga durante regeneración */}
      {isRegenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-500 ease-in-out animate-fade-in">
          <div className="bg-gradient-to-br from-barber-dark via-barber-slate to-barber-charcoal rounded-2xl p-8 max-w-md w-full mx-4 border border-barber-gold/30 shadow-2xl transform scale-95 animate-scale-in">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-barber-gold to-barber-copper rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 border-2 border-barber-black border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-barber-white mb-2 animate-pulse">Regenerando Slots</h3>
                <p className="text-barber-cream/80">Configurando horarios con {slotInterval} minutos de intervalo...</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className={`container mx-auto px-4 py-8 pb-16 relative z-10 transition-all duration-500 ${refreshKey > 0 ? 'animate-fade-in-up' : ''}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 shadow-barber-xl border border-barber-gold/20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-barber-gold to-barber-copper rounded-xl shadow-lg glow-gold animate-pulse-slow">
              <Crown className="h-6 w-6 text-barber-black" />
            </div>
            <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-barber-gold to-barber-copper bg-clip-text text-transparent font-display">
                    Gestión de Horarios
                  </h1>
                  <p className="text-barber-cream/80 font-body flex items-center space-x-2">
                <Settings className="h-4 w-4 animate-spin-slow" />
                    <span>Configura tus horarios de trabajo de forma eficiente</span>
                  </p>
            </div>
          </div>
              
          {!isEditing ? (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                      initializeEditedHours();
                setIsEditing(true);
              }}
                    className="group relative overflow-hidden bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold text-barber-midnight py-3 px-6 sm:py-2 sm:px-6 rounded-lg font-bold hover:from-barber-gold-dark hover:via-barber-bronze hover:to-barber-gold-dark focus:outline-none focus:ring-2 focus:ring-barber-gold/50 transition-all duration-300 shadow-gold-glow transform hover:scale-105 hover:shadow-neon-gold font-barber text-sm flex items-center justify-center space-x-2 w-full sm:w-auto min-h-[44px]"
            >
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Editar Horarios</span>
            </button>
                </div>
          ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleCancel}
                    className="px-4 py-3 sm:py-2 text-barber-gold hover:text-barber-white font-bold transition-all duration-300 flex items-center justify-center space-x-2 hover:bg-barber-gold/10 rounded-lg border border-barber-gold/30 hover:border-barber-gold hover:scale-105 text-sm w-full sm:w-auto min-h-[44px]"
              >
                    <X className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Cancelar</span>
              </button>
              <button
                onClick={handleSave}
                    className="px-6 py-3 sm:py-2 bg-gradient-to-r from-green-500 to-barber-gold text-barber-black font-bold rounded-lg hover:from-green-600 hover:to-barber-copper transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/50 hover:scale-105 glow-green text-sm w-full sm:w-auto min-h-[44px]"
              >
                    <Save className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Guardar</span>
              </button>
            </div>
          )}
        </div>
      </div>
        </div>

        {/* Slot Interval Configuration */}
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-2xl p-6 mb-8 shadow-barber-xl border border-barber-gold/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-barber-cream mb-6 font-display flex items-center space-x-2">
              <Clock className="h-5 w-5 animate-pulse" />
              <span>Configuración de Intervalos</span>
            </h2>
            {isLoadingInterval ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-barber-cream">Cargando configuración...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: 15, label: '15 min', description: 'Muy frecuente' },
                  { value: 30, label: '30 min', description: 'Estándar' },
                  { value: 45, label: '45 min', description: 'Relajado' },
                  { value: 60, label: '1 hora', description: 'Espaciado' }
                ].map((option) => {
                const isSelected = slotInterval === option.value;
                const isSaved = savedInterval === option.value;
                console.log(`🔍 Opción ${option.value}: ${isSelected ? 'SELECCIONADA' : 'no seleccionada'} (slotInterval: ${slotInterval}, savedInterval: ${savedInterval})`);
                return (
                <button
                  key={option.value}
                  onClick={() => {
                    console.log('🔄 Cambiando intervalo de', slotInterval, 'a', option.value);
                    setSlotInterval(option.value);
                  }}
                  className={`group relative overflow-hidden rounded-xl p-4 border transition-all duration-300 transform hover:scale-105 ${
                    slotInterval === option.value
                      ? 'border-barber-gold bg-gradient-to-r from-barber-gold to-barber-copper shadow-lg shadow-barber-gold/50 hover:shadow-barber-gold/60 glow-gold ring-2 ring-barber-gold/50'
                      : 'border-barber-gold/30 bg-gradient-to-br from-barber-dark/40 via-barber-slate/20 to-barber-charcoal/40 hover:border-barber-gold/50 hover:shadow-barber-gold/20'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${
                      slotInterval === option.value 
                        ? (isSaved ? 'text-white drop-shadow-lg' : 'text-barber-gold drop-shadow-lg')
                        : 'text-barber-cream group-hover:text-barber-gold'
                    }`}>
                      {option.label}
                    </div>
                    <div className={`text-sm ${
                      slotInterval === option.value 
                        ? (isSaved ? 'text-white/90 font-semibold' : 'text-barber-gold/90 font-semibold')
                        : 'text-barber-cream/70 group-hover:text-barber-copper'
                    }`}>
                      {option.description}
                    </div>
                  </div>
                </button>
                );
                })}
              </div>
            )}
            <div className="mt-4 p-4 bg-barber-dark/30 rounded-lg border border-barber-gold/20">
              <p className="text-sm text-barber-cream/80">
                <strong className="text-barber-cream">Intervalo actual:</strong> {slotInterval || 'Cargando...'} minutos entre citas
              </p>
              <p className="text-xs text-barber-cream/60 mt-1">
                Los slots se generarán automáticamente con este intervalo cuando regeneres los horarios disponibles.
              </p>
              
              
              <div className="mt-3 flex gap-3">
                <button
                  onClick={async () => {
                    if (isRegenerating) return; // Prevenir múltiples clics
                    
                    setIsRegenerating(true);
                    try {
                      const { ScheduleService } = await import('../../services/scheduleService');
                      
                      // Guardar el intervalo seleccionado en la tabla settings
                      if (slotInterval !== null) {
                        console.log('💾 Guardando intervalo en settings:', slotInterval);
                        await ScheduleService.updateSlotInterval(slotInterval);
                        setSavedInterval(slotInterval);
                        console.log('✅ Intervalo guardado exitosamente en settings');
                      }
                      
                      // Luego regenerar los slots con el nuevo intervalo
                      await ScheduleService.regenerateAvailableSlots(slotInterval || 30);
                      
                      // Mostrar mensaje de éxito con animación
                      
                      // Crear notificación elegante
                      const notification = document.createElement('div');
                      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-500';
                      notification.innerHTML = `
                        <div class="flex items-center space-x-3">
                          <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                          <div>
                            <p class="font-semibold">¡Configuración Guardada!</p>
                            <p class="text-sm opacity-90">Slots regenerados con ${slotInterval} minutos</p>
                          </div>
                        </div>
                      `;
                      
                      document.body.appendChild(notification);
                      
                      // Animar entrada
                      setTimeout(() => {
                        notification.style.transform = 'translateX(0)';
                      }, 100);
                      
                      // Animar salida y actualizar estado sin recargar
                      setTimeout(() => {
                        notification.style.transform = 'translateX(100%)';
                        setTimeout(() => {
                          document.body.removeChild(notification);
                          // En lugar de recargar, actualizamos el estado local
                          // Esto evita el salto brusco
                          setRefreshKey(prev => prev + 1);
                        }, 500);
                      }, 2000); // Reducido a 2 segundos para mejor UX
                      
                    } catch (error) {
                      console.error('Error regenerando slots:', error);
                      
                      // Mostrar error elegante
                      const errorNotification = document.createElement('div');
                      errorNotification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-500';
                      errorNotification.innerHTML = `
                        <div class="flex items-center space-x-3">
                          <div class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                            </svg>
                          </div>
                          <div>
                            <p class="font-semibold">Error al Guardar</p>
                            <p class="text-sm opacity-90">Inténtalo de nuevo</p>
                          </div>
                        </div>
                      `;
                      
                      document.body.appendChild(errorNotification);
                      
                      setTimeout(() => {
                        errorNotification.style.transform = 'translateX(0)';
                      }, 100);
                      
                      setTimeout(() => {
                        errorNotification.style.transform = 'translateX(100%)';
                        setTimeout(() => {
                          document.body.removeChild(errorNotification);
                        }, 500);
                      }, 3000);
                      
                    } finally {
                      setIsRegenerating(false);
                    }
                  }}
                  disabled={isRegenerating}
                  className={`flex-1 font-bold py-2 px-4 rounded-lg transition-all duration-300 transform shadow-lg form-button ${
                    isRegenerating 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-barber-gold to-barber-copper text-barber-black hover:from-barber-gold-dark hover:to-barber-bronze hover:scale-105 hover:shadow-barber-gold/30'
                  }`}
                >
                  {isRegenerating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Regenerando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>🔄</span>
                      <span>Regenerar Slots</span>
                    </div>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔄 Revirtiendo al valor guardado:', savedInterval);
                    setSlotInterval(savedInterval);
                  }}
                  className="px-4 py-2 bg-barber-slate/50 text-barber-cream font-bold rounded-lg hover:bg-barber-slate/70 transition-all duration-300 border border-barber-gold/30 hover:border-barber-gold"
                >
                  ↶ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Schedule Content */}
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-barber-xl border border-barber-gold/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10 p-6">
        {isEditing ? (
              <div className="space-y-6">
            {daysOfWeek.map((day) => {
              const daySchedule = editedHours.find(h => h.dayOfWeek === day.id);
                  if (!daySchedule) return null;

                  const status = getDayStatus(daySchedule);

              return (
                <div
                  key={day.id}
                      className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${
                    daySchedule.isAvailable 
                      ? 'border-barber-gold/50 bg-gradient-to-br from-barber-gold/10 via-barber-dark to-barber-charcoal shadow-lg hover:shadow-barber-gold/20 glow-subtle'
                      : 'border-barber-copper/40 bg-gradient-to-br from-barber-copper/10 via-barber-dark to-barber-charcoal hover:border-barber-copper/60'
                  }`}
                >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                      <button
                        onClick={() => handleDayToggle(day.id)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 flex-shrink-0 ${
                          daySchedule.isAvailable
                            ? 'border-barber-gold bg-gradient-to-br from-barber-gold to-barber-copper shadow-lg hover:shadow-barber-gold/50 glow-gold'
                            : 'border-barber-copper/40 bg-gradient-to-br from-barber-copper/50 to-barber-dark hover:border-barber-copper/60'
                        }`}
                      >
                            {daySchedule.isAvailable && <Check className="h-5 w-5 sm:h-6 sm:w-6 text-barber-black font-bold" />}
                      </button>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{day.emoji}</span>
                            <div className="min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-barber-white font-display truncate">{day.name}</h3>
                              <div className={`text-xs font-bold ${status.color} inline-block`}>
                                {status.text}
                      </div>
                    </div>
                    </div>
                        </div>
                        
                        {daySchedule.isAvailable && (
                          <button
                            onClick={() => handleCopyToAll(day.id)}
                            className="group relative overflow-hidden bg-gradient-to-r from-barber-gold/20 to-barber-copper/20 hover:from-barber-gold/30 hover:to-barber-copper/30 text-barber-gold py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-bold border border-barber-gold/40 hover:border-barber-gold/60 transition-all duration-300 transform hover:scale-105 glow-gold font-barber text-xs sm:text-sm flex items-center justify-center space-x-2 w-full sm:w-auto min-h-[40px] sm:min-h-[44px]"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">Copiar a todos</span>
                          </button>
                        )}
                  </div>

                  {daySchedule.isAvailable && (
                    <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                        <div>
                              <label className="block text-sm font-bold text-barber-cream mb-2 sm:mb-3 font-barber flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-barber-gold animate-pulse flex-shrink-0" />
                                <span className="truncate">Hora de inicio</span>
                          </label>
                          <input
                            type="time"
                            value={daySchedule.startTime}
                            onChange={(e) => handleTimeChange(day.id, 'startTime', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-barber-dark/50 backdrop-blur-sm border border-barber-gold/30 rounded-lg text-barber-white focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold/60 transition-all duration-300 font-barber hover:border-barber-gold/50 glow-subtle text-sm sm:text-base min-h-[44px] form-input"
                          />
                        </div>
                        <div>
                              <label className="block text-sm font-bold text-barber-cream mb-2 sm:mb-3 font-barber flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-barber-gold animate-pulse flex-shrink-0" />
                                <span className="truncate">Hora de cierre</span>
                          </label>
                          <input
                            type="time"
                            value={daySchedule.endTime}
                            onChange={(e) => handleTimeChange(day.id, 'endTime', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-barber-dark/50 backdrop-blur-sm border border-barber-gold/30 rounded-lg text-barber-white focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold/60 transition-all duration-300 font-barber hover:border-barber-gold/50 glow-subtle text-sm sm:text-base min-h-[44px] form-input"
                          />
                        </div>
                      </div>

                          {/* Breaks Section */}
                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-barber-gold/10 rounded-lg border border-barber-gold/30">
                              <h5 className="text-sm font-bold text-barber-cream font-barber flex items-center space-x-2">
                                <Coffee className="h-4 w-4 text-barber-gold animate-pulse flex-shrink-0" />
                            <span>Descansos</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleAddBreak(day.id)}
                                className="group relative overflow-hidden bg-gradient-to-r from-barber-copper/20 to-barber-bronze/20 hover:from-barber-copper/30 hover:to-barber-bronze/30 text-barber-cream/80 py-2 px-3 sm:px-4 rounded-lg font-bold border border-barber-copper/40 hover:border-barber-copper/60 transition-all duration-300 transform hover:scale-105 glow-copper font-barber text-xs sm:text-sm w-full sm:w-auto min-h-[40px] sm:min-h-[44px]"
                          >
                                + Agregar Descanso
                          </button>
                        </div>
                            
                            <div className="space-y-3">
                          {(daySchedule.breaks && daySchedule.breaks.length > 0) ? (
                                (daySchedule.breaks || []).map((brk, idx) => (
                                  <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-barber-copper/20 to-barber-bronze/20 rounded-lg border border-barber-copper/30 shadow-sm">
                                    <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:flex-1 min-w-0">
                                    <input
                                      type="time"
                                      value={brk.start}
                                      onChange={e => handleBreakChange(day.id, idx, 'start', e.target.value)}
                                        className="px-2 sm:px-3 py-2 border border-barber-copper/40 rounded bg-barber-dark/60 text-barber-white font-barber text-xs sm:text-sm focus:border-barber-copper focus:ring-1 focus:ring-barber-copper/30 transition-all duration-300 min-h-[40px] sm:min-h-[44px] flex-1 min-w-0 form-input"
                                    />
                                      <span className="text-barber-copper text-xs sm:text-sm font-barber font-medium flex-shrink-0">a</span>
                                    <input
                                      type="time"
                                      value={brk.end}
                                      onChange={e => handleBreakChange(day.id, idx, 'end', e.target.value)}
                                        className="px-2 sm:px-3 py-2 border border-barber-copper/40 rounded bg-barber-dark/60 text-barber-white font-barber text-xs sm:text-sm focus:border-barber-copper focus:ring-1 focus:ring-barber-copper/30 transition-all duration-300 min-h-[40px] sm:min-h-[44px] flex-1 min-w-0 form-input"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveBreak(day.id, idx)}
                                      className="group relative overflow-hidden bg-red-600/30 hover:bg-red-500/40 text-red-300 p-2 rounded border border-red-400/40 hover:border-red-300/60 transition-all duration-300 transform hover:scale-105 shadow-sm text-xs sm:text-sm w-full sm:w-auto min-h-[40px] sm:min-h-[44px]"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                                ))
                              ) : (
                                <div className="text-xs sm:text-sm text-barber-copper/70 font-barber italic bg-barber-copper/10 p-3 sm:p-4 rounded border border-barber-copper/20 text-center">
                                  No hay descansos configurados para este día
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {daysOfWeek.map((day) => {
              const daySchedule = workingHours.find(h => h.dayOfWeek === day.id);
              if (!daySchedule) {
                const defaultSchedule = {
                  id: `default-${day.id}`,
                  dayOfWeek: day.id,
                  startTime: '09:00',
                  endTime: '18:00',
                      isAvailable: day.id !== 0,
                  breaks: []
                };
                    const status = getDayStatus(defaultSchedule);
                    
                return (
                  <div
                    key={day.id}
                        className={`group relative overflow-hidden p-4 sm:p-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-barber ${
                      defaultSchedule.isAvailable 
                            ? 'bg-gradient-to-r from-green-500/10 to-barber-gold/10 glow-subtle hover:glow-green' 
                            : 'bg-gradient-to-r from-red-500/10 to-barber-dark/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg flex-shrink-0 ${
                          defaultSchedule.isAvailable ? 'bg-green-500 glow-green' : 'bg-red-500 glow-red'
                        }`} />
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <span className="text-xl sm:text-2xl flex-shrink-0">{day.emoji}</span>
                              <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-barber-white font-display truncate">{day.name}</h3>
                                <div className={`text-xs font-bold ${status.color} inline-block`}>
                                  {status.text}
                                </div>
                              </div>
                        </div>
                      </div>
                    </div>
                        <div className="text-xs sm:text-sm text-barber-gold/80 font-barber">
                      {defaultSchedule.isAvailable ? (
                            <span className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-barber-gold flex-shrink-0" />
                              <span className="text-barber-gold font-bold truncate">
                            {formatTime(defaultSchedule.startTime)} - {formatTime(defaultSchedule.endTime)}
                          </span>
                        </span>
                      ) : (
                            <span className="flex items-center space-x-2">
                              <X className="h-3 w-3 sm:h-4 sm:w-4 text-barber-copper flex-shrink-0" />
                              <span className="text-barber-copper font-bold">Cerrado</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

                  const status = getDayStatus(daySchedule);

              return (
                <div
                  key={day.id}
                      className={`group relative overflow-hidden p-4 sm:p-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 font-barber ${
                    daySchedule.isAvailable 
                          ? 'bg-gradient-to-r from-green-500/10 to-barber-gold/10 glow-subtle hover:glow-green' 
                          : 'bg-gradient-to-r from-red-500/10 to-barber-dark/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg flex-shrink-0 ${
                        daySchedule.isAvailable ? 'bg-green-500 glow-green' : 'bg-red-500 glow-red'
                      }`} />
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <span className="text-xl sm:text-2xl flex-shrink-0">{day.emoji}</span>
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-barber-white font-display truncate">{day.name}</h3>
                              <div className={`text-xs font-bold ${status.color} inline-block`}>
                                {status.text}
                              </div>
                            </div>
                      </div>
                    </div>
                  </div>
                      <div className="text-xs sm:text-sm text-barber-gold/80 font-barber">
                    {daySchedule.isAvailable ? (
                          <span className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-barber-gold flex-shrink-0" />
                            <span className="text-barber-gold font-bold truncate">
                          {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                        </span>
                      </span>
                    ) : (
                          <span className="flex items-center space-x-2">
                            <X className="h-3 w-3 sm:h-4 sm:w-4 text-barber-copper flex-shrink-0" />
                        <span className="text-barber-copper font-bold">Cerrado</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManager;