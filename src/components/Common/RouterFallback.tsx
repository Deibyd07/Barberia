import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RouterFallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Si estamos en la raíz, redirigir según el rol del usuario
    if (currentPath === '/') {
      // Intentar obtener el rol del usuario del localStorage o contexto
      const userRole = localStorage.getItem('userRole') || 'client';
      
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/client/dashboard', { replace: true });
      }
      return;
    }

    // Si estamos en una ruta de admin sin dashboard
    if (currentPath === '/admin') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    // Si estamos en una ruta de client sin dashboard
    if (currentPath === '/client') {
      navigate('/client/dashboard', { replace: true });
      return;
    }

    // Si estamos en una ruta que no existe, redirigir a la raíz
    if (!currentPath.startsWith('/admin/') && !currentPath.startsWith('/client/')) {
      navigate('/', { replace: true });
      return;
    }

    // Si estamos en una ruta de admin pero no es válida
    if (currentPath.startsWith('/admin/') && !isValidAdminRoute(currentPath)) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    // Si estamos en una ruta de client pero no es válida
    if (currentPath.startsWith('/client/') && !isValidClientRoute(currentPath)) {
      navigate('/client/dashboard', { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Cargando...
        </h1>
        <p className="text-gray-600">
          Redirigiendo a la página correcta
        </p>
      </div>
    </div>
  );
};

// Función para validar rutas de admin
const isValidAdminRoute = (path: string): boolean => {
  const validAdminRoutes = [
    '/admin/dashboard',
    '/admin/appointments',
    '/admin/schedule',
    '/admin/clients'
  ];
  return validAdminRoutes.includes(path);
};

// Función para validar rutas de client
const isValidClientRoute = (path: string): boolean => {
  const validClientRoutes = [
    '/client/dashboard',
    '/client/book',
    '/client/appointments'
  ];
  return validClientRoutes.includes(path);
};

export default RouterFallback;
