import { supabase } from '../lib/supabase';
import { WorkingHours, AvailableSlot } from '../types';
import { createLocalDate, getDayOfWeek, getDayName } from '../utils/dateUtils';

export class ScheduleService {
  static async getSlotInterval(): Promise<number> {
    try {
      console.log('🔍 getSlotInterval: Iniciando carga desde base de datos...');
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase no está configurado');
      }

      console.log('🔍 getSlotInterval: Cargando desde Supabase...');
      const { data, error } = await supabase
        .from('settings')
        .select('slot_interval')
        .eq('key', 'slot_interval')
        .single();

      if (error) {
        console.log('⚠️ getSlotInterval: Error en Supabase:', error.message);
        throw new Error(`Error en base de datos: ${error.message}`);
      }

      const interval = data?.slot_interval || 30;
      console.log('✅ getSlotInterval: Valor desde Supabase:', interval);
      return interval;
    } catch (error) {
      console.error('❌ getSlotInterval: Error general:', error);
      throw error; // No usar localStorage, lanzar el error
    }
  }

  static async updateSlotInterval(interval: number): Promise<boolean> {
    try {
      // Validar que el intervalo no sea null o undefined
      if (interval === null || interval === undefined || isNaN(interval)) {
        console.error('❌ updateSlotInterval: Intervalo inválido:', interval);
        return false;
      }
      
      console.log('💾 updateSlotInterval: Guardando intervalo en base de datos:', interval);
      
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase no está configurado');
      }

      console.log('💾 updateSlotInterval: Guardando en Supabase...');
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'slot_interval',
          slot_interval: interval,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('❌ updateSlotInterval: Error en Supabase:', error);
        throw new Error(`Error guardando en base de datos: ${error.message}`);
      }

      console.log('✅ updateSlotInterval: Guardado exitosamente en Supabase:', interval);
      return true;
    } catch (error) {
      console.error('❌ updateSlotInterval: Error general:', error);
      throw error; // No usar localStorage, lanzar el error
    }
  }

  static async getWorkingHours(): Promise<WorkingHours[]> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase
          .from('working_hours')
          .select('*')
          .order('day_of_week');

        if (error) {
          console.error('Supabase error:', error);
          return this.getDefaultWorkingHours();
        }

        if (data && data.length > 0) {
          return data.map(wh => ({
            id: wh.id,
            dayOfWeek: wh.day_of_week,
            startTime: wh.start_time,
            endTime: wh.end_time,
            isAvailable: wh.is_available,
            breaks: wh.breaks || []
          }));
        }
      }

      // Fallback a datos por defecto si Supabase no está configurado
      return this.getDefaultWorkingHours();
    } catch (error) {
      console.error('Error fetching working hours:', error);
      return this.getDefaultWorkingHours();
    }
  }

  private static getDefaultWorkingHours(): WorkingHours[] {
    return [
      { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Lunes
      { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Martes
      { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Miércoles
      { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Jueves
      { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Viernes
      { id: '6', dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isAvailable: true }, // Sábado
      { id: '7', dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isAvailable: false }, // Domingo
    ];
  }

  static async updateWorkingHours(workingHours: WorkingHours[]): Promise<boolean> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('🔄 Actualizando horarios en Supabase...', workingHours);
        
        // Primero eliminar todos los horarios existentes
        const { error: deleteError } = await supabase
          .from('working_hours')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos los registros

        if (deleteError) {
          console.error('❌ Error deleting existing working hours:', deleteError);
          return false;
        }

        // Luego insertar los nuevos horarios
        const workingHoursData = workingHours.map(wh => ({
          day_of_week: wh.dayOfWeek,
          start_time: wh.startTime,
          end_time: wh.endTime,
          is_available: wh.isAvailable,
          breaks: wh.breaks || []
        }));

        const { error: insertError } = await supabase
          .from('working_hours')
          .insert(workingHoursData);

        if (insertError) {
          console.error('❌ Error inserting working hours:', insertError);
          return false;
        }

        console.log('✅ Horarios actualizados exitosamente en Supabase');
        
        // Regenerar slots disponibles para los próximos 30 días
        await this.regenerateAvailableSlots();
        
        return true;
      }

      // Fallback para desarrollo
      console.log('⚠️ Supabase no configurado, usando localStorage');
      localStorage.setItem('barbershop_working_hours', JSON.stringify(workingHours));
      return true;
    } catch (error) {
      console.error('❌ Error updating working hours:', error);
      return false;
    }
  }

  static async getAvailableSlots(): Promise<AvailableSlot[]> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase
          .from('available_slots')
          .select('*')
          .order('date')
          .order('time');

        if (error) {
          console.error('Supabase error:', error);
          return [];
        }

        if (data) {
          return data.map(slot => ({
            date: slot.date,
            time: slot.time,
            isBooked: slot.is_booked
          }));
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  static async addAvailableSlot(date: string, time: string): Promise<boolean> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { error } = await supabase
          .from('available_slots')
          .insert({
            date,
            time,
            is_booked: false
          });

        if (error) {
          console.error('Supabase error:', error);
          return false;
        }

        return true;
      }

      // Fallback para desarrollo
      console.log('Adding available slot (mock):', date, time);
      return true;
    } catch (error) {
      console.error('Error adding available slot:', error);
      return false;
    }
  }

  static async removeAvailableSlot(date: string, time: string): Promise<boolean> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { error } = await supabase
          .from('available_slots')
          .delete()
          .eq('date', date)
          .eq('time', time);

        if (error) {
          console.error('Supabase error:', error);
          return false;
        }

        return true;
      }

      // Fallback para desarrollo
      console.log('Removing available slot (mock):', date, time);
      return true;
    } catch (error) {
      console.error('Error removing available slot:', error);
      return false;
    }
  }

  static async markSlotAsBooked(date: string, time: string): Promise<boolean> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Primero verificar si el slot existe
        const { data: existingSlot, error: selectError } = await supabase
          .from('available_slots')
          .select('id, is_booked')
          .eq('date', date)
          .eq('time', time)
          .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Supabase select error:', selectError);
          return false;
        }

        if (existingSlot) {
          // Si el slot existe, actualizarlo
          const { error: updateError } = await supabase
            .from('available_slots')
            .update({ is_booked: true })
            .eq('id', existingSlot.id);

          if (updateError) {
            console.error('Supabase update error:', updateError);
            return false;
          }
        } else {
          // Si el slot no existe, crearlo como reservado
          const { error: insertError } = await supabase
            .from('available_slots')
            .insert({
              date,
              time,
              is_booked: true
            });

          if (insertError) {
            console.error('Supabase insert error:', insertError);
            return false;
          }
        }

        console.log('✅ Slot marcado como reservado:', date, time);
        return true;
      }

      // Fallback para desarrollo
      console.log('Marking slot as booked (mock):', date, time);
      return true;
    } catch (error) {
      console.error('Error marking slot as booked:', error);
      return false;
    }
  }

  static async markSlotAsAvailable(date: string, time: string): Promise<boolean> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Primero verificar si el slot existe
        const { data: existingSlot, error: selectError } = await supabase
          .from('available_slots')
          .select('id, is_booked')
          .eq('date', date)
          .eq('time', time)
          .single();

        if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Supabase select error:', selectError);
          return false;
        }

        if (existingSlot) {
          // Si el slot existe, actualizarlo
          const { error: updateError } = await supabase
            .from('available_slots')
            .update({ is_booked: false })
            .eq('id', existingSlot.id);

          if (updateError) {
            console.error('Supabase update error:', updateError);
            return false;
          }
        } else {
          // Si el slot no existe, crearlo como disponible
          const { error: insertError } = await supabase
            .from('available_slots')
            .insert({
              date,
              time,
              is_booked: false
            });

          if (insertError) {
            console.error('Supabase insert error:', insertError);
            return false;
          }
        }

        console.log('✅ Slot marcado como disponible:', date, time);
        return true;
      }

      // Fallback para desarrollo
      console.log('Marking slot as available (mock):', date, time);
      return true;
    } catch (error) {
      console.error('Error marking slot as available:', error);
      return false;
    }
  }

  static async isSlotAvailable(date: string, time: string): Promise<boolean> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase
          .from('available_slots')
          .select('is_booked')
          .eq('date', date)
          .eq('time', time)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Supabase error:', error);
          return false;
        }

        // Si no hay datos, el slot está disponible
        if (!data) {
          console.log('Slot no encontrado, asumiendo disponible:', date, time);
          return true;
        }

        const isAvailable = !data.is_booked;
        console.log(`Slot ${date} ${time}: ${isAvailable ? 'disponible' : 'reservado'}`);
        return isAvailable;
      }

      // Fallback para desarrollo
      console.log('Checking slot availability (mock):', date, time);
      return true;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }

  // Método para regenerar slots disponibles basado en horarios de trabajo
  static async regenerateAvailableSlots(intervalMinutes: number = 30): Promise<void> {
    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        console.log('⚠️ Supabase no configurado, saltando regeneración de slots');
        return;
      }

      console.log('🔄 Regenerando slots disponibles...');
      
      // Obtener horarios de trabajo actuales
      const workingHours = await this.getWorkingHours();
      
      // Generar slots para los próximos 30 días
      const today = new Date();
      const slotsToInsert = [];
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        
        // Buscar horario para este día
        const daySchedule = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
        
        if (daySchedule && daySchedule.isAvailable) {
          // Generar slots con el intervalo configurado
          const startTime = new Date(`2000-01-01T${daySchedule.startTime}`);
          const endTime = new Date(`2000-01-01T${daySchedule.endTime}`);
          
          let currentTime = new Date(startTime);
          
          while (currentTime < endTime) {
            const timeString = currentTime.toTimeString().slice(0, 5);
            
            // Verificar si este horario está en un descanso
            const isInBreak = daySchedule.breaks?.some(breakTime => {
              const breakStart = new Date(`2000-01-01T${breakTime.start}`);
              const breakEnd = new Date(`2000-01-01T${breakTime.end}`);
              return currentTime >= breakStart && currentTime < breakEnd;
            });
            
            if (!isInBreak) {
              slotsToInsert.push({
                date: dateString,
                time: timeString,
                is_booked: false
              });
            }
            
            // Avanzar según el intervalo configurado
            currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
          }
        }
      }
      
      if (slotsToInsert.length > 0) {
        // Eliminar slots existentes para las fechas que vamos a regenerar
        const startDate = today.toISOString().split('T')[0];
        const endDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        await supabase
          .from('available_slots')
          .delete()
          .gte('date', startDate)
          .lte('date', endDate);
        
        // Insertar nuevos slots en lotes de 100
        const batchSize = 100;
        for (let i = 0; i < slotsToInsert.length; i += batchSize) {
          const batch = slotsToInsert.slice(i, i + batchSize);
          const { error } = await supabase
            .from('available_slots')
            .insert(batch);
          
          if (error) {
            console.error('❌ Error inserting slots batch:', error);
          }
        }
        
        console.log(`✅ ${slotsToInsert.length} slots regenerados exitosamente`);
      }
    } catch (error) {
      console.error('❌ Error regenerating available slots:', error);
    }
  }

  // Nuevo método optimizado para obtener todos los slots de una fecha
  static async getAvailableSlotsForDate(date: string): Promise<{ [time: string]: boolean }> {
    try {
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase
          .from('available_slots')
          .select('time, is_booked')
          .eq('date', date);

        if (error) {
          console.error('Supabase error getting slots:', error);
          return {};
        }

        // Crear un mapa de tiempo -> disponibilidad
        const slotsMap: { [time: string]: boolean } = {};
        if (data) {
          data.forEach(slot => {
            slotsMap[slot.time] = !slot.is_booked;
          });
        }

        console.log(`✅ Obtenidos ${Object.keys(slotsMap).length} slots para ${date}`);
        return slotsMap;
      }

      // Fallback para desarrollo
      console.log('Getting available slots (mock):', date);
      return {};
    } catch (error) {
      console.error('Error getting available slots for date:', error);
      return {};
    }
  }

  static async generateSlotsForDate(date: string): Promise<AvailableSlot[]> {
    try {
      console.log(`🔄 Generando slots para la fecha: ${date}`);
      
      // Primero verificar si ya existen slots para esta fecha en la base de datos
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const existingSlots = await this.getAvailableSlotsForDate(date);
        if (Object.keys(existingSlots).length > 0) {
          console.log('✅ Slots ya existen en la base de datos, retornando...');
          return Object.entries(existingSlots).map(([time, isBooked]) => ({
            date,
            time,
            isBooked: !isBooked
          }));
        }
      }
      
      const workingHours = await this.getWorkingHours();
      
      // Crear fecha local para evitar problemas de zona horaria
      const dayOfWeek = getDayOfWeek(date);
      
      console.log(`📅 Fecha procesada: ${date} -> Día de la semana: ${dayOfWeek} (${getDayName(dayOfWeek)})`);
      
      const daySchedule = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
      if (!daySchedule || !daySchedule.isAvailable) {
        console.log('❌ No hay horario disponible para este día');
        return [];
      }

      console.log(`📅 Horario encontrado: ${daySchedule.startTime} - ${daySchedule.endTime}`);
      if (daySchedule.breaks && daySchedule.breaks.length > 0) {
        console.log(`☕ Descansos: ${daySchedule.breaks.map(b => `${b.start}-${b.end}`).join(', ')}`);
      }

      const slots: AvailableSlot[] = [];
      const startTime = new Date(`2000-01-01T${daySchedule.startTime}`);
      const endTime = new Date(`2000-01-01T${daySchedule.endTime}`);
      const breaks = daySchedule.breaks || [];
      
      // Generar slots cada 30 minutos
      const currentTime = new Date(startTime);
      while (currentTime < endTime) {
        const timeString = currentTime.toTimeString().slice(0, 5);
        
        // Verificar si el slot cae dentro de algún descanso
        const isInBreak = breaks.some(b => {
          const breakStart = new Date(`2000-01-01T${b.start}`);
          const breakEnd = new Date(`2000-01-01T${b.end}`);
          return currentTime >= breakStart && currentTime < breakEnd;
        });
        
        if (!isInBreak) {
          slots.push({
            date,
            time: timeString,
            isBooked: false
          });
        }
        
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      console.log(`✅ ${slots.length} slots generados para ${date}`);

      // Guardar slots en Supabase si está configurado
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        try {
          const { error } = await supabase
            .from('available_slots')
            .upsert(
              slots.map(slot => ({
                date: slot.date,
                time: slot.time,
                is_booked: slot.isBooked
              })),
              { onConflict: 'date,time' }
            );

          if (error) {
            console.error('❌ Error upserting slots:', error);
          } else {
            console.log('✅ Slots guardados en Supabase');
          }
        } catch (error) {
          console.error('❌ Error saving slots to Supabase:', error);
        }
      }

      return slots;
    } catch (error) {
      console.error('❌ Error generating slots for date:', error);
      return [];
    }
  }

  // Método fallback para crear slots individualmente
  static async createSlotsIndividually(slots: any[], existingSlots: any, date: string): Promise<void> {
    const slotsToCreate = slots.filter(slot => !(slot.time in existingSlots));
    
    if (slotsToCreate.length === 0) {
      console.log('✅ Todos los slots ya existen para', date);
      return;
    }

    let createdCount = 0;
    let errorCount = 0;
    
    for (const slot of slotsToCreate) {
      try {
        const { error } = await supabase
          .from('available_slots')
          .insert({
            date: slot.date,
            time: slot.time,
            is_booked: false
          });

        if (error) {
          console.warn(`⚠️ No se pudo crear slot ${slot.time}:`, error.message);
          errorCount++;
        } else {
          createdCount++;
        }
      } catch (error) {
        console.warn(`⚠️ Error creando slot ${slot.time}:`, error);
        errorCount++;
      }
    }
    
    if (createdCount > 0) {
      console.log(`✅ Creados ${createdCount} slots para ${date}`);
    }
    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} slots no se pudieron crear`);
    }
  }

  // Métodos para integración futura con Supabase
  static async syncWithSupabase(): Promise<void> {
    try {
      // TODO: Implementar sincronización con Supabase
      console.log('Syncing schedule with Supabase...');
    } catch (error) {
      console.error('Error syncing schedule with Supabase:', error);
    }
  }
}
