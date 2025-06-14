import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, Heart, Share2, Pin, Eye, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { news, user, likeNews, addComment, incrementNewsViews } = useAuth();
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [viewedNews, setViewedNews] = useState<Set<string>>(new Set());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleComment = (newsId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }
    
    if (newComment.trim()) {
      addComment(newsId, newComment);
      setNewComment('');
    }
  };

  const handleLike = (newsId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para dar like');
      return;
    }
    
    likeNews(newsId);
  };

  const handleShare = (newsItem: any) => {
    if (navigator.share) {
      navigator.share({
        title: newsItem.title,
        text: newsItem.content,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${newsItem.title}\n\n${newsItem.content}\n\n${window.location.href}`);
      alert('Enlace copiado al portapapeles');
    }
  };

  // Increment views when news is first viewed
  useEffect(() => {
    news.forEach(item => {
      if (!viewedNews.has(item.id)) {
        incrementNewsViews(item.id);
        setViewedNews(prev => new Set([...prev, item.id]));
      }
    });
  }, [news, incrementNewsViews, viewedNews]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Noticias de la Comunidad</h1>
        <p className="text-blue-200 text-lg">Mantente al día con las últimas novedades de Tactical Ops 3.5 Chile</p>
      </div>

      {news.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 p-12 max-w-2xl mx-auto">
            <MessageCircle className="w-24 h-24 text-blue-400 mx-auto mb-6 opacity-50" />
            <h2 className="text-3xl font-bold text-white mb-4">¡Bienvenido a la Comunidad!</h2>
            <p className="text-blue-300 text-lg mb-8">
              Aún no hay noticias publicadas. Los administradores pueden crear las primeras noticias 
              desde el panel de administración para mantener informada a la comunidad.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-700/40 rounded-xl p-6">
                <Pin className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Noticias Importantes</h3>
                <p className="text-blue-300 text-sm">
                  Las noticias fijadas aparecerán destacadas para toda la comunidad
                </p>
              </div>
              
              <div className="bg-slate-700/40 rounded-xl p-6">
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Interacción</h3>
                <p className="text-blue-300 text-sm">
                  Los usuarios podrán comentar y reaccionar a las publicaciones
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-8">
          {news
            .sort((a, b) => {
              // Sort by pinned first, then by date
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            })
            .map((item) => {
              const isLikedByUser = user && item.likedBy.includes(user.id);
              
              return (
                <article
                  key={item.id}
                  className={`
                    relative bg-slate-800/40 backdrop-blur-lg rounded-2xl border border-blue-700/30 
                    overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-blue-500/10
                    ${item.isPinned ? 'ring-2 ring-yellow-400/50' : ''}
                  `}
                >
                  {item.isPinned && (
                    <div className="absolute top-4 right-4 z-10 bg-yellow-500/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1">
                      <Pin className="w-4 h-4 text-yellow-900" />
                      <span className="text-yellow-900 text-sm font-medium">Fijado</span>
                    </div>
                  )}

                  <div className="md:flex">
                    <div className="md:w-2/5">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    </div>
                    
                    <div className="md:w-3/5 p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4 text-sm text-blue-300">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{item.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(item.date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{item.views}</span>
                          </div>
                        </div>
                      </div>

                      <h2 className="text-2xl font-bold text-white mb-4 hover:text-blue-300 transition-colors">
                        {item.title}
                      </h2>
                      
                      <p className="text-blue-100 mb-6 leading-relaxed">
                        {item.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => handleLike(item.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                              isLikedByUser
                                ? 'bg-red-500/30 text-red-200 border border-red-400/30'
                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isLikedByUser ? 'fill-current' : ''}`} />
                            <span>{item.likes}</span>
                          </button>
                          
                          <button
                            onClick={() => setSelectedNews(selectedNews === item.id ? null : item.id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-blue-300 hover:text-blue-200"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>{item.comments.length}</span>
                          </button>
                          
                          <button 
                            onClick={() => handleShare(item)}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-green-300 hover:text-green-200"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Compartir</span>
                          </button>
                        </div>
                      </div>

                      {selectedNews === item.id && (
                        <div className="mt-6 border-t border-blue-700/30 pt-6">
                          <h4 className="text-lg font-semibold text-white mb-4">
                            Comentarios ({item.comments.length})
                          </h4>
                          
                          <div className="space-y-4 mb-6">
                            {item.comments.length === 0 ? (
                              <div className="text-center py-6">
                                <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-50" />
                                <p className="text-blue-400">No hay comentarios aún</p>
                                <p className="text-blue-500 text-sm">¡Sé el primero en comentar!</p>
                              </div>
                            ) : (
                              item.comments.map((comment) => (
                                <div key={comment.id} className="flex space-x-3">
                                  <img
                                    src={comment.avatar}
                                    alt={comment.author}
                                    className="w-8 h-8 rounded-full border border-blue-500/30"
                                  />
                                  <div className="flex-1 bg-slate-700/40 rounded-lg p-3">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-blue-300">{comment.author}</span>
                                      <span className="text-xs text-blue-400">{formatDate(comment.date)}</span>
                                    </div>
                                    <p className="text-blue-100">{comment.content}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {user ? (
                            <div className="flex space-x-3">
                              <img
                                src={user.avatar || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop'}
                                alt={user.username}
                                className="w-8 h-8 rounded-full border border-blue-500/30"
                              />
                              <div className="flex-1 flex space-x-2">
                                <input
                                  type="text"
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder="Escribe tu comentario..."
                                  className="flex-1 px-4 py-2 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
                                  onKeyPress={(e) => e.key === 'Enter' && handleComment(item.id)}
                                />
                                <button
                                  onClick={() => handleComment(item.id)}
                                  disabled={!newComment.trim()}
                                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg text-white font-medium transition-colors"
                                >
                                  Enviar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-blue-400 mb-2">Inicia sesión para comentar</p>
                              <button 
                                onClick={() => window.location.hash = '#user-panel'}
                                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-300 hover:text-blue-200 transition-all duration-300"
                              >
                                Iniciar Sesión
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Home;