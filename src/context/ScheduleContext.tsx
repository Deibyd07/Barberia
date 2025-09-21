import React, { createContext, useContext, useState, useEffect } from 'react';
import { WorkingHours, AvailableSlot } from '../types';
import { ScheduleService } from '../services/scheduleService';

interface ScheduleContextType {
  workingHours: WorkingHours[];
  availableSlots: AvailableSlot[];
  updateWorkingHours: (workingHours: WorkingHours[]) => Promise<void>;
  addAvailableSlot: (date: string, time: string) => Promise<void>;
  removeAvailableSlot: (date: string, time: string) => Promise<void>;
  markSlotAsBooked: (date: string, time: string) => Promise<void>;
  isSlotAvailable: (date: string, time: string) => Promise<boolean>;
  getAvailableSlotsForDate: (date: string) => AvailableSlot[];
  generateSlotsForDate: (date: string) => Promise<AvailableSlot[]>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Horarios por defecto (Lunes a Sábado, 9 AM a 6 PM)
const defaultWorkingHours: WorkingHours[] = [
  { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Lunes
  { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Martes
  { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Miércoles
  { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Jueves
  { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Viernes
  { id: '6', dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Sábado
  { id: '7', dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isAvailable: false }, // Domingo
];

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(defaultWorkingHours);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar horarios de trabajo desde Supabase
        const workingHoursData = await ScheduleService.getWorkingHours();
        if (workingHoursData.length > 0) {
          setWorkingHours(workingHoursData);
        } else {
          // Fallback a localStorage si no hay datos en Supabase
          const storedWorkingHours = localStorage.getItem('barbershop_working_hours');
          if (storedWorkingHours) {
            setWorkingHours(JSON.parse(storedWorkingHours));
          }
        }

        // Cargar slots disponibles desde Supabase
        const availableSlotsData = await ScheduleService.getAvailableSlots();
        if (availableSlotsData.length > 0) {
          setAvailableSlots(availableSlotsData);
        } else {
          // Fallback a localStorage si no hay datos en Supabase
          const storedAvailableSlots = localStorage.getItem('barbershop_available_slots');
          if (storedAvailableSlots) {
            setAvailableSlots(JSON.parse(storedAvailableSlots));
          }
        }

        // La configuración de slots se mantiene en la tabla settings
        console.log('📊 Configuración de slots cargada desde settings');
      } catch (error) {
        console.error('Error loading schedule data:', error);
        // Fallback a localStorage en caso de error
        const storedWorkingHours = localStorage.getItem('barbershop_working_hours');
        const storedAvailableSlots = localStorage.getItem('barbershop_available_slots');
        
        if (storedWorkingHours) {
          setWorkingHours(JSON.parse(storedWorkingHours));
        }
        
        if (storedAvailableSlots) {
          setAvailableSlots(JSON.parse(storedAvailableSlots));
        }
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('barbershop_working_hours', JSON.stringify(workingHours));
  }, [workingHours]);

  useEffect(() => {
    localStorage.setItem('barbershop_available_slots', JSON.stringify(availableSlots));
  }, [availableSlots]);

  const updateWorkingHours = async (newWorkingHours: WorkingHours[]) => {
    try {
      console.log('🔄 Actualizando horarios de trabajo...', newWorkingHours);
      
      // Actualizar en Supabase
      const success = await ScheduleService.updateWorkingHours(newWorkingHours);
      if (success) {
        setWorkingHours(newWorkingHours);
        console.log('✅ Horarios actualizados exitosamente');
        
        // Notificar a otros componentes que los horarios han cambiado
        window.dispatchEvent(new CustomEvent('workingHoursUpdated', { 
          detail: newWorkingHours 
        }));
      } else {
        console.error('❌ Error al actualizar horarios en Supabase');
        // Fallback a estado local
        setWorkingHours(newWorkingHours);
      }
    } catch (error) {
      console.error('❌ Error updating working hours:', error);
      // Fallback a estado local
      setWorkingHours(newWorkingHours);
    }
  };

  const addAvailableSlot = async (date: string, time: string) => {
    try {
      const success = await ScheduleService.addAvailableSlot(date, time);
      if (success) {
        const slotExists = availableSlots.some(slot => slot.date === date && slot.time === time);
        if (!slotExists) {
          setAvailableSlots(prev => [...prev, { date, time, isBooked: false }]);
        }
      }
    } catch (error) {
      console.error('Error adding available slot:', error);
      // Fallback a estado local
      const slotExists = availableSlots.some(slot => slot.date === date && slot.time === time);
      if (!slotExists) {
        setAvailableSlots(prev => [...prev, { date, time, isBooked: false }]);
      }
    }
  };

  const removeAvailableSlot = async (date: string, time: string) => {
    try {
      const success = await ScheduleService.removeAvailableSlot(date, time);
      if (success) {
        setAvailableSlots(prev => prev.filter(slot => !(slot.date === date && slot.time === time)));
      }
    } catch (error) {
      console.error('Error removing available slot:', error);
      // Fallback a estado local
      setAvailableSlots(prev => prev.filter(slot => !(slot.date === date && slot.time === time)));
    }
  };

  const markSlotAsBooked = async (date: string, time: string) => {
    try {
      const success = await ScheduleService.markSlotAsBooked(date, time);
      if (success) {
        setAvailableSlots(prev => 
          prev.map(slot => 
            slot.date === date && slot.time === time 
              ? { ...slot, isBooked: true }
              : slot
          )
        );
      }
    } catch (error) {
      console.error('Error marking slot as booked:', error);
      // Fallback a estado local
      setAvailableSlots(prev => 
        prev.map(slot => 
          slot.date === date && slot.time === time 
            ? { ...slot, isBooked: true }
            : slot
        )
      );
    }
  };

  const isSlotAvailable = async (date: string, time: string) => {
    try {
      return await ScheduleService.isSlotAvailable(date, time);
    } catch (error) {
      console.error('Error checking slot availability:', error);
      // Fallback a estado local
      return availableSlots.some(slot => slot.date === date && slot.time === time && !slot.isBooked);
    }
  };

  const getAvailableSlotsForDate = (date: string) => {
    return availableSlots.filter(slot => slot.date === date);
  };

  const generateSlotsForDate = async (date: string): Promise<AvailableSlot[]> => {
    try {
      // Usar ScheduleService para generar slots
      const slots = await ScheduleService.generateSlotsForDate(date);
      
      // Actualizar estado local con los slots generados
      const newSlots = slots.filter(slot => 
        !availableSlots.some(existingSlot => 
          existingSlot.date === slot.date && existingSlot.time === slot.time
        )
      );
      
      if (newSlots.length > 0) {
        setAvailableSlots(prev => [...prev, ...newSlots]);
      }
      
      return slots;
    } catch (error) {
      console.error('Error generating slots for date:', error);
      // Fallback a generación local
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      
      const daySchedule = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
      if (!daySchedule || !daySchedule.isAvailable) {
        return [];
      }

      const slots: AvailableSlot[] = [];
      const startTime = new Date(`2000-01-01T${daySchedule.startTime}`);
      const endTime = new Date(`2000-01-01T${daySchedule.endTime}`);
      const breaks = daySchedule.breaks || [];
      
      // Generar slots cada 30 minutos
      const currentTime = new Date(startTime);
      while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().slice(0, 5);
        // Excluir si el slot cae dentro de algún break
        const isInBreak = breaks.some(b => {
          const breakStart = new Date(`2000-01-01T${b.start}`);
          const breakEnd = new Date(`2000-01-01T${b.end}`);
          return currentTime >= breakStart && currentTime < breakEnd;
        });
        if (!isInBreak) {
          const existingSlot = availableSlots.find(slot => slot.date === date && slot.time === timeString);
          slots.push({
            date,
            time: timeString,
            isBooked: existingSlot ? existingSlot.isBooked : false
          });
        }
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      return slots;
    }
  };

  return (
    <ScheduleContext.Provider value={{
      workingHours,
      availableSlots,
      updateWorkingHours,
      addAvailableSlot,
      removeAvailableSlot,
      markSlotAsBooked,
      isSlotAvailable,
      getAvailableSlotsForDate,
      generateSlotsForDate
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};
