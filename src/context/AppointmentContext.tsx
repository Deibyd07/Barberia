import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment } from '../types';
import { AppointmentService } from '../services/appointmentService';
import NotificationService from '../services/notificationService';
import AppointmentCompletionService from '../services/appointmentCompletionService';
import pushNotificationService from '../services/pushNotificationService';

// Importamos el contexto de horarios para marcar slots como reservados
let scheduleContext: any = null;
export const setScheduleContext = (context: any) => {
  scheduleContext = context;
};

interface AppointmentContextType {
  appointments: Appointment[];
  isLoading: boolean;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  cancelAppointment: (id: string) => Promise<void>;
  getAppointmentsByDate: (date: string) => Appointment[];
  getClientAppointments: (clientId: string) => Appointment[];
  refreshAppointments: () => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

// Mock appointments
const initialAppointments: Appointment[] = [
  {
    id: '1',
    clientId: 'client1',
    clientName: 'Juan Pérez',
    clientPhone: '+57 300 987 6543',
    date: '2025-01-15',
    time: '10:00',
    status: 'confirmed',
    service: 'Corte de cabello',
            price: 12000,
    createdAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '2',
    clientId: 'client2',
    clientName: 'María García',
    clientPhone: '+57 300 555 1234',
    date: '2025-01-15',
    time: '14:00',
    status: 'confirmed',
    service: 'Corte de cabello',
            price: 12000,
    createdAt: '2025-01-10T00:00:00Z'
  }
];

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔧 AppointmentProvider initializing...');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar citas desde Supabase al inicializar
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando citas desde Supabase...');
        
        if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
          const appointments = await AppointmentService.getAppointments();
          console.log('✅ Citas cargadas desde Supabase:', appointments.length);
          
          // Verificar y completar citas automáticamente
          const updatedAppointments = await AppointmentCompletionService.checkAndCompleteAppointments(appointments);
          setAppointments(updatedAppointments);
        } else {
          console.log('⚠️ Supabase no configurado, usando localStorage');
          const storedAppointments = localStorage.getItem('barbershop_appointments');
          if (storedAppointments) {
            const appointments = JSON.parse(storedAppointments);
            // Verificar y completar citas automáticamente
            const updatedAppointments = await AppointmentCompletionService.checkAndCompleteAppointments(appointments);
            setAppointments(updatedAppointments);
          }
        }
      } catch (error) {
        console.error('❌ Error loading appointments:', error);
        // Fallback a localStorage
        const storedAppointments = localStorage.getItem('barbershop_appointments');
        if (storedAppointments) {
          const appointments = JSON.parse(storedAppointments);
          // Verificar y completar citas automáticamente
          const updatedAppointments = await AppointmentCompletionService.checkAndCompleteAppointments(appointments);
          setAppointments(updatedAppointments);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadAppointments();
    
    // Inicializar notificaciones
    NotificationService.initialize();
    
    // Timer para verificar citas automáticamente cada 5 minutos
    const completionTimer = setInterval(async () => {
      console.log('🔄 Verificando citas para completar automáticamente...');
      try {
        const currentAppointments = appointments;
        if (currentAppointments.length > 0) {
          const updatedAppointments = await AppointmentCompletionService.checkAndCompleteAppointments(currentAppointments);
          // Solo actualizar si hay cambios
          if (updatedAppointments.length !== currentAppointments.length || 
              updatedAppointments.some((apt, index) => apt.status !== currentAppointments[index]?.status)) {
            setAppointments(updatedAppointments);
            console.log('✅ Citas actualizadas automáticamente');
          }
        }
      } catch (error) {
        console.error('❌ Error en verificación automática:', error);
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Cleanup del timer
    return () => {
      clearInterval(completionTimer);
    };
  }, []);

  // Sincronizar con localStorage como backup
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('barbershop_appointments', JSON.stringify(appointments));
    }
  }, [appointments, isLoading]);

  const refreshAppointments = async () => {
    try {
      console.log('🔄 Recargando citas...');
      setIsLoading(true);
      
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const appointments = await AppointmentService.getAppointments();
        console.log('✅ Citas recargadas desde Supabase:', appointments.length);
        
        // Verificar y completar citas automáticamente
        const updatedAppointments = await AppointmentCompletionService.checkAndCompleteAppointments(appointments);
        setAppointments(updatedAppointments);
      } else {
        console.log('⚠️ Supabase no configurado, usando localStorage');
        const storedAppointments = localStorage.getItem('barbershop_appointments');
        if (storedAppointments) {
          const appointments = JSON.parse(storedAppointments);
          // Verificar y completar citas automáticamente
          const updatedAppointments = await AppointmentCompletionService.checkAndCompleteAppointments(appointments);
          setAppointments(updatedAppointments);
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    try {
      console.log('🔄 Creando cita en el contexto...', appointmentData);
      
      // El AppointmentService ya maneja la verificación de disponibilidad y marcado de slots
      const newAppointment = await AppointmentService.createAppointment(appointmentData);
      
      if (newAppointment) {
        console.log('✅ Cita creada exitosamente:', newAppointment);
        
        // Actualizar inmediatamente el estado local
        setAppointments(prev => [newAppointment, ...prev]);
        console.log('✅ Cita agregada al estado local inmediatamente');
        
        // Disparar evento personalizado para notificar a otros componentes
        window.dispatchEvent(new CustomEvent('appointmentCreated', { 
          detail: { appointment: newAppointment } 
        }));
        console.log('✅ Evento appointmentCreated disparado');
        
        // Mostrar notificación al barbero
        await NotificationService.showAppointmentNotification(newAppointment, 'created');
        
        // Enviar notificación push para el celular
        try {
          await pushNotificationService.notifyNewAppointment(newAppointment);
        } catch (error) {
          console.warn('⚠️ Error enviando notificación push:', error);
        }
        
        // También recargar desde la base de datos para asegurar sincronización
        setTimeout(async () => {
          console.log('🔄 Recargando citas desde base de datos...');
          await refreshAppointments();
        }, 100);
      } else {
        console.log('⚠️ No se pudo crear la cita');
        throw new Error('No se pudo crear la cita');
      }
    } catch (error) {
      console.error('❌ Error adding appointment:', error);
      // Re-lanzar el error para que el componente pueda manejarlo
      throw error;
    }
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => 
      prev.map(appointment => 
        appointment.id === id ? { ...appointment, ...updates } : appointment
      )
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(appointment => appointment.id !== id));
  };

  const cancelAppointment = async (id: string) => {
    try {
      console.log('🔄 Cancelando cita en el contexto...', id);
      
      // Usar el AppointmentService para cancelar la cita
      const success = await AppointmentService.cancelAppointment(id);
      
      if (success) {
        console.log('✅ Cita cancelada exitosamente');
        
        // Encontrar la cita cancelada para mostrar notificación
        const cancelledAppointment = appointments.find(apt => apt.id === id);
        if (cancelledAppointment) {
          await NotificationService.showAppointmentNotification(cancelledAppointment, 'cancelled');
          
          // Enviar notificación push para el celular
          try {
            await pushNotificationService.notifyCancelledAppointment(cancelledAppointment);
          } catch (error) {
            console.warn('⚠️ Error enviando notificación push de cancelación:', error);
          }
        }
        
        // Recargar todas las citas para asegurar sincronización
        await refreshAppointments();
      } else {
        throw new Error('No se pudo cancelar la cita');
      }
    } catch (error) {
      console.error('❌ Error canceling appointment:', error);
      throw error;
    }
  };

  const getAppointmentsByDate = (date: string) => {
    return appointments.filter(appointment => appointment.date === date);
  };

  const getClientAppointments = (clientId: string) => {
    return appointments.filter(appointment => appointment.clientId === clientId);
  };

  console.log('🔧 AppointmentProvider rendering with context value:', {
    appointments: appointments.length,
    isLoading
  });

  return (
    <AppointmentContext.Provider value={{
      appointments,
      isLoading,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      cancelAppointment,
      getAppointmentsByDate,
      getClientAppointments,
      refreshAppointments
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};