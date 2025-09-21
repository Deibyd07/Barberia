import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { PasswordRecoveryService } from '../../services/passwordRecoveryService';

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onBack: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess, onBack }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      console.log('🔍 Verificando token:', token);
      const result = await PasswordRecoveryService.verifyRecoveryToken(token);
      
      if (result.valid) {
        setIsTokenValid(true);
        setUserEmail(result.email || '');
        setMessage('Token válido. Puedes establecer tu nueva contraseña.');
      } else {
        setIsTokenValid(false);
        setMessage(result.message);
      }
    } catch (error) {
      console.error('❌ Error verificando token:', error);
      setIsTokenValid(false);
      setMessage('Error al verificar el enlace de recuperación.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      setIsSuccess(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔄 Reseteando contraseña...');
      const result = await PasswordRecoveryService.resetPassword(token, newPassword);
      
      if (result.success) {
        setIsSuccess(true);
        setMessage(result.message);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setIsSuccess(false);
        setMessage(result.message);
      }
    } catch (error) {
      console.error('❌ Error reseteando contraseña:', error);
      setIsSuccess(false);
      setMessage('Error interno. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-barber-gold/30 border-t-barber-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-barber-cream/70 font-body">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-barber-red to-barber-red/80 rounded-2xl mx-auto mb-4 shadow-lg">
            <AlertCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-barber-red font-display mb-2">
            Enlace Inválido
          </h2>
          <p className="text-barber-cream/70 font-body">
            {message}
          </p>
        </div>

        <button
          onClick={onBack}
          className="w-full py-3 px-4 bg-gradient-to-r from-barber-gold to-barber-copper text-barber-black font-bold rounded-xl hover:from-barber-copper hover:to-barber-gold focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:ring-offset-2 focus:ring-offset-barber-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-barber"
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Login</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-barber-gold to-barber-copper rounded-2xl mx-auto mb-4 shadow-lg glow-gold">
          <Lock className="h-8 w-8 text-barber-black" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-barber-gold to-barber-copper bg-clip-text text-transparent font-display mb-2">
          Nueva Contraseña
        </h2>
        <p className="text-barber-cream/70 font-body">
          {userEmail && `Para: ${userEmail}`}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-barber-gold mb-2 font-barber">
            Nueva Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-barber-gold/60" />
            </div>
            <input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-barber-dark/50 border border-barber-gold/30 rounded-xl text-barber-cream placeholder-barber-cream/50 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold transition-all duration-300 font-body"
              placeholder="Mínimo 6 caracteres"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-barber-gold/60 hover:text-barber-gold transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-barber-gold mb-2 font-barber">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-barber-gold/60" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-barber-dark/50 border border-barber-gold/30 rounded-xl text-barber-cream placeholder-barber-cream/50 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold transition-all duration-300 font-body"
              placeholder="Repite la contraseña"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-barber-gold/60 hover:text-barber-gold transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl border ${
            isSuccess 
              ? 'bg-barber-green/10 border-barber-green/30 text-barber-green' 
              : 'bg-barber-red/10 border-barber-red/30 text-barber-red'
          }`}>
            <div className="flex items-center space-x-2">
              {isSuccess ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <p className="text-sm font-body">{message}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !newPassword.trim() || !confirmPassword.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-barber-gold to-barber-copper text-barber-black font-bold rounded-xl hover:from-barber-copper hover:to-barber-gold focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:ring-offset-2 focus:ring-offset-barber-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-barber"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-barber-black/30 border-t-barber-black rounded-full animate-spin"></div>
              <span>Actualizando...</span>
            </div>
          ) : (
            'Actualizar Contraseña'
          )}
        </button>

        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-transparent border border-barber-gold/30 text-barber-gold font-bold rounded-xl hover:bg-barber-gold/10 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:ring-offset-2 focus:ring-offset-barber-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-barber"
        >
          <div className="flex items-center justify-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Login</span>
          </div>
        </button>
      </form>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-barber-cream/50 font-body">
          La contraseña debe tener al menos 6 caracteres
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordForm;



