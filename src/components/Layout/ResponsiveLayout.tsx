import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-dark via-barber-slate to-barber-charcoal">
      {/* Indicador de progreso de navegación */}
      <NavigationProgress />
      
      {/* Header */}
      {isMobile ? <HeaderMobile /> : <Header />}
      
      {/* Contenido principal */}
      <main className="pb-0 md:pb-0">
        {isMobile && user?.role !== 'admin' ? (
          // Para cliente móvil, sin contenedor extra pero con padding top mínimo para el header
          <div className="pt-12">
            {children}
          </div>
        ) : (
          // Para admin o desktop, con contenedor
          <div className="container-barber py-6">
            {!isMobile && (
              <div className="mb-6">
                <Navigation />
              </div>
            )}
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
