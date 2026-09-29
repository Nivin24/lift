import React, { useState, useEffect } from 'react';
import { TopicSummary, LearningAreaProgress } from '../types';
import { api } from '../services/api';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  Plus,
  BookOpen,
  Layers,
  Circle,
  Clock4,
} from 'lucide-react';

interface LearningAreaViewProps {
  areaId: number;
  onSelectTopic: (topicId: number) => void;
  onBack: () => void;
}

export const LearningAreaView: React.FC<LearningAreaViewProps> = ({
  areaId,
  onSelectTopic,
  onBack,
}) => {
  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [areaInfo, setAreaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const area = await api.request<any>(`/areas/${areaId}`);
      setAreaInfo(area);
      const topList = await api.getAreaTopics(areaId);
      setTopics(topList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [areaId]);

  const handleToggleTopic = async (topicId: number, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = currentStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    try {
      await api.updateTopicProgress(topicId, nextStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTopics = topics.filter((t) => {
    if (filter === 'ALL') return true;
    return t.user_status === filter;
  });

  const completedCount = topics.filter((t) => t.user_status === 'COMPLETED').length;
  const percent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white dark:bg-[#161917] hover:bg-[#F0F1EC] dark:hover:bg-[#222624] text-[#161917] dark:text-white transition-colors shadow-xs border border-[#E3E5DE] dark:border-[#262A27]"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#888F89] dark:text-[#767C77]">
          <span>Curriculum</span>
          <span>/</span>
          <span className="text-[#161917] dark:text-white font-semibold">{areaInfo?.title || 'Learning Area'}</span>
        </div>
      </div>

      {/* Area Banner Header */}
      <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold mb-1">
              <Layers className="w-4 h-4 text-[#888F89] dark:text-[#767C77]" />
              <span>LEARNING AREA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#161917] dark:text-white tracking-tight">
              {areaInfo?.title}
            </h1>
            <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-1 max-w-xl leading-relaxed">
              {areaInfo?.description}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl font-extrabold text-[#161917] dark:text-white font-sans tracking-tight">
              {percent}%
            </span>
            <p className="text-xs text-[#888F89] dark:text-[#767C77] font-mono mt-0.5">
              {completedCount} of {topics.length} Topics Complete
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#F0F1EC] dark:bg-[#202422] rounded-full h-2.5 mt-5 overflow-hidden">
          <div
            className="bg-[#161917] dark:bg-white h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Topic List Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
            Topics in this Area ({topics.length})
          </h2>
        </div>

        <div className="flex items-center space-x-1.5 bg-white dark:bg-[#161917] p-1 rounded-full border border-[#E3E5DE] dark:border-[#262A27] text-xs shadow-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            All ({topics.length})
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors ${
              filter === 'COMPLETED'
                ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter('NOT_STARTED')}
            className={`px-3 py-1 rounded-full font-semibold transition-colors ${
              filter === 'NOT_STARTED'
                ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            Pending ({topics.length - completedCount})
          </button>
        </div>
      </div>

      {/* Topics List Card */}
      <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl divide-y divide-[#F0F1EC] dark:divide-[#262A27] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#888F89] dark:text-[#767C77] font-mono">
            Loading topics...
          </div>
        ) : filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => {
            const isCompleted = topic.user_status === 'COMPLETED';
            const isInProgress = topic.user_status === 'IN_PROGRESS';

            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className="p-5 hover:bg-[#F0F1EC]/60 dark:hover:bg-[#202422]/60 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-start space-x-4 flex-1 pr-4">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={(e) => handleToggleTopic(topic.id, topic.user_status, e)}
                    title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                    className="mt-0.5 text-[#888F89] hover:text-[#161917] dark:hover:text-white transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : isInProgress ? (
                      <Clock4 className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-[#888F89] hover:text-[#161917] dark:hover:text-white" />
                    )}
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        isCompleted
                          ? 'text-[#888F89] dark:text-[#666B67] line-through'
                          : 'text-[#161917] dark:text-white group-hover:text-blue-600 dark:group-hover:text-[#9DE8BA]'
                      } transition-colors`}
                    >
                      {topic.title}
                    </h3>
                    {topic.summary && (
                      <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-1 line-clamp-1 leading-relaxed">
                        {topic.summary}
                      </p>
                    )}
                    {topic.subtopics && topic.subtopics.length > 0 && (
                      <span className="inline-block mt-2 text-[10px] font-mono text-[#161917] dark:text-neutral-300 bg-[#F0F1EC] dark:bg-[#202422] px-2 py-0.5 rounded-full font-medium">
                        {topic.subtopics.length} syllabus items
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FCE8A6] text-[#634800] font-bold">
                    {topic.difficulty}
                  </span>
                  <div className="flex items-center space-x-1 text-xs text-[#888F89] dark:text-[#767C77] font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{topic.estimated_minutes}m</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#888F89] dark:text-[#767C77] group-hover:translate-x-1 group-hover:text-[#161917] dark:group-hover:text-white transition-all" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-[#888F89] dark:text-[#767C77] font-mono">
            No topics matching filter.
          </div>
        )}
      </div>
    </div>
  );
};

