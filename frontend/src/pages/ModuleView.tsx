import React, { useState, useEffect } from 'react';
import { ModuleStatus, LearningAreaProgress } from '../types';
import { api } from '../services/api';
import {
  Lock,
  Unlock,
  CheckCircle2,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface ModuleViewProps {
  moduleCode: string;
  moduleStatus: ModuleStatus | undefined;
  onSelectArea: (areaId: number) => void;
  onBack: () => void;
  onRefresh: () => void;
}

export const ModuleView: React.FC<ModuleViewProps> = ({
  moduleCode,
  moduleStatus,
  onSelectArea,
  onBack,
  onRefresh,
}) => {
  const [areas, setAreas] = useState<LearningAreaProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLocked = moduleStatus?.status === 'LOCKED';

  useEffect(() => {
    if (!moduleStatus || isLocked) {
      setLoading(false);
      return;
    }

    const loadAreas = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getModuleAreas(moduleStatus.module_id);
        setAreas(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load module learning areas');
      } finally {
        setLoading(false);
      }
    };

    loadAreas();
  }, [moduleCode, moduleStatus?.status, moduleStatus?.module_id]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      {/* Header Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] text-[#161917] dark:text-white hover:bg-[#F0F1EC] dark:hover:bg-[#222624] transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#888F89] dark:text-[#767C77]">
          <span>LIFT</span>
          <span>/</span>
          <span className="text-[#161917] dark:text-white font-semibold">{moduleCode}</span>
        </div>
      </div>

      {/* Module Title Card */}
      <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#161917] text-white dark:bg-white dark:text-[#161917]">
                {moduleCode}
              </span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isLocked
                  ? 'bg-[#F0F1EC] text-[#888F89] dark:bg-[#202422] dark:text-[#767C77]'
                  : moduleStatus?.status === 'COMPLETED'
                  ? 'bg-[#CDE9D6] text-[#19522F] dark:bg-[#153B23] dark:text-[#A3E8B5]'
                  : 'bg-[#FDD7AE] text-[#7A3E00] dark:bg-[#4E2A00] dark:text-[#FDD7AE]'
              }`}>
                {moduleStatus?.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#161917] dark:text-white tracking-tight">
              {moduleStatus?.title}
            </h1>
            <p className="text-sm text-[#6B7280] dark:text-[#8E948F] mt-1 max-w-2xl leading-relaxed">
              {moduleStatus?.description}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl font-extrabold text-[#161917] dark:text-white font-mono">
              {moduleStatus?.completion_percent || 0}%
            </span>
            <p className="text-xs text-[#888F89] dark:text-[#767C77] font-mono mt-0.5">
              {moduleStatus?.completed_topics}/{moduleStatus?.total_topics} Topics Completed
            </p>
          </div>
        </div>
      </div>

      {/* Strict Lock Banner if Locked */}
      {isLocked ? (
        <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] flex items-center justify-center mx-auto mb-4 text-[#161917] dark:text-white">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#161917] dark:text-white mb-2">
            {moduleCode} is Strictly Locked
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#8E948F] max-w-md mx-auto mb-6">
            {moduleStatus?.unlock_requirement_message ||
              'Prerequisite stages must be satisfied before this module unlocks on both the frontend and backend.'}
          </p>

          <div className="inline-flex items-center space-x-2 text-xs font-mono px-4 py-2 rounded-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] text-[#161917] dark:text-[#A3AAA4]">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Backend authorization rule: Direct API calls to this module return 403 Forbidden.</span>
          </div>
        </div>
      ) : (
        /* Unlocked: Learning Areas List */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#888F89] dark:text-[#767C77]">
              Learning Areas ({areas.length})
            </h2>
            <span className="text-xs text-[#888F89] dark:text-[#767C77]">Click card to open topics</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-[#888F89] dark:text-[#767C77] font-mono">
              Loading learning areas...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areas.map((area) => (
                <div
                  key={area.id}
                  onClick={() => onSelectArea(area.id)}
                  className="bg-white dark:bg-[#161917] hover:border-[#161917] dark:hover:border-white border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 cursor-pointer transition-all shadow-xs group hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-2xl bg-[#D4E2F8] dark:bg-[#1E3048] text-[#1E3A68] dark:text-[#9EC5F8] group-hover:scale-105 transition-transform">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-semibold text-[#161917] dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#9DE8BA] transition-colors">
                        {area.title}
                      </h3>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#888F89] dark:text-[#767C77] group-hover:translate-x-1 group-hover:text-[#161917] dark:group-hover:text-white transition-all" />
                  </div>

                  <p className="text-xs text-[#6B7280] dark:text-[#8E948F] line-clamp-2 mb-4 leading-relaxed">
                    {area.description}
                  </p>

                  <div className="flex items-center justify-between text-xs font-mono text-[#888F89] dark:text-[#767C77] mb-2">
                    <span>
                      {area.completed_topics}/{area.total_topics} Topics Complete
                    </span>
                    <span className="font-bold text-[#161917] dark:text-white">{area.completion_percent}%</span>
                  </div>

                  <div className="w-full bg-[#F0F1EC] dark:bg-[#202422] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#161917] dark:bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${area.completion_percent}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
