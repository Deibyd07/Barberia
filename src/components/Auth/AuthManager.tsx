import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface AuthManagerProps {
  onAuthSuccess: (user: any) => void;
}

const AuthManager: React.FC<AuthManagerProps> = ({ onAuthSuccess }) => {
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [resetToken, setResetToken] = useState<string>('');

  // Verificar si hay un token en la URL para reset de contraseña
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
      setCurrentView('reset-password');
    }
  }, []);

  const handleShowRegister = () => {
    setCurrentView('register');
  };

  const handleShowLogin = () => {
    setCurrentView('login');
  };

  const handleShowForgotPassword = () => {
    setCurrentView('forgot-password');
  };

  const handleForgotPasswordSuccess = (email: string) => {
    console.log('✅ Email de recuperación enviado a:', email);
    // Aquí podrías mostrar un mensaje de confirmación
    setTimeout(() => {
      setCurrentView('login');
    }, 3000);
  };

  const handleResetPasswordSuccess = () => {
    console.log('✅ Contraseña actualizada exitosamente');
    // Aquí podrías mostrar un mensaje de confirmación
    setTimeout(() => {
      setCurrentView('login');
    }, 2000);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onShowRegister={handleShowRegister}
            onShowForgotPassword={handleShowForgotPassword}
          />
        );
      case 'register':
        return <RegisterForm onSuccess={onAuthSuccess} onBackToLogin={handleShowLogin} />;
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onBack={handleShowLogin}
            onSuccess={handleForgotPasswordSuccess}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm
            token={resetToken}
            onSuccess={handleResetPasswordSuccess}
            onBack={handleShowLogin}
          />
        );
      default:
        return (
          <LoginForm
            onShowRegister={handleShowRegister}
            onShowForgotPassword={handleShowForgotPassword}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-barber-gold/5 to-transparent rounded-full animate-pulse-slow"></div>
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default AuthManager;
