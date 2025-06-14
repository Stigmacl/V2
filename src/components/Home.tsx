import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, Heart, Share2, Pin, Eye, User, Trash2, RotateCcw, AlertTriangle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { news, user, likeNews, addComment, incrementNewsViews, deleteComment, restoreComment } = useAuth();
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [viewedNews, setViewedNews] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{ newsId: string; commentId: string; author: string } | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

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

  const handleDeleteComment = (newsId: string, commentId: string, author: string) => {
    setCommentToDelete({ newsId, commentId, author });
    setShowDeleteModal(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    const success = await deleteComment(
      commentToDelete.newsId, 
      commentToDelete.commentId, 
      deleteReason || 'Moderación administrativa'
    );
    
    if (success) {
      setShowDeleteModal(false);
      setCommentToDelete(null);
      setDeleteReason('');
    } else {
      alert('Error al eliminar el comentario');
    }
  };

  const handleRestoreComment = async (newsId: string, commentId: string) => {
    const success = await restoreComment(newsId, commentId);
    if (!success) {
      alert('Error al restaurar el comentario');
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
                            <span>{item.comments.filter(c => !c.isDeleted).length}</span>
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
                            Comentarios ({item.comments.filter(c => !c.isDeleted).length})
                          </h4>
                          
                          <div className="space-y-4 mb-6">
                            {item.comments.filter(c => !c.isDeleted).length === 0 ? (
                              <div className="text-center py-6">
                                <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-50" />
                                <p className="text-blue-400">No hay comentarios aún</p>
                                <p className="text-blue-500 text-sm">¡Sé el primero en comentar!</p>
                              </div>
                            ) : (
                              item.comments
                                .filter(c => !c.isDeleted)
                                .map((comment) => (
                                  <div key={comment.id} className="flex space-x-3">
                                    <img
                                      src={comment.avatar}
                                      alt={comment.author}
                                      className="w-8 h-8 rounded-full border border-blue-500/30"
                                    />
                                    <div className="flex-1 bg-slate-700/40 rounded-lg p-3">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-blue-300">{comment.author}</span>
                                          <span className="text-xs text-blue-400">{formatDate(comment.date)}</span>
                                        </div>
                                        
                                        {user?.role === 'admin' && (
                                          <div className="flex items-center space-x-1">
                                            <button
                                              onClick={() => handleDeleteComment(item.id, comment.id, comment.author)}
                                              className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                                              title="Eliminar comentario"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-blue-100">{comment.content}</p>
                                    </div>
                                  </div>
                                ))
                            )}

                            {/* Mostrar comentarios eliminados solo a admins */}
                            {user?.role === 'admin' && item.comments.some(c => c.isDeleted) && (
                              <div className="border-t border-red-700/30 pt-4">
                                <h5 className="text-sm font-medium text-red-300 mb-3 flex items-center space-x-2">
                                  <Shield className="w-4 h-4" />
                                  <span>Comentarios Eliminados (Solo Admins)</span>
                                </h5>
                                {item.comments
                                  .filter(c => c.isDeleted)
                                  .map((comment) => (
                                    <div key={comment.id} className="flex space-x-3 mb-3">
                                      <img
                                        src={comment.avatar}
                                        alt={comment.author}
                                        className="w-8 h-8 rounded-full border border-red-500/30 opacity-50"
                                      />
                                      <div className="flex-1 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center space-x-2">
                                            <span className="font-medium text-red-300">{comment.author}</span>
                                            <span className="text-xs text-red-400">{formatDate(comment.date)}</span>
                                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">ELIMINADO</span>
                                          </div>
                                          
                                          <button
                                            onClick={() => handleRestoreComment(item.id, comment.id)}
                                            className="p-1 hover:bg-green-500/20 rounded text-green-400 hover:text-green-300 transition-colors"
                                            title="Restaurar comentario"
                                          >
                                            <RotateCcw className="w-3 h-3" />
                                          </button>
                                        </div>
                                        <p className="text-red-200 opacity-75">{comment.content}</p>
                                        {comment.deletionReason && (
                                          <p className="text-xs text-red-400 mt-2 italic">
                                            Razón: {comment.deletionReason}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
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

      {/* Modal de confirmación para eliminar comentario */}
      {showDeleteModal && commentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-red-500/30 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Eliminar Comentario</h3>
                <p className="text-red-300 text-sm">Esta acción se puede revertir</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-blue-200 mb-4">
                ¿Estás seguro de que quieres eliminar el comentario de <strong>{commentToDelete.author}</strong>?
              </p>
              
              <div>
                <label className="block text-blue-300 text-sm font-medium mb-2">
                  Razón de eliminación (opcional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Ej: Contenido inapropiado, spam, etc."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700/40 border border-blue-600/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteComment}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium transition-colors"
              >
                Eliminar Comentario
              </button>
              
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCommentToDelete(null);
                  setDeleteReason('');
                }}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-xl text-white font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;