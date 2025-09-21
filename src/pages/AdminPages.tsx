import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PageTransition from '../components/Common/PageTransition';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AppointmentList from '../components/Admin/AppointmentList';
import ScheduleManager from '../components/Admin/ScheduleManager';
import ClientManagement from '../components/Admin/ClientManagement';

const AdminPages: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <PageTransition>
          <AdminDashboard />
        </PageTransition>
      } />
      <Route path="/appointments" element={
        <PageTransition>
          <AppointmentList />
        </PageTransition>
      } />
      <Route path="/schedule" element={
        <PageTransition>
          <ScheduleManager />
        </PageTransition>
      } />
      <Route path="/clients" element={
        <PageTransition>
          <ClientManagement />
        </PageTransition>
      } />
    </Routes>
  );
};

export default AdminPages;
