import React from 'react';

interface PageLoaderProps {
  isLoading: boolean;
  message?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ isLoading, message = "Cargando..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-barber-midnight/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-barber-slate/90 backdrop-blur-xl rounded-2xl p-8 shadow-barber-xl border border-barber-gold/30">
        <div className="flex flex-col items-center space-y-4">
          {/* Spinner profesional */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-barber-gold/20 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-barber-gold rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-barber-copper rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          
          {/* Mensaje */}
          <div className="text-center">
            <p className="text-barber-cream font-medium text-lg">{message}</p>
            <div className="flex space-x-1 mt-2">
              <div className="w-2 h-2 bg-barber-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-barber-copper rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-barber-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
