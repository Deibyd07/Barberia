export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'admin';
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  service: string;
  price: number;
  notes?: string;
  createdAt: string;
  completedAt?: string; // Fecha y hora cuando se completó la cita
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

// Nuevos tipos para el sistema de horarios
export interface Break {
  start: string; // formato 'HH:mm'
  end: string;   // formato 'HH:mm'
}

export interface WorkingHours {
  id: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, etc.
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  breaks?: Break[]; // descansos configurables por día
}

export interface AvailableSlot {
  date: string;
  time: string;
  isBooked: boolean;
}

export interface Service {
  id: string;
  name: string;
  duration: number; // en minutos
  price: number;
  description?: string;
}