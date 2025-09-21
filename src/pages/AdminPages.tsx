import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageTransition from '../components/Common/PageTransition';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AppointmentList from '../components/Admin/AppointmentList';
import ScheduleManager from '../components/Admin/ScheduleManager';
import ClientManagement from '../components/Admin/ClientManagement';

const AdminPages: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
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
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminPages;
