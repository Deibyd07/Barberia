import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppointmentProvider, setScheduleContext } from './context/AppointmentContext';
import { ScheduleProvider, useSchedule } from './context/ScheduleContext';
import ResponsiveLayout from './components/Layout/ResponsiveLayout';
import AuthManager from './components/Auth/AuthManager';
import ClientPages from './pages/ClientPages';
import AdminPages from './pages/AdminPages';
import ErrorBoundary from './components/Common/ErrorBoundary';
import './styles/barber-theme.css';
import { initializeEmailService } from './utils/initializeEmail';

// Componente para conectar los contextos
const ContextConnector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scheduleContext = useSchedule();

  // Conectar los contextos
  React.useEffect(() => {
    setScheduleContext(scheduleContext);
  }, [scheduleContext]);

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <AuthManager onAuthSuccess={() => {
      // El usuario ya está autenticado por el contexto
      // No necesitamos hacer nada aquí
    }} />;
  }

  return (
    <ErrorBoundary>
      <ResponsiveLayout>
        <Routes>
          {user?.role === 'admin' ? (
            <>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/*" element={<AdminPages />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/client/dashboard" replace />} />
              <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />
              <Route path="/client/*" element={<ClientPages />} />
              <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
            </>
          )}
        </Routes>
      </ResponsiveLayout>
    </ErrorBoundary>
  );
};

function App() {
  // Inicializar servicio de email al cargar la aplicación
  React.useEffect(() => {
    initializeEmailService();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ScheduleProvider>
          <ContextConnector>
            <AppointmentProvider>
              <AppContent />
            </AppointmentProvider>
          </ContextConnector>
        </ScheduleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;