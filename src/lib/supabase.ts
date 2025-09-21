import { createClient } from '@supabase/supabase-js';

// Estas son las credenciales de ejemplo. Debes reemplazarlas con las de tu proyecto de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para la base de datos
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          role: 'client' | 'admin';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          role: 'client' | 'admin';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          role?: 'client' | 'admin';
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          client_name: string;
          client_phone: string;
          date: string;
          time: string;
          status: 'confirmed' | 'completed' | 'cancelled';
          service: string;
          price: number;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          client_name: string;
          client_phone: string;
          date: string;
          time: string;
          status?: 'confirmed' | 'completed' | 'cancelled';
          service: string;
          price: number;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          client_name?: string;
          client_phone?: string;
          date?: string;
          time?: string;
          status?: 'confirmed' | 'completed' | 'cancelled';
          service?: string;
          price?: number;
          notes?: string;
          created_at?: string;
        };
      };
      working_hours: {
        Row: {
          id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available: boolean;
          breaks?: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_available?: boolean;
          breaks?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_available?: boolean;
          breaks?: any;
          created_at?: string;
        };
      };
    };
  };
}
