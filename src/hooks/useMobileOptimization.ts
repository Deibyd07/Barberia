import { useState, useEffect } from 'react';

export const useMobileOptimization = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(mobile);
      setIsTouchDevice(touch);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTouchDevice,
    shouldReduceMotion: isMobile || isTouchDevice
  };
};
