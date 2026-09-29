import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo-dark.png';
import logoLight from '../assets/logo-light.png';
import {
  Sun,
  Moon,
  Settings,
  Check,
  ChevronDown,
  Search,
  Command,
} from 'lucide-react';
import { AISettings } from '../types';

interface HeaderProps {
  currentTab?: string;
  setCurrentTab: (tab: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  aiSettings?: AISettings | null;
  onRefresh?: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  setCurrentTab,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  aiSettings,
  onRefresh,
  onOpenSettings,
}) => {
  const { user, switchDemoUser } = useAuth();
  const { theme, toggleTheme, logoTheme, setLogoTheme, activeLogo } = useTheme();
  const [switching, setSwitching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSwitchUser = async (target: 'user1' | 'user2') => {
    setSwitching(true);
    try {
      await switchDemoUser(target);
      if (onRefresh) onRefresh();
    } finally {
      setSwitching(false);
    }
  };

  const initial = (user?.full_name || user?.username || 'U').charAt(0).toUpperCase();
  const displayName = user?.full_name ? user.full_name.split(' ')[0] : user?.username || 'User';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentTab('tasks');
    }
  };

  return (
    <header className="rounded-3xl border border-[#E3E5DE] dark:border-[#262A27] bg-white dark:bg-[#161917] px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 select-none shadow-xs transition-colors">
      {/* Left: Logo (Exclusively on top navbar) */}
      <div className="flex items-center shrink-0">
        <div
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <img
            src={activeLogo}
            alt="LIFT"
            className="w-8 h-8 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-bold text-[#161917] dark:text-white text-sm tracking-tight leading-none">
              LIFT
            </span>
            <span className="text-[10px] text-[#888F89] dark:text-[#767C77] font-mono leading-none mt-0.5">
              Workspace
            </span>
          </div>
        </div>
      </div>

      {/* Center: Spotlight Search (No duplicate navigation buttons) */}
      <div className="flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 text-[#888F89] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search topics, workouts, questions... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-full text-xs pl-9 pr-14 py-2 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none focus:border-[#161917] dark:focus:border-white transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 text-[10px] font-mono text-[#888F89] bg-white dark:bg-[#161917] px-1.5 py-0.5 rounded border border-[#E3E5DE] dark:border-[#2E3330] pointer-events-none">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </form>
      </div>

      {/* Right: Theme Toggle & Profile Dropdown */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Theme Toggle Icon */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="p-2 rounded-xl text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white hover:bg-[#F0F1EC] dark:hover:bg-[#222624] transition-colors"
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-sky-400" />
          )}
        </button>

        {/* Profile Avatar & Account Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 py-1 pl-1 pr-2.5 rounded-full hover:bg-[#F0F1EC] dark:hover:bg-[#222624] border border-[#E3E5DE] dark:border-[#2E3330] transition-colors focus:outline-none"
          >
            <div className="w-6 h-6 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] flex items-center justify-center font-bold text-[11px]">
              {initial}
            </div>
            <span className="text-xs font-semibold text-[#161917] dark:text-white hidden sm:inline">
              {displayName}
            </span>
            <ChevronDown className="w-3 h-3 text-[#888F89]" />
          </button>

          {/* Account Popover */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl p-2 shadow-xl z-50 space-y-1.5 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-[#F0F1EC] dark:border-[#262A27]">
                <p className="text-xs font-bold text-[#161917] dark:text-white truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-[11px] text-[#888F89] dark:text-[#767C77] font-mono truncate">
                  {user?.email}
                </p>
              </div>

              {/* Demo Account Switcher */}
              <div className="px-1 py-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#888F89] px-2 block mb-1">
                  Active User
                </span>
                <button
                  onClick={() => {
                    handleSwitchUser('user1');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    user?.username === 'user1'
                      ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                      : 'hover:bg-[#F0F1EC] dark:hover:bg-[#222624] text-[#161917] dark:text-white'
                  }`}
                >
                  <span>Nivin</span>
                  {user?.username === 'user1' && <Check className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    handleSwitchUser('user2');
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    user?.username === 'user2'
                      ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                      : 'hover:bg-[#F0F1EC] dark:hover:bg-[#222624] text-[#161917] dark:text-white'
                  }`}
                >
                  <span>Partner</span>
                  {user?.username === 'user2' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* App Icon / Logo Theme Switcher */}
              <div className="px-1 py-1 border-t border-[#F0F1EC] dark:border-[#262A27]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#888F89] px-2 block mb-1">
                  App Logo & Icon
                </span>
                <div className="grid grid-cols-3 gap-1 px-1">
                  <button
                    onClick={() => setLogoTheme('auto')}
                    title="Adaptive (Follows Theme)"
                    className={`flex flex-col items-center py-1.5 px-1 rounded-xl text-[10px] font-medium border transition-colors ${
                      logoTheme === 'auto'
                        ? 'border-[#161917] dark:border-white bg-[#F0F1EC] dark:bg-[#202422] text-[#161917] dark:text-white font-bold'
                        : 'border-transparent text-[#888F89] hover:bg-[#F0F1EC] dark:hover:bg-[#222624]'
                    }`}
                  >
                    <div className="flex items-center -space-x-1 mb-1">
                      <img src={logoDark} className="w-4 h-4 rounded" alt="dark" />
                      <img src={logoLight} className="w-4 h-4 rounded" alt="light" />
                    </div>
                    <span>Auto</span>
                  </button>

                  <button
                    onClick={() => setLogoTheme('dark')}
                    title="Onyx Dark Icon"
                    className={`flex flex-col items-center py-1.5 px-1 rounded-xl text-[10px] font-medium border transition-colors ${
                      logoTheme === 'dark'
                        ? 'border-[#161917] dark:border-white bg-[#F0F1EC] dark:bg-[#202422] text-[#161917] dark:text-white font-bold'
                        : 'border-transparent text-[#888F89] hover:bg-[#F0F1EC] dark:hover:bg-[#222624]'
                    }`}
                  >
                    <img src={logoDark} className="w-4 h-4 rounded mb-1" alt="dark" />
                    <span>Onyx</span>
                  </button>

                  <button
                    onClick={() => setLogoTheme('light')}
                    title="Alabaster Light Icon"
                    className={`flex flex-col items-center py-1.5 px-1 rounded-xl text-[10px] font-medium border transition-colors ${
                      logoTheme === 'light'
                        ? 'border-[#161917] dark:border-white bg-[#F0F1EC] dark:bg-[#202422] text-[#161917] dark:text-white font-bold'
                        : 'border-transparent text-[#888F89] hover:bg-[#F0F1EC] dark:hover:bg-[#222624]'
                    }`}
                  >
                    <img src={logoLight} className="w-4 h-4 rounded mb-1" alt="light" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              <div className="pt-1 border-t border-[#F0F1EC] dark:border-[#262A27]">
                <button
                  onClick={() => {
                    onOpenSettings();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#161917] dark:text-white hover:bg-[#F0F1EC] dark:hover:bg-[#222624] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#888F89]" />
                  <span>Settings & BYOK</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
