import React from 'react';
import { Search, Bell, Menu, Calendar, Code, HelpCircle } from 'lucide-react';
import { useGuru } from '../../contexts/GuruContext';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { openGuru } = useGuru();

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
            <div className="hidden md:flex items-center space-x-2 bg-primary-600 px-3 py-1.5 rounded-lg">
              <span className="text-white text-sm font-medium">Pro Plan</span>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <button className="p-2 rounded-lg hover:bg-secondary-700 text-secondary-400 relative touch-target" aria-label="View code">
                <Code className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary-700 text-secondary-400 touch-target" aria-label="View calendar">
                <Calendar className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary-700 text-secondary-400 touch-target" aria-label="Help">
                <HelpCircle className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-secondary-700 text-secondary-400 relative touch-target" aria-label="Notifications">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-white">Janar Kuusk</div>
                <div className="text-xs text-secondary-400">janar@example.com</div>
              </div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">JK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;