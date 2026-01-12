
import React from 'react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="w-full h-screen max-w-md mx-auto bg-white flex flex-col relative shadow-2xl overflow-hidden border-x border-gray-100">
      {/* Top Status Bar Placeholder */}
      <div className="h-12 w-full flex justify-between items-center px-6 pt-2 bg-white/90 backdrop-blur-md z-40 shrink-0">
        <span className="text-sm font-semibold text-[#002147]">10:24</span>
        <div className="flex space-x-2 items-center text-[#002147]">
          <span className="material-symbols-outlined text-[18px]">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-[18px]">wifi</span>
          <span className="material-symbols-outlined text-[18px] rotate-90">battery_full</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>

      {/* Bottom Nav */}
      <nav className="shrink-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 pb-8 pt-3 z-50">
        <div className="flex justify-around items-center max-w-xs mx-auto">
          <button 
            onClick={() => onTabChange('hub')}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'hub' ? 'text-[#002147]' : 'text-gray-400'}`}
          >
            <span className={`material-symbols-outlined text-[28px] ${activeTab === 'hub' ? 'material-symbols-fill' : ''}`}>grid_view</span>
            <span className="text-[10px] font-bold">Hub</span>
          </button>
          <button 
            onClick={() => onTabChange('map')}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'map' ? 'text-[#002147]' : 'text-gray-400'}`}
          >
            <span className={`material-symbols-outlined text-[28px] ${activeTab === 'map' ? 'material-symbols-fill' : ''}`}>map</span>
            <span className="text-[10px] font-bold">Live Map</span>
          </button>
          <button 
            onClick={() => onTabChange('history')}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === 'history' ? 'text-[#002147]' : 'text-gray-400'}`}
          >
            <span className={`material-symbols-outlined text-[28px] ${activeTab === 'history' ? 'material-symbols-fill' : ''}`}>history</span>
            <span className="text-[10px] font-bold">History</span>
          </button>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-200 rounded-full"></div>
      </nav>
    </div>
  );
};

export default Layout;
