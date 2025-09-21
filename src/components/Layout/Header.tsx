import React from 'react';
import { LogOut, Scissors, User, Crown, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="relative bg-gradient-to-r from-barber-midnight via-barber-charcoal to-barber-midnight shadow-barber-xl border-b border-barber-gold/30 backdrop-blur-xl animate-fade-in">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-16 h-16 sm:w-32 sm:h-32 bg-barber-gold/10 rounded-full blur-2xl animate-float"></div>
      <div className="absolute top-0 right-1/4 w-12 h-12 sm:w-24 sm:h-24 bg-barber-copper/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-2 sm:px-4 relative z-10">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-2 sm:space-x-4 animate-slide-in-left min-w-0 flex-1">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-barber-gold/30 rounded-full blur-lg animate-glow"></div>
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-barber-gold via-barber-copper to-barber-bronze rounded-full shadow-neon-gold border-2 border-barber-gold/50 transform group-hover:scale-110 transition-all duration-300 animate-float">
                <Scissors className="h-5 w-5 sm:h-7 sm:w-7 text-barber-midnight animate-spin-slow" />
                <div className="absolute -top-1 -right-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-barber-gold animate-pulse" />
                </div>
              </div>
            </div>
            <div className="group min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-display font-bold text-transparent bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold bg-clip-text tracking-wide drop-shadow-lg group-hover:from-barber-gold-light group-hover:to-barber-gold-light transition-all duration-300 truncate">
                Panel de Control
              </h1>
              <div className="hidden sm:flex items-center space-x-2">
                <Sparkles className="h-3 w-3 text-barber-gold animate-pulse flex-shrink-0" />
                <p className="text-xs sm:text-sm text-barber-cream/80 font-body tracking-wider truncate">
                  Gestión Profesional
                </p>
                <Sparkles className="h-3 w-3 text-barber-gold animate-pulse flex-shrink-0" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-2 sm:space-x-6 animate-slide-in-right flex-shrink-0">
            {/* User Info */}
            <div className="flex items-center space-x-2 sm:space-x-4 group">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-barber-gold/20 rounded-full blur-md animate-glow"></div>
                <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-barber-slate via-barber-dark to-barber-charcoal rounded-full border-2 border-barber-gold/50 shadow-gold-glow transform group-hover:scale-105 transition-all duration-300">
                  {user?.role === 'admin' ? (
                    <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-barber-gold animate-bounce-slow" />
                  ) : (
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-barber-gold" />
                  )}
                </div>
              </div>
              <div className="hidden md:block min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm lg:text-lg font-semibold text-barber-cream font-display group-hover:text-barber-gold transition-colors duration-300 truncate">
                    {user?.name}
                  </p>
                  {user?.role === 'admin' && (
                    <Crown className="h-3 w-3 lg:h-4 lg:w-4 text-barber-copper animate-pulse flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs lg:text-sm text-barber-gold/80 capitalize font-body tracking-wide truncate">
                  {user?.role === 'admin' ? 'Administrador' : 'Cliente Premium'}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="group relative overflow-hidden flex items-center space-x-1 sm:space-x-3 px-3 sm:px-6 py-2 sm:py-3 bg-barber-slate/30 backdrop-blur-md border border-barber-gold/30 text-barber-gold hover:text-barber-midnight hover:bg-barber-gold rounded-lg sm:rounded-xl transition-all duration-300 font-display font-medium transform hover:scale-105 hover:shadow-gold-glow flex-shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-barber-gold/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5 relative z-10 group-hover:animate-bounce" />
              <span className="text-xs sm:text-sm hidden lg:inline relative z-10">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-barber-gold to-transparent"></div>
    </header>
  );
};

export default Header;