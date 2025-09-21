import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { PasswordRecoveryService } from '../../services/passwordRecoveryService';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess: (email: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔄 Enviando solicitud de recuperación para:', email);
      const result = await PasswordRecoveryService.createRecoveryRequest(email);
      
      if (result.success) {
        setIsSuccess(true);
        setMessage(result.message);
        // Mostrar el enlace en desarrollo
        if (result.message.includes('desarrollo')) {
          setMessage(result.message + '\n\nEnlace de desarrollo: /reset-password?token=test123');
        }
        setTimeout(() => {
          onSuccess(email);
        }, 2000);
      } else {
        setIsSuccess(false);
        setMessage(result.message);
      }
    } catch (error) {
      console.error('❌ Error en recuperación:', error);
      setIsSuccess(false);
      setMessage('Error interno. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-barber-gold to-barber-copper rounded-2xl mx-auto mb-4 shadow-lg glow-gold">
          <Mail className="h-8 w-8 text-barber-black" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-barber-gold to-barber-copper bg-clip-text text-transparent font-display mb-2">
          Recuperar Contraseña
        </h2>
        <p className="text-barber-cream/70 font-body">
          Ingresa tu email para recibir un enlace de recuperación
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-barber-gold mb-2 font-barber">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-barber-gold/60" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-barber-dark/50 border border-barber-gold/30 rounded-xl text-barber-cream placeholder-barber-cream/50 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold transition-all duration-300 font-body"
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
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
              <p className="text-sm font-body whitespace-pre-line">{message}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-barber-gold to-barber-copper text-barber-black font-bold rounded-xl hover:from-barber-copper hover:to-barber-gold focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:ring-offset-2 focus:ring-offset-barber-black transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-barber"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-barber-black/30 border-t-barber-black rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </div>
          ) : (
            'Enviar Enlace de Recuperación'
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
          ¿No recibiste el email? Revisa tu carpeta de spam o{' '}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-barber-gold hover:text-barber-copper underline"
          >
            intenta nuevamente
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;



