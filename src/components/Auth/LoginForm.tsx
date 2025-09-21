import React, { useState } from 'react';
import { Scissors, Eye, EyeOff, User, Lock, Crown, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onShowRegister?: () => void;
  onShowForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onShowRegister, onShowForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-barber-gold/5 to-transparent rounded-full animate-pulse-slow"></div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo and header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-barber-gold/20 rounded-full blur-xl animate-glow"></div>
            <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-barber-gold via-barber-copper to-barber-bronze rounded-full shadow-neon-gold border-2 border-barber-gold/50 animate-float">
              <Scissors className="h-10 w-10 text-barber-midnight animate-spin-slow" />
              <div className="absolute -top-1 -right-1">
                <Crown className="h-6 w-6 text-barber-gold animate-bounce-slow" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-display font-bold text-barber-gold mb-3 tracking-wide animate-slide-in-left">
            <span className="bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold bg-clip-text text-transparent">
              Barbería Elite
            </span>
          </h2>
          <p className="text-barber-cream/80 text-lg font-body animate-slide-in-right">
            Experiencia Premium en Cada Corte
          </p>
          <div className="flex items-center justify-center mt-2 space-x-1">
            <Sparkles className="h-4 w-4 text-barber-gold animate-pulse" />
            <span className="text-barber-gold/60 text-sm font-body">Inicia sesión para continuar</span>
            <Sparkles className="h-4 w-4 text-barber-gold animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>


        {/* Login form */}
        <form onSubmit={handleSubmit} className="relative backdrop-blur-xl bg-barber-dark/40 border border-barber-gold/20 rounded-2xl p-8 shadow-barber-xl animate-pop" style={{ animationDelay: '0.4s' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5 rounded-2xl"></div>
          <div className="relative z-10">
            {error && (
              <div className="mb-6 p-4 bg-barber-crimson/10 border border-barber-crimson/30 rounded-xl backdrop-blur-sm animate-shake">
                <p className="text-sm text-barber-crimson font-medium">{error}</p>
              </div>
            )}

            <div className="mb-6 form-field">
              <label htmlFor="email" className="block text-sm font-medium text-barber-gold mb-3 font-display form-label">
                Correo Electrónico
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-barber-slate/30 backdrop-blur-sm border border-barber-gold/30 rounded-xl text-barber-cream placeholder-barber-cream/50 focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold/60 transition-all duration-300 font-body group-hover:border-barber-gold/50 form-input"
                  placeholder="tu@email.com"
                  required
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-barber-gold/0 via-barber-gold/5 to-barber-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            <div className="mb-8 form-field">
              <label htmlFor="password" className="block text-sm font-medium text-barber-gold mb-3 font-display form-label">
                Contraseña
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-barber-slate/30 backdrop-blur-sm border border-barber-gold/30 rounded-xl text-barber-cream placeholder-barber-cream/50 focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold/60 transition-all duration-300 font-body pr-12 group-hover:border-barber-gold/50 form-input"
                  placeholder="Tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-barber-gold/60 hover:text-barber-gold transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-barber-gold/0 via-barber-gold/5 to-barber-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Forgot Password Link */}
            {onShowForgotPassword && (
              <div className="mb-6 text-right">
                <button
                  type="button"
                  onClick={onShowForgotPassword}
                  className="text-sm text-barber-gold/80 hover:text-barber-gold transition-colors duration-200 underline hover:no-underline font-body"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold text-barber-midnight py-4 px-6 rounded-xl font-bold text-lg hover:from-barber-gold-dark hover:via-barber-bronze hover:to-barber-gold-dark focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:ring-offset-2 focus:ring-offset-barber-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold-glow transform hover:scale-[1.02] hover:shadow-neon-gold font-display form-button"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-barber-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-barber-midnight mr-3"></div>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </div>
            </button>

            {/* Register Button */}
            {onShowRegister && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={onShowRegister}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-barber-slate/30 via-barber-dark/40 to-barber-slate/30 text-barber-gold py-4 px-6 rounded-xl font-bold text-lg hover:from-barber-gold/20 hover:via-barber-copper/20 hover:to-barber-gold/20 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:ring-offset-2 focus:ring-offset-barber-dark transition-all duration-300 border border-barber-gold/30 hover:border-barber-gold/60 transform hover:scale-[1.02] hover:shadow-gold-glow font-display"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-barber-gold/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative z-10 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                    <span>Crear Cuenta</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};

export default LoginForm;