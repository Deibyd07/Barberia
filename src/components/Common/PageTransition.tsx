import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const { isMobile, shouldReduceMotion } = useMobileOptimization();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // En móvil, usar transiciones más rápidas y sutiles
    if (isMobile || shouldReduceMotion) {
      setIsTransitioning(true);
      setIsVisible(false);

      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children);
        setIsVisible(true);
        setIsTransitioning(false);
      }, 50); // Más rápido en móvil
    } else {
      // Desktop: transición completa
      setIsTransitioning(true);
      setIsVisible(false);

      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children);
        setIsVisible(true);
        setIsTransitioning(false);
      }, 100);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, children, isMobile, shouldReduceMotion]);

  // Estilos dinámicos basados en el dispositivo
  const getTransitionStyles = () => {
    if (isMobile || shouldReduceMotion) {
      return {
        transition: 'opacity 0.15s ease-out',
        transform: 'none'
      };
    }
    
    return {
      transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isTransitioning ? 'translateY(-4px)' : 'translateY(0)'
    };
  };

  return (
    <div 
      className={`page-transition-container ${
        isTransitioning ? 'page-exiting' : 'page-entering'
      } ${!isVisible ? 'opacity-0' : 'opacity-100'}`}
      style={getTransitionStyles()}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
