import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, Crown, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User as UserType } from '../../types';

interface RegisterFormProps {
  onSuccess: (user: UserType) => void;
  onBackToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onBackToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const success = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'client',
        password: formData.password
      });

      if (success) {
        // El usuario ya está autenticado por el contexto
        setTimeout(() => {
          onSuccess({
            id: Date.now().toString(),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: 'client',
            createdAt: new Date().toISOString()
          });
        }, 1000);
      } else {
        setErrors({ general: 'El email ya está registrado. Intenta con otro email.' });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrors({ general: 'Error al registrar usuario. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-barber-gold/30 rounded-full blur-lg animate-glow"></div>
              <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-barber-gold/20 via-barber-copper/20 to-barber-bronze/20 backdrop-blur-md rounded-full border-2 border-barber-gold/50 shadow-neon-gold transform hover:scale-110 transition-all duration-300 animate-float">
                <Crown className="h-10 w-10 text-barber-gold" />
                <div className="absolute -top-1 -right-1">
                  <Star className="h-4 w-4 text-barber-gold animate-bounce-slow" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold mt-4 mb-2">
              <span className="bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold bg-clip-text text-transparent">
                Únete a la Barbería
              </span>
            </h1>
            <p className="text-barber-cream/80 text-sm">
              Crea tu cuenta y reserva tu cita
            </p>
          </div>

          {/* Form */}
          <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-2xl p-8 shadow-barber-xl border border-barber-gold/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="absolute top-4 right-4">
              <div className="flex space-x-2">
                <Sparkles className="h-4 w-4 text-barber-gold animate-pulse" />
                <Star className="h-3 w-3 text-barber-copper animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              {errors.general && (
                <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400 text-sm">{errors.general}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-barber-gold mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-barber-gold/60" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-barber-black/50 border rounded-xl text-barber-white placeholder-barber-gold/60 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold transition-all duration-300 ${
                      errors.name ? 'border-red-500' : 'border-barber-gold/30'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-barber-gold mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-barber-gold/60" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-barber-black/50 border rounded-xl text-barber-white placeholder-barber-gold/60 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold transition-all duration-300 ${
                      errors.email ? 'border-red-500' : 'border-barber-gold/30'
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-barber-gold mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-barber-gold/60" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 bg-barber-black/50 border rounded-xl text-barber-white placeholder-barber-gold/60 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold transition-all duration-300 ${
                      errors.phone ? 'border-red-500' : 'border-barber-gold/30'
                    }`}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-barber-gold mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-barber-gold/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 bg-barber-black/50 border rounded-xl text-barber-white placeholder-barber-gold/60 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold transition-all duration-300 ${
                      errors.password ? 'border-red-500' : 'border-barber-gold/30'
                    }`}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-barber-gold/60 hover:text-barber-gold transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-barber-gold mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-barber-gold/60" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 bg-barber-black/50 border rounded-xl text-barber-white placeholder-barber-gold/60 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold transition-all duration-300 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-barber-gold/30'
                    }`}
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-barber-gold/60 hover:text-barber-gold transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold text-barber-black font-bold rounded-xl shadow-neon-gold hover:shadow-neon-gold-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-barber-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Crear Cuenta</span>
                  </div>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-barber-gold/80 hover:text-barber-gold text-sm transition-colors duration-300"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
