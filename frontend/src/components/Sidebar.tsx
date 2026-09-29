import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Lock,
  CheckCircle2,
  ListTodo,
  Settings,
  Activity,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { ModuleStatus } from '../types';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  modules: ModuleStatus[];
  onSelectModule: (code: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  modules,
  onSelectModule,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { theme, setTheme } = useTheme();

  const bm1 = modules.find((m) => m.code === 'BM1');
  const bm2 = modules.find((m) => m.code === 'BM2');
  const toi = modules.find((m) => m.code === 'TOI');

  return (
    <aside
      className={`h-full flex flex-col shrink-0 select-none transition-all duration-300 ease-in-out rounded-3xl border border-[#E3E5DE] dark:border-[#262A27] bg-white dark:bg-[#161917] shadow-xs overflow-hidden ${
        isCollapsed ? 'w-16 items-center py-4 justify-between' : 'w-60 py-4 px-3 justify-between'
      }`}
    >
      {/* Top Header: Collapse Control (NO LOGO, logo moved to navbar) */}
      <div className="w-full">
        {isCollapsed ? (
          <div className="flex flex-col items-center">
            <button
              onClick={() => setIsCollapsed(false)}
              title="Expand Sidebar"
              className="p-2 rounded-xl text-[#888F89] hover:text-[#161917] dark:hover:text-white hover:bg-[#F0F1EC] dark:hover:bg-[#222624] transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="px-2 pb-2.5 mb-1 border-b border-[#F0F1EC] dark:border-[#262A27]/60 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
              Navigation
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              title="Collapse to Dock"
              className="p-1 rounded-lg text-[#888F89] hover:text-[#161917] dark:hover:text-white hover:bg-[#F0F1EC] dark:hover:bg-[#222624] transition-colors"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Primary Navigation Items */}
        <div className={`mt-2 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {/* Dashboard */}
          <button
            onClick={() => setCurrentTab('dashboard')}
            title="Dashboard"
            className={`${
              isCollapsed
                ? 'w-10 h-10 justify-center rounded-2xl'
                : 'w-full px-3 py-2 rounded-xl justify-between'
            } flex items-center text-xs font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                : 'text-[#525752] dark:text-[#A3AAA4] hover:bg-[#F0F1EC] dark:hover:bg-[#222624] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </div>
          </button>

          {/* Tasks & Workouts */}
          <button
            onClick={() => setCurrentTab('tasks')}
            title="Tasks & Workouts"
            className={`${
              isCollapsed
                ? 'w-10 h-10 justify-center rounded-2xl'
                : 'w-full px-3 py-2 rounded-xl justify-between'
            } flex items-center text-xs font-semibold transition-all ${
              currentTab === 'tasks'
                ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                : 'text-[#525752] dark:text-[#A3AAA4] hover:bg-[#F0F1EC] dark:hover:bg-[#222624] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <ListTodo className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Tasks & Workouts</span>}
            </div>
          </button>

          {/* Learning Areas */}
          <button
            onClick={() => setCurrentTab('areas')}
            title="Learning Areas"
            className={`${
              isCollapsed
                ? 'w-10 h-10 justify-center rounded-2xl'
                : 'w-full px-3 py-2 rounded-xl justify-start space-x-2.5'
            } flex items-center text-xs font-semibold transition-all ${
              currentTab === 'areas' || currentTab === 'area-detail'
                ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                : 'text-[#525752] dark:text-[#A3AAA4] hover:bg-[#F0F1EC] dark:hover:bg-[#222624] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Learning Areas</span>}
          </button>

          {/* Analytics */}
          <button
            onClick={() => setCurrentTab('analytics')}
            title="Analytics"
            className={`${
              isCollapsed
                ? 'w-10 h-10 justify-center rounded-2xl'
                : 'w-full px-3 py-2 rounded-xl justify-between'
            } flex items-center text-xs font-semibold transition-all ${
              currentTab === 'analytics'
                ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                : 'text-[#525752] dark:text-[#A3AAA4] hover:bg-[#F0F1EC] dark:hover:bg-[#222624] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Activity className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Analytics</span>}
            </div>
          </button>
        </div>

        {/* Curriculum Stages Section */}
        {!isCollapsed && (
          <div className="mt-4 pt-3 border-t border-[#F0F1EC] dark:border-[#262A27]/60 space-y-1">
            <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
              Curriculum Stages
            </div>

            {/* BM1 */}
            <button
              onClick={() => onSelectModule('BM1')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'module-BM1'
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                  : 'text-[#525752] dark:text-[#A3AAA4] hover:bg-[#F0F1EC] dark:hover:bg-[#222624]'
              }`}
            >
              <div className="flex items-center space-x-2">
                {bm1?.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#161917] dark:bg-white" />
                )}
                <span>BM1 Core</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#CDE9D6] text-[#19522F]">
                {bm1 ? `${bm1.completion_percent}%` : '0%'}
              </span>
            </button>

            {/* BM2 */}
            <button
              onClick={() => onSelectModule('BM2')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'module-BM2'
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                  : 'text-[#525752] dark:text-[#A3AAA4] hover:bg-[#F0F1EC] dark:hover:bg-[#222624]'
              }`}
            >
              <div className="flex items-center space-x-2">
                {bm2?.status === 'LOCKED' ? (
                  <Lock className="w-3.5 h-3.5 text-[#888F89]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#FDD7AE]" />
                )}
                <span>BM2 Advanced</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#FDD7AE] text-[#7A3E00]">
                {bm2?.status === 'LOCKED' ? 'LOCKED' : `${bm2?.completion_percent}%`}
              </span>
            </button>

            {/* TOI */}
            <button
              onClick={() => onSelectModule('TOI')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentTab === 'module-TOI'
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                  : 'text-[#525752] dark:text-[#A3AAA4] hover:bg-[#F0F1EC] dark:hover:bg-[#222624]'
              }`}
            >
              <div className="flex items-center space-x-2">
                {toi?.status === 'LOCKED' ? (
                  <Lock className="w-3.5 h-3.5 text-[#888F89]" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5 text-[#2563EB]" />
                )}
                <span>TOI Interview</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#D4E2F8] text-[#1E3A68]">
                {toi?.status === 'LOCKED' ? 'LOCKED' : 'READY'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className={`pt-3 border-t border-[#F0F1EC] dark:border-[#262A27]/60 ${isCollapsed ? 'flex flex-col items-center space-y-2' : 'space-y-2 px-1'}`}>
        {/* Settings */}
        <button
          onClick={() => setCurrentTab('settings')}
          title="Settings"
          className={`${
            isCollapsed
              ? 'w-10 h-10 justify-center rounded-2xl'
              : 'w-full px-2.5 py-1.5 rounded-xl justify-start space-x-2.5'
          } flex items-center text-xs font-semibold transition-all ${
            currentTab === 'settings'
              ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
              : 'text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC] dark:hover:bg-[#222624] hover:text-[#161917] dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 shrink-0 text-[#888F89]" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* Minimal Theme Switcher Pill */}
        {!isCollapsed ? (
          <div className="bg-[#F0F1EC] dark:bg-[#1E2220] p-0.5 rounded-xl flex items-center border border-[#E3E5DE] dark:border-[#2E3330]">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-white text-[#161917] shadow-xs'
                  : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-[#2A2E2B] text-white shadow-xs'
                  : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>Dark</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-[#F0F1EC] dark:bg-[#202422] text-[#161917] dark:text-white hover:scale-105 transition-transform"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-sky-400" />
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
