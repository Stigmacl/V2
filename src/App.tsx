import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Servers from './components/Servers';
import Ranking from './components/Ranking';
import Players from './components/Players';
import Contact from './components/Contact';
import Admin from './components/Admin';
import UserPanel from './components/UserPanel';
import SessionManager from './components/SessionManager';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

export type Section = 'home' | 'servers' | 'ranking' | 'players' | 'contact' | 'admin' | 'user-panel';

function AppContent() {
  const [currentSection, setCurrentSection] = useState<Section>('home');
  const [isLoading, setIsLoading] = useState(true);
  const { themeConfig } = useTheme();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return <Home />;
      case 'servers':
        return <Servers />;
      case 'ranking':
        return <Ranking />;
      case 'players':
        return <Players />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <Admin />;
      case 'user-panel':
        return <UserPanel />;
      default:
        return <Home />;
    }
  };

  if (isLoading) {
    return (
      <div 
        className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.background} flex items-center justify-center`}
      >
        <div className="text-center">
          <div 
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: `${themeConfig.colors.primary} transparent transparent transparent` }}
          ></div>
          <p 
            className="text-lg font-medium"
            style={{ color: themeConfig.colors.textSecondary }}
          >
            Cargando Tactical Ops 3.5...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen bg-gradient-to-br ${themeConfig.colors.background}`}
      style={{ color: themeConfig.colors.text }}
    >
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
      
      <Header />
      <Navigation currentSection={currentSection} onSectionChange={setCurrentSection} />
      <SessionManager />
      
      <main className="relative z-10 pt-44">
        {renderSection()}
      </main>
      
      <footer 
        className="relative z-10 mt-20 py-8 border-t"
        style={{ borderColor: themeConfig.colors.border }}
      >
        <div className="container mx-auto px-4 text-center">
          <p style={{ color: `${themeConfig.colors.textSecondary}70` }}>
            © 2025 Tactical Ops 3.5 Chile - Comunidad oficial
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;