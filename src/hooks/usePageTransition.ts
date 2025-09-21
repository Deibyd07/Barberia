import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTransition = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previousPath, setPreviousPath] = useState<string>('');

  const startTransition = useCallback(() => {
    setIsTransitioning(true);
    setIsLoading(true);
  }, []);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Solo iniciar transición si cambió la ruta
    if (location.pathname !== previousPath) {
      setPreviousPath(location.pathname);
      startTransition();

      // Transición más rápida y natural
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 150);

      const loadingTimer = setTimeout(() => {
        setIsLoading(false);
      }, 250);

      return () => {
        clearTimeout(transitionTimer);
        clearTimeout(loadingTimer);
      };
    }
  }, [location.pathname, previousPath, startTransition]);

  return {
    isTransitioning,
    isLoading,
    currentPath: location.pathname,
    previousPath,
    startTransition,
    endTransition
  };
};
