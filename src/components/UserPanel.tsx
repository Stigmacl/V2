import React, { useState } from 'react';
import { User, Camera, Settings, Save, Star, Shield, Trophy, Clock, Edit3, LogIn, UserPlus, Eye, EyeOff, Inbox, MessageCircle, Send, Reply, Trash2, AreaChart as MarkAsUnread } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserPanel: React.FC = () => {
  const { user, updateUser, logout, login, register, users, getConversation, getUnreadCount, markMessageAsRead, sendMessage } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'messages'>('profile');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    status: user?.status || '',
    avatar: user?.avatar || ''
  });

  const [authData, setAuthData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value
    });
    setAuthError('');
  };

  const handleSave = () => {
    updateUser(user!.id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user!.username,
      email: user!.email,
      status: user!.status || '',
      avatar: user!.avatar || ''
    });
    setIsEditing(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    const success = await login(authData.username, authData.password);
    
    if (!success) {
      setAuthError('Credenciales incorrectas. Intenta nuevamente.');
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    if (authData.password !== authData.confirmPassword) {
      setAuthError('Las contraseñas no coinciden.');
      setIsSubmitting(false);
      return;
    }

    if (authData.password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      setIsSubmitting(false);
      return;
    }

    const success = await register(authData.username, authData.email, authData.password);
    
    if (!success) {
      setAuthError('El usuario o email ya existe. Intenta con otros datos.');
    }
    
    setIsSubmitting(false);
  };

  const handleSendReply = () => {
    if (!replyMessage.trim() || !selectedConversation || !user) return;
    
    sendMessage(selectedConversation, replyMessage);
    setReplyMessage('');
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

  // Get conversations for current user
  const getConversations = () => {
    if (!user) return [];
    
    const conversationUsers = new Set<string>();
    const conversations: any[] = [];
    
    // Find all users who have exchanged messages with current user
    users.forEach(otherUser => {
      if (otherUser.id === user.id) return;
      
      const conversation = getConversation(user.id, otherUser.id);
      if (conversation.length > 0) {
        const lastMessage = conversation[conversation.length - 1];
        const unreadCount = conversation.filter(msg => 
          msg.toUserId === user.id && !msg.isRead
        ).length;
        
        conversations.push({
          user: otherUser,
          lastMessage,
          unreadCount,
          messages: conversation
        });
      }
    });
    
    return conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Acceso de Usuario</h1>
          <p className="text-blue-200 text-lg">Inicia sesión o regístrate para acceder a tu perfil</p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-8 shadow-2xl">
            {/* Toggle Buttons */}
            <div className="flex mb-6 bg-slate-700/40 rounded-xl p-1">
              <button
                onClick={() => setShowLogin(true)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                  showLogin 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-300 hover:text-blue-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                  !showLogin 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-300 hover:text-blue-200'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Login Form */}
            {showLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-center mb-6">
                  <LogIn className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-white">Iniciar Sesión</h2>
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={authData.username}
                    onChange={handleAuthChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ingresa tu usuario"
                  />
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={authData.password}
                      onChange={handleAuthChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                      placeholder="Ingresa tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-xl text-white font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Iniciar Sesión</span>
                    </>
                  )}
                </button>

                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
                  <p className="font-medium mb-1">Credenciales de prueba:</p>
                  <p>Admin: root / tacticalopschile2025</p>
                </div>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="text-center mb-6">
                  <UserPlus className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-white">Crear Cuenta</h2>
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">Nombre de Usuario</label>
                  <input
                    type="text"
                    name="username"
                    value={authData.username}
                    onChange={handleAuthChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Elige un nombre de usuario"
                  />
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={authData.email}
                    onChange={handleAuthChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={authData.password}
                      onChange={handleAuthChange}
                      required
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors pr-12"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">Confirmar Contraseña</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={authData.confirmPassword}
                    onChange={handleAuthChange}
                    required
                    className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Repite tu contraseña"
                  />
                </div>

                {authError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-xl text-white font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Crear Cuenta</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Partidas Jugadas', value: '0', icon: Trophy, color: 'text-blue-400' },
    { label: 'Horas Jugadas', value: '0h', icon: Clock, color: 'text-green-400' },
    { label: 'Mejor Racha', value: '0', icon: Star, color: 'text-yellow-400' },
    { label: 'K/D Ratio', value: '0.00', icon: Shield, color: 'text-red-400' }
  ];

  const achievements = [
    { name: 'Primera Conexión', description: 'Te has registrado en la comunidad', unlocked: true },
    { name: 'Primera Victoria', description: 'Gana tu primera partida', unlocked: false },
    { name: 'Francotirador', description: 'Consigue 50 eliminaciones con sniper', unlocked: false },
    { name: 'Veterano', description: 'Juega 100 partidas', unlocked: false },
    { name: 'Leyenda', description: 'Alcanza el top 10 del ranking', unlocked: false }
  ];

  const conversations = getConversations();
  const totalUnreadMessages = getUnreadCount(user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Mi Perfil</h1>
        <p className="text-blue-200 text-lg">Gestiona tu información personal y configuraciones</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex space-x-2 bg-slate-800/40 backdrop-blur-lg rounded-xl p-2 border border-blue-700/30">
          <button
            onClick={() => setActiveTab('profile')}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300
              ${activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-blue-300 hover:bg-blue-600/20 hover:text-blue-200'
              }
            `}
          >
            <User className="w-5 h-5" />
            <span>Mi Perfil</span>
          </button>
          
          <button
            onClick={() => setActiveTab('messages')}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 relative
              ${activeTab === 'messages'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-blue-300 hover:bg-blue-600/20 hover:text-blue-200'
              }
            `}
          >
            <Inbox className="w-5 h-5" />
            <span>Mensajes</span>
            {totalUnreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalUnreadMessages}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={user.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                    alt={user.username}
                    className="w-24 h-24 rounded-full border-4 border-blue-500/30 mx-auto"
                  />
                  <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                  <div className={`absolute -bottom-2 -right-8 w-6 h-6 rounded-full border-4 border-slate-800 ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mt-4">{user.username}</h2>
                <p className="text-blue-300">{user.email}</p>
                
                {user.clan && (
                  <div className="mt-2">
                    <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm font-medium">
                      [{user.clan}]
                    </span>
                  </div>
                )}
                
                <div className="mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center justify-center space-x-1 ${
                    user.role === 'admin' 
                      ? 'bg-yellow-500/20 text-yellow-300' 
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                    <span>{user.role === 'admin' ? 'Administrador' : 'Jugador'}</span>
                  </span>
                </div>

                {user.status && (
                  <div className="mt-4 p-3 bg-slate-700/40 rounded-lg">
                    <p className="text-blue-200 italic text-sm">"{user.status}"</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-300 hover:text-blue-200 font-medium transition-all duration-300"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{isEditing ? 'Cancelar Edición' : 'Editar Perfil'}</span>
                </button>
                
                <button
                  onClick={logout}
                  className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-300 hover:text-red-200 font-medium transition-all duration-300"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Edit Form */}
            {isEditing && (
              <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-6 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">Editar Información</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Nombre de Usuario</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">Estado Personalizado</label>
                    <input
                      type="text"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      placeholder="Ej: Listo para la batalla"
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-blue-300 text-sm font-medium mb-2">URL del Avatar</label>
                    <input
                      type="url"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/avatar.jpg"
                      className="w-full px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </button>
                    
                    <button
                      onClick={handleCancel}
                      className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-xl text-white font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Statistics */}
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Estadísticas de Juego</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-slate-700/40 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-8 h-8 ${stat.color}`} />
                        <div>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className="text-blue-300 text-sm">{stat.label}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Logros</h3>
              
              <div className="grid gap-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-4 p-4 rounded-xl border ${
                      achievement.unlocked
                        ? 'bg-green-600/10 border-green-500/30'
                        : 'bg-slate-700/40 border-slate-600/30'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked ? 'bg-green-600/20' : 'bg-slate-600/40'
                    }`}>
                      <Trophy className={`w-6 h-6 ${
                        achievement.unlocked ? 'text-green-400' : 'text-slate-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-bold ${
                        achievement.unlocked ? 'text-green-300' : 'text-slate-400'
                      }`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    
                    {achievement.unlocked && (
                      <div className="text-green-400 font-bold text-sm">
                        ✓ Desbloqueado
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <Inbox className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Conversaciones</h3>
                {totalUnreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {totalUnreadMessages}
                  </span>
                )}
              </div>

              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-blue-400 mx-auto mb-3 opacity-50" />
                  <p className="text-blue-300">No tienes conversaciones aún</p>
                  <p className="text-blue-400 text-sm mt-1">Los mensajes aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.user.id}
                      onClick={() => {
                        setSelectedConversation(conversation.user.id);
                        // Mark messages as read when opening conversation
                        conversation.messages
                          .filter(msg => msg.toUserId === user.id && !msg.isRead)
                          .forEach(msg => markMessageAsRead(msg.id));
                      }}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        selectedConversation === conversation.user.id
                          ? 'bg-blue-600/20 border border-blue-500/30'
                          : 'bg-slate-700/40 hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={conversation.user.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                            alt={conversation.user.username}
                            className="w-10 h-10 rounded-full border-2 border-blue-500/30"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${
                            conversation.user.isOnline ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white truncate">{conversation.user.username}</h4>
                            {conversation.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-blue-300 text-sm truncate">
                            {conversation.lastMessage.fromUserId === user.id ? 'Tú: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                          <p className="text-blue-400 text-xs">
                            {formatDate(conversation.lastMessage.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 shadow-2xl h-[600px] flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-6 border-b border-blue-700/30">
                    <div className="flex items-center space-x-3">
                      <img
                        src={users.find(u => u.id === selectedConversation)?.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop'}
                        alt="User"
                        className="w-10 h-10 rounded-full border-2 border-blue-500/30"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {users.find(u => u.id === selectedConversation)?.username}
                        </h3>
                        <p className="text-blue-300 text-sm">
                          {users.find(u => u.id === selectedConversation)?.isOnline ? 'En línea' : 'Desconectado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                      {getConversation(user.id, selectedConversation).map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.fromUserId === user.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.fromUserId === user.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700/40 text-blue-100'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.fromUserId === user.id ? 'text-blue-200' : 'text-blue-400'
                            }`}>
                              {formatDate(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Input */}
                  <div className="p-6 border-t border-blue-700/30">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        className="flex-1 px-4 py-3 bg-slate-700/40 border border-blue-600/30 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-xl text-white font-medium transition-colors flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Enviar</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-white mb-2">Selecciona una conversación</h3>
                    <p className="text-blue-300">Elige una conversación para ver los mensajes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;