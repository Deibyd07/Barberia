import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PageTransition from '../components/Common/PageTransition';
import ClientDashboardResponsive from '../components/Client/ClientDashboardResponsive';
import BookingPage from '../components/Client/BookingPage';
import ClientAppointments from '../components/Client/ClientAppointments';

const ClientPages: React.FC = () => {
  return (
    <Routes>
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
    </Routes>
  );
};

export default ClientPages;
