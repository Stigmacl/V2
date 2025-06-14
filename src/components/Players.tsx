import React, { useState } from 'react';
import { Users, Search, Filter, UserCheck, UserX, Clock, MapPin, Shield, Star, MessageCircle, X, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Players: React.FC = () => {
  const { users, user, sendMessage } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'player'>('all');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageContent, setMessageContent] = useState('');

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'online' && userItem.isOnline) || 
      (statusFilter === 'offline' && !userItem.isOnline);
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getStatusColor = (isOnline: boolean) => {
    return isOnline 
      ? 'bg-green-500 shadow-lg shadow-green-500/30' 
      : 'bg-gray-500';
  };

  const getStatusText = (isOnline: boolean) => {
    return isOnline ? 'En línea' : 'Desconectado';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? (
      <Shield className="w-4 h-4 text-yellow-400" />
    ) : (
      <Star className="w-4 h-4 text-blue-400" />
    );
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' 
      : 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  const handleSendMessage = (targetUser: any) => {
    if (!user) {
      alert('Debes iniciar sesión para enviar mensajes');
      return;
    }
    
    if (targetUser.id === user.id) {
      alert('No puedes enviarte un mensaje a ti mismo');
      return;
    }
    
    setSelectedUser(targetUser);
    setShowMessageModal(true);
  };

  const handleSubmitMessage = () => {
    if (!messageContent.trim() || !selectedUser || !user) return;
    
    sendMessage(selectedUser.id, messageContent);
    setMessageContent('');
    setShowMessageModal(false);
    setSelectedUser(null);
    alert('Mensaje enviado correctamente');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Comunidad de Jugadores</h1>
        <p className="text-blue-200 text-lg">Conoce a los miembros de nuestra comunidad</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input
              type="text"
              placeholder="Buscar jugadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'online' | 'offline')}
              className="px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">Todos los estados</option>
              <option value="online">En línea</option>
              <option value="offline">Desconectados</option>
            </select>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'player')}
              className="px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="player">Jugadores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-blue-300 text-sm">Total Jugadores</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
          <div className="flex items-center space-x-3">
            <UserCheck className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.isOnline).length}</p>
              <p className="text-green-300 text-sm">En Línea</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
          <div className="flex items-center space-x-3">
            <UserX className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => !u.isOnline).length}</p>
              <p className="text-gray-300 text-sm">Desconectados</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-yellow-300 text-sm">Administradores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((userItem) => (
          <div
            key={userItem.id}
            className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-6 shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:transform hover:scale-105"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={userItem.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop'}
                    alt={userItem.username}
                    className="w-16 h-16 rounded-full border-4 border-blue-500/30"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${getStatusColor(userItem.isOnline)} border-2 border-slate-800`}></div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-white">{userItem.username}</h3>
                  <p className="text-blue-300 text-sm">{userItem.email}</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center space-x-1 ${getRoleBadgeColor(userItem.role)}`}>
                {getRoleIcon(userItem.role)}
                <span>{userItem.role === 'admin' ? 'Admin' : 'Jugador'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-400">Estado:</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(userItem.isOnline)}`}></div>
                  <span className="text-white">{getStatusText(userItem.isOnline)}</span>
                </div>
              </div>

              {userItem.status && (
                <div className="text-sm">
                  <span className="text-blue-400">Estado personalizado:</span>
                  <p className="text-white italic mt-1">"{userItem.status}"</p>
                </div>
              )}

              {userItem.clan && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-400">Clan:</span>
                  <div className="px-2 py-1 bg-blue-600/20 rounded text-blue-300 font-mono text-xs">
                    [{userItem.clan}]
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-blue-700/30">
                <div className="flex items-center space-x-4 text-xs text-blue-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Recién conectado</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>Chile</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-700/30">
              <div className="flex justify-between items-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                  Ver Perfil
                </button>
                <button 
                  onClick={() => handleSendMessage(userItem)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-300 hover:text-blue-200 text-sm font-medium transition-all duration-300"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Enviar Mensaje</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">No se encontraron jugadores</h3>
          <p className="text-blue-300">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-blue-700/30 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedUser.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                  alt={selectedUser.username}
                  className="w-10 h-10 rounded-full border-2 border-blue-500/30"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">Enviar mensaje a {selectedUser.username}</h3>
                  <p className="text-blue-300 text-sm">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedUser(null);
                  setMessageContent('');
                }}
                className="p-2 hover:bg-slate-700 rounded-lg text-blue-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">Mensaje</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitMessage}
                  disabled={!messageContent.trim()}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-xl text-white font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Mensaje</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setSelectedUser(null);
                    setMessageContent('');
                  }}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-xl text-white font-medium transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;