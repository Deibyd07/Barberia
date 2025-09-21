import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, BarChart3, Users, Clock, Crown, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const adminNavItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Panel principal'
    },
    {
      path: '/admin/appointments',
      label: 'Citas',
      icon: Calendar,
      description: 'Gestión de citas'
    },
    {
      path: '/admin/schedule',
      label: 'Horarios',
      icon: Clock,
      description: 'Configurar horarios'
    },
    {
      path: '/admin/clients',
      label: 'Clientes',
      icon: Users,
      description: 'Base de clientes'
    }
  ];

  const clientNavItems = [
    {
      path: '/client/dashboard',
      label: 'Mi Panel',
      icon: Crown,
      description: 'Mis citas'
    },
    {
      path: '/client/book',
      label: 'Reservar',
      icon: Calendar,
      description: 'Nueva cita'
    }
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : clientNavItems;

  return (
    <nav className="relative bg-gradient-to-r from-barber-slate/60 via-barber-dark/60 to-barber-slate/60 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-barber-xl border border-barber-gold/20 animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-r from-barber-gold/5 via-transparent to-barber-copper/5 rounded-2xl"></div>
      <div className="relative z-10 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group relative overflow-hidden flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-display font-bold nav-link-professional text-base sm:text-lg transform hover:scale-[1.01] ${
                isActive
                  ? 'bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold text-barber-midnight shadow-neon-gold'
                  : 'text-barber-gold hover:text-barber-cream hover:bg-barber-gold/10 backdrop-blur-sm border border-barber-gold/30'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-barber-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
              <div className="relative z-10 flex items-center justify-center space-x-3">
                <Icon className={`h-6 w-6 ${isActive ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">{item.label}</span>
                {isActive && <Sparkles className="h-4 w-4 animate-pulse" />}
              </div>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-barber-gold transition-all duration-300 group-hover:w-full"></div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
