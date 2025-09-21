import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';

const NavigationMobile: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useMobileOptimization();
  const [isNavigating, setIsNavigating] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    
    // Debug específico para cada ruta
    console.log(`🔍 Checking ${path} against ${currentPath}`);
    
    // Lógica ultra-precisa para cada ruta
    if (path === '/admin/dashboard') {
      const isActive = currentPath === '/admin/dashboard' || currentPath === '/admin/dashboard/';
      console.log(`✅ Admin Dashboard: ${isActive}`);
      return isActive;
    }
    if (path === '/client/dashboard') {
      const isActive = currentPath === '/client/dashboard' || currentPath === '/client/dashboard/';
      console.log(`✅ Client Dashboard: ${isActive}`);
      return isActive;
    }
    if (path === '/admin/appointments') {
      const isActive = currentPath.startsWith('/admin/appointments');
      console.log(`✅ Admin Appointments: ${isActive}`);
      return isActive;
    }
    if (path === '/admin/schedule') {
      const isActive = currentPath.startsWith('/admin/schedule');
      console.log(`✅ Admin Schedule: ${isActive}`);
      return isActive;
    }
    if (path === '/admin/clients') {
      const isActive = currentPath.startsWith('/admin/clients');
      console.log(`✅ Admin Clients: ${isActive}`);
      return isActive;
    }
    if (path === '/client/appointments') {
      const isActive = currentPath.startsWith('/client/appointments');
      console.log(`✅ Client Appointments: ${isActive}`);
      return isActive;
    }
    
    console.log(`❌ No match for ${path}`);
    return false;
  };

  // Forzar actualización cuando cambie la ruta
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Pequeño delay para feedback visual
    setTimeout(() => {
      navigate(path);
      setIsNavigating(false);
    }, 50);
  };

  const getNavItems = () => {
    if (user?.role === 'admin') {
      return [
        {
          path: '/admin/dashboard',
          icon: Home,
          label: 'Inicio',
          active: isActive('/admin/dashboard')
        },
        {
          path: '/admin/appointments',
          icon: Calendar,
          label: 'Citas',
          active: isActive('/admin/appointments')
        },
        {
          path: '/admin/schedule',
          icon: Clock,
          label: 'Horarios',
          active: isActive('/admin/schedule')
        },
        {
          path: '/admin/clients',
          icon: Users,
          label: 'Clientes',
          active: isActive('/admin/clients')
        }
      ];
    } else {
      return [
        {
          path: '/client/dashboard',
          icon: Home,
          label: 'Inicio',
          active: isActive('/client/dashboard')
        },
        {
          path: '/client/appointments',
          icon: Calendar,
          label: 'Mis Citas',
          active: isActive('/client/appointments')
        }
      ];
    }
  };

  const navItems = getNavItems();

  // Debug temporal
  console.log('🔍 Navigation Debug:', {
    currentPath: location.pathname,
    userRole: user?.role,
    forceUpdate: forceUpdate,
    navItems: navItems.map(item => ({
      path: item.path,
      active: item.active,
      label: item.label
    }))
  });
  
  // Debug específico para ver qué botones están activos
  const activeButtons = navItems.filter(item => item.active);
  console.log('🎯 Active buttons:', activeButtons.map(b => b.label));

  return (
    <nav className="nav-mobile">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            disabled={isNavigating}
            className={`nav-mobile-item nav-link-professional ${item.active ? 'active' : ''} ${
              isNavigating ? 'opacity-70' : ''
            }`}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-medium truncate text-center">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default NavigationMobile;
