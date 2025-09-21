import { supabase } from '../lib/supabase';
import { User } from '../types';

export class AuthService {
  static async login(email: string, password: string): Promise<User | null> {
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          // Fallback a sistema mock
          return this.mockLogin(email, password);
        }

        if (data && data.password && password === data.password) {
          return {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            createdAt: data.created_at
          };
        }
      }

      // Fallback a sistema mock si Supabase no está configurado
      return this.mockLogin(email, password);
    } catch (error) {
      console.error('Error during login:', error);
      return this.mockLogin(email, password);
    }
  }

  private static mockLogin(email: string, password: string): User | null {
    const mockUsers: { [key: string]: User & { password: string } } = {
      'admin@barberia.com': {
        id: 'admin1',
        name: 'Carlos Martínez',
        email: 'admin@barberia.com',
        phone: '+57 300 123 4567',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        password: 'admin123'
      },
      'cliente@email.com': {
        id: 'client1',
        name: 'Juan Pérez',
        email: 'cliente@email.com',
        phone: '+57 300 987 6543',
        role: 'client',
        createdAt: '2024-01-01T00:00:00Z',
        password: 'cliente123'
      }
    };

    const user = mockUsers[email];
    if (user && password === user.password) {
      return user;
    }
    return null;
  }

  static async logout(): Promise<void> {
    try {
      // Limpiar datos locales
      localStorage.removeItem('barbershop_user');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const storedUser = localStorage.getItem('barbershop_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // Métodos para integración futura con Supabase Auth
  static async signUp(email: string, password: string, userData: Partial<User>): Promise<User | null> {
    try {
      // TODO: Implementar registro con Supabase Auth
      console.log('Sign up not implemented yet');
      return null;
    } catch (error) {
      console.error('Error during sign up:', error);
      return null;
    }
  }

  static async resetPassword(email: string): Promise<boolean> {
    try {
      // TODO: Implementar reset de contraseña con Supabase Auth
      console.log('Password reset not implemented yet');
      return false;
    } catch (error) {
      console.error('Error during password reset:', error);
      return false;
    }
  }
}
