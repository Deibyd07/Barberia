import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMobileOptimization } from '../../hooks/useMobileOptimization';

const NavigationProgress: React.FC = () => {
  const location = useLocation();
  const { isMobile } = useMobileOptimization();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
    // En móvil, mostrar por menos tiempo
    const duration = isMobile ? 150 : 300;
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [location.pathname, isMobile]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className={`bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold ${
        isMobile ? 'h-0.5' : 'h-1'
      }`}>
        <div className={`h-full bg-gradient-to-r from-transparent via-white/30 to-transparent ${
          isMobile ? 'animate-pulse' : 'animate-pulse'
        }`}></div>
      </div>
    </div>
  );
};

export default NavigationProgress;
