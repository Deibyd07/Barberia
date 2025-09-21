import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageTransition from '../components/Common/PageTransition';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminDashboardMobile from '../components/Admin/AdminDashboardMobile';
import AppointmentList from '../components/Admin/AppointmentList';
import ScheduleManager from '../components/Admin/ScheduleManager';
import ClientManagement from '../components/Admin/ClientManagement';
import { useMobileOptimization } from '../hooks/useMobileOptimization';

const AdminPages: React.FC = () => {
  const { isMobile } = useMobileOptimization();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard" element={
        isMobile ? (
          <AdminDashboardMobile />
        ) : (
          <PageTransition>
            <AdminDashboard />
          </PageTransition>
        )
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
