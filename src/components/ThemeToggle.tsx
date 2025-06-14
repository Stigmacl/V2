import React, { useState } from 'react';
import { Palette, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeCustomizer from './ThemeCustomizer';

const ThemeToggle: React.FC = () => {
  const { mode, themeConfig, toggleMode } = useTheme();
  const [showCustomizer, setShowCustomizer] = useState(false);

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Quick Mode Toggle */}
        <button
          onClick={toggleMode}
          className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
          style={{
            backgroundColor: `${themeConfig.colors.primary}20`,
            color: themeConfig.colors.primary
          }}
          title={`Cambiar a modo ${mode === 'dark' ? 'claro' : 'oscuro'}`}
        >
          {mode === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Theme Customizer Button */}
        <button
          onClick={() => setShowCustomizer(true)}
          className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
          style={{
            backgroundColor: `${themeConfig.colors.primary}20`,
            color: themeConfig.colors.primary
          }}
          title="Personalizar tema"
        >
          <Palette className="w-5 h-5" />
        </button>
      </div>

      <ThemeCustomizer 
        isOpen={showCustomizer} 
        onClose={() => setShowCustomizer(false)} 
      />
    </>
  );
};

export default ThemeToggle;