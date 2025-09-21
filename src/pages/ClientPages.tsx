import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageTransition from '../components/Common/PageTransition';
import ClientDashboardResponsive from '../components/Client/ClientDashboardResponsive';
import BookingPage from '../components/Client/BookingPage';
import ClientAppointments from '../components/Client/ClientAppointments';

const ClientPages: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/client/dashboard" replace />} />
      <Route path="/dashboard" element={
        <PageTransition>
          <ClientDashboardResponsive />
        </PageTransition>
      } />
      <Route path="/book" element={
        <PageTransition>
          <BookingPage />
        </PageTransition>
      } />
      <Route path="/appointments" element={
        <PageTransition>
          <ClientAppointments />
        </PageTransition>
      } />
      <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
    </Routes>
  );
};

export default ClientPages;
