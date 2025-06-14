import React, { useState } from 'react';
import { Palette, Sun, Moon, Monitor, Settings, X, Check, Sparkles, Gamepad2, Zap, Shield } from 'lucide-react';
import { useTheme, GameTheme } from '../contexts/ThemeContext';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { mode, theme, themeConfig, toggleMode, setTheme, themes } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<GameTheme>(theme);

  const handleApplyTheme = () => {
    setTheme(selectedTheme);
    onClose();
  };

  const getThemeIcon = (themeId: GameTheme) => {
    switch (themeId) {
      case 'tactical': return Shield;
      case 'counter-strike': return Zap;
      case 'call-of-duty': return Gamepad2;
      case 'cyberpunk': return Sparkles;
      case 'military': return Shield;
      case 'neon': return Zap;
      default: return Palette;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo sólido oscuro */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div 
        className="relative rounded-2xl border p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto mx-auto my-auto shadow-2xl"
        style={{
          backgroundColor: mode === 'dark' 
            ? 'rgb(15, 23, 42)' // Slate-900 sólido para modo oscuro
            : 'rgb(255, 255, 255)', // Blanco sólido para modo claro
          borderColor: themeConfig.colors.border,
          boxShadow: `0 25px 50px -12px ${themeConfig.colors.primary}40, 0 0 0 1px ${themeConfig.colors.border}`
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-xl"
              style={{ 
                backgroundColor: `${themeConfig.colors.primary}20`,
                boxShadow: `0 0 20px ${themeConfig.colors.primary}30`
              }}
            >
              <Palette className="w-6 h-6" style={{ color: themeConfig.colors.primary }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: themeConfig.colors.text }}>
                Personalización de Tema
              </h2>
              <p style={{ color: themeConfig.colors.textSecondary }}>
                Elige tu estilo visual favorito para una experiencia gaming única
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
            style={{ 
              color: themeConfig.colors.textSecondary,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${themeConfig.colors.error}20`;
              e.currentTarget.style.color = themeConfig.colors.error;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = themeConfig.colors.textSecondary;
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: themeConfig.colors.text }}>
            <Settings className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
            <span>Modo de Visualización</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={toggleMode}
              className={`flex items-center space-x-4 px-6 py-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                mode === 'dark' ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: mode === 'dark' 
                  ? `${themeConfig.colors.primary}20` 
                  : mode === 'dark' 
                    ? 'rgba(30, 41, 59, 0.6)' 
                    : 'rgba(248, 250, 252, 0.8)',
                borderColor: mode === 'dark' ? themeConfig.colors.primary : themeConfig.colors.border,
                ringColor: mode === 'dark' ? themeConfig.colors.primary : 'transparent',
                boxShadow: mode === 'dark' ? `0 8px 32px ${themeConfig.colors.primary}20` : 'none'
              }}
            >
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${themeConfig.colors.primary}20` }}
              >
                <Moon className="w-6 h-6" style={{ color: themeConfig.colors.primary }} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-lg" style={{ color: themeConfig.colors.text }}>
                  Modo Oscuro
                </div>
                <div className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                  Ideal para gaming nocturno y sesiones largas
                </div>
              </div>
              {mode === 'dark' && (
                <Check className="w-6 h-6" style={{ color: themeConfig.colors.primary }} />
              )}
            </button>

            <button
              onClick={toggleMode}
              className={`flex items-center space-x-4 px-6 py-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
                mode === 'light' ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: mode === 'light' 
                  ? `${themeConfig.colors.primary}20` 
                  : mode === 'dark' 
                    ? 'rgba(30, 41, 59, 0.6)' 
                    : 'rgba(248, 250, 252, 0.8)',
                borderColor: mode === 'light' ? themeConfig.colors.primary : themeConfig.colors.border,
                ringColor: mode === 'light' ? themeConfig.colors.primary : 'transparent',
                boxShadow: mode === 'light' ? `0 8px 32px ${themeConfig.colors.primary}20` : 'none'
              }}
            >
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${themeConfig.colors.warning}20` }}
              >
                <Sun className="w-6 h-6" style={{ color: themeConfig.colors.warning }} />
              </div>
              <div className="text-left flex-1">
                <div className="font-semibold text-lg" style={{ color: themeConfig.colors.text }}>
                  Modo Claro
                </div>
                <div className="text-sm" style={{ color: themeConfig.colors.textSecondary }}>
                  Perfecto para el día y mejor legibilidad
                </div>
              </div>
              {mode === 'light' && (
                <Check className="w-6 h-6" style={{ color: themeConfig.colors.primary }} />
              )}
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2" style={{ color: themeConfig.colors.text }}>
            <Gamepad2 className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
            <span>Temas de Gaming</span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((themeOption) => {
              const Icon = getThemeIcon(themeOption.id);
              const isSelected = selectedTheme === themeOption.id;
              
              return (
                <button
                  key={themeOption.id}
                  onClick={() => setSelectedTheme(themeOption.id)}
                  className={`relative p-5 rounded-xl border transition-all duration-300 text-left group hover:scale-105 hover:-translate-y-1 ${
                    isSelected ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected 
                      ? `${themeOption.colors.primary}20` 
                      : mode === 'dark' 
                        ? 'rgba(30, 41, 59, 0.6)' 
                        : 'rgba(248, 250, 252, 0.8)',
                    borderColor: isSelected ? themeOption.colors.primary : themeConfig.colors.border,
                    ringColor: isSelected ? themeOption.colors.primary : 'transparent',
                    ringOffsetColor: mode === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(255, 255, 255)',
                    boxShadow: isSelected 
                      ? `0 20px 40px ${themeOption.colors.primary}30` 
                      : `0 4px 20px ${themeConfig.colors.primary}10`
                  }}
                >
                  {/* Theme Preview */}
                  <div 
                    className={`h-20 rounded-lg mb-4 bg-gradient-to-r ${themeOption.preview} relative overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-2 right-2">
                      <Icon className="w-5 h-5 text-white drop-shadow-lg" />
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: themeOption.colors.primary }}
                        >
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 mb-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${themeOption.colors.primary}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: themeOption.colors.primary }} />
                    </div>
                    <h4 className="font-bold text-lg" style={{ color: themeConfig.colors.text }}>
                      {themeOption.name}
                    </h4>
                  </div>
                  
                  <p className="text-sm mb-4" style={{ color: themeConfig.colors.textSecondary }}>
                    {themeOption.description}
                  </p>

                  {/* Color Palette Preview */}
                  <div className="flex space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: themeOption.colors.primary }}
                      title="Color Primario"
                    ></div>
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: themeOption.colors.secondary }}
                      title="Color Secundario"
                    ></div>
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: themeOption.colors.accent }}
                      title="Color de Acento"
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Theme Info */}
        <div 
          className="rounded-xl p-6 mb-6 border"
          style={{
            backgroundColor: `${themeConfig.colors.primary}10`,
            borderColor: `${themeConfig.colors.primary}30`
          }}
        >
          <h4 className="font-semibold mb-4 flex items-center space-x-2" style={{ color: themeConfig.colors.text }}>
            <Monitor className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
            <span>Vista Previa del Tema Seleccionado</span>
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: mode === 'dark' 
                  ? 'rgba(30, 41, 59, 0.6)' 
                  : 'rgba(248, 250, 252, 0.8)',
                borderColor: themeConfig.colors.border
              }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: themeConfig.colors.text }}>
                Superficie
              </div>
              <div className="text-xs" style={{ color: themeConfig.colors.textSecondary }}>
                Tarjetas y paneles principales
              </div>
            </div>
            
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${themeConfig.colors.primary}20`,
                borderColor: `${themeConfig.colors.primary}30`
              }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: themeConfig.colors.primary }}>
                Primario
              </div>
              <div className="text-xs" style={{ color: themeConfig.colors.textSecondary }}>
                Botones y elementos interactivos
              </div>
            </div>
            
            <div 
              className="p-4 rounded-lg border"
              style={{ 
                backgroundColor: `${themeConfig.colors.accent}20`,
                borderColor: `${themeConfig.colors.accent}30`
              }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: themeConfig.colors.accent }}>
                Acento
              </div>
              <div className="text-xs" style={{ color: themeConfig.colors.textSecondary }}>
                Elementos destacados y notificaciones
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleApplyTheme}
            className="flex-1 flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            style={{
              background: `linear-gradient(135deg, ${themeConfig.colors.primary}, ${themeConfig.colors.secondary})`,
              color: 'white',
              boxShadow: `0 8px 32px ${themeConfig.colors.primary}40`
            }}
          >
            <Check className="w-5 h-5" />
            <span>Aplicar Tema</span>
          </button>
          
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 border hover:scale-105"
            style={{
              backgroundColor: mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.6)' 
                : 'rgba(248, 250, 252, 0.8)',
              borderColor: themeConfig.colors.border,
              color: themeConfig.colors.textSecondary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${themeConfig.colors.error}20`;
              e.currentTarget.style.borderColor = themeConfig.colors.error;
              e.currentTarget.style.color = themeConfig.colors.error;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.6)' 
                : 'rgba(248, 250, 252, 0.8)';
              e.currentTarget.style.borderColor = themeConfig.colors.border;
              e.currentTarget.style.color = themeConfig.colors.textSecondary;
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;