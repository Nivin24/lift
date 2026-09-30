import React, { useState, useEffect } from 'react';
import { TopicDetail, Task } from '../types';
import { api } from '../services/api';
import { AIGeneratorModal } from '../components/AIGeneratorModal';
import { StudyMaterialViewer } from '../components/StudyMaterialViewer';
import { CardStatusDropdown } from '../components/CardStatusDropdown';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  BookOpen,
  FileText,
  ExternalLink,
  HelpCircle,
  ListTodo,
  CheckSquare,
  Edit3,
  Save,
  ChevronDown,
  ChevronUp,
  Circle,
  Lightbulb,
  Target,
  Terminal,
  Briefcase,
  Brain,
  ListChecks,
  Compass,
  X,
} from 'lucide-react';

interface TopicViewProps {
  topicId: number;
  onBack: () => void;
  onOpenSettings: () => void;
}

export const TopicView: React.FC<TopicViewProps> = ({
  topicId,
  onBack,
  onOpenSettings,
}) => {
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subtopics' | 'material' | 'questions' | 'tasks' | 'resources' | 'notes'>('subtopics');
  const [personalNotes, setPersonalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedAlert, setNotesSavedAlert] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});
  const [selectedQuizOptions, setSelectedQuizOptions] = useState<Record<number, number>>({});
  const [checkedSubtopics, setCheckedSubtopics] = useState<Record<string, boolean>>({});
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  const loadTopic = async () => {
    setLoading(true);
    try {
      const data = await api.getTopicDetail(topicId);
      setTopic(data);
      setPersonalNotes(data.notes || '');
      try {
        const saved = localStorage.getItem(`lift_subtopics_${topicId}`);
        if (saved) {
          setCheckedSubtopics(JSON.parse(saved));
        } else {
          setCheckedSubtopics({});
        }
      } catch (e) {
        // ignore localStorage errors
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubtopic = (item: string) => {
    const nextState = !checkedSubtopics[item];
    const updated = { ...checkedSubtopics, [item]: nextState };
    setCheckedSubtopics(updated);
    try {
      localStorage.setItem(`lift_subtopics_${topicId}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const handleToggleTopicStatus = async () => {
    if (!topic) return;
    const newStatus = topic.user_status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    try {
      await api.updateTopicProgress(topic.id, newStatus, personalNotes);
      loadTopic();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async () => {
    if (!topic) return;
    setSavingNotes(true);
    try {
      await api.updateTopicProgress(topic.id, topic.user_status, personalNotes);
      setNotesSavedAlert(true);
      setTimeout(() => setNotesSavedAlert(false), 2000);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.updateTaskProgress(taskId, newStatus);
      loadTopic();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAnswer = (qId: number) => {
    setExpandedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const selectQuizOption = (qId: number, optionIdx: number) => {
    setSelectedQuizOptions((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-text-secondary">
        Loading topic workspace...
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="py-24 text-center text-xs font-mono text-red-500">
        Failed to load topic details.
      </div>
    );
  }

  const isCompleted = topic.user_status === 'COMPLETED';

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans w-full">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-[#F0F1EC] dark:hover:bg-[#222624] bg-white dark:bg-[#161917] text-[#161917] dark:text-white transition-colors border border-[#E3E5DE] dark:border-[#262A27] shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center space-x-2 text-xs font-mono text-[#888F89] dark:text-[#767C77]">
          <span>{topic.module_code}</span>
          <span>/</span>
          <span>{topic.learning_area_title}</span>
          <span>/</span>
          <span className="text-[#161917] dark:text-white font-bold">{topic.title}</span>
        </div>
      </div>

      {/* 1. Overview Section Banner */}
      <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border border-[#E3E5DE] dark:border-[#2E3330]">
                {topic.learning_area_title}
              </span>
              <span className="font-mono text-[11px] font-bold px-3 py-1 rounded-full bg-[#FCE8A6] text-[#634800] dark:bg-[#4E3800] dark:text-[#FCE8A6]">
                {topic.difficulty}
              </span>
              <span className="flex items-center space-x-1 font-mono text-[11px] text-[#888F89] dark:text-[#767C77] px-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{topic.estimated_minutes} min read</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#161917] dark:text-white tracking-tight">{topic.title}</h1>
            {topic.summary && <p className="text-sm text-[#5C625D] dark:text-[#A3AAA4] max-w-3xl leading-relaxed">{topic.summary}</p>}
          </div>

          {/* Action buttons: Status Toggle & AI Generator */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setAiModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#161917] dark:bg-white text-white dark:text-[#161917] rounded-full text-xs font-semibold shadow-xs hover:opacity-90 transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-[#0D381E] dark:text-[#9DE8BA]" />
              <span>AI Actions</span>
            </button>

            <button
              onClick={handleToggleTopicStatus}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-semibold transition-all shadow-xs ${
                isCompleted
                  ? 'bg-[#9DE8BA] dark:bg-[#153E23] text-[#0D381E] dark:text-[#A3E8B5] font-bold'
                  : 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white border border-[#E3E5DE] dark:border-[#262A27] hover:bg-[#F0F1EC] dark:hover:bg-[#222624]'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-[#A3E8B5]" />
                  <span>Topic Completed</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-[#888F89] dark:text-[#767C77]" />
                  <span>Mark as Done</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Structured Curriculum Specifications & Relevance */}
      {(topic.learning_objective || topic.machine_task_relevance || topic.interview_relevance) && (
        <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topic.learning_objective && (
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#F0F1EC]/60 dark:bg-[#202422]/60 border border-[#E3E5DE]/80 dark:border-[#2E3330]">
                <div className="flex items-center space-x-1.5 text-[#161917] dark:text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Learning Objective</span>
                </div>
                <p className="text-[13px] text-[#383E3A] dark:text-[#D1D5DB] leading-relaxed font-sans">{topic.learning_objective}</p>
              </div>
            )}
            {topic.expected_outcome && (
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#F0F1EC]/60 dark:bg-[#202422]/60 border border-[#E3E5DE]/80 dark:border-[#2E3330]">
                <div className="flex items-center space-x-1.5 text-[#161917] dark:text-white font-mono text-[11px] font-bold uppercase tracking-wider">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Expected Learning Outcome</span>
                </div>
                <p className="text-[13px] text-[#383E3A] dark:text-[#D1D5DB] leading-relaxed font-sans">{topic.expected_outcome}</p>
              </div>
            )}
          </div>

          {(topic.prerequisites || topic.practice_requirement) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 border-t border-[#F0F1EC] dark:border-[#262A27] text-xs font-mono">
              {topic.prerequisites && (
                <div className="flex items-center space-x-2">
                  <span className="text-[#888F89] dark:text-[#767C77] font-bold">Prerequisites:</span>
                  <span className="text-[#161917] dark:text-white font-semibold">{topic.prerequisites}</span>
                </div>
              )}
              {topic.practice_requirement && (
                <div className="flex items-center space-x-2">
                  <span className="text-amber-700 dark:text-amber-400 font-bold">Practice Requirement:</span>
                  <span className="text-[#161917] dark:text-white font-semibold">{topic.practice_requirement}</span>
                </div>
              )}
            </div>
          )}

          {/* Relevance Triad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
            {topic.machine_task_relevance && (
              <div className="p-4 rounded-2xl bg-[#FDD7AE]/30 dark:bg-[#4E2A00]/30 border border-amber-300/40 dark:border-amber-800/40 space-y-1">
                <div className="flex items-center space-x-1.5 text-[#733700] dark:text-[#FDD7AE] font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Machine-Task Relevance</span>
                </div>
                <p className="text-[12px] text-[#733700] dark:text-[#FDD7AE] leading-relaxed font-sans">{topic.machine_task_relevance}</p>
              </div>
            )}
            {topic.practical_task_relevance && (
              <div className="p-4 rounded-2xl bg-[#D4E2F8]/30 dark:bg-[#122A54]/30 border border-blue-200/50 dark:border-blue-900/50 space-y-1">
                <div className="flex items-center space-x-1.5 text-[#1A3B8B] dark:text-[#9EC5F8] font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Practical-Task Relevance</span>
                </div>
                <p className="text-[12px] text-[#1A3B8B] dark:text-[#9EC5F8] leading-relaxed font-sans">{topic.practical_task_relevance}</p>
              </div>
            )}
            {topic.interview_relevance && (
              <div className="p-4 rounded-2xl bg-[#CDE9D6]/40 dark:bg-[#143E23]/30 border border-emerald-300/40 dark:border-emerald-800/40 space-y-1">
                <div className="flex items-center space-x-1.5 text-[#144D26] dark:text-[#A3E8B5] font-mono text-[11px] font-bold uppercase tracking-wider">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Interview / TOI Relevance</span>
                </div>
                <p className="text-[12px] text-[#144D26] dark:text-[#A3E8B5] leading-relaxed font-sans">{topic.interview_relevance}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modern Pill Tabs Navigation */}
      <div className="flex items-center space-x-1.5 p-1.5 bg-[#F0F1EC] dark:bg-[#202422] rounded-full border border-[#E3E5DE] dark:border-[#2E3330] overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('subtopics')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            activeTab === 'subtopics'
              ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white font-bold shadow-xs'
              : 'text-[#5C625D] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white font-medium'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Syllabus ({topic.subtopics?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('material')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            activeTab === 'material'
              ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white font-bold shadow-xs'
              : 'text-[#5C625D] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white font-medium'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Study Material ({topic.materials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white font-bold shadow-xs'
              : 'text-[#5C625D] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white font-medium'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Questions & Quiz ({topic.questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white font-bold shadow-xs'
              : 'text-[#5C625D] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white font-medium'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Tasks ({topic.tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            activeTab === 'resources'
              ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white font-bold shadow-xs'
              : 'text-[#5C625D] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white font-medium'
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Resources ({topic.resources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            activeTab === 'notes'
              ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white font-bold shadow-xs'
              : 'text-[#5C625D] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white font-medium'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Personal Notes</span>
        </button>
      </div>

      {/* Tab: Syllabus & Subtopics Checklist */}
      {activeTab === 'subtopics' && (
        <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F0F1EC] dark:border-[#262A27] pb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-[#161917] dark:text-white">Curriculum Subtopics & Syllabus</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-0.5 font-sans">
                Official BM1 syllabus items. Check off items as you master them.
              </p>
            </div>
            {topic.subtopics && topic.subtopics.length > 0 && (
              <span className="text-xs font-mono font-bold text-[#0D381E] dark:text-[#A3E8B5] bg-[#CDE9D6]/60 dark:bg-[#143E23] px-3.5 py-1 rounded-full border border-emerald-300/60 dark:border-emerald-800 self-start sm:self-auto">
                {Object.values(checkedSubtopics).filter(Boolean).length} / {topic.subtopics.length} Mastered
              </span>
            )}
          </div>

          {topic.subtopics && topic.subtopics.length > 0 ? (
            <div className="divide-y divide-[#F0F1EC] dark:divide-[#262A27]">
              {topic.subtopics.map((sub, idx) => {
                const isChecked = !!checkedSubtopics[sub];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSubtopic(sub)}
                    className="py-3 px-3 rounded-2xl hover:bg-[#F0F1EC]/60 dark:hover:bg-[#202422]/60 cursor-pointer transition-colors flex items-start space-x-3.5 group"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-[#888F89] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 dark:text-neutral-600" />
                      )}
                    </button>
                    <span
                      className={`text-[13px] font-mono leading-relaxed transition-colors ${
                        isChecked
                          ? 'text-[#888F89] dark:text-[#666B67] line-through'
                          : 'text-[#2D332F] dark:text-[#E8EAE6] group-hover:text-black dark:group-hover:text-white font-medium'
                      }`}
                    >
                      {sub}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs font-mono text-[#888F89] dark:text-[#767C77]">
              No detailed subtopics breakdown specified for this topic.
            </div>
          )}
        </div>
      )}

      {/* Tab 1: Study Material (Rich Readable Markdown) */}
      {activeTab === 'material' && (
        <div className="space-y-6">
          {topic.materials.length > 0 ? (
            topic.materials.map((mat) => (
              <StudyMaterialViewer
                key={mat.id}
                title={mat.title}
                authorType={mat.author_type}
                createdAt={mat.created_at}
                content={mat.content}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <BookOpen className="w-10 h-10 text-[#888F89] dark:text-[#767C77] mx-auto" />
              <p className="text-sm font-sans text-[#6B7280] dark:text-[#8E948F]">
                No study material has been generated for this topic yet.
              </p>
              <button
                onClick={() => setAiModalOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#161917] dark:bg-white text-white dark:text-[#161917] rounded-full text-xs font-semibold shadow-xs hover:opacity-90 transition-all"
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-[#9DE8BA]" />
                <span>Generate with Gemini</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Questions & Quiz */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {topic.questions.length > 0 ? (
            topic.questions.map((q, idx) => {
              const isExpanded = !!expandedAnswers[q.id];
              const isQuiz = q.question_type === 'QUIZ' && q.options && q.options.length > 0;
              const selectedOpt = selectedQuizOptions[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border border-[#E3E5DE] dark:border-[#2E3330]">
                        {q.question_type}
                      </span>
                      <span className="text-xs font-mono text-[#888F89] dark:text-[#767C77]">Question #{idx + 1}</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#FCE8A6] text-[#634800] dark:bg-[#4E3800] dark:text-[#FCE8A6]">
                      {q.difficulty}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[#161917] dark:text-white leading-relaxed">{q.question_text}</p>

                  {/* Multiple Choice Options if Quiz */}
                  {isQuiz && (
                    <div className="space-y-2 mt-3">
                      {q.options!.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        const isCorrect = q.correct_option_index === optIdx;
                        const hasAnswered = selectedOpt !== undefined;

                        let optClasses = 'border-[#E3E5DE] dark:border-[#2E3330] bg-[#FAFBF9] dark:bg-[#202422] text-[#161917] dark:text-white hover:border-[#161917] dark:hover:border-white';
                        if (hasAnswered) {
                          if (isCorrect) {
                            optClasses = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-bold';
                          } else if (isChosen && !isCorrect) {
                            optClasses = 'border-rose-400 bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-200';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => selectQuizOption(q.id, optIdx)}
                            className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-mono border transition-all flex items-center justify-between ${optClasses}`}
                          >
                            <span>
                              <strong className="mr-2 font-bold">{chr(65 + optIdx)})</strong> {opt}
                            </span>
                            {hasAnswered && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Toggle Answer / Explanation */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 hover:opacity-80 transition-opacity"
                    >
                      <span>{isExpanded ? 'Hide Answer & Explanation' : 'Reveal Answer & Explanation'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-2xl bg-[#F0F1EC]/60 dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] text-xs leading-relaxed text-[#383E3A] dark:text-[#D1D5DB] space-y-1.5 font-sans">
                        <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-400 font-bold text-xs font-mono mb-1">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Authoritative Solution</span>
                        </div>
                        <p className="whitespace-pre-wrap">{q.answer_text || 'No explanation provided.'}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-12 text-center space-y-4 shadow-xs">
              <HelpCircle className="w-10 h-10 text-[#888F89] dark:text-[#767C77] mx-auto" />
              <p className="text-sm font-sans text-[#6B7280] dark:text-[#8E948F]">No questions or quiz added yet.</p>
              <button
                onClick={() => setAiModalOpen(true)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#161917] dark:bg-white text-white dark:text-[#161917] rounded-full text-xs font-semibold shadow-xs hover:opacity-90 transition-all"
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-600 dark:text-[#9DE8BA]" />
                <span>Generate Questions with Gemini</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topic.tasks.length > 0 ? (
              topic.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setFocusedTask(task)}
                  className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-[#161917] dark:hover:border-white transition-all hover:-translate-y-0.5 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4E2F8] dark:bg-[#122A54] text-[#1E3A68] dark:text-[#9EC5F8]">
                        {task.task_type}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FDD7AE] dark:bg-[#4E2A00] text-[#7A3E00] dark:text-[#FDD7AE]">
                        {task.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#161917] dark:text-white group-hover:text-emerald-700 dark:group-hover:text-[#A3E8B5] transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-xs text-[#5C625D] dark:text-[#A3AAA4] leading-relaxed line-clamp-3">
                      {task.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#F0F1EC] dark:border-[#262A27] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#888F89] dark:text-[#767C77]">Status:</span>
                    <CardStatusDropdown
                      status={task.user_status}
                      onStatusChange={(newStatus) => handleTaskStatusChange(task.id, newStatus)}
                      direction="up"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-12 text-center text-xs font-mono text-[#888F89] dark:text-[#767C77] shadow-xs">
                No tasks currently associated with this topic.
              </div>
            )}
          </div>

          {/* Focused Task Modal */}
          {focusedTask && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
              <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-[#F0F1EC] dark:border-[#262A27] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#161917] text-white dark:bg-white dark:text-[#161917]">
                      {focusedTask.module_code || 'BM1'}
                    </span>
                    <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#D4E2F8] dark:bg-[#122A54] text-[#1E3A68] dark:text-[#9EC5F8]">
                      {focusedTask.task_type}
                    </span>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FDD7AE] dark:bg-[#4E2A00] text-[#7A3E00] dark:text-[#FDD7AE]">
                      {focusedTask.priority}
                    </span>
                  </div>
                  <button
                    onClick={() => setFocusedTask(null)}
                    className="p-1.5 rounded-full hover:bg-[#F0F1EC] dark:hover:bg-[#222624] text-[#6B7280] dark:text-[#888F89] hover:text-[#161917] dark:hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  <div>
                    <h2 className="text-xl font-bold text-[#161917] dark:text-white">
                      {focusedTask.title}
                    </h2>
                    <p className="text-xs font-mono text-[#888F89] dark:text-[#767C77] mt-1">
                      {topic.title} • {topic.learning_area_title}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
                      Instructions & Workout Scope
                    </span>
                    <div className="p-4 rounded-2xl bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#262A27] text-xs text-[#161917] dark:text-neutral-200 leading-relaxed whitespace-pre-line font-mono">
                      {focusedTask.description || 'Complete required implementation and verify against benchmark test suite.'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-[#888F89] dark:text-[#767C77]">Status:</span>
                      <p className="text-xs font-bold text-[#161917] dark:text-white">{focusedTask.user_status}</p>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          handleTaskStatusChange(focusedTask.id, 'TODO');
                          setFocusedTask({ ...focusedTask, user_status: 'TODO' });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          focusedTask.user_status === 'TODO'
                            ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                            : 'bg-[#F0F1EC] dark:bg-[#2A2E2C] text-[#6B7280] dark:text-[#A3AAA4] hover:text-black dark:hover:text-white'
                        }`}
                      >
                        TODO
                      </button>
                      <button
                        onClick={() => {
                          handleTaskStatusChange(focusedTask.id, 'IN_PROGRESS');
                          setFocusedTask({ ...focusedTask, user_status: 'IN_PROGRESS' });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          focusedTask.user_status === 'IN_PROGRESS'
                            ? 'bg-[#FCE8A6] dark:bg-[#4E3800] text-[#634800] dark:text-[#FCE8A6]'
                            : 'bg-[#F0F1EC] dark:bg-[#2A2E2C] text-[#6B7280] dark:text-[#A3AAA4] hover:text-black dark:hover:text-white'
                        }`}
                      >
                        IN PROGRESS
                      </button>
                      <button
                        onClick={() => {
                          handleTaskStatusChange(focusedTask.id, 'COMPLETED');
                          setFocusedTask({ ...focusedTask, user_status: 'COMPLETED' });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          focusedTask.user_status === 'COMPLETED'
                            ? 'bg-[#9DE8BA] dark:bg-[#153E23] text-[#0D381E] dark:text-[#A3E8B5] font-bold'
                            : 'bg-[#F0F1EC] dark:bg-[#2A2E2C] text-[#6B7280] dark:text-[#A3AAA4] hover:text-black dark:hover:text-white'
                        }`}
                      >
                        DONE
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-[#F0F1EC] dark:border-[#262A27] flex justify-end">
                  <button
                    onClick={() => setFocusedTask(null)}
                    className="px-5 py-2 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Resources */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topic.resources.length > 0 ? (
            topic.resources.map((res) => (
              <div
                key={res.id}
                className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 shadow-xs space-y-3 hover:border-[#161917] dark:hover:border-white transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border border-[#E3E5DE] dark:border-[#2E3330]">
                    {res.resource_type}
                  </span>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-full bg-[#F0F1EC] dark:bg-[#202422] hover:bg-white dark:hover:bg-[#282D2A] text-[#525752] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white transition-colors border border-[#E3E5DE] dark:border-[#2E3330]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#161917] dark:text-white">{res.title}</h3>
                {res.description && (
                  <p className="text-xs text-[#5C625D] dark:text-[#A3AAA4] leading-relaxed">{res.description}</p>
                )}
                {res.url && (
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline truncate block pt-1"
                  >
                    {res.url}
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-12 text-center text-xs font-mono text-[#888F89] dark:text-[#767C77] shadow-xs">
              No external resources linked.
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Personal Notes */}
      {activeTab === 'notes' && (
        <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F0F1EC] dark:border-[#262A27] gap-3">
            <div>
              <h2 className="text-base font-bold text-[#161917] dark:text-white">Personal Study Notes</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#8E948F] font-sans mt-0.5">
                Notes are private and tracked per user.
              </p>
            </div>
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-[#161917] dark:bg-white text-white dark:text-[#161917] rounded-full text-xs font-semibold shadow-xs hover:opacity-90 transition-all self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>

          <textarea
            rows={10}
            value={personalNotes}
            onChange={(e) => setPersonalNotes(e.target.value)}
            placeholder="Capture your personal takeaways, syntax gotchas, or interview reminders..."
            className="w-full bg-[#FAFBF9] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl p-4 text-xs font-mono text-[#161917] dark:text-white placeholder-[#888F89] dark:placeholder-[#666B67] focus:outline-none focus:border-[#161917] dark:focus:border-white leading-relaxed shadow-inner transition-colors"
          ></textarea>

          {notesSavedAlert && (
            <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">Personal notes saved successfully.</p>
          )}
        </div>
      )}

      {/* AI Content Generator Modal */}
      <AIGeneratorModal
        topicId={topic.id}
        topicTitle={topic.title}
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onSaved={loadTopic}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
};

function chr(code: number): string {
  return String.fromCharCode(code);
}
