import { supabase } from '../lib/supabase';
import { Appointment } from '../types';
import { ScheduleService } from './scheduleService';

export class AppointmentService {
  static async getAppointments(): Promise<Appointment[]> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error);
          return this.getMockAppointments();
        }

        if (data) {
          return data.map(appointment => ({
            id: appointment.id,
            clientId: appointment.client_id,
            clientName: appointment.client_name,
            clientPhone: appointment.client_phone,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            service: appointment.service,
            price: appointment.price,
            notes: appointment.notes,
            createdAt: appointment.created_at
          }));
        }
      }

      // Fallback a datos mock si Supabase no está configurado
      return this.getMockAppointments();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return this.getMockAppointments();
    }
  }

  private static getMockAppointments(): Appointment[] {
    return [
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
  }

  static async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment | null> {
    try {
      console.log('🔄 Creando cita en AppointmentService...', appointment);
      
      // PRIMERO: Verificar que el slot esté disponible
      const isAvailable = await ScheduleService.isSlotAvailable(appointment.date, appointment.time);
      if (!isAvailable) {
        console.error('❌ El slot ya no está disponible:', appointment.date, appointment.time);
        throw new Error('El horario seleccionado ya no está disponible');
      }

      // SEGUNDO: Marcar el slot como reservado ANTES de crear la cita
      console.log('🔒 Marcando slot como reservado...', appointment.date, appointment.time);
      const slotMarked = await ScheduleService.markSlotAsBooked(appointment.date, appointment.time);
      if (!slotMarked) {
        console.error('❌ No se pudo marcar el slot como reservado');
        throw new Error('No se pudo reservar el horario seleccionado');
      }

      // TERCERO: Crear la cita en Supabase
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('💾 Creando cita en Supabase...');
        
        // Generar un UUID válido para el client_id si no es un UUID válido
        let clientId = appointment.clientId;
        if (!this.isValidUUID(clientId)) {
          clientId = this.generateUUID();
          console.log('🔄 Generando UUID válido para clientId:', clientId);
        }
        
        const { data, error } = await supabase
          .from('appointments')
          .insert({
            client_id: clientId,
            client_name: appointment.clientName,
            client_phone: appointment.clientPhone,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
            service: appointment.service,
            price: appointment.price,
            notes: appointment.notes
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error creando cita en Supabase:', error);
          // Si falla la creación de la cita, liberar el slot
          await ScheduleService.markSlotAsAvailable(appointment.date, appointment.time);
          throw new Error('Error al crear la cita en la base de datos');
        }

        if (data) {
          console.log('✅ Cita creada exitosamente en Supabase:', data.id);
          return {
            id: data.id,
            clientId: data.client_id,
            clientName: data.client_name,
            clientPhone: data.client_phone,
            date: data.date,
            time: data.time,
            status: data.status,
            service: data.service,
            price: data.price,
            notes: data.notes,
            createdAt: data.created_at
          };
        }
      }

      // Fallback a creación mock si Supabase no está configurado
      console.log('⚠️ Supabase no configurado, usando mock');
      const mockAppointment = this.createMockAppointment(appointment);
      return mockAppointment;
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      throw error; // Re-lanzar el error para que el contexto lo maneje
    }
  }

  private static createMockAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    return {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
  }

  // Función para validar si un string es un UUID válido
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Función para generar un UUID v4 válido
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  static async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    try {
      // TODO: Implementar actualización en Supabase
      console.log('Updating appointment:', id, updates);
      return null;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return null;
    }
  }

  static async cancelAppointment(id: string): Promise<boolean> {
    try {
      console.log('🔄 Cancelando cita:', id);
      
      // PRIMERO: Obtener la cita para conocer fecha y hora
      const appointments = await this.getAppointments();
      const appointment = appointments.find(apt => apt.id === id);
      
      if (!appointment) {
        console.error('❌ Cita no encontrada:', id);
        throw new Error('Cita no encontrada');
      }

      // SEGUNDO: Actualizar el estado de la cita a 'cancelled' en Supabase
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('💾 Actualizando cita en Supabase...');
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', id);

        if (error) {
          console.error('❌ Error actualizando cita en Supabase:', error);
          throw new Error('Error al cancelar la cita en la base de datos');
        }
      }

      // TERCERO: Marcar el slot como disponible
      console.log('🔓 Liberando slot:', appointment.date, appointment.time);
      const slotFreed = await ScheduleService.markSlotAsAvailable(appointment.date, appointment.time);
      if (!slotFreed) {
        console.error('❌ No se pudo liberar el slot');
        // No lanzamos error aquí porque la cita ya se canceló
      }

      console.log('✅ Cita cancelada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error cancelando cita:', error);
      throw error;
    }
  }

  static async completeAppointment(id: string): Promise<boolean> {
    try {
      console.log('🔄 Completando cita:', id);
      
      // Actualizar el estado de la cita a 'completed' en Supabase
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('💾 Marcando cita como completada en Supabase...');
        const { error } = await supabase
          .from('appointments')
          .update({ 
            status: 'completed'
          })
          .eq('id', id);

        if (error) {
          console.error('❌ Error actualizando cita en Supabase:', error);
          throw new Error('Error al completar la cita en la base de datos');
        }
      }

      console.log('✅ Cita completada exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error completando cita:', error);
      throw error;
    }
  }

  static async deleteAppointment(id: string): Promise<boolean> {
    try {
      // TODO: Implementar eliminación en Supabase
      console.log('Deleting appointment:', id);
      return true;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
  }

  static async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    try {
      const appointments = await this.getAppointments();
      return appointments.filter(appointment => appointment.date === date);
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      return [];
    }
  }

  static async getClientAppointments(clientId: string): Promise<Appointment[]> {
    try {
      const appointments = await this.getAppointments();
      return appointments.filter(appointment => appointment.clientId === clientId);
    } catch (error) {
      console.error('Error fetching client appointments:', error);
      return [];
    }
  }

  // Métodos para integración futura con Supabase
  static async syncWithSupabase(): Promise<void> {
    try {
      // TODO: Implementar sincronización con Supabase
      console.log('Syncing with Supabase...');
    } catch (error) {
      console.error('Error syncing with Supabase:', error);
    }
  }
}
