import React from 'react';
import { Search, Bell, Menu, Calendar, Code, HelpCircle } from 'lucide-react';
import { useGuru } from '../../contexts/GuruContext';
import { usePlan } from '../../contexts/PlanContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { openGuru } = useGuru();
  const { demoMode, setDemoMode } = usePlan();

  return (
    <header className="bg-secondary-800 border-b border-secondary-700">
      <div className="px-4 py-3 sm:px-6 md:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary-700 text-secondary-400 touch-target"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search CRM data..."
                className="w-64 md:w-80 pl-10 pr-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
                onFocus={openGuru}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Demo/Real Mode Toggle */}
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`px-3 py-1 rounded-full text-xs font-bold shadow transition-colors focus:outline-none focus:ring-2 focus:ring-accent mr-2 ${
                demoMode ? 'bg-yellow-400 text-black' : 'bg-green-600 text-white'
              }`}
              title="Toggle Demo Mode"
            >
              {demoMode ? 'Demo Mode' : 'Real Mode'}
            </button>
            {/* Icons: Remove or disable non-functional ones, add TODOs for future features */}
            {/* <div className="hidden md:flex items-center space-x-2 bg-primary-600 px-3 py-1.5 rounded-lg">
              <span className="text-white text-sm font-medium">Pro Plan</span>
            </div> */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* TODO: Add functional icons here in the future (e.g., notifications, help) */}
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-white">Janar Kuusk</div>
                <div className="text-xs text-secondary-400">janar@example.com</div>
              </div>
              <button
                className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:scale-105 transition-all"
                onClick={() => window.location.href = '/settings/account'}
                title="Account Settings"
              >
                <span className="text-sm font-medium text-white">JK</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;