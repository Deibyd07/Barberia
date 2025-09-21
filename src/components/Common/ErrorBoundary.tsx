import React from 'react';
import { useLocation } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const location = useLocation();
  
  // Si estamos en una ruta que debería existir, redirigir
  React.useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/dashboard';
    } else if (location.pathname.startsWith('/client')) {
      window.location.href = '/client/dashboard';
    } else {
      window.location.href = '/';
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirigiendo...
        </h1>
        <p className="text-gray-600">
          Si no eres redirigido automáticamente, 
          <a href="/" className="text-blue-600 hover:underline ml-1">
            haz clic aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;
