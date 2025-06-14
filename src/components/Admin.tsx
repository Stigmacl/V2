import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, Shield, Image, Edit, Trash2, Plus, Save, X, Upload, Eye, UserCheck, UserX, Key, Ban, CheckCircle, AlertTriangle, Calendar, Clock, RotateCcw, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Admin: React.FC = () => {
  const { 
    user, 
    users, 
    updateUser, 
    changeUserPassword, 
    toggleUserStatus, 
    deleteUser, 
    news, 
    createNews, 
    updateNews, 
    deleteNews,
    clans,
    createClan,
    updateClan,
    deleteClan,
    getDeletedComments,
    restoreComment
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'news' | 'users' | 'clans' | 'moderation'>('users');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'suspended' | 'admin' | 'player'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedComments, setDeletedComments] = useState<any[]>([]);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-blue-300">No tienes permisos para acceder al panel de administración.</p>
        </div>
      </div>
    );
  }

  // Load deleted comments when moderation tab is active
  useEffect(() => {
    if (activeTab === 'moderation') {
      loadDeletedComments();
    }
  }, [activeTab]);

  const loadDeletedComments = async () => {
    const comments = await getDeletedComments();
    setDeletedComments(comments);
  };

  // Filter users based on search and filter criteria
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = userFilter === 'all' ||
                         (userFilter === 'active' && u.isActive) ||
                         (userFilter === 'suspended' && !u.isActive) ||
                         (userFilter === 'admin' && u.role === 'admin') ||
                         (userFilter === 'player' && u.role === 'player');
    
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (item: any, type: 'news' | 'user' | 'clan') => {
    setEditingItem({ ...item, type });
    setImagePreview(item.image || item.logo || item.avatar || '');
    setIsEditing(true);
  };

  const handleCreate = (type: 'news' | 'clan') => {
    const newItem = type === 'news' 
      ? {
          title: '',
          content: '',
          image: '',
          isPinned: false,
          author: user.username,
          date: new Date().toISOString().split('T')[0],
          type: 'news'
        }
      : {
          id: '',
          name: '',
          tag: '',
          logo: '',
          description: '',
          members: 0,
          type: 'clan'
        };
    
    setEditingItem(newItem);
    setImagePreview('');
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      let success = false;
      
      if (editingItem.type === 'user') {
        success = await updateUser(editingItem.id, {
          username: editingItem.username,
          email: editingItem.email,
          role: editingItem.role,
          clan: editingItem.clan,
          status: editingItem.status,
          avatar: editingItem.avatar
        });
        
        if (editingItem.newPassword) {
          changeUserPassword(editingItem.id, editingItem.newPassword);
        }
      } else if (editingItem.type === 'news') {
        if (isCreating) {
          success = await createNews({
            title: editingItem.title,
            content: editingItem.content,
            image: editingItem.image,
            author: editingItem.author,
            date: editingItem.date,
            isPinned: editingItem.isPinned
          });
        } else {
          success = await updateNews(editingItem.id, editingItem);
        }
      } else if (editingItem.type === 'clan') {
        if (isCreating) {
          success = await createClan({
            name: editingItem.name,
            tag: editingItem.tag,
            logo: editingItem.logo,
            description: editingItem.description
          });
        } else {
          success = await updateClan(editingItem.id, editingItem);
        }
      }
      
      if (success) {
        setIsEditing(false);
        setEditingItem(null);
        setIsCreating(false);
        setImagePreview('');
      } else {
        alert('Error al guardar. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar. Intenta nuevamente.');
    }
  };

  const handleDelete = async (id: string, type: 'news' | 'user' | 'clan') => {
    try {
      let success = false;
      
      if (type === 'user') {
        if (id === '1') {
          alert('No se puede eliminar al administrador principal.');
          return;
        }
        if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
          success = await deleteUser(id);
        }
      } else if (type === 'news') {
        if (confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
          success = await deleteNews(id);
        }
      } else if (type === 'clan') {
        if (confirm('¿Estás seguro de que quieres eliminar este clan? Los usuarios asignados perderán su clan.')) {
          success = await deleteClan(id);
        }
      }
      
      if (!success) {
        alert('Error al eliminar. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error al eliminar. Intenta nuevamente.');
    }
  };

  const handleRestoreComment = async (commentId: string) => {
    const success = await restoreComment('', commentId);
    if (success) {
      loadDeletedComments(); // Reload deleted comments
    } else {
      alert('Error al restaurar el comentario');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImagePreview(imageUrl);
        setEditingItem({
          ...editingItem,
          [editingItem.type === 'news' ? 'image' : editingItem.type === 'user' ? 'avatar' : 'logo']: imageUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setImagePreview(url);
    setEditingItem({
      ...editingItem,
      [editingItem.type === 'news' ? 'image' : editingItem.type === 'user' ? 'avatar' : 'logo']: url
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const suspended = users.filter(u => !u.isActive).length;
    const admins = users.filter(u => u.role === 'admin').length;
    const online = users.filter(u => u.isOnline && u.isActive).length;
    
    return { total, active, suspended, admins, online };
  };

  const stats = getUserStats();

  const tabs = [
    { id: 'users' as const, label: 'Gestión de Usuarios', icon: Users },
    { id: 'news' as const, label: 'Gestión de Noticias', icon: FileText },
    { id: 'clans' as const, label: 'Sistema de Clanes', icon: Shield },
    { id: 'moderation' as const, label: 'Moderación', icon: MessageCircle }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Panel de Administración</h1>
        <p className="text-blue-200 text-lg">Gestión completa de la comunidad</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-slate-800/40 backdrop-blur-lg rounded-xl p-2 border border-blue-700/30">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
                  ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-blue-300 hover:bg-blue-600/20 hover:text-blue-200'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* User Statistics */}
          <div className="grid md:grid-cols-5 gap-4">
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-blue-300 text-sm">Total Usuarios</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.active}</p>
                  <p className="text-green-300 text-sm">Activos</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
              <div className="flex items-center space-x-3">
                <UserX className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.suspended}</p>
                  <p className="text-red-300 text-sm">Suspendidos</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.admins}</p>
                  <p className="text-yellow-300 text-sm">Administradores</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.online}</p>
                  <p className="text-green-300 text-sm">En Línea</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar usuarios por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value as any)}
                className="px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">Todos los usuarios</option>
                <option value="active">Usuarios activos</option>
                <option value="suspended">Usuarios suspendidos</option>
                <option value="admin">Administradores</option>
                <option value="player">Jugadores</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/40">
                  <tr>
                    <th className="px-6 py-4 text-left text-blue-300 font-medium">Usuario</th>
                    <th className="px-6 py-4 text-left text-blue-300 font-medium">Email</th>
                    <th className="px-6 py-4 text-left text-blue-300 font-medium">Rol</th>
                    <th className="px-6 py-4 text-left text-blue-300 font-medium">Estado</th>
                    <th className="px-6 py-4 text-left text-blue-300 font-medium">Clan</th>
                    <th className="px-6 py-4 text-left text-blue-300 font-medium">Último Acceso</th>
                    <th className="px-6 py-4 text-left text-blue-300 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((userItem) => (
                    <tr key={userItem.id} className="border-b border-blue-800/20 hover:bg-slate-700/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={userItem.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                              alt={userItem.username}
                              className="w-10 h-10 rounded-full border-2 border-blue-500/30"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                              userItem.isOnline && userItem.isActive ? 'bg-green-500' : 'bg-gray-500'
                            }`}></div>
                          </div>
                          <div>
                            <span className="text-white font-medium">{userItem.username}</span>
                            {userItem.id === '1' && (
                              <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                                Root
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-blue-200">{userItem.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${
                          userItem.role === 'admin' 
                            ? 'bg-yellow-500/20 text-yellow-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {userItem.role === 'admin' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          <span>{userItem.role === 'admin' ? 'Admin' : 'Jugador'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {userItem.isActive ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-300 text-sm">Activo</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 text-red-400" />
                              <span className="text-red-300 text-sm">Suspendido</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-200">{userItem.clan || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 text-blue-400 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{userItem.lastLogin ? formatDate(userItem.lastLogin) : 'Nunca'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(userItem, 'user')}
                            className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg text-blue-300 transition-colors"
                            title="Editar usuario"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleUserStatus(userItem.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              userItem.isActive
                                ? 'bg-red-600/20 hover:bg-red-600/40 text-red-300'
                                : 'bg-green-600/20 hover:bg-green-600/40 text-green-300'
                            }`}
                            title={userItem.isActive ? 'Suspender usuario' : 'Activar usuario'}
                          >
                            {userItem.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          
                          {userItem.id !== '1' && (
                            <button
                              onClick={() => handleDelete(userItem.id, 'user')}
                              className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-300 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron usuarios</h3>
              <p className="text-blue-300">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* News Management */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Gestión de Noticias</h2>
            <button 
              onClick={() => handleCreate('news')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Noticia</span>
            </button>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No hay noticias creadas</h3>
              <p className="text-blue-300">Crea la primera noticia para comenzar a informar a la comunidad</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {news.map((item) => (
                <div key={item.id} className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4 flex-1">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-bold text-white">{item.title}</h3>
                          {item.isPinned && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full">
                              Fijado
                            </span>
                          )}
                        </div>
                        <p className="text-blue-200 text-sm mb-2">{item.content.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-4 text-xs text-blue-400">
                          <span>Por: {item.author}</span>
                          <span>Fecha: {item.date}</span>
                          <span>Comentarios: {item.comments.filter(c => !c.isDeleted).length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item, 'news')}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, 'news')}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clan Management */}
      {activeTab === 'clans' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Sistema de Clanes</h2>
            <button 
              onClick={() => handleCreate('clan')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Clan</span>
            </button>
          </div>

          {clans.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-white mb-2">No hay clanes creados</h3>
              <p className="text-blue-300">Crea el primer clan para comenzar a organizar la comunidad</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {clans.map((clan) => (
                <div key={clan.id} className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={clan.logo || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&fit=crop'}
                        alt={clan.name}
                        className="w-16 h-16 rounded-lg border-2 border-blue-500/30"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-white">{clan.name}</h3>
                        <p className="text-blue-300 font-mono">[{clan.tag}]</p>
                        <p className="text-blue-400 text-sm">{clan.members} miembros</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(clan, 'clan')}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg text-blue-300 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(clan.id, 'clan')}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-blue-200 text-sm mb-4">{clan.description}</p>
                  
                  {/* Show clan members */}
                  <div className="border-t border-blue-700/30 pt-4">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">Miembros:</h4>
                    <div className="flex flex-wrap gap-2">
                      {users.filter(u => u.clan === clan.tag).map(member => (
                        <span key={member.id} className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full">
                          {member.username}
                        </span>
                      ))}
                      {users.filter(u => u.clan === clan.tag).length === 0 && (
                        <span className="text-blue-400 text-xs italic">Sin miembros asignados</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Moderation Panel */}
      {activeTab === 'moderation' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Panel de Moderación</h2>
            <button 
              onClick={loadDeletedComments}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-lg rounded-xl border border-blue-700/30 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-red-400" />
              <span>Comentarios Eliminados ({deletedComments.length})</span>
            </h3>

            {deletedComments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-50" />
                <p className="text-blue-300">No hay comentarios eliminados</p>
                <p className="text-blue-400 text-sm mt-1">Los comentarios moderados aparecerán aquí</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deletedComments.map((comment) => (
                  <div key={comment.id} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3 flex-1">
                        <img
                          src={comment.authorAvatar}
                          alt={comment.author}
                          className="w-10 h-10 rounded-full border border-red-500/30 opacity-75"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-red-300">{comment.author}</span>
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">ELIMINADO</span>
                            <span className="text-xs text-red-400">{formatDate(comment.createdAt)}</span>
                          </div>
                          
                          <p className="text-red-200 mb-2">{comment.content}</p>
                          
                          <div className="text-xs text-red-400 space-y-1">
                            <p><strong>Noticia:</strong> {comment.newsTitle}</p>
                            <p><strong>Eliminado por:</strong> {comment.deletedBy}</p>
                            <p><strong>Fecha eliminación:</strong> {formatDate(comment.deletedAt)}</p>
                            {comment.deletionReason && (
                              <p><strong>Razón:</strong> {comment.deletionReason}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleRestoreComment(comment.id)}
                        className="p-2 bg-green-600/20 hover:bg-green-600/40 rounded-lg text-green-300 transition-colors"
                        title="Restaurar comentario"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-blue-700/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {isCreating ? 'Crear' : 'Editar'} {
                  editingItem.type === 'news' ? 'Noticia' : 
                  editingItem.type === 'user' ? 'Usuario' : 'Clan'
                }
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setIsCreating(false);
                  setEditingItem(null);
                  setImagePreview('');
                }}
                className="p-2 hover:bg-slate-700 rounded-lg text-blue-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {editingItem.type === 'user' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-blue-300 text-sm font-medium mb-2">Nombre de Usuario</label>
                      <input
                        type="text"
                        value={editingItem.username || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, username: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-blue-300 text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={editingItem.email || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-blue-300 text-sm font-medium mb-2">Rol</label>
                      <select
                        value={editingItem.role || 'player'}
                        onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                      >
                        <option value="player">Jugador</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-blue-300 text-sm font-medium mb-2">Clan</label>
                      <select
                        value={editingItem.clan || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, clan: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                      >
                        <option value="">Sin clan</option>
                        {clans.map(clan => (
                          <option key={clan.id} value={clan.tag}>{clan.name} [{clan.tag}]</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Estado Personalizado</label>
                    <input
                      type="text"
                      value={editingItem.status || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                      placeholder="Estado del usuario"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Nueva Contraseña</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                      <input
                        type="password"
                        value={editingItem.newPassword || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, newPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                        placeholder="Dejar vacío para mantener la actual"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Avatar (URL)</label>
                    <input
                      type="url"
                      value={editingItem.avatar || ''}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                      placeholder="https://ejemplo.com/avatar.jpg"
                    />
                    {imagePreview && (
                      <div className="mt-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border border-blue-600/30"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {editingItem.type === 'news' && (
                <>
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Título</label>
                    <input
                      type="text"
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Imagen</label>
                    
                    <div className="space-y-3">
                      {/* File Upload */}
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 cursor-pointer transition-all duration-300">
                          <Upload className="w-4 h-4" />
                          <span>Subir Archivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-blue-400 text-sm">o</span>
                      </div>
                      
                      {/* URL Input */}
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/imagen.jpg"
                        value={editingItem.image || ''}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white placeholder-blue-300"
                      />
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-blue-600/30"
                          />
                          <div className="absolute top-2 right-2 bg-black/50 rounded-lg p-1">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Contenido</label>
                    <textarea
                      value={editingItem.content || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="pinned"
                      checked={editingItem.isPinned || false}
                      onChange={(e) => setEditingItem({ ...editingItem, isPinned: e.target.checked })}
                      className="rounded border-blue-600/30"
                    />
                    <label htmlFor="pinned" className="text-blue-300">Fijar noticia</label>
                  </div>
                </>
              )}

              {editingItem.type === 'clan' && (
                <>
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Nombre del Clan</label>
                    <input
                      type="text"
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white"
                      placeholder="Ej: Elite Squad"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Tag del Clan</label>
                    <input
                      type="text"
                      value={editingItem.tag || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, tag: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white font-mono"
                      placeholder="Ej: ELITE"
                      maxLength={8}
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Logo del Clan</label>
                    
                    <div className="space-y-3">
                      {/* File Upload */}
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 cursor-pointer transition-all duration-300">
                          <Upload className="w-4 h-4" />
                          <span>Subir Logo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-blue-400 text-sm">o</span>
                      </div>
                      
                      {/* URL Input */}
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/logo.jpg"
                        value={editingItem.logo || ''}
                        onChange={(e) => handleImageUrlChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white placeholder-blue-300"
                      />
                      
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-24 h-24 object-cover rounded-lg border border-blue-600/30"
                          />
                          <div className="absolute top-1 right-1 bg-black/50 rounded-lg p-1">
                            <Eye className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Descripción</label>
                    <textarea
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white resize-none"
                      placeholder="Describe el clan y sus objetivos..."
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreating ? 'Crear' : 'Guardar'}</span>
                </button>
                
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                    setEditingItem(null);
                    setImagePreview('');
                  }}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors"
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

export default Admin;