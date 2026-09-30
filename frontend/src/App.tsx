import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { api } from './services/api';
import { DashboardOverview, ModuleStatus, AISettings } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { ModuleView } from './pages/ModuleView';
import { LearningAreaView } from './pages/LearningAreaView';
import { TopicView } from './pages/TopicView';
import { TasksView } from './pages/TasksView';
import { SettingsView } from './pages/SettingsView';
import { AreasOverview } from './pages/AreasOverview';
import { AnalyticsView } from './pages/AnalyticsView';

const LiftApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedModuleCode, setSelectedModuleCode] = useState<string>('BM1');
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true); // Default to slim floating dock like reference image

  const fetchGlobalData = async () => {
    if (!user) return;
    try {
      const [dash, ai] = await Promise.all([
        api.getDashboard(),
        api.getAISettings().catch(() => null),
      ]);
      setDashboardData(dash);
      setAiSettings(ai);
    } catch (err) {
      console.error('Error fetching global data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGlobalData();
    }
  }, [user?.id]);

  const handleSelectModule = (code: string) => {
    setSelectedModuleCode(code);
    setCurrentTab(`module-${code}`);
  };

  const handleSelectArea = (areaId: number) => {
    setSelectedAreaId(areaId);
    setCurrentTab('area-detail');
  };

  const handleSelectTopic = (topicId: number) => {
    setSelectedTopicId(topicId);
    setCurrentTab('topic-detail');
  };

  const handleOpenSettings = () => {
    setCurrentTab('settings');
  };

  const handleOpenTasks = () => {
    setCurrentTab('tasks');
  };

  if (authLoading || (loading && !dashboardData)) {
    return (
      <div className="min-h-screen bg-workspace-bg flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center font-mono font-bold text-white text-xl animate-pulse">
          ▲
        </div>
        <p className="font-mono text-xs text-slate-400 tracking-wider">INITIALIZING LIFT WORKSPACE...</p>
      </div>
    );
  }

  // Get current active module status
  const activeModuleStatus = dashboardData?.modules.find((m) => m.code === selectedModuleCode);

  return (
    <div className="flex flex-col h-screen bg-[#F0F1EC] dark:bg-[#0B0D0C] text-[#161917] dark:text-[#F0F1EC] overflow-hidden font-sans transition-colors p-3 md:p-3.5 gap-3 md:gap-3.5">
      {/* Top Navbar Capsule spanning above sidebar and main canvas */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        aiSettings={aiSettings}
        onRefresh={fetchGlobalData}
        onOpenSettings={handleOpenSettings}
      />

      {/* Main Row: Detached Floating Sidebar + Main Workspace Canvas */}
      <div className="flex flex-1 min-h-0 gap-3 md:gap-3.5 overflow-hidden">
        {/* Desktop Detached Floating Sidebar Dock */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            modules={dashboardData?.modules || []}
            onSelectModule={handleSelectModule}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        </div>

        {/* Scrollable View Container */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
          {currentTab === 'dashboard' && dashboardData && (
            <Dashboard
              data={dashboardData}
              onSelectModule={handleSelectModule}
              onSelectArea={handleSelectArea}
              onSelectTopic={handleSelectTopic}
              onRefresh={fetchGlobalData}
              onOpenTasks={handleOpenTasks}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView
              onSelectArea={handleSelectArea}
              onSelectModule={handleSelectModule}
            />
          )}

          {currentTab.startsWith('module-') && (
            <ModuleView
              moduleCode={selectedModuleCode}
              moduleStatus={activeModuleStatus}
              onSelectArea={handleSelectArea}
              onBack={() => setCurrentTab('dashboard')}
              onRefresh={fetchGlobalData}
            />
          )}

          {currentTab === 'areas' && (
            <AreasOverview
              onSelectArea={handleSelectArea}
              modules={dashboardData?.modules || []}
            />
          )}

          {currentTab === 'area-detail' && selectedAreaId !== null && (
            <LearningAreaView
              areaId={selectedAreaId}
              onSelectTopic={handleSelectTopic}
              onBack={() => setCurrentTab('areas')}
            />
          )}

          {currentTab === 'topic-detail' && selectedTopicId !== null && (
            <TopicView
              topicId={selectedTopicId}
              onBack={() => {
                if (selectedAreaId) {
                  setCurrentTab('area-detail');
                } else {
                  setCurrentTab('dashboard');
                }
              }}
              onOpenSettings={handleOpenSettings}
            />
          )}

          {currentTab === 'tasks' && (
            <TasksView
              onSelectTopic={handleSelectTopic}
              onBackToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView onRefreshGlobal={fetchGlobalData} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        modules={dashboardData?.modules || []}
        onSelectModule={handleSelectModule}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LiftApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
