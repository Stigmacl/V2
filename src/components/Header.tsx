import React from 'react';
import { Shield, Users, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const { themeConfig } = useTheme();

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: `${themeConfig.colors.surface}80`,
        backdropFilter: 'blur(16px)',
        borderColor: themeConfig.colors.border
      }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield 
                className="w-8 h-8" 
                style={{ color: themeConfig.colors.primary }} 
              />
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                style={{ backgroundColor: themeConfig.colors.success }}
              ></div>
            </div>
            <div>
              <h1 
                className="text-xl font-bold"
                style={{ color: themeConfig.colors.text }}
              >
                Tactical Ops 3.5
              </h1>
              <p 
                className="text-sm"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                Comunidad Chile
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm">
                <Users 
                  className="w-4 h-4" 
                  style={{ color: themeConfig.colors.success }} 
                />
                <span style={{ color: themeConfig.colors.textSecondary }}>
                  Comunidad activa
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Zap 
                  className="w-4 h-4" 
                  style={{ color: themeConfig.colors.warning }} 
                />
                <span style={{ color: themeConfig.colors.textSecondary }}>
                  Servidores disponibles
                </span>
              </div>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;