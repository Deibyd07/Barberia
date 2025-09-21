import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'> & { password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: { [key: string]: User } = {
  'admin@barberia.com': {
    id: 'admin1',
    name: 'Carlos Martínez',
    email: 'admin@barberia.com',
    phone: '+57 300 123 4567',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z'
  },
  'cliente@email.com': {
    id: 'client1',
    name: 'Juan Pérez',
    email: 'cliente@email.com',
    phone: '+57 300 987 6543',
    role: 'client',
    createdAt: '2024-01-01T00:00:00Z'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('barbershop_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    logger.log('🔍 Intentando login con:', { email, password: '***' });
    
    try {
      // Intentar conectar con Supabase primero
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        logger.log('📡 Conectando con Supabase...');
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        logger.log('📊 Respuesta de Supabase:', { data, error });

        if (error) {
          logger.error('❌ Supabase error:', error);
          // Fallback a sistema mock
          return loginMock(email, password);
        }

        if (data) {
          console.log('✅ Usuario encontrado en Supabase:', data);
          console.log('🔐 Verificando contraseña...');
          console.log('🔑 Contraseña en BD:', data.password);
          console.log('🔑 Contraseña ingresada:', password);
          
          if (data.password && password === data.password) {
            console.log('✅ Contraseña correcta');
            
            const user: User = {
              id: data.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              createdAt: data.created_at
            };

            console.log('👤 Usuario creado:', user);
            setUser(user);
            localStorage.setItem('barbershop_user', JSON.stringify(user));
            return true;
          } else {
            console.log('❌ Contraseña incorrecta');
            console.log('🔍 Comparación:', {
              passwordInDB: data.password,
              passwordEntered: password,
              match: data.password === password
            });
            return false;
          }
        } else {
          console.log('❌ No se encontró usuario en Supabase');
        }
      } else {
        console.log('⚠️ Supabase no configurado, usando fallback');
      }

      // Fallback a sistema mock si Supabase no está configurado
      return loginMock(email, password);
    } catch (error) {
      console.error('❌ Error during login:', error);
      return loginMock(email, password);
    }
  };

  const loginMock = (email: string, password: string): boolean => {
    const foundUser = mockUsers[email];
    if (foundUser && password === '123456') {
      setUser(foundUser);
      localStorage.setItem('barbershop_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): Promise<boolean> => {
    try {
      // Verificar si Supabase está configurado
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Intentar insertar en Supabase
        const { data, error } = await supabase
          .from('users')
          .insert({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            password: userData.password // Usar la contraseña real del usuario
          })
          .select()
          .single();

        if (error) {
          console.error('Error inserting user:', error);
          // Fallback a sistema mock
          return registerMock(userData);
        }

        if (data) {
          const newUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            createdAt: data.created_at
          };

          setUser(newUser);
          localStorage.setItem('barbershop_user', JSON.stringify(newUser));
          return true;
        }
      }

      // Fallback a sistema mock si Supabase no está configurado
      return registerMock(userData);
    } catch (error) {
      console.error('Error during registration:', error);
      return registerMock(userData);
    }
  };

  const registerMock = (userData: Omit<User, 'id' | 'createdAt'> & { password: string }): boolean => {
    // Verificar si el email ya existe
    if (mockUsers[userData.email]) {
      return false;
    }

    // Crear nuevo usuario (sin incluir la contraseña en el objeto User)
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      createdAt: new Date().toISOString()
    };

    // Agregar a mockUsers
    mockUsers[userData.email] = newUser;
    
    // Autenticar al usuario
    setUser(newUser);
    localStorage.setItem('barbershop_user', JSON.stringify(newUser));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('barbershop_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};