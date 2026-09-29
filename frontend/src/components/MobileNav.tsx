import React from 'react';
import { LayoutDashboard, Layers, ListTodo, ShieldCheck, Activity, Lock } from 'lucide-react';
import { ModuleStatus } from '../types';

interface MobileNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  modules: ModuleStatus[];
  onSelectModule: (code: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentTab,
  setCurrentTab,
  modules,
  onSelectModule,
}) => {
  const toi = modules.find((m) => m.code === 'TOI');

  return (
    <nav className="md:hidden fixed bottom-3 left-3 right-3 h-14 bg-white/95 backdrop-blur-md border border-neutral-200/80 shadow-lg rounded-full flex items-center justify-around px-2 z-40 select-none">
      <button
        onClick={() => setCurrentTab('dashboard')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-full text-xs transition-colors ${
          currentTab === 'dashboard'
            ? 'bg-neutral-100 text-neutral-900 font-bold'
            : 'text-neutral-500 hover:text-neutral-900 font-medium'
        }`}
      >
        <LayoutDashboard className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Today</span>
      </button>

      <button
        onClick={() => setCurrentTab('areas')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-full text-xs transition-colors ${
          currentTab === 'areas' || currentTab === 'area-detail' || currentTab === 'topic-detail'
            ? 'bg-neutral-100 text-neutral-900 font-bold'
            : 'text-neutral-500 hover:text-neutral-900 font-medium'
        }`}
      >
        <Layers className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Learn</span>
      </button>

      <button
        onClick={() => setCurrentTab('tasks')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-full text-xs transition-colors ${
          currentTab === 'tasks'
            ? 'bg-neutral-100 text-neutral-900 font-bold'
            : 'text-neutral-500 hover:text-neutral-900 font-medium'
        }`}
      >
        <ListTodo className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Tasks</span>
      </button>

      <button
        onClick={() => onSelectModule('TOI')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-full text-xs transition-colors ${
          currentTab === 'module-TOI'
            ? 'bg-neutral-100 text-neutral-900 font-bold'
            : 'text-neutral-500 hover:text-neutral-900 font-medium'
        }`}
      >
        {toi?.status === 'LOCKED' ? (
          <Lock className="w-4 h-4 mb-0.5 text-neutral-400" />
        ) : (
          <ShieldCheck className="w-4 h-4 mb-0.5 text-neutral-900" />
        )}
        <span className="text-[10px]">TOI</span>
      </button>

      <button
        onClick={() => setCurrentTab('analytics')}
        className={`flex flex-col items-center justify-center px-3 py-1 rounded-full text-xs transition-colors ${
          currentTab === 'analytics'
            ? 'bg-neutral-100 text-neutral-900 font-bold'
            : 'text-neutral-500 hover:text-neutral-900 font-medium'
        }`}
      >
        <Activity className="w-4 h-4 mb-0.5" />
        <span className="text-[10px]">Trends</span>
      </button>
    </nav>
  );
};

