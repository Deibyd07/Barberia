import React, { useState, useEffect } from 'react';
import { Calendar, DollarSign, Users, Clock, CheckCircle, Crown } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import { getTodayString, createLocalDate } from '../../utils/dateUtils';

const AdminDashboardMobile: React.FC = () => {
  const { appointments } = useAppointments();
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  // Calculate statistics
  const today = getTodayString();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  // Obtener citas del día seleccionado
  const selectedDateAppointments = appointments.filter(apt => 
    apt.date === selectedDate && apt.status !== 'cancelled'
  );

  const todayAppointments = appointments.filter(apt => 
    apt.date === today && apt.status !== 'cancelled'
  );
  const confirmedToday = todayAppointments.filter(apt => apt.status === 'confirmed').length;
  
  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = createLocalDate(apt.date);
    return aptDate.getMonth() === thisMonth && aptDate.getFullYear() === thisYear && apt.status !== 'cancelled';
  });

  const completedThisMonth = monthlyAppointments.filter(apt => apt.status === 'completed');
  const confirmedThisMonth = monthlyAppointments.filter(apt => apt.status === 'confirmed');
  const monthlyRevenue = completedThisMonth.reduce((sum, apt) => sum + (apt.price || 0), 0);

  const stats = [
    {
      title: 'Ingresos del Mes',
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Citas Hoy',
      value: `${confirmedToday}/${todayAppointments.length}`,
      icon: Calendar,
      color: 'text-blue-500'
    },
    {
      title: 'Citas Futuras',
      value: appointments.filter(apt => apt.status === 'confirmed').length.toString(),
      icon: CheckCircle,
      color: 'text-purple-500'
    },
    {
      title: 'Clientes del Mes',
      value: new Set(monthlyAppointments.map(apt => apt.clientId)).size.toString(),
      icon: Users,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header Simple */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Crown className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Panel Admin</h1>
            <p className="text-gray-400 text-sm">Control de barbería</p>
          </div>
        </div>
      </div>

      {/* Stats Grid Simple */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Citas del Día */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Citas del Día</h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
          />
        </div>
        
        {selectedDateAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No hay citas para esta fecha</p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedDateAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
              <div key={appointment.id} className="bg-gray-700 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{appointment.clientName}</p>
                    <p className="text-gray-400 text-sm">{appointment.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    <p className={`text-xs ${
                      appointment.status === 'confirmed' ? 'text-green-400' : 
                      appointment.status === 'completed' ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' : 
                       appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumen Mensual */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Resumen Mensual</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Servicios completados</span>
            <span className="text-white font-semibold">{completedThisMonth.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Citas confirmadas</span>
            <span className="text-white font-semibold">{confirmedThisMonth.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Ingresos totales</span>
            <span className="text-white font-semibold">${monthlyRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Clientes únicos</span>
            <span className="text-white font-semibold">{new Set(monthlyAppointments.map(apt => apt.clientId)).size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMobile;
