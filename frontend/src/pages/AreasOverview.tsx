import React, { useState, useEffect } from 'react';
import { LearningAreaProgress, ModuleStatus } from '../types';
import { api } from '../services/api';
import { Layers, ChevronRight, CheckCircle2, Lock } from 'lucide-react';

interface AreasOverviewProps {
  onSelectArea: (areaId: number) => void;
  modules: ModuleStatus[];
}

export const AreasOverview: React.FC<AreasOverviewProps> = ({ onSelectArea, modules }) => {
  const [areas, setAreas] = useState<LearningAreaProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const dash = await api.getDashboard();
        setAreas(dash.learning_areas_progress);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      <div>
        <span className="text-[11px] font-mono tracking-wider uppercase text-[#888F89] dark:text-[#767C77] font-semibold">
          KNOWLEDGE ARCHITECTURE
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#161917] dark:text-white tracking-tight flex items-center space-x-2.5 mt-0.5">
          <Layers className="w-6 h-6 text-[#161917] dark:text-white" />
          <span>Curriculum Learning Areas</span>
        </h1>
        <p className="text-xs text-[#6B7280] dark:text-[#8E948F] font-mono mt-1">
          Explore structured domains across BM1, BM2, and TOI.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-[#888F89] dark:text-[#767C77]">
          Loading learning areas...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {areas.map((area) => {
            const mod = modules.find((m) => m.code === area.module_code);
            const isModLocked = mod?.status === 'LOCKED';

            return (
              <div
                key={area.id}
                onClick={() => {
                  if (!isModLocked) {
                    onSelectArea(area.id);
                  }
                }}
                className={`border rounded-3xl p-6 transition-all shadow-xs flex flex-col justify-between ${
                  isModLocked
                    ? 'bg-white/50 dark:bg-[#161917]/50 border-[#E3E5DE] dark:border-[#262A27] opacity-60 cursor-not-allowed'
                    : 'bg-white dark:bg-[#161917] hover:border-[#161917] dark:hover:border-white border-[#E3E5DE] dark:border-[#262A27] cursor-pointer group hover:-translate-y-0.5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#161917] text-white dark:bg-white dark:text-[#161917]">
                      {area.module_code}
                    </span>
                    {isModLocked ? (
                      <span className="flex items-center space-x-1 text-xs font-mono text-[#888F89] dark:text-[#767C77]">
                        <Lock className="w-3.5 h-3.5" />
                        <span>LOCKED</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#161917] dark:text-white">
                        {area.completion_percent}%
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-[#161917] dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#9DE8BA] transition-colors">
                    {area.title}
                  </h3>
                  {area.description && (
                    <p className="text-xs text-[#6B7280] dark:text-[#8E948F] line-clamp-2 mt-1 mb-4 leading-relaxed">
                      {area.description}
                    </p>
                  )}
                </div>

                <div>
                  <div className="w-full bg-[#F0F1EC] dark:bg-[#202422] rounded-full h-2 overflow-hidden mt-4">
                    <div
                      className="bg-[#161917] dark:bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${area.completion_percent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#888F89] dark:text-[#767C77] mt-3">
                    <span>{area.completed_topics}/{area.total_topics} Topics</span>
                    {!isModLocked && (
                      <span className="text-[#161917] dark:text-white font-semibold flex items-center space-x-0.5 group-hover:translate-x-1 transition-transform">
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
