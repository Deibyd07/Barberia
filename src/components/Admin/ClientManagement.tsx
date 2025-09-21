import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Edit, Trash2, Phone, Mail, Calendar, Star, AlertCircle } from 'lucide-react';
import { useAppointments } from '../../context/AppointmentContext';
import ClientService from '../../services/clientService';

const ClientManagement: React.FC = () => {
  const { appointments } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [clients, setClients] = useState<any[]>([]);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Obtener clientes de la tabla users
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await ClientService.getClients();
        
        // Enriquecer con estadísticas de citas
        const enrichedClients = clientsData.map(client => {
          const clientAppointments = appointments.filter(apt => apt.clientId === client.id);
          const totalAppointments = clientAppointments.length;
          const completedAppointments = clientAppointments.filter(apt => apt.status === 'completed').length;
          const lastAppointment = clientAppointments.length > 0 
            ? clientAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
            : null;

          return {
            ...client,
            totalAppointments,
            completedAppointments,
            lastAppointment,
            status: clientAppointments.length > 0 ? 'active' : 'inactive'
          };
        });

        setClients(enrichedClients);
      } catch (error) {
        console.error('Error obteniendo clientes:', error);
        // Fallback a clientes de citas si hay error
        const uniqueClients = appointments.reduce((acc: any[], appointment) => {
          const existingClient = acc.find(client => client.id === appointment.clientId);
          
          if (!existingClient) {
            acc.push({
              id: appointment.clientId,
              name: appointment.clientName,
              phone: appointment.clientPhone,
              email: `${appointment.clientName.toLowerCase().replace(/\s+/g, '')}@email.com`,
              totalAppointments: 1,
              completedAppointments: appointment.status === 'completed' ? 1 : 0,
              lastAppointment: appointment.date,
              status: appointment.status,
              joinDate: appointment.createdAt
            });
          } else {
            existingClient.totalAppointments++;
            if (appointment.status === 'completed') {
              existingClient.completedAppointments++;
            }
            if (new Date(appointment.date) > new Date(existingClient.lastAppointment)) {
              existingClient.lastAppointment = appointment.date;
            }
          }
          
          return acc;
        }, []);

        setClients(uniqueClients);
      }
    };

    fetchClients();
  }, [appointments]);

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && client.totalAppointments > 0) ||
                         (filterStatus === 'new' && client.totalAppointments === 1);
    
    return matchesSearch && matchesFilter;
  });

  // Iniciar edición de cliente
  const handleEditClient = (client: any) => {
    setEditingClient(client.id);
    setEditForm({
      name: client.name,
      phone: client.phone,
      email: client.email || ''
    });
    setShowEditModal(true);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingClient(null);
    setEditForm({ name: '', phone: '', email: '' });
    setShowEditModal(false);
  };

  // Guardar cambios del cliente
  const handleSaveClient = async (clientId: string) => {
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      alert('Nombre y teléfono son obligatorios');
      return;
    }

    setIsLoading(true);
    try {
      const updatedClient = await ClientService.updateClient(clientId, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim()
      });

      if (updatedClient) {
        // Actualizar la lista local
        setClients(prev => prev.map(client => 
          client.id === clientId ? { ...client, ...updatedClient } : client
        ));
        
        setEditingClient(null);
        setEditForm({ name: '', phone: '', email: '' });
        setShowEditModal(false);
        alert('Cliente actualizado correctamente');
      } else {
        alert('Error al actualizar el cliente');
      }
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      alert('Error al actualizar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar cliente
  const handleDeleteClient = async (clientId: string) => {
    setIsLoading(true);
    try {
      const success = await ClientService.deleteClient(clientId);
      
      if (success) {
        // Actualizar la lista local
        setClients(prev => prev.filter(client => client.id !== clientId));
        setShowDeleteModal(null);
        alert('Cliente eliminado correctamente');
      } else {
        alert('No se puede eliminar el cliente porque tiene citas existentes');
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const getClientStats = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.totalAppointments > 0).length;
    const newClients = clients.filter(c => c.totalAppointments === 1).length;
    const avgAppointments = totalClients > 0 ? (clients.reduce((sum, c) => sum + c.totalAppointments, 0) / totalClients).toFixed(1) : 0;

    return { totalClients, activeClients, newClients, avgAppointments };
  };

  const stats = getClientStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-barber-midnight via-barber-charcoal to-barber-black font-barber relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-barber-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-barber-gold/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-barber-copper/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container-barber py-4 sm:py-8 px-2 sm:px-4 relative z-10 pb-8 sm:pb-12">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-barber-dark/60 via-barber-slate/40 to-barber-charcoal/60 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-6 lg:p-8 text-barber-gold mb-4 sm:mb-6 lg:mb-10 shadow-barber-xl border border-barber-gold/20 overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 sm:gap-4 lg:gap-6">
            <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-barber-gold/30 rounded-full blur-lg animate-glow"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-gradient-to-br from-barber-gold/20 via-barber-copper/20 to-barber-bronze/20 backdrop-blur-md rounded-full border-2 border-barber-gold/50 shadow-neon-gold transform group-hover:scale-110 transition-all duration-300 animate-float">
                  <Users className="h-8 w-8 text-barber-gold" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl lg:text-5xl font-display font-bold mb-1 sm:mb-2 tracking-wide">
                  <span className="bg-gradient-to-r from-barber-gold via-barber-copper to-barber-gold bg-clip-text text-transparent">
                    Gestión de Clientes
                  </span>
                </h1>
                <p className="text-barber-cream/90 text-xs sm:text-base lg:text-lg font-body">
                  Administra tu base de clientes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="group relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-charcoal backdrop-blur-md rounded-xl sm:rounded-2xl shadow-barber-xl p-4 sm:p-6 lg:p-8 border border-barber-gold/30 hover:shadow-neon-gold transition-all duration-500 transform hover:scale-105 animate-slide-in-left overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-barber-gold/20 rounded-2xl blur-lg animate-glow"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-gold-glow transform group-hover:rotate-12 transition-all duration-300">
                    <Users className="h-8 w-8 text-white group-hover:animate-bounce" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-barber-gold mb-2 group-hover:text-barber-copper transition-colors duration-300">
                  {stats.totalClients}
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-medium text-barber-cream mb-3 font-display">
                  Total Clientes
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-charcoal backdrop-blur-md rounded-xl sm:rounded-2xl shadow-barber-xl p-4 sm:p-6 lg:p-8 border border-barber-gold/30 hover:shadow-neon-gold transition-all duration-500 transform hover:scale-105 animate-slide-in-left overflow-hidden" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-barber-gold/20 rounded-2xl blur-lg animate-glow"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-gold-glow transform group-hover:rotate-12 transition-all duration-300">
                    <Star className="h-8 w-8 text-white group-hover:animate-bounce" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-barber-gold mb-2 group-hover:text-barber-copper transition-colors duration-300">
                  {stats.activeClients}
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-medium text-barber-cream mb-3 font-display">
                  Clientes Activos
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-charcoal backdrop-blur-md rounded-xl sm:rounded-2xl shadow-barber-xl p-4 sm:p-6 lg:p-8 border border-barber-gold/30 hover:shadow-neon-gold transition-all duration-500 transform hover:scale-105 animate-slide-in-left overflow-hidden" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-barber-gold/20 rounded-2xl blur-lg animate-glow"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-gold-glow transform group-hover:rotate-12 transition-all duration-300">
                    <Plus className="h-8 w-8 text-white group-hover:animate-bounce" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-barber-gold mb-2 group-hover:text-barber-copper transition-colors duration-300">
                  {stats.newClients}
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-medium text-barber-cream mb-3 font-display">
                  Clientes Nuevos
                </p>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-charcoal backdrop-blur-md rounded-xl sm:rounded-2xl shadow-barber-xl p-4 sm:p-6 lg:p-8 border border-barber-gold/30 hover:shadow-neon-gold transition-all duration-500 transform hover:scale-105 animate-slide-in-left overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-barber-gold/20 rounded-2xl blur-lg animate-glow"></div>
                  <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-gold-glow transform group-hover:rotate-12 transition-all duration-300">
                    <Calendar className="h-8 w-8 text-white group-hover:animate-bounce" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-barber-gold mb-2 group-hover:text-barber-copper transition-colors duration-300">
                  {stats.avgAppointments}
                </p>
                <p className="text-sm sm:text-base lg:text-lg font-medium text-barber-cream mb-3 font-display">
                  Promedio Citas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-black rounded-2xl shadow-2xl shadow-barber-gold/20 border border-barber-gold/30 glow-border overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-barber-gold/60" />
                  <input
                    type="text"
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-barber-dark/50 border border-barber-gold/30 rounded-lg text-barber-cream placeholder-barber-cream/60 focus:outline-none focus:ring-2 focus:ring-barber-gold/50 focus:border-barber-gold text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-barber-dark/50 border border-barber-gold/30 rounded-lg text-barber-cream focus:outline-none focus:ring-2 focus:ring-barber-gold/50 text-sm sm:text-base"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="new">Nuevos</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Clients List */}
        <div className="relative bg-gradient-to-br from-barber-black via-barber-dark to-barber-black rounded-2xl shadow-2xl shadow-barber-gold/20 border border-barber-gold/30 glow-border overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-barber-gold/5 via-transparent to-barber-copper/5"></div>
          <div className="relative z-10 p-4 sm:p-6 pb-6 sm:pb-8">
            <h3 className="text-lg sm:text-xl font-bold text-barber-gold mb-4 sm:mb-6 font-display">
              Lista de Clientes ({filteredClients.length})
            </h3>
            
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-barber-gold/50 mx-auto mb-4" />
                <p className="text-barber-cream/60 font-body">
                  {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes registrados'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="p-4 bg-gradient-to-r from-barber-dark/50 to-barber-black/50 rounded-xl border border-barber-gold/30 hover:border-barber-gold/50 transition-all duration-300 hover:scale-[1.02] glow-subtle"
                  >
                    {/* Desktop Layout */}
                    <div className="hidden lg:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-barber-gold to-barber-copper rounded-full flex items-center justify-center">
                          <span className="text-barber-black font-bold text-lg">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-barber-white text-lg font-display">
                            {client.name}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-barber-cream/80">
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{client.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{client.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-barber-cream/60">Total Citas</p>
                          <p className="text-lg font-bold text-barber-gold">{client.totalAppointments}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-barber-cream/60">Completadas</p>
                          <p className="text-lg font-bold text-green-400">{client.completedAppointments}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-barber-cream/60">Última Cita</p>
                          <p className="text-sm font-bold text-barber-gold">
                            {new Date(client.lastAppointment).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditClient(client)}
                            disabled={isLoading}
                            className="p-2 bg-barber-gold/20 hover:bg-barber-gold/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Edit className="h-4 w-4 text-barber-gold" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteModal(client.id)}
                            disabled={isLoading}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile/Tablet Layout */}
                    <div className="lg:hidden space-y-4">
                      {/* Header with avatar and name */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-barber-gold to-barber-copper rounded-full flex items-center justify-center">
                          <span className="text-barber-black font-bold text-sm">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-barber-white text-base font-display">
                            {client.name}
                          </h4>
                          <div className="flex items-center space-x-1 text-xs text-barber-cream/80">
                            <Phone className="h-3 w-3" />
                            <span>{client.phone}</span>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => handleEditClient(client)}
                            disabled={isLoading}
                            className="p-2 bg-barber-gold/20 hover:bg-barber-gold/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Edit className="h-4 w-4 text-barber-gold" />
                          </button>
                          <button 
                            onClick={() => setShowDeleteModal(client.id)}
                            disabled={isLoading}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Contact info */}
                      <div className="flex items-center space-x-1 text-xs text-barber-cream/80">
                        <Mail className="h-3 w-3" />
                        <span>{client.email}</span>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-barber-dark/30 rounded-lg">
                          <p className="text-xs text-barber-cream/60">Total</p>
                          <p className="text-sm font-bold text-barber-gold">{client.totalAppointments}</p>
                        </div>
                        <div className="text-center p-2 bg-barber-dark/30 rounded-lg">
                          <p className="text-xs text-barber-cream/60">Completadas</p>
                          <p className="text-sm font-bold text-green-400">{client.completedAppointments}</p>
                        </div>
                        <div className="text-center p-2 bg-barber-dark/30 rounded-lg">
                          <p className="text-xs text-barber-cream/60">Última</p>
                          <p className="text-xs font-bold text-barber-gold">
                            {new Date(client.lastAppointment).toLocaleDateString('es-ES', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición de cliente */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-barber-dark via-barber-slate to-barber-charcoal rounded-2xl p-6 max-w-md w-full mx-4 border border-barber-gold/30">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-barber-gold/20 rounded-full flex items-center justify-center">
                <Edit className="h-5 w-5 text-barber-gold" />
              </div>
              <h3 className="text-lg font-bold text-barber-white">Editar Cliente</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-barber-cream mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-barber-dark/50 border border-barber-gold/30 rounded-lg text-barber-white focus:outline-none focus:ring-2 focus:ring-barber-gold/50"
                  placeholder="Nombre del cliente"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-barber-cream mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-barber-dark/50 border border-barber-gold/30 rounded-lg text-barber-white focus:outline-none focus:ring-2 focus:ring-barber-gold/50"
                  placeholder="Teléfono"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-barber-cream mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-barber-dark/50 border border-barber-gold/30 rounded-lg text-barber-white focus:outline-none focus:ring-2 focus:ring-barber-gold/50"
                  placeholder="Email"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveClient(editingClient!)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-barber-gold/20 hover:bg-barber-gold/30 text-barber-gold rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-barber-dark via-barber-slate to-barber-charcoal rounded-2xl p-6 max-w-md w-full mx-4 border border-barber-gold/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-barber-white">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-barber-cream/80 mb-6">
              ¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteClient(showDeleteModal)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
