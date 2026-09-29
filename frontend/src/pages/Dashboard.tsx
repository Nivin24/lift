import React, { useState } from 'react';
import {
  DashboardOverview,
  ModuleStatus,
  LearningAreaProgress,
  Task,
  FocusAreaItem,
} from '../types';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Flame,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Target,
  ListTodo,
  ShieldCheck,
  Zap,
  Play,
  Check,
} from 'lucide-react';
import { api } from '../services/api';

interface DashboardProps {
  data: DashboardOverview;
  onSelectModule: (code: string) => void;
  onSelectArea: (areaId: number) => void;
  onSelectTopic: (topicId: number) => void;
  onRefresh: () => void;
  onOpenTasks: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onSelectModule,
  onSelectArea,
  onSelectTopic,
  onRefresh,
  onOpenTasks,
}) => {
  const [toggling, setToggling] = useState(false);

  const bm1 = data.modules.find((m) => m.code === 'BM1');
  const bm2 = data.modules.find((m) => m.code === 'BM2');
  const toi = data.modules.find((m) => m.code === 'TOI');

  const handleToggleModule = async (code: string) => {
    setToggling(true);
    try {
      await api.toggleModuleCompletion(code);
      onRefresh();
    } catch (e: any) {
      alert(e.message || 'Failed to toggle module completion');
    } finally {
      setToggling(false);
    }
  };

  const handleTaskToggle = async (task: Task) => {
    const nextStatus = task.user_status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      await api.updateTaskProgress(task.id, nextStatus);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Circular gauge circumference math
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.overall_preparation_percent / 100) * circumference;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 font-sans">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#888F89] dark:text-[#767C77] font-semibold">
            BENCHMARK READINESS PLAN
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161917] dark:text-white tracking-tight mt-0.5">
            Your Preparation Dashboard
          </h1>
        </div>

        {/* Quick Progression Simulation Pill */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#161917] px-3.5 py-1.5 rounded-full border border-[#E3E5DE] dark:border-[#2E3330] shadow-xs text-xs font-mono">
          <span className="text-[#888F89] dark:text-[#767C77] font-medium">Stage Simulation:</span>
          <button
            onClick={() => handleToggleModule('BM1')}
            disabled={toggling}
            className="px-3 py-1 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] hover:opacity-90 transition-opacity font-sans text-xs font-semibold disabled:opacity-50"
          >
            {bm1?.status === 'COMPLETED' ? '↺ Reset BM1' : 'Complete BM1'}
          </button>
          {bm1?.status === 'COMPLETED' && (
            <button
              onClick={() => handleToggleModule('BM2')}
              disabled={toggling}
              className="px-3 py-1 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] hover:opacity-90 transition-opacity font-sans text-xs font-semibold disabled:opacity-50"
            >
              {bm2?.status === 'COMPLETED' ? '↺ Reset BM2' : 'Complete BM2'}
            </button>
          )}
        </div>
      </div>

      {/* Row 1: Hero Focus Card + Circular Readiness Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dark Hero Focus Card (inspired by Screen 1 dark card) */}
        <div className="lg:col-span-2 bg-[#161917] dark:bg-[#1C1F1D] border border-transparent dark:border-[#2E3330] rounded-3xl p-7 text-white shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-3 z-10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest uppercase text-neutral-400 font-semibold">
                ACTIVE FOCUS WORKOUT
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                BM1 CURRICULUM
              </span>
            </div>

            <div className="pt-2">
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans">
                {bm1?.status === 'COMPLETED' ? 'BM1 Verified' : 'Week 1 Technical Drills'}
              </div>
              <p className="text-sm text-neutral-300 font-medium mt-1">
                {bm1?.status === 'COMPLETED'
                  ? 'Foundations benchmark complete. Ready for BM2 Advanced Systems.'
                  : 'Mastering Python OOP, Collections, and Practical Machine Tasks.'}
              </p>
              <p className="text-xs text-neutral-400 mt-2">
                Primitives · OOP Inheritance · Memory & Closures · High-Performance Dicts
              </p>
            </div>
          </div>

          {/* Bottom Accent Indicator Pills */}
          <div className="pt-8 flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-1.5 rounded-full bg-[#FDD7AE]"></span>
              <span className="w-8 h-1.5 rounded-full bg-[#CDE9D6]"></span>
              <span className="w-8 h-1.5 rounded-full bg-[#FCE8A6]"></span>
              <span className="w-8 h-1.5 rounded-full bg-[#D4E2F8]"></span>
            </div>

            <div className="text-xs font-mono text-neutral-400">
              {bm1?.completed_topics || 0} / {bm1?.total_topics || 9} Topics Mastered
            </div>
          </div>
        </div>

        {/* Circular Readiness Gauge (inspired by Screen 3) */}
        <div className="bg-white dark:bg-[#161917] rounded-3xl p-6 border border-[#E3E5DE] dark:border-[#262A27] shadow-xs flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold mb-3">
            OVERALL READINESS
          </span>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-[#F0F1EC] dark:stroke-[#222624]"
                strokeWidth="10"
                fill="none"
              />
              {/* Progress Gradient Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="url(#readinessGradient)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FCE8A6" />
                  <stop offset="50%" stopColor="#FDD7AE" />
                  <stop offset="100%" stopColor="#9DE8BA" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[#161917] dark:text-white tracking-tight">
                {data.overall_preparation_percent}
              </span>
              <span className="text-[10px] font-mono uppercase text-[#888F89] dark:text-[#767C77] font-semibold">
                OF 100
              </span>
            </div>
          </div>

          <div className="mt-2 text-center">
            <p className="text-sm font-bold text-[#161917] dark:text-white">
              {data.overall_preparation_percent >= 80
                ? 'Benchmark Ready'
                : data.overall_preparation_percent >= 40
                ? 'Progressing Steady'
                : 'Foundations Stage'}
            </p>
            <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-0.5">
              BM1 (40%) + BM2 (40%) + TOI (20%)
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: 4 Pastel Trigger/Metric Tiles (inspired by Screen 2 2x2 grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tile 1: Apricot */}
        <div
          onClick={() => onSelectModule('BM1')}
          className="bg-[#FDD7AE] rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-800">
            BM1 FOUNDATIONS
          </span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight font-sans">
              {bm1?.completion_percent || 0}%
            </span>
            <p className="text-xs text-neutral-700 font-medium mt-1">
              {bm1?.completed_topics}/{bm1?.total_topics} topics
            </p>
          </div>
          <span className="text-[11px] font-medium text-neutral-800 flex items-center justify-between">
            <span>{bm1?.status}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Tile 2: Sage / Mint */}
        <div
          onClick={() => onSelectModule('BM2')}
          className="bg-[#CDE9D6] rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-800">
            BM2 SYSTEMS
          </span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight font-sans">
              {bm2?.status === 'LOCKED' ? '0%' : `${bm2?.completion_percent || 0}%`}
            </span>
            <p className="text-xs text-neutral-700 font-medium mt-1">
              {bm2?.status === 'LOCKED' ? 'Locked (Requires BM1)' : `${bm2?.completed_topics}/${bm2?.total_topics} topics`}
            </p>
          </div>
          <span className="text-[11px] font-medium text-neutral-800 flex items-center justify-between">
            <span>{bm2?.status}</span>
            {bm2?.status === 'LOCKED' ? <Lock className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        </div>

        {/* Tile 3: Butter Yellow */}
        <div
          onClick={onOpenTasks}
          className="bg-[#FCE8A6] rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-800">
            PENDING TASKS
          </span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight font-sans">
              {data.pending_tasks.length}
            </span>
            <p className="text-xs text-neutral-700 font-medium mt-1">
              Active workouts
            </p>
          </div>
          <span className="text-[11px] font-medium text-neutral-800 flex items-center justify-between">
            <span>Review tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Tile 4: Periwinkle Blue */}
        <div
          onClick={() => onSelectModule('TOI')}
          className="bg-[#D4E2F8] rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
        >
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-neutral-800">
            TOI INTERVIEWS
          </span>
          <div className="my-3">
            <span className="text-3xl font-extrabold text-neutral-900 tracking-tight font-sans">
              {toi?.status === 'LOCKED' ? 'Locked' : 'Unlocked'}
            </span>
            <p className="text-xs text-neutral-700 font-medium mt-1">
              Final technical evaluation
            </p>
          </div>
          <span className="text-[11px] font-medium text-neutral-800 flex items-center justify-between">
            <span>{toi?.status}</span>
            {toi?.status === 'LOCKED' ? <Lock className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        </div>
      </div>

      {/* Row 3: Focus Today + Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Focus Today & Learning Areas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Focus Today (Next Workouts list inspired by Screen 1 Next 30 Minutes) */}
          <section className="bg-white dark:bg-[#161917] rounded-3xl p-6 border border-[#E3E5DE] dark:border-[#262A27] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
                  IMMEDIATE FOCUS
                </span>
                <h2 className="text-lg font-bold text-[#161917] dark:text-white">
                  Recommended Areas for Today
                </h2>
              </div>
              <span className="text-xs font-mono text-[#888F89] dark:text-[#767C77]">
                Prioritized by completion gap
              </span>
            </div>

            <div className="divide-y divide-[#F0F1EC] dark:divide-[#262A27]">
              {data.focus_areas.length > 0 ? (
                data.focus_areas.map((fa, index) => (
                  <div
                    key={fa.area_id}
                    onClick={() => onSelectArea(fa.area_id)}
                    className="py-3.5 flex items-center justify-between hover:bg-[#F0F1EC] dark:hover:bg-[#222624] px-3 -mx-3 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <span className="w-7 h-7 rounded-full bg-[#F0F1EC] dark:bg-[#222624] text-[#161917] dark:text-white font-mono text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#161917] dark:text-white">{fa.area_title}</p>
                        <p className="text-xs text-[#6B7280] dark:text-[#8E948F] font-mono">
                          {fa.pending_topics_count} topics remaining · {fa.module_code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono font-bold text-[#161917] dark:text-white">
                        {fa.completion_percent}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#888F89]" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs font-mono text-[#888F89]">
                  All active learning areas currently completed!
                </div>
              )}
            </div>

            {/* Mint Pill Button (inspired by Screen 1 Start Reset button) */}
            {data.focus_areas.length > 0 && (
              <button
                onClick={() => onSelectArea(data.focus_areas[0].area_id)}
                className="w-full mt-4 py-3 rounded-full bg-[#9DE8BA] hover:bg-[#8bd8a8] text-[#0D381E] font-bold text-sm transition-all shadow-xs flex items-center justify-center space-x-2"
              >
                <span>Launch {data.focus_areas[0].area_title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </section>

          {/* Learning Areas Curriculum Breakdown */}
          <section className="bg-white dark:bg-[#161917] rounded-3xl p-6 border border-[#E3E5DE] dark:border-[#262A27] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
                  CURRICULUM BREAKDOWN
                </span>
                <h2 className="text-lg font-bold text-[#161917] dark:text-white">
                  Learning Areas Progression
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {data.learning_areas_progress.map((area) => (
                <div
                  key={area.id}
                  onClick={() => onSelectArea(area.id)}
                  className="p-4 rounded-2xl bg-[#F0F1EC]/80 dark:bg-[#202422] hover:bg-[#F0F1EC] dark:hover:bg-[#272C29] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-[#161917] dark:text-white text-sm">{area.title}</span>
                    <span className="font-mono text-[#6B7280] dark:text-[#8E948F] font-semibold">
                      {area.completed_topics}/{area.total_topics} Topics ({area.completion_percent}%)
                    </span>
                  </div>
                  {/* Subtle bar */}
                  <div className="w-full bg-[#E3E5DE] dark:bg-[#2E3330] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#161917] dark:bg-[#9DE8BA] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${area.completion_percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col: Tasks & Activity */}
        <div className="space-y-6">
          {/* Pending Tasks (White Card) */}
          <section className="bg-white dark:bg-[#161917] rounded-3xl p-6 border border-[#E3E5DE] dark:border-[#262A27] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
                  WORKOUT TASKS
                </span>
                <h2 className="text-lg font-bold text-[#161917] dark:text-white">Pending Tasks</h2>
              </div>
              <button
                onClick={onOpenTasks}
                className="text-xs font-mono text-[#161917] dark:text-white font-semibold flex items-center space-x-1"
              >
                <span>All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {data.pending_tasks.length > 0 ? (
                data.pending_tasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-[#F0F1EC]/80 dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] flex items-start space-x-3 text-xs"
                  >
                    <button
                      onClick={() => handleTaskToggle(task)}
                      className="mt-0.5 text-[#888F89] hover:text-[#161917] dark:hover:text-white transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#161917] dark:text-white truncate">{task.title}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-[#6B7280] dark:text-[#8E948F] font-mono mt-1">
                        <span className="px-1.5 py-0.5 rounded-full bg-white dark:bg-[#161917] font-medium text-[#161917] dark:text-white border border-[#E3E5DE] dark:border-[#2E3330]">
                          {task.task_type}
                        </span>
                        <span>{task.module_code}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#888F89] font-mono text-center py-6">
                  No pending tasks.
                </p>
              )}
            </div>

            {/* Dark Pill Button (inspired by Screen 3 Build a reset plan) */}
            <button
              onClick={onOpenTasks}
              className="w-full mt-4 py-3 rounded-full bg-[#161917] hover:bg-black dark:bg-white dark:text-[#161917] dark:hover:bg-neutral-100 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Open Full Tasks Workspace
            </button>
          </section>

          {/* Recent Activity */}
          <section className="bg-white dark:bg-[#161917] rounded-3xl p-6 border border-[#E3E5DE] dark:border-[#262A27] shadow-xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
              ACTIVITY STREAM
            </span>
            <h2 className="text-lg font-bold text-[#161917] dark:text-white mb-4">Recent Milestones</h2>

            <div className="space-y-3 font-mono text-xs">
              {data.recent_activities.length > 0 ? (
                data.recent_activities.slice(0, 4).map((act) => (
                  <div key={act.id} className="flex items-start space-x-2.5 text-[#161917] dark:text-neutral-200">
                    <span className="w-2 h-2 rounded-full bg-[#161917] dark:bg-white mt-1 shrink-0"></span>
                    <div className="flex-1">
                      <p className="text-xs text-[#161917] dark:text-white font-sans font-medium">{act.description}</p>
                      <span className="text-[10px] text-[#888F89] dark:text-[#767C77]">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[#888F89] text-center py-4 font-sans">No recent activity.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
