import React, { useState, useEffect, useRef } from 'react';
import { Task, Question } from '../types';
import { api } from '../services/api';
import {
  ListTodo,
  CheckCircle2,
  Clock4,
  Circle,
  Upload,
  FileText,
  ChevronRight,
  ChevronDown,
  Sparkles,
  BookOpen,
  Filter,
  Check,
  Paperclip,
  ArrowLeft,
  X,
  HelpCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Search,
  RotateCcw,
} from 'lucide-react';

import { CardStatusDropdown } from '../components/CardStatusDropdown';

interface TasksViewProps {
  onSelectTopic?: (topicId: number) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onSelectTopic }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtration state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Custom Dropdown Menus state
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

  const moduleDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(e.target as Node)) {
        setIsModuleMenuOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setIsTypeMenuOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(e.target as Node)) {
        setIsPriorityMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);
  
  // Selected task focus modal
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);
  const [taskQuestions, setTaskQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  // Custom machine task upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadNote, setUploadNote] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.updateTaskProgress(taskId, newStatus);
      if (focusedTask && focusedTask.id === taskId) {
        setFocusedTask({ ...focusedTask, user_status: newStatus as any });
      }
      loadTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenTask = async (task: Task) => {
    setFocusedTask(task);
    setTaskQuestions([]);
    setRevealedAnswers({});
    if (task.topic_id) {
      setLoadingQuestions(true);
      try {
        const topDetail = await api.getTopicDetail(task.topic_id);
        setTaskQuestions(topDetail.questions || []);
      } catch (e) {
        // Continue without questions
      } finally {
        setLoadingQuestions(false);
      }
    }
  };

  const toggleAnswerReveal = (qId: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const submitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile && !uploadTitle) return;

    // Create a local workout entry
    const newTask: Task = {
      id: Date.now(),
      module_id: 1,
      module_code: 'BM1',
      title: uploadTitle || uploadedFile?.name || 'Custom Machine Task',
      description: uploadNote || `Custom uploaded specification (${uploadedFile?.name || 'document'}). Complete required implementation against test specs.`,
      task_type: 'MACHINE_TASK',
      priority: 'HIGH',
      is_required: true,
      learning_area_title: 'Personal Weekly Machine Task',
      user_status: 'TODO',
      created_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      setUploadedFile(null);
      setUploadTitle('');
      setUploadNote('');
    }, 1200);
  };

  // Filtration logic
  const filtered = tasks.filter((t) => {
    if (statusFilter !== 'ALL' && t.user_status !== statusFilter) return false;
    if (moduleFilter !== 'ALL' && t.module_code !== moduleFilter) return false;
    if (typeFilter !== 'ALL' && t.task_type !== typeFilter) return false;
    if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchArea = t.learning_area_title?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchArea) return false;
    }
    return true;
  });

  // Dynamic counts for status pills
  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.user_status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.user_status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.user_status === 'COMPLETED').length;

  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    moduleFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setStatusFilter('ALL');
    setModuleFilter('ALL');
    setTypeFilter('ALL');
    setPriorityFilter('ALL');
    setSearchQuery('');
  };

  // Labels for active dropdowns
  const moduleLabel =
    moduleFilter === 'ALL'
      ? 'All Modules'
      : moduleFilter === 'BM1'
      ? 'BM1 Foundations'
      : moduleFilter === 'BM2'
      ? 'BM2 Advanced'
      : 'TOI Practice';

  const typeLabel =
    typeFilter === 'ALL'
      ? 'All Types'
      : typeFilter === 'MACHINE_TASK'
      ? 'Machine Tasks'
      : typeFilter === 'CODING'
      ? 'Coding Drills'
      : 'Practice Sets';

  const priorityLabel =
    priorityFilter === 'ALL'
      ? 'All Priorities'
      : priorityFilter;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 font-sans">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#888F89] dark:text-[#767C77] font-semibold">
            PRACTICAL EXECUTION
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161917] dark:text-white tracking-tight mt-0.5">
            Tasks & Workouts
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#8E948F] font-mono mt-1">
            Machine tasks, coding drills, and weekly curriculum exercises. Click any card to open full details.
          </p>
        </div>

        {/* Upload Custom Machine Task Button */}
        <div className="shrink-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] hover:opacity-90 transition-all text-xs font-bold shadow-xs hover:scale-[1.01] active:scale-[0.99]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Machine Task (PDF/Doc)</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Toolbar (Zero Raw Native OS Selects) */}
      <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-3.5 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Search Bar & Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Real-Time Search */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#888F89] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search workouts or areas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-full text-xs pl-8 pr-7 py-1.5 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none focus:border-[#161917] dark:focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888F89] hover:text-[#161917] dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Module Filter Dropdown */}
          <div className="relative" ref={moduleDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsModuleMenuOpen(!isModuleMenuOpen);
                setIsTypeMenuOpen(false);
                setIsPriorityMenuOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs ${
                moduleFilter !== 'ALL'
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] border-[#161917] dark:border-white'
                  : 'bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white'
              }`}
            >
              <span>{moduleLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isModuleMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isModuleMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-2xl p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                {[
                  { value: 'ALL', label: 'All Modules' },
                  { value: 'BM1', label: 'BM1 Foundations' },
                  { value: 'BM2', label: 'BM2 Advanced' },
                  { value: 'TOI', label: 'TOI Practice' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setModuleFilter(opt.value);
                      setIsModuleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      moduleFilter === opt.value
                        ? 'bg-[#F0F1EC] dark:bg-[#202422] text-[#161917] dark:text-white font-bold'
                        : 'text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC]/60 dark:hover:bg-[#202422]/60 hover:text-[#161917] dark:hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {moduleFilter === opt.value && <Check className="w-3.5 h-3.5 text-[#161917] dark:text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Task Type Filter Dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsTypeMenuOpen(!isTypeMenuOpen);
                setIsModuleMenuOpen(false);
                setIsPriorityMenuOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs ${
                typeFilter !== 'ALL'
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] border-[#161917] dark:border-white'
                  : 'bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white'
              }`}
            >
              <span>{typeLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isTypeMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTypeMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-2xl p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                {[
                  { value: 'ALL', label: 'All Types' },
                  { value: 'MACHINE_TASK', label: 'Machine Tasks' },
                  { value: 'CODING', label: 'Coding Drills' },
                  { value: 'PRACTICE', label: 'Practice Sets' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setTypeFilter(opt.value);
                      setIsTypeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      typeFilter === opt.value
                        ? 'bg-[#F0F1EC] dark:bg-[#202422] text-[#161917] dark:text-white font-bold'
                        : 'text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC]/60 dark:hover:bg-[#202422]/60 hover:text-[#161917] dark:hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {typeFilter === opt.value && <Check className="w-3.5 h-3.5 text-[#161917] dark:text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority Filter Dropdown */}
          <div className="relative" ref={priorityDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsPriorityMenuOpen(!isPriorityMenuOpen);
                setIsModuleMenuOpen(false);
                setIsTypeMenuOpen(false);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs ${
                priorityFilter !== 'ALL'
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917] border-[#161917] dark:border-white'
                  : 'bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white'
              }`}
            >
              <span>{priorityLabel}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isPriorityMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isPriorityMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-2xl p-1.5 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-100">
                {[
                  { value: 'ALL', label: 'All Priorities' },
                  { value: 'URGENT', label: 'Urgent' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'LOW', label: 'Low' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setPriorityFilter(opt.value);
                      setIsPriorityMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      priorityFilter === opt.value
                        ? 'bg-[#F0F1EC] dark:bg-[#202422] text-[#161917] dark:text-white font-bold'
                        : 'text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC]/60 dark:hover:bg-[#202422]/60 hover:text-[#161917] dark:hover:text-white'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {priorityFilter === opt.value && <Check className="w-3.5 h-3.5 text-[#161917] dark:text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters Action Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              title="Reset all active filters"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-[#888F89] hover:text-[#161917] dark:hover:text-white hover:bg-[#F0F1EC] dark:hover:bg-[#202422] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Status Segmented Control with Live Item Counts */}
        <div className="flex items-center space-x-1 bg-[#F0F1EC] dark:bg-[#202422] p-1 rounded-full border border-[#E3E5DE] dark:border-[#2E3330] text-xs self-start lg:self-auto shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            All <span className="text-[10px] font-mono opacity-70">({totalCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('TODO')}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              statusFilter === 'TODO'
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            Todo <span className="text-[10px] font-mono opacity-70">({todoCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              statusFilter === 'IN_PROGRESS'
                ? 'bg-white dark:bg-[#161917] text-[#634800] dark:text-[#FCE8A6] shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            In Progress <span className="text-[10px] font-mono opacity-70">({inProgressCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              statusFilter === 'COMPLETED'
                ? 'bg-white dark:bg-[#161917] text-[#19522F] dark:text-[#A3E8B5] shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            Done <span className="text-[10px] font-mono opacity-70">({completedCount})</span>
          </button>
        </div>
      </div>

      {/* Upload Custom Machine Task Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0F1EC] dark:border-[#262A27] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-2xl bg-[#D4E2F8] text-[#1E3A68]">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#161917] dark:text-white">
                    Upload Weekly Machine Task
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#8E948F]">
                    Attach assignment specification PDF, Word, or Markdown doc
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-[#6B7280] hover:text-[#161917] dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#6B7280] dark:text-[#8E948F] uppercase tracking-wider mb-1.5">
                  Workout Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Week 1 Custom CLI Cache Parser"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#262A27] rounded-2xl text-xs px-3.5 py-2.5 text-[#161917] dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B7280] dark:text-[#8E948F] uppercase tracking-wider mb-1.5">
                  Select Document (PDF / DOCX / TXT)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#F0F1EC]/50 dark:bg-[#202422]/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Paperclip className="w-6 h-6 mx-auto mb-2 text-[#888F89]" />
                  {uploadedFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#161917] dark:text-white">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[11px] font-mono text-[#6B7280]">
                        {(uploadedFile.size / 1024).toFixed(1)} KB • Click to change
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-[#161917] dark:text-white">
                        Click or drag document to attach
                      </p>
                      <p className="text-[11px] text-[#888F89] mt-0.5">
                        PDF, DOCX, or MD task specifications
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B7280] dark:text-[#8E948F] uppercase tracking-wider mb-1.5">
                  Notes or Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific requirements, expected test coverage, time limit..."
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#262A27] rounded-2xl text-xs px-3.5 py-2 text-[#161917] dark:text-white focus:outline-none"
                />
              </div>

              {uploadSuccess && (
                <div className="p-3 rounded-2xl bg-[#CDE9D6] text-[#19522F] text-xs font-semibold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#19522F]" />
                  <span>Machine task specification uploaded successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC] dark:hover:bg-[#222624]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-bold hover:opacity-90 shadow-xs"
                >
                  Save to My Workouts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Focus / Detail Modal (Opens when user clicks on task card) */}
      {focusedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#F0F1EC] dark:border-[#262A27] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#161917] text-white dark:bg-white dark:text-[#161917]">
                  {focusedTask.module_code}
                </span>
                <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full ${
                  focusedTask.task_type === 'MACHINE_TASK' || focusedTask.task_type === 'CODING'
                    ? 'bg-[#FDD7AE] text-[#7A3E00]'
                    : focusedTask.task_type === 'PRACTICE'
                    ? 'bg-[#CDE9D6] text-[#19522F]'
                    : 'bg-[#D4E2F8] text-[#1E3A68]'
                }`}>
                  {focusedTask.task_type.replace('_', ' ')}
                </span>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                  focusedTask.priority === 'URGENT'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : focusedTask.priority === 'HIGH'
                    ? 'bg-[#FCE8A6] text-[#634800]'
                    : 'bg-[#F0F1EC] dark:bg-[#222624] text-[#6B7280]'
                }`}>
                  Priority: {focusedTask.priority}
                </span>
              </div>

              <button
                onClick={() => setFocusedTask(null)}
                className="p-2 rounded-full hover:bg-[#F0F1EC] dark:hover:bg-[#222624] text-[#6B7280] hover:text-[#161917] dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#161917] dark:text-white tracking-tight leading-snug">
                  {focusedTask.title}
                </h2>
                {focusedTask.learning_area_title && (
                  <p className="text-xs font-mono text-[#888F89] dark:text-[#767C77] mt-1.5 flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{focusedTask.learning_area_title}</span>
                  </p>
                )}
              </div>

              {/* Status Indicator & Quick Switcher Buttons */}
              <div className="p-4 rounded-2xl bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
                    Current Progression Status
                  </span>
                  <p className="text-sm font-bold text-[#161917] dark:text-white mt-0.5">
                    {focusedTask.user_status}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleStatusChange(focusedTask.id, 'TODO')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono transition-colors ${
                      focusedTask.user_status === 'TODO'
                        ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                        : 'bg-white dark:bg-[#161917] text-[#6B7280] hover:text-[#161917]'
                    }`}
                  >
                    TODO
                  </button>
                  <button
                    onClick={() => handleStatusChange(focusedTask.id, 'IN_PROGRESS')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono transition-colors ${
                      focusedTask.user_status === 'IN_PROGRESS'
                        ? 'bg-[#FCE8A6] text-[#634800]'
                        : 'bg-white dark:bg-[#161917] text-[#6B7280] hover:text-[#161917]'
                    }`}
                  >
                    IN PROGRESS
                  </button>
                  <button
                    onClick={() => handleStatusChange(focusedTask.id, 'COMPLETED')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono transition-colors ${
                      focusedTask.user_status === 'COMPLETED'
                        ? 'bg-[#9DE8BA] text-[#0D381E] font-bold'
                        : 'bg-white dark:bg-[#161917] text-[#6B7280] hover:text-[#161917]'
                    }`}
                  >
                    COMPLETED
                  </button>
                </div>
              </div>

              {/* Task Instructions / Description */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
                  Workout Specifications & Requirements
                </span>
                <div className="p-5 rounded-2xl bg-white dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] text-sm text-[#161917] dark:text-neutral-200 leading-relaxed font-sans whitespace-pre-line shadow-xs">
                  {focusedTask.description || 'No additional specifications provided for this workout.'}
                </div>
              </div>

              {/* Relevant Topic Questions (if any loaded from topic) */}
              {taskQuestions.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77] font-semibold">
                      Related Topic Practice Questions ({taskQuestions.length})
                    </span>
                    <span className="text-xs text-[#888F89]">Click question to view answer</span>
                  </div>

                  <div className="space-y-3">
                    {taskQuestions.slice(0, 3).map((q, idx) => {
                      const isRevealed = !!revealedAnswers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-2xl bg-[#F0F1EC]/80 dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white dark:bg-[#161917] text-[#161917] dark:text-white">
                              Q#{idx + 1} • {q.question_type}
                            </span>
                            <button
                              onClick={() => toggleAnswerReveal(q.id)}
                              className="text-xs font-mono text-[#161917] dark:text-white font-semibold flex items-center space-x-1 hover:underline"
                            >
                              {isRevealed ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Hide Answer</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Show Answer</span>
                                </>
                              )}
                            </button>
                          </div>

                          <p className="text-xs font-semibold text-[#161917] dark:text-white">
                            {q.question_text}
                          </p>

                          {isRevealed && q.answer_text && (
                            <div className="p-3 rounded-xl bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#2E3330] text-xs text-[#525752] dark:text-[#A3AAA4] font-mono leading-relaxed mt-2 animate-in fade-in duration-150">
                              <span className="font-bold text-[#161917] dark:text-white block mb-1">
                                Verified Answer:
                              </span>
                              {q.answer_text}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[#F0F1EC] dark:border-[#262A27] bg-[#F0F1EC]/50 dark:bg-[#202422]/50 flex items-center justify-between gap-3">
              <button
                onClick={() => setFocusedTask(null)}
                className="px-5 py-2.5 rounded-full bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] text-xs font-semibold text-[#161917] dark:text-white hover:bg-[#F0F1EC] dark:hover:bg-[#222624] transition-colors"
              >
                Close
              </button>

              {focusedTask.topic_id && onSelectTopic && (
                <button
                  onClick={() => {
                    const tId = focusedTask.topic_id!;
                    setFocusedTask(null);
                    onSelectTopic(tId);
                  }}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-bold hover:opacity-90 transition-opacity shadow-xs"
                >
                  <span>Open Topic Workspace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tasks and Workouts: 3 Cards in a Row Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#888F89]">
          Loading tasks and workouts...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((task) => {
            const isDone = task.user_status === 'COMPLETED';
            const isInProg = task.user_status === 'IN_PROGRESS';

            return (
              <div
                key={task.id}
                onClick={() => handleOpenTask(task)}
                className={`rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:-translate-y-1 hover:shadow-md cursor-pointer group ${
                  isDone
                    ? 'bg-white/70 dark:bg-[#161917]/70 border-[#E3E5DE] dark:border-[#262A27] opacity-80'
                    : 'bg-white dark:bg-[#161917] border-[#E3E5DE] dark:border-[#262A27] hover:border-[#161917] dark:hover:border-white'
                }`}
              >
                {/* Card Top: Badges and Quick Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    {/* Badges */}
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#161917] text-white dark:bg-white dark:text-[#161917]">
                        {task.module_code}
                      </span>
                      <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full ${
                        task.task_type === 'MACHINE_TASK' || task.task_type === 'CODING'
                          ? 'bg-[#FDD7AE] text-[#7A3E00]'
                          : task.task_type === 'PRACTICE'
                          ? 'bg-[#CDE9D6] text-[#19522F]'
                          : 'bg-[#D4E2F8] text-[#1E3A68]'
                      }`}>
                        {task.task_type.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'HIGH'
                            ? 'bg-[#FCE8A6] text-[#634800]'
                            : 'bg-[#F0F1EC] dark:bg-[#222624] text-[#6B7280]'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Quick Complete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, isDone ? 'TODO' : 'COMPLETED');
                      }}
                      title={isDone ? 'Mark as Todo' : 'Mark as Completed'}
                      className="p-1 rounded-full text-[#888F89] hover:text-[#161917] dark:hover:text-white transition-colors"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : isInProg ? (
                        <Clock4 className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#888F89] hover:text-[#161917] dark:hover:text-white" />
                      )}
                    </button>
                  </div>

                  {/* Task Title */}
                  <h3
                    className={`text-base font-bold tracking-tight mb-2 group-hover:text-[#2563EB] dark:group-hover:text-[#9DE8BA] transition-colors ${
                      isDone
                        ? 'line-through text-[#888F89] dark:text-[#666B67]'
                        : 'text-[#161917] dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {/* Description */}
                  {task.description && (
                    <p className="text-xs text-[#6B7280] dark:text-[#8E948F] line-clamp-3 leading-relaxed mb-4">
                      {task.description}
                    </p>
                  )}

                  {/* Learning Area metadata */}
                  {task.learning_area_title && (
                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#888F89] dark:text-[#767C77] mb-4">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{task.learning_area_title}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Status Pill Selector + Action Button */}
                <div className="pt-4 border-t border-[#F0F1EC] dark:border-[#262A27] flex items-center justify-between gap-2">
                  <CardStatusDropdown
                    status={task.user_status}
                    onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                  />

                  <span className="text-xs font-semibold text-[#161917] dark:text-white flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-xs font-mono text-[#888F89] dark:text-[#767C77] bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-8 space-y-3 shadow-xs">
          <p>No tasks or workouts found matching current filters.</p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
