import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  ShieldAlert,
  Target,
  Clock,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsOverview } from '../types';

interface AnalyticsViewProps {
  onSelectArea?: (areaId: number) => void;
  onSelectModule?: (code: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onSelectArea, onSelectModule }) => {
  const [pacingDays, setPacingDays] = useState<number>(7);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalytics(days);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load self-analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(pacingDays);
  }, [pacingDays]);

  const handlePacingChange = (days: number) => {
    setPacingDays(days);
  };

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400 tracking-wider">COMPUTING SELF-ANALYTICS...</span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8">
        <div className="bg-rose-950/30 border border-rose-800/60 rounded-lg p-5 max-w-xl">
          <div className="flex items-center space-x-2 text-rose-400 font-medium text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Analytics Engine Error</span>
          </div>
          <p className="text-xs text-slate-300 font-mono">{error}</p>
          <button
            onClick={() => fetchAnalytics(pacingDays)}
            className="mt-3 px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 border border-rose-700/50 rounded text-xs font-mono"
          >
            Retry Calculation
          </button>
        </div>
      </div>
    );
  }

  const bm1Readiness = data?.bm1_readiness;
  const isBM1Passed = bm1Readiness?.is_ready_to_unlock_bm2;
  const remainingItems = data?.total_remaining_bm1_items ?? 0;
  const currentVelocity = data?.study_velocity_topics_per_day ?? 0.8;
  const requiredPace = data?.required_daily_pace ?? 1.0;
  const isAheadOfPace = currentVelocity >= requiredPace;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 font-sans w-full">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#888F89] dark:text-[#767C77] font-semibold">
            DIAGNOSTIC WORKSPACE
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#161917] dark:text-white mt-0.5">
            Progression Pace & Analytics
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#8E948F] font-normal mt-1">
            Focused diagnostic metrics calibrated to help you eliminate weak points and pass BM1.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchAnalytics(pacingDays)}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white dark:bg-[#161917] hover:bg-[#F0F1EC] dark:hover:bg-[#222624] border border-[#E3E5DE] dark:border-[#262A27] text-xs font-semibold text-[#161917] dark:text-white shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* 1. Core High-Value Telemetry (4 Pastel Tiles inspired by Reference Screenshot Screen 2) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tile 1: Apricot (#FDD7AE) */}
        <div className="bg-[#FDD7AE] rounded-3xl p-5 flex flex-col justify-between min-h-[130px] shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase text-[#542B00]">
            <span>DAILY OUTPUT</span>
            <Calendar className="w-3.5 h-3.5 text-[#542B00]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-[#381B00] tracking-tight font-sans">
              {data?.daily_completed_count}
            </span>
            <p className="text-xs text-[#542B00] font-medium mt-0.5">items completed</p>
          </div>
          <div className="text-[11px] text-[#542B00] font-mono">
            Target: <strong className="font-bold">{requiredPace} / day</strong>
          </div>
        </div>

        {/* Tile 2: Sage / Mint (#CDE9D6) */}
        <div className="bg-[#CDE9D6] rounded-3xl p-5 flex flex-col justify-between min-h-[130px] shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase text-[#0D381E]">
            <span>WEEKLY OUTPUT</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#0D381E]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-[#0D381E] tracking-tight font-sans">
              {data?.weekly_completed_count}
            </span>
            <p className="text-xs text-[#0D381E] font-medium mt-0.5">last 7 days</p>
          </div>
          <div className="text-[11px] text-[#0D381E] font-mono">
            Pace: <strong className="font-bold">{currentVelocity} items/day</strong>
          </div>
        </div>

        {/* Tile 3: Butter Yellow (#FCE8A6) */}
        <div className="bg-[#FCE8A6] rounded-3xl p-5 flex flex-col justify-between min-h-[130px] shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase text-[#523C00]">
            <span>STUDY STREAK</span>
            <Flame className="w-3.5 h-3.5 text-[#523C00]" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-[#3B2B00] tracking-tight font-sans">
              {data?.current_streak_days}d
            </span>
            <p className="text-xs text-[#523C00] font-medium mt-0.5">consecutive days</p>
          </div>
          <div className="text-[11px] text-[#523C00] font-mono">
            Active momentum
          </div>
        </div>

        {/* Tile 4: Periwinkle Blue (#D4E2F8) */}
        <div className="bg-[#D4E2F8] rounded-3xl p-5 flex flex-col justify-between min-h-[130px] shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider uppercase text-[#122A54]">
            <span>BM1 CLEARANCE</span>
            <Clock className="w-3.5 h-3.5 text-[#122A54]" />
          </div>
          <div className="my-2">
            {isBM1Passed ? (
              <span className="text-2xl font-extrabold text-[#0D381E] tracking-tight font-sans">PASSED</span>
            ) : (
              <span className="text-3xl font-extrabold text-[#122A54] tracking-tight font-sans">
                {data?.projected_days_to_bm1_pass}d
              </span>
            )}
            <p className="text-xs text-[#122A54] font-medium mt-0.5">
              {isBM1Passed ? 'Prerequisites met' : 'days remaining'}
            </p>
          </div>
          <div className="text-[11px] text-[#122A54] font-mono">
            {isBM1Passed ? 'Ready to advance' : `${remainingItems} items left`}
          </div>
        </div>
      </div>

      {/* 2. Pacing Controller & Trajectory Comparison */}
      <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
                TRAJECTORY CONTROL
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#161917] dark:text-white">
              Curriculum Pacing Target
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-0.5">
              Select your target schedule. Adjust between intensive 1-week pacing or 2+ week tracks.
            </p>
          </div>

          {/* Pacing Track Segmented Selector */}
          <div className="flex items-center bg-[#F0F1EC] dark:bg-[#202422] p-1 rounded-full text-xs border border-[#E3E5DE] dark:border-[#2E3330]">
            <button
              onClick={() => handlePacingChange(7)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
                pacingDays === 7
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                  : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
              }`}
            >
              1 Week (Intensive)
            </button>
            <button
              onClick={() => handlePacingChange(14)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
                pacingDays === 14
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                  : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
              }`}
            >
              2 Weeks (Standard)
            </button>
            <button
              onClick={() => handlePacingChange(21)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-colors ${
                pacingDays === 21
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] shadow-xs'
                  : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
              }`}
            >
              3 Weeks (Flexible)
            </button>
          </div>
        </div>

        {/* Pacing Trajectory Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#F0F1EC] dark:border-[#262A27]">
          <div className="bg-[#F0F1EC]/60 dark:bg-[#202422]/60 rounded-2xl p-4 border border-transparent dark:border-[#2E3330]">
            <span className="text-[11px] font-mono text-[#888F89] dark:text-[#767C77] uppercase font-semibold block mb-1">
              Required Pace
            </span>
            <div className="text-xl font-bold text-[#161917] dark:text-white font-sans">{requiredPace} items / day</div>
            <span className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-1 block">
              Required to pass BM1 within {pacingDays} days
            </span>
          </div>

          <div className="bg-[#F0F1EC]/60 dark:bg-[#202422]/60 rounded-2xl p-4 border border-transparent dark:border-[#2E3330]">
            <span className="text-[11px] font-mono text-[#888F89] dark:text-[#767C77] uppercase font-semibold block mb-1">
              Current Velocity
            </span>
            <div className="text-xl font-bold text-[#161917] dark:text-white font-sans">{currentVelocity} items / day</div>
            <div className="mt-1 flex items-center space-x-1.5">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isAheadOfPace
                    ? 'bg-[#CDE9D6] text-[#0D381E] dark:bg-[#143E23] dark:text-[#A3E8B5]'
                    : 'bg-[#FDD7AE] text-[#542B00] dark:bg-[#4E2A00] dark:text-[#FDD7AE]'
                }`}
              >
                {isAheadOfPace ? 'ON PACE' : 'NEEDS ACCELERATION'}
              </span>
              <span className="text-xs text-[#6B7280] dark:text-[#8E948F]">
                {isAheadOfPace ? 'Meeting daily target' : 'Below target cadence'}
              </span>
            </div>
          </div>

          <div className="bg-[#F0F1EC]/60 dark:bg-[#202422]/60 rounded-2xl p-4 border border-transparent dark:border-[#2E3330]">
            <span className="text-[11px] font-mono text-[#888F89] dark:text-[#767C77] uppercase font-semibold block mb-1">
              Items Remaining
            </span>
            <div className="text-xl font-bold text-[#161917] dark:text-white font-sans">{remainingItems}</div>
            <span className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-1 block">
              {bm1Readiness?.total_topics ? `${bm1Readiness.total_topics - bm1Readiness.completed_topics} topics` : ''}
              {bm1Readiness?.total_tasks ? ` • ${bm1Readiness.total_tasks - bm1Readiness.completed_tasks} tasks` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Struggling Areas & Weak Spots Diagnostics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
              DIAGNOSTIC ALERTS
            </span>
            <h2 className="text-lg font-bold text-[#161917] dark:text-white">
              Struggling Areas & Focus Recommendations
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-0.5">
              Actionable diagnostic alerts highlighting learning areas where topics or tasks are lagging.
            </p>
          </div>
          <span className="text-xs font-mono text-[#888F89] dark:text-[#767C77] font-semibold">
            {data?.struggling_areas.length || 0} Area(s) Detected
          </span>
        </div>

        {data?.struggling_areas && data.struggling_areas.length > 0 ? (
          <div className="space-y-3">
            {data.struggling_areas.map((area) => {
              const isHigh = area.urgency_level === 'HIGH_URGENCY';
              const isMod = area.urgency_level === 'MODERATE';

              return (
                <div
                  key={area.area_id}
                  className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 shadow-xs transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold tracking-wider ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isMod
                              ? 'bg-[#FDD7AE] text-[#7A3E00] dark:bg-[#4E2A00] dark:text-[#FDD7AE]'
                              : 'bg-[#CDE9D6] text-[#19522F] dark:bg-[#143E23] dark:text-[#A3E8B5]'
                          }`}
                        >
                          {isHigh ? 'HIGH ATTENTION' : isMod ? 'MODERATE' : 'ON TRACK'}
                        </span>
                        <span className="text-xs font-mono text-[#888F89] dark:text-[#767C77]">{area.module_code} STAGE</span>
                      </div>

                      <h3 className="text-lg font-bold text-[#161917] dark:text-white">{area.area_title}</h3>
                      <p className="text-xs text-[#6B7280] dark:text-[#8E948F] leading-relaxed font-sans">{area.recommendation}</p>

                      <div className="flex items-center space-x-4 pt-2 text-xs font-mono text-[#888F89] dark:text-[#767C77]">
                        <span>
                          Pending Topics: <strong className="text-[#161917] dark:text-white font-bold">{area.pending_topics_count}</strong>
                        </span>
                        <span>
                          Pending Tasks: <strong className="text-[#161917] dark:text-white font-bold">{area.pending_tasks_count}</strong>
                        </span>
                        <span>
                          Completion: <strong className="text-[#161917] dark:text-white font-bold">{area.completion_percent}%</strong>
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center md:self-center">
                      <button
                        onClick={() => onSelectArea && onSelectArea(area.area_id)}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] hover:opacity-90 text-xs font-bold transition-opacity shadow-xs"
                      >
                        <span>Open Area</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-8 text-center shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#161917] dark:text-white">No Struggling Areas</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-1 max-w-md mx-auto">
              All BM1 learning areas are currently on track or completed. Proceed with final review and practice tasks.
            </p>
          </div>
        )}
      </div>

      {/* 4. BM1 Unlock Gate Assessment */}
      <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F1EC] dark:border-[#262A27]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
              STAGE GATE CHECK
            </span>
            <h2 className="text-lg font-bold text-[#161917] dark:text-white">
              BM1 → BM2 Progression Gate Assessment
            </h2>
            <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-0.5">
              Strict gate requirements that must be 100% satisfied before BM2 unlocks.
            </p>
          </div>

          <span
            className={`text-xs font-mono px-3 py-1 rounded-full font-bold ${
              isBM1Passed
                ? 'bg-[#CDE9D6] text-[#0D381E] dark:bg-[#143E23] dark:text-[#A3E8B5]'
                : 'bg-[#F0F1EC] dark:bg-[#202422] text-[#888F89] dark:text-[#767C77]'
            }`}
          >
            {isBM1Passed ? 'READY TO ADVANCE' : 'BM2 LOCKED'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Topics requirement */}
          <div className="bg-[#F0F1EC]/60 dark:bg-[#202422]/60 rounded-2xl p-4 border border-transparent dark:border-[#2E3330]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#161917] dark:text-[#A3AAA4] font-semibold">ALL BM1 TOPICS COMPLETED</span>
              {bm1Readiness?.topics_passed ? (
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">PASSED</span>
              ) : (
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">INCOMPLETE</span>
              )}
            </div>
            <div className="w-full bg-[#E3E5DE] dark:bg-[#2E3330] rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-[#161917] dark:bg-white h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    bm1Readiness?.total_topics
                      ? Math.round((bm1Readiness.completed_topics / bm1Readiness.total_topics) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#888F89] dark:text-[#767C77]">
              <span>{bm1Readiness?.completed_topics} / {bm1Readiness?.total_topics} Topics</span>
              <span className="font-bold text-[#161917] dark:text-white">
                {bm1Readiness?.total_topics
                  ? Math.round((bm1Readiness.completed_topics / bm1Readiness.total_topics) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>

          {/* Tasks requirement */}
          <div className="bg-[#F0F1EC]/60 dark:bg-[#202422]/60 rounded-2xl p-4 border border-transparent dark:border-[#2E3330]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#161917] dark:text-[#A3AAA4] font-semibold">ALL BM1 REQUIRED TASKS</span>
              {bm1Readiness?.tasks_passed ? (
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">PASSED</span>
              ) : (
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">INCOMPLETE</span>
              )}
            </div>
            <div className="w-full bg-[#E3E5DE] dark:bg-[#2E3330] rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-[#161917] dark:bg-white h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    bm1Readiness?.total_tasks
                      ? Math.round((bm1Readiness.completed_tasks / bm1Readiness.total_tasks) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-[#888F89] dark:text-[#767C77]">
              <span>{bm1Readiness?.completed_tasks} / {bm1Readiness?.total_tasks} Tasks</span>
              <span className="font-bold text-[#161917] dark:text-white">
                {bm1Readiness?.total_tasks
                  ? Math.round((bm1Readiness.completed_tasks / bm1Readiness.total_tasks) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Blocking items list */}
        {bm1Readiness?.blocking_items && bm1Readiness.blocking_items.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-mono text-[#888F89] dark:text-[#767C77] uppercase font-semibold block mb-2">
              Key Prerequisite Items Still Pending:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {bm1Readiness.blocking_items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 text-xs font-mono text-[#161917] dark:text-[#A3AAA4] bg-[#F0F1EC] dark:bg-[#202422] px-3.5 py-2.5 rounded-xl border border-[#E3E5DE] dark:border-[#2E3330]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
