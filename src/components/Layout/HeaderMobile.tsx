import React, { useState } from 'react';
import { Menu, X, User, LogOut, Settings, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HeaderMobile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // Header diferente para cliente
  if (user?.role !== 'admin') {
    return (
      <>
        {/* Header para cliente */}
        <header className="fixed top-0 left-0 right-0 header-mobile bg-gradient-to-r from-barber-dark to-barber-slate backdrop-blur-xl border-b border-barber-gold/20">
          <div className="px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo y saludo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-barber-gold to-barber-copper rounded-lg flex items-center justify-center">
                  <span className="text-barber-black font-bold text-lg">B</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-barber-gold">¡Hola, {user?.name?.split(' ')[0]}!</h1>
                  <p className="text-xs text-barber-cream/60">Experiencia Premium</p>
                </div>
              </div>

              {/* Botón de menú de usuario */}
              <button
                onClick={toggleMenu}
                className="p-2 text-barber-cream hover:text-barber-gold transition-colors"
                aria-label="Abrir menú de usuario"
              >
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Menú de usuario para cliente */}
        <div className={`mobile-menu-container transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}>
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={toggleMenu}
          />
          
          {/* Menú lateral */}
          <div className={`mobile-menu-sidebar bg-gradient-to-b from-barber-dark to-barber-slate backdrop-blur-xl border-l border-barber-gold/20 transform transition-transform duration-300 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="p-6">
              {/* Información del usuario */}
              <div className="mb-6 pb-6 border-b border-barber-gold/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-barber-gold to-barber-copper rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-barber-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-barber-gold">{user?.name}</h3>
                    <p className="text-sm text-barber-cream/60">Cliente</p>
                  </div>
                </div>
                
                {/* Información adicional */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-barber-gold" />
                    <span className="text-sm text-barber-cream">{user?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Botón de cerrar sesión */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Header para admin (original)
  return (
    <>
      {/* Header principal */}
      <header className="fixed top-0 left-0 right-0 header-mobile bg-gradient-to-r from-barber-dark to-barber-slate backdrop-blur-xl border-b border-barber-gold/20">
        <div className="container-barber">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-barber-gold to-barber-copper rounded-lg flex items-center justify-center">
                <span className="text-barber-black font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-barber-gold">Panel de Control</h1>
                <p className="text-xs text-barber-cream/60">Gestión Profesional</p>
              </div>
            </div>

            {/* Botón de menú */}
            <button
              onClick={toggleMenu}
              className="p-2 text-barber-cream hover:text-barber-gold transition-colors"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú deslizable */}
      <div className={`mobile-menu-container transition-all duration-300 ${
        isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={toggleMenu}
        />
        
        {/* Menú lateral */}
        <div className={`mobile-menu-sidebar bg-gradient-to-b from-barber-dark to-barber-slate backdrop-blur-xl border-l border-barber-gold/20 transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6">
            {/* Información del usuario */}
            <div className="mb-6 pb-6 border-b border-barber-gold/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-barber-gold to-barber-copper rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-barber-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-barber-cream">{user?.name}</h3>
                  <p className="text-sm text-barber-cream/60">{user?.email}</p>
                  <span className="inline-block px-2 py-1 text-xs bg-barber-gold/20 text-barber-gold rounded-full mt-1">
                    {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Navegación */}
            <nav className="space-y-2">
              <a
                href={user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'}
                className="flex items-center space-x-3 p-3 text-barber-cream hover:bg-barber-gold/10 rounded-lg transition-colors"
                onClick={toggleMenu}
              >
                <Settings className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
              
              {user?.role === 'admin' && (
                <>
                  <a
                    href="/admin/appointments"
                    className="flex items-center space-x-3 p-3 text-barber-cream hover:bg-barber-gold/10 rounded-lg transition-colors"
                    onClick={toggleMenu}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Citas</span>
                  </a>
                  <a
                    href="/admin/schedule"
                    className="flex items-center space-x-3 p-3 text-barber-cream hover:bg-barber-gold/10 rounded-lg transition-colors"
                    onClick={toggleMenu}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Horarios</span>
                  </a>
                  <a
                    href="/admin/clients"
                    className="flex items-center space-x-3 p-3 text-barber-cream hover:bg-barber-gold/10 rounded-lg transition-colors"
                    onClick={toggleMenu}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Clientes</span>
                  </a>
                </>
              )}
            </nav>

            {/* Botón de cerrar sesión */}
            <div className="mt-8 pt-6 border-t border-barber-gold/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espaciador para el header fijo */}
      <div className="h-16" />
    </>
  );
};

export default HeaderMobile;
