import { AppointmentService } from './appointmentService';
import { createLocalDate } from '../utils/dateUtils';

class AppointmentCompletionService {
  /**
   * Verifica y completa automáticamente las citas que ya pasaron su hora
   * @param appointments Lista de citas a verificar
   * @returns Lista de citas actualizadas
   */
  static async checkAndCompleteAppointments(appointments: any[]): Promise<any[]> {
    const now = new Date();
    const todayString = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    console.log('🔄 Verificando citas para completar automáticamente...');
    console.log('📅 Fecha actual:', todayString);
    console.log('⏰ Hora actual:', currentTime);

    const updatedAppointments = [];
    let completedCount = 0;

    for (const appointment of appointments) {
      // Solo procesar citas confirmadas (no canceladas ni ya completadas)
      if (appointment.status !== 'confirmed') {
        updatedAppointments.push(appointment);
        continue;
      }

      const appointmentDate = appointment.date;
      const appointmentTime = appointment.time;

      // Verificar si la cita es de hoy y ya pasó la hora
      const shouldComplete = this.shouldCompleteAppointment(appointmentDate, appointmentTime, todayString, currentTime);

      if (shouldComplete) {
        console.log(`✅ Completando cita automáticamente: ${appointment.clientName} - ${appointmentTime}`);
        
        try {
          // Marcar como completada en la base de datos
          const success = await AppointmentService.completeAppointment(appointment.id);
          
          if (success) {
            // Actualizar el estado local
            const completedAppointment = {
              ...appointment,
              status: 'completed',
              completedAt: new Date().toISOString() // Solo para uso local
            };
            updatedAppointments.push(completedAppointment);
            completedCount++;
            
            console.log(`✅ Cita completada: ${appointment.clientName}`);
          } else {
            console.log(`⚠️ No se pudo completar la cita: ${appointment.clientName}`);
            updatedAppointments.push(appointment);
          }
        } catch (error) {
          console.error(`❌ Error completando cita ${appointment.id}:`, error);
          updatedAppointments.push(appointment);
        }
      } else {
        updatedAppointments.push(appointment);
      }
    }

    if (completedCount > 0) {
      console.log(`🎉 Se completaron automáticamente ${completedCount} citas`);
    } else {
      console.log('ℹ️ No hay citas para completar automáticamente');
    }

    return updatedAppointments;
  }

  /**
   * Determina si una cita debe ser completada automáticamente
   */
  private static shouldCompleteAppointment(
    appointmentDate: string, 
    appointmentTime: string, 
    todayString: string, 
    currentTime: string
  ): boolean {
    // Solo completar citas de hoy
    if (appointmentDate !== todayString) {
      return false;
    }

    // Verificar si ya pasó la hora de la cita
    // Agregamos 30 minutos de tolerancia para que se complete automáticamente
    const appointmentTimeMinutes = this.timeToMinutes(appointmentTime);
    const currentTimeMinutes = this.timeToMinutes(currentTime);
    const toleranceMinutes = 30; // 30 minutos de tolerancia

    return currentTimeMinutes >= (appointmentTimeMinutes + toleranceMinutes);
  }

  /**
   * Convierte tiempo HH:MM a minutos desde medianoche
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Obtiene estadísticas de citas completadas
   */
  static getCompletionStats(appointments: any[]): {
    total: number;
    completed: number;
    confirmed: number;
    cancelled: number;
    completionRate: number;
  } {
    const total = appointments.length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      confirmed,
      cancelled,
      completionRate
    };
  }

  /**
   * Obtiene citas completadas recientemente (últimas 24 horas)
   */
  static getRecentlyCompletedAppointments(appointments: any[]): any[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return appointments.filter(appointment => {
      if (appointment.status !== 'completed') return false;
      
      // Si tiene completedAt, usar esa fecha
      if (appointment.completedAt) {
        const completedDate = new Date(appointment.completedAt);
        return completedDate >= yesterday;
      }
      
      // Si no tiene completedAt, verificar por fecha de la cita (hoy)
      const appointmentDate = createLocalDate(appointment.date);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    });
  }
}

export default AppointmentCompletionService;
