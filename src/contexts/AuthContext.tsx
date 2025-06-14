import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  avatar: string;
  isDeleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
  deletionReason?: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image: string;
  author: string;
  date: string;
  isPinned: boolean;
  views: number;
  comments: Comment[];
  likes: number;
  likedBy: string[];
}

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'player';
  avatar?: string;
  status?: string;
  isOnline: boolean;
  clan?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface Clan {
  id: string;
  name: string;
  tag: string;
  logo: string;
  description: string;
  members: number;
  createdAt: string;
}

interface SessionInfo {
  isActive: boolean;
  expiresAt: number;
  lastExtended: number;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  sessionInfo: SessionInfo;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  extendSession: () => Promise<boolean>;
  users: User[];
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>;
  changeUserPassword: (userId: string, newPassword: string) => boolean;
  toggleUserStatus: (userId: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  messages: Message[];
  sendMessage: (toUserId: string, content: string) => void;
  markMessageAsRead: (messageId: string) => void;
  getConversation: (userId1: string, userId2: string) => Message[];
  getUnreadCount: (userId: string) => number;
  news: NewsItem[];
  createNews: (newsData: Omit<NewsItem, 'id' | 'views' | 'comments' | 'likes' | 'likedBy'>) => Promise<boolean>;
  updateNews: (newsId: string, updates: Partial<NewsItem>) => Promise<boolean>;
  deleteNews: (newsId: string) => Promise<boolean>;
  likeNews: (newsId: string) => void;
  addComment: (newsId: string, content: string) => void;
  incrementNewsViews: (newsId: string) => void;
  deleteComment: (newsId: string, commentId: string, reason?: string) => void;
  restoreComment: (newsId: string, commentId: string) => void;
  clans: Clan[];
  createClan: (clanData: Omit<Clan, 'id' | 'members' | 'createdAt'>) => Promise<boolean>;
  updateClan: (clanId: string, updates: Partial<Clan>) => Promise<boolean>;
  deleteClan: (clanId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Detectar si estamos en desarrollo o producción
const getApiBaseUrl = () => {
  // En desarrollo (Vite dev server)
  if (window.location.port === '5173') {
    return 'http://localhost/tactical-ops-chile/api';
  }
  
  // En producción (XAMPP)
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (port && port !== '80' && port !== '443') {
    return `${protocol}//${hostname}:${port}/api`;
  }
  
  return `${protocol}//${hostname}/tactical-ops-chile/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Constantes de sesión
const SESSION_DURATION = 20 * 60 * 1000; // 20 minutos en milisegundos
const AUTO_EXTEND_INTERVAL = 15 * 60 * 1000; // Auto-extender cada 15 minutos
const SESSION_WARNING_TIME = 5 * 60 * 1000; // Advertir 5 minutos antes de expirar

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [clans, setClans] = useState<Clan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    isActive: false,
    expiresAt: 0,
    lastExtended: 0
  });

  // Referencias para los timers
  const autoExtendTimer = React.useRef<NodeJS.Timeout | null>(null);
  const sessionCheckTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Verificar sesión al cargar la página
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Auto-extender sesión y verificar estado
  useEffect(() => {
    if (user && sessionInfo.isActive) {
      startSessionTimers();
    } else {
      clearSessionTimers();
    }

    return () => clearSessionTimers();
  }, [user, sessionInfo.isActive]);

  const checkExistingSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-session.php`, {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        updateSessionInfo(data.sessionTime);
        await loadInitialData();
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionInfo = (sessionTime?: number) => {
    const now = sessionTime ? sessionTime * 1000 : Date.now();
    setSessionInfo({
      isActive: true,
      expiresAt: now + SESSION_DURATION,
      lastExtended: now
    });
  };

  const startSessionTimers = () => {
    clearSessionTimers();

    // Auto-extender cada 15 minutos
    autoExtendTimer.current = setInterval(async () => {
      if (user) {
        await extendSession();
      }
    }, AUTO_EXTEND_INTERVAL);

    // Verificar estado de sesión cada minuto
    sessionCheckTimer.current = setInterval(() => {
      if (sessionInfo.isActive) {
        const timeLeft = sessionInfo.expiresAt - Date.now();
        
        // Si quedan menos de 5 minutos, mostrar advertencia
        if (timeLeft <= SESSION_WARNING_TIME && timeLeft > 0) {
          const minutesLeft = Math.ceil(timeLeft / 60000);
          console.warn(`⚠️ Tu sesión expirará en ${minutesLeft} minuto(s)`);
        }
        
        // Si la sesión expiró, cerrar sesión
        if (timeLeft <= 0) {
          console.warn('🔒 Sesión expirada');
          logout();
        }
      }
    }, 60000); // Cada minuto
  };

  const clearSessionTimers = () => {
    if (autoExtendTimer.current) {
      clearInterval(autoExtendTimer.current);
      autoExtendTimer.current = null;
    }
    if (sessionCheckTimer.current) {
      clearInterval(sessionCheckTimer.current);
      sessionCheckTimer.current = null;
    }
  };

  const extendSession = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/extend-session.php`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        updateSessionInfo(data.sessionTime);
        console.log('✅ Sesión extendida automáticamente');
        return true;
      } else {
        console.warn('❌ No se pudo extender la sesión:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error extending session:', error);
      return false;
    }
  };

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadUsers(),
        loadNews(),
        loadClans()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/get-all.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadNews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/get-all.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setNews(data.news);
      }
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const loadClans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clans/get-all.php`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setClans(data.clans);
      }
    } catch (error) {
      console.error('Error loading clans:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        updateSessionInfo();
        await loadInitialData();
        console.log('✅ Sesión iniciada correctamente');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        updateSessionInfo();
        await loadInitialData();
        console.log('✅ Usuario registrado y sesión iniciada');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout.php`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setSessionInfo({
        isActive: false,
        expiresAt: 0,
        lastExtended: 0
      });
      clearSessionTimers();
      console.log('🔒 Sesión cerrada');
    }
  };

  const createNews = async (newsData: Omit<NewsItem, 'id' | 'views' | 'comments' | 'likes' | 'likedBy'>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newsData)
      });

      const data = await response.json();

      if (data.success) {
        await loadNews();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create news error:', error);
      return false;
    }
  };

  const updateNews = async (newsId: string, updates: Partial<NewsItem>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: newsId, ...updates })
      });

      const data = await response.json();

      if (data.success) {
        await loadNews();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update news error:', error);
      return false;
    }
  };

  const deleteNews = async (newsId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: newsId })
      });

      const data = await response.json();

      if (data.success) {
        await loadNews();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete news error:', error);
      return false;
    }
  };

  const likeNews = async (newsId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/like.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newsId })
      });

      const data = await response.json();

      if (data.success) {
        await loadNews();
      }
    } catch (error) {
      console.error('Like news error:', error);
    }
  };

  const addComment = async (newsId: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/comment.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newsId, content })
      });

      const data = await response.json();

      if (data.success) {
        await loadNews();
      }
    } catch (error) {
      console.error('Add comment error:', error);
    }
  };

  const sendMessage = async (toUserId: string, content: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/send.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ toUserId, content })
      });

      const data = await response.json();

      if (data.success) {
        const newMessage: Message = {
          id: data.id,
          fromUserId: user!.id,
          toUserId,
          content,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: userId, ...updates })
      });

      const data = await response.json();

      if (data.success) {
        await loadUsers();
        if (userId === user?.id) {
          setUser(prev => prev ? { ...prev, ...updates } : null);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  const toggleUserStatus = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/toggle-status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: userId })
      });

      const data = await response.json();

      if (data.success) {
        await loadUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Toggle user status error:', error);
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: userId })
      });

      const data = await response.json();

      if (data.success) {
        await loadUsers();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  };

  const createClan = async (clanData: Omit<Clan, 'id' | 'members' | 'createdAt'>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/clans/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(clanData)
      });

      const data = await response.json();

      if (data.success) {
        await loadClans();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Create clan error:', error);
      return false;
    }
  };

  const updateClan = async (clanId: string, updates: Partial<Clan>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/clans/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: clanId, ...updates })
      });

      const data = await response.json();

      if (data.success) {
        await Promise.all([loadClans(), loadUsers()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update clan error:', error);
      return false;
    }
  };

  const deleteClan = async (clanId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/clans/delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id: clanId })
      });

      const data = await response.json();

      if (data.success) {
        await Promise.all([loadClans(), loadUsers()]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Delete clan error:', error);
      return false;
    }
  };

  const getConversation = (userId1: string, userId2: string): Message[] => {
    return messages
      .filter(msg => 
        (msg.fromUserId === userId1 && msg.toUserId === userId2) ||
        (msg.fromUserId === userId2 && msg.toUserId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getUnreadCount = (userId: string): number => {
    return messages.filter(msg => 
      msg.toUserId === userId && !msg.isRead
    ).length;
  };

  // Funciones temporales para compatibilidad
  const changeUserPassword = (userId: string, newPassword: string): boolean => {
    console.log('Change password:', userId);
    return true;
  };

  const incrementNewsViews = (newsId: string) => {
    console.log('Increment views:', newsId);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const deleteComment = (newsId: string, commentId: string, reason?: string) => {
    console.log('Delete comment:', newsId, commentId, reason);
  };

  const restoreComment = (newsId: string, commentId: string) => {
    console.log('Restore comment:', newsId, commentId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-blue-200">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      sessionInfo,
      login,
      logout,
      register,
      extendSession,
      users,
      updateUser,
      changeUserPassword,
      toggleUserStatus,
      deleteUser,
      messages,
      sendMessage,
      markMessageAsRead,
      getConversation,
      getUnreadCount,
      news,
      createNews,
      updateNews,
      deleteNews,
      likeNews,
      addComment,
      incrementNewsViews,
      deleteComment,
      restoreComment,
      clans,
      createClan,
      updateClan,
      deleteClan
    }}>
      {children}
    </AuthContext.Provider>
  );
};