import React from 'react';
import { LayoutDashboard, Library, Menu } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: 'dashboard' | 'flashcards';
  onNavigate: (page: 'dashboard' | 'flashcards') => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-dashboard-card transition-all duration-300 border-r border-gray-700`}>
        <div className="p-4 flex items-center justify-between">
          <h1 className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>Flashy</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-dashboard-bg rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="mt-8">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
              currentPage === 'dashboard'
                ? 'bg-dashboard-accent/10 text-dashboard-accent border-r-2 border-dashboard-accent'
                : 'hover:bg-dashboard-bg text-dashboard-text-secondary'
            }`}
          >
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span>Dashboard</span>}
          </button>
          
          <button
            onClick={() => onNavigate('flashcards')}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
              currentPage === 'flashcards'
                ? 'bg-dashboard-accent/10 text-dashboard-accent border-r-2 border-dashboard-accent'
                : 'hover:bg-dashboard-bg text-dashboard-text-secondary'
            }`}
          >
            <Library size={20} />
            {isSidebarOpen && <span>Flashcards</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}