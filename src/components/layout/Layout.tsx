import React, { useState } from 'react';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Header from './Header';
import GuruPanel from '../ai/GuruPanel';
import GuruFloatingButton from '../ai/GuruFloatingButton';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import Spline from '@splinetool/react-spline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen bg-secondary-900 overflow-hidden relative">
      {/* 3D Background - positioned to fill the entire screen */}
      <div className="fixed inset-0 z-0">
        <Spline
          scene="https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode"
          className="w-full h-full"
        />
      </div>
      
      {/* Very subtle gradient overlay to ensure text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-secondary-900/30 to-secondary-900/50 z-0"></div>
      
      {/* Sidebar - with high z-index to bring it to front */}
      <div className="relative z-30">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto bg-transparent">
          {children}
        </main>
      </div>

      {/* Floating Guru Button */}
      <GuruFloatingButton />

      {/* Guru Panel */}
      <GuruPanel />
    </div>
  );
};

export default Layout;