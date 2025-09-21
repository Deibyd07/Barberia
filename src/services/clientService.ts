import { supabase } from '../lib/supabase';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'client' | 'admin';
  totalAppointments?: number;
  completedAppointments?: number;
  lastAppointment?: string;
  status?: string;
  joinDate?: string;
}

class ClientService {
  // Obtener todos los clientes de la tabla users
  static async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error obteniendo clientes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      return [];
    }
  }

  // Crear un nuevo cliente
  static async createClient(client: Omit<Client, 'id'>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: client.name,
          phone: client.phone,
          email: client.email || '',
          role: 'client'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creando cliente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creando cliente:', error);
      return null;
    }
  }

  // Actualizar un cliente
  static async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          phone: updates.phone,
          email: updates.email
        })
        .eq('id', id)
        .eq('role', 'client') // Asegurar que solo actualizamos clientes
        .select()
        .single();

      if (error) {
        console.error('Error actualizando cliente:', error);
        return null;
      }

      // Actualizar también en appointments para mantener consistencia
      const { error: appointmentError } = await supabase
        .from('appointments')
        .update({
          client_name: updates.name,
          client_phone: updates.phone,
        })
        .eq('client_id', id);

      if (appointmentError) {
        console.error('Error actualizando cliente en appointments:', appointmentError);
        // No lanzar error aquí, ya que el cliente se actualizó correctamente en users
      }

      return data;
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      return null;
    }
  }

  // Eliminar un cliente
  static async deleteClient(id: string): Promise<boolean> {
    try {
      // Primero verificar si el cliente tiene citas activas
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('client_id', id)
        .neq('status', 'cancelled'); // No permitir eliminar si tiene citas activas

      if (appointmentsError) {
        console.error('Error verificando citas del cliente:', appointmentsError);
        return false;
      }

      if (appointments && appointments.length > 0) {
        console.warn('No se puede eliminar cliente con citas activas');
        return false;
      }

      // Eliminar el cliente de la tabla users
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .eq('role', 'client'); // Asegurar que solo eliminamos clientes

      if (error) {
        console.error('Error eliminando cliente:', error);
        return false;
      }

      // Eliminar citas canceladas o completadas del cliente
      const { error: appointmentDeleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('client_id', id);

      if (appointmentDeleteError) {
        console.error('Error eliminando citas del cliente:', appointmentDeleteError);
        // No lanzar error aquí, ya que el cliente se eliminó correctamente de users
      }

      return true;
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      return false;
    }
  }

  // Obtener cliente por ID
  static async getClientById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', 'client')
        .single();

      if (error) {
        console.error('Error obteniendo cliente:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      return null;
    }
  }

  // Obtener estadísticas del cliente
  static async getClientStats(clientId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    lastAppointment: string | null;
  }> {
    try {
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('status, date, created_at')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error obteniendo estadísticas del cliente:', error);
        return {
          totalAppointments: 0,
          completedAppointments: 0,
          lastAppointment: null
        };
      }

      const totalAppointments = appointments?.length || 0;
      const completedAppointments = appointments?.filter(apt => apt.status === 'completed').length || 0;
      const lastAppointment = appointments?.[0]?.date || null;

      return {
        totalAppointments,
        completedAppointments,
        lastAppointment
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del cliente:', error);
      return {
        totalAppointments: 0,
        completedAppointments: 0,
        lastAppointment: null
      };
    }
  }
}

export default ClientService;
