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
  
  // Redirigir inmediatamente sin mostrar mensaje
  React.useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/dashboard';
    } else if (location.pathname.startsWith('/client')) {
      window.location.href = '/client/dashboard';
    } else {
      window.location.href = '/';
    }
  }, [location.pathname]);

  // No mostrar nada, solo redirigir
  return null;
};

export default ErrorBoundary;
