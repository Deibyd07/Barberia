import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';
import HeaderMobile from './HeaderMobile';
import NavigationMobile from './NavigationMobile';
import Header from './Header';
import Navigation from './Navigation';
import NavigationProgress from '../Common/NavigationProgress';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { isMobile } = useMobileOptimization();

  // Debug: Log para ver qué está detectando
  console.log('ResponsiveLayout - isMobile:', isMobile, 'user role:', user?.role);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-dark via-barber-slate to-barber-charcoal">
      {/* Debug visual temporal */}
      <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-xs z-50">
        DEBUG: isMobile={isMobile ? 'true' : 'false'} | Role={user?.role || 'none'}
      </div>
      
      {/* Indicador de progreso de navegación */}
      <NavigationProgress />
      
      {/* Header */}
      {isMobile ? <HeaderMobile /> : <Header />}
      
      {/* Contenido principal */}
      <main className="pb-0 md:pb-0">
        {isMobile ? (
          // Para móvil (tanto admin como cliente), sin contenedor extra pero con padding top para el header
          <div className="pt-16">
            {children}
          </div>
        ) : (
          // Para desktop, con contenedor
          <div className="container-barber py-6">
            <div className="mb-6">
              <Navigation />
            </div>
            {children}
          </div>
        )}
      </main>
      
      {/* Navegación móvil */}
      {isMobile && <NavigationMobile />}
    </div>
  );
};

export default ResponsiveLayout;
