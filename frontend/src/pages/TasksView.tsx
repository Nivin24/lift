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
  Layers,
  Cpu,
  CheckSquare,
  Calendar,
  AlertTriangle,
  ArrowRight,
  FileCode,
  Terminal,
  BarChart3,
  Binary,
  Database,
  Award,
  LayoutGrid,
  ListFilter,
  Flame,
  TrendingUp,
} from 'lucide-react';

import { CardStatusDropdown } from '../components/CardStatusDropdown';

// Rich curriculum metadata for primary category cards
const CATEGORY_META: Record<string, {
  icon: any;
  colorBgLight: string;
  colorBgDark: string;
  textColor: string;
  badge: string;
  description: string;
  defaultModule: string;
}> = {
  'Python': {
    icon: Terminal,
    colorBgLight: 'bg-amber-500/10 border-amber-500/20',
    colorBgDark: 'dark:bg-amber-500/15 dark:border-amber-500/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    badge: 'Core Programming',
    description: 'Master clean syntax, OOP architecture, concurrency, generators, decorators, memory model, and algorithmic workouts.',
    defaultModule: 'BM1',
  },
  'Data Handling & Visualization': {
    icon: BarChart3,
    colorBgLight: 'bg-blue-500/10 border-blue-500/20',
    colorBgDark: 'dark:bg-blue-500/15 dark:border-blue-500/30',
    textColor: 'text-blue-600 dark:text-cyan-400',
    badge: 'Analytical Computing',
    description: 'High-speed NumPy vectorized operations, Pandas DataFrame wrangling, and publication-ready Matplotlib & Seaborn plots.',
    defaultModule: 'BM1',
  },
  'Data Structures & Algorithms': {
    icon: Cpu,
    colorBgLight: 'bg-emerald-500/10 border-emerald-500/20',
    colorBgDark: 'dark:bg-emerald-500/15 dark:border-emerald-500/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'Technical Workouts',
    description: 'Linear & non-linear structures, ADTs, time-space complexity, trees, graphs, sorting algorithms, and competitive problem solving.',
    defaultModule: 'BM1',
  },
  'Mathematics & Statistics': {
    icon: Binary,
    colorBgLight: 'bg-indigo-500/10 border-indigo-500/20',
    colorBgDark: 'dark:bg-indigo-500/15 dark:border-indigo-500/30',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    badge: 'Theoretical Foundations',
    description: 'Linear algebra, matrix operations, multivariable calculus, probability distributions, hypothesis testing, and loss gradients.',
    defaultModule: 'BM1',
  },
  'Machine Learning Concepts': {
    icon: Sparkles,
    colorBgLight: 'bg-purple-500/10 border-purple-500/20',
    colorBgDark: 'dark:bg-purple-500/15 dark:border-purple-500/30',
    textColor: 'text-purple-600 dark:text-pink-400',
    badge: 'Predictive Modeling',
    description: 'Supervised and unsupervised learning paradigms, cost functions, gradient descent optimization, and evaluation metrics.',
    defaultModule: 'BM1',
  },
  'SQL for Data & ML': {
    icon: Database,
    colorBgLight: 'bg-teal-500/10 border-teal-500/20',
    colorBgDark: 'dark:bg-teal-500/15 dark:border-teal-500/30',
    textColor: 'text-teal-600 dark:text-teal-400',
    badge: 'Data Architecture',
    description: 'Relational schemas, complex window functions, CTEs, aggregation rollups, and analytical query optimization.',
    defaultModule: 'BM1',
  },
  'Live Project & Presentation': {
    icon: Award,
    colorBgLight: 'bg-rose-500/10 border-rose-500/20',
    colorBgDark: 'dark:bg-rose-500/15 dark:border-rose-500/30',
    textColor: 'text-rose-600 dark:text-rose-400',
    badge: 'Applied Milestone',
    description: 'End-to-end production pipelines, architectural defense, clean code packaging, and technical interview demonstrations.',
    defaultModule: 'BM1',
  },
};

interface TasksViewProps {
  onSelectTopic?: (topicId: number) => void;
  onBackToDashboard?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onSelectTopic, onBackToDashboard }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Primary Navigation
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'categories' | 'all'>('categories');

  // Filtration state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [collapsedAreas, setCollapsedAreas] = useState<Record<string, boolean>>({});
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

  // Machine Task Deconstruction Studio state
  const [showDeconstructStudio, setShowDeconstructStudio] = useState(false);
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [isDeconstructing, setIsDeconstructing] = useState(false);
  const [studioTab, setStudioTab] = useState<'spec' | 'architecture' | 'requirements' | 'milestones'>('spec');

  const [parsedDoc, setParsedDoc] = useState<{
    filename: string;
    unique_filename: string;
    file_url: string;
    file_type: string;
    extracted_text: string;
    suggested_title: string;
    summary: string;
  } | null>(null);

  const [studioTitle, setStudioTitle] = useState('');
  const [studioModule, setStudioModule] = useState('BM1');
  const [studioWeek, setStudioWeek] = useState(1);
  const [studioPriority, setStudioPriority] = useState('URGENT');
  const [studioLearningArea, setStudioLearningArea] = useState('Python');
  const [studioExtractedText, setStudioExtractedText] = useState('');
  const [studioCustomInstruction, setStudioCustomInstruction] = useState('');

  const [deconstructedData, setDeconstructedData] = useState<{
    overview?: string;
    architecture?: {
      pattern?: string;
      components?: Array<{ name: string; responsibility: string; methods_or_interfaces?: string[] }>;
      data_flow?: string;
      diagram_ascii?: string;
    };
    requirements_matrix?: {
      core_requirements?: string[];
      edge_cases?: string[];
      testing_criteria?: string[];
    };
    milestone_roadmap?: Array<{
      phase: number;
      title: string;
      pacing: string;
      cognitive_focus: string;
      deliverables: string[];
    }>;
    suggested_subtasks?: Array<{
      title: string;
      description: string;
      task_type: string;
      priority: string;
    }>;
  } | null>(null);

  const [createPhasedWorkouts, setCreatePhasedWorkouts] = useState(true);
  const [savingStructuredTask, setSavingStructuredTask] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setIsParsingDoc(true);
      setShowUploadModal(false);
      setShowDeconstructStudio(true);
      setDeconstructedData(null);
      setStudioTab('spec');

      try {
        const res = await api.parseDocument(file);
        setParsedDoc(res);
        setStudioTitle(res.suggested_title || file.name.replace(/\.[^/.]+$/, ''));
        setStudioExtractedText(res.extracted_text || '');
        setStudioLearningArea(selectedArea !== 'ALL' ? selectedArea : 'Python');
      } catch (err: any) {
        console.error(err);
        setStudioTitle(file.name.replace(/\.[^/.]+$/, ''));
        setStudioExtractedText(`## ${file.name}\n\n(Document parsing notice: ${err.message || 'Manual entry active'}). You can edit or paste task requirements here.`);
      } finally {
        setIsParsingDoc(false);
      }
    }
  };

  const submitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      fileInputRef.current?.click();
      return;
    }
    setShowUploadModal(false);
    setShowDeconstructStudio(true);
  };

  const handleDeconstruct = async () => {
    if (!studioExtractedText.trim()) return;
    setIsDeconstructing(true);
    try {
      const res = await api.deconstructSpec(
        studioExtractedText,
        studioTitle,
        studioModule,
        studioCustomInstruction
      );
      setDeconstructedData(res);
      if (res.title && !studioTitle) {
        setStudioTitle(res.title);
      }
      setStudioTab('architecture');
    } catch (err: any) {
      alert(`AI Deconstruction Notice: ${err.message || 'Failed to generate architecture'}. Verify your Gemini API Key in Settings.`);
    } finally {
      setIsDeconstructing(false);
    }
  };

  const handleSaveStructuredTask = async () => {
    if (!studioTitle.trim()) return;
    setSavingStructuredTask(true);

    try {
      const matchingTask = tasks.find((t) => t.learning_area_title === studioLearningArea);
      const learningAreaId = matchingTask?.learning_area_id;

      let fullSpecMarkdown = `# ${studioTitle}\n`;
      fullSpecMarkdown += `**Module:** ${studioModule} | **Week:** ${studioWeek} | **Priority:** ${studioPriority}\n`;
      if (parsedDoc?.filename) {
        fullSpecMarkdown += `**Attachment:** \`${parsedDoc.filename}\`\n`;
      }
      fullSpecMarkdown += `\n---\n\n`;

      if (deconstructedData?.overview) {
        fullSpecMarkdown += `### Executive Summary\n${deconstructedData.overview}\n\n`;
      }

      if (deconstructedData?.architecture) {
        fullSpecMarkdown += `### System Architecture & Components\n`;
        if (deconstructedData.architecture.pattern) {
          fullSpecMarkdown += `**Pattern:** \`${deconstructedData.architecture.pattern}\`\n\n`;
        }
        if (deconstructedData.architecture.components) {
          fullSpecMarkdown += `| Component | Responsibility | Interfaces / Methods |\n`;
          fullSpecMarkdown += `| :--- | :--- | :--- |\n`;
          deconstructedData.architecture.components.forEach((c) => {
            const methods = (c.methods_or_interfaces || []).join(', ') || '-';
            fullSpecMarkdown += `| **${c.name}** | ${c.responsibility} | \`${methods}\` |\n`;
          });
          fullSpecMarkdown += `\n`;
        }
        if (deconstructedData.architecture.data_flow) {
          fullSpecMarkdown += `**Data Flow:**\n${deconstructedData.architecture.data_flow}\n\n`;
        }
        if (deconstructedData.architecture.diagram_ascii) {
          fullSpecMarkdown += `\`\`\`\n${deconstructedData.architecture.diagram_ascii}\n\`\`\`\n\n`;
        }
      }

      if (deconstructedData?.requirements_matrix) {
        fullSpecMarkdown += `### Requirements & Edge Cases Matrix\n`;
        if (deconstructedData.requirements_matrix.core_requirements?.length) {
          fullSpecMarkdown += `#### Core Requirements\n`;
          deconstructedData.requirements_matrix.core_requirements.forEach((r) => {
            fullSpecMarkdown += `- [ ] ${r}\n`;
          });
          fullSpecMarkdown += `\n`;
        }
        if (deconstructedData.requirements_matrix.edge_cases?.length) {
          fullSpecMarkdown += `#### Critical Edge Cases & Failure Modes\n`;
          deconstructedData.requirements_matrix.edge_cases.forEach((e) => {
            fullSpecMarkdown += `- [ ] ⚠️ ${e}\n`;
          });
          fullSpecMarkdown += `\n`;
        }
        if (deconstructedData.requirements_matrix.testing_criteria?.length) {
          fullSpecMarkdown += `#### Testing & Verification Criteria\n`;
          deconstructedData.requirements_matrix.testing_criteria.forEach((t) => {
            fullSpecMarkdown += `- [ ] 🧪 ${t}\n`;
          });
          fullSpecMarkdown += `\n`;
        }
      }

      if (deconstructedData?.milestone_roadmap?.length) {
        fullSpecMarkdown += `### Phased Implementation Roadmap\n`;
        deconstructedData.milestone_roadmap.forEach((m) => {
          fullSpecMarkdown += `#### Phase ${m.phase}: ${m.title} (${m.pacing})\n`;
          fullSpecMarkdown += `*Cognitive Focus:* ${m.cognitive_focus}\n\n`;
          m.deliverables.forEach((d) => {
            fullSpecMarkdown += `- [ ] ${d}\n`;
          });
          fullSpecMarkdown += `\n`;
        });
      }

      fullSpecMarkdown += `### Extracted Document Content\n${studioExtractedText}\n`;

      await api.createStructuredMachineTask({
        title: studioTitle,
        module_code: studioModule,
        week_number: studioWeek,
        priority: studioPriority,
        learning_area_id: learningAreaId,
        overview: deconstructedData?.overview || studioExtractedText.slice(0, 200),
        spec_markdown: fullSpecMarkdown,
        attachment_url: parsedDoc?.file_url,
        attachment_filename: parsedDoc?.filename,
        create_subtasks: createPhasedWorkouts,
        subtasks: deconstructedData?.suggested_subtasks,
      });

      await loadTasks();
      setShowDeconstructStudio(false);
      setParsedDoc(null);
      setDeconstructedData(null);
    } catch (err: any) {
      alert(`Error saving machine task: ${err.message || 'Failed to save'}`);
    } finally {
      setSavingStructuredTask(false);
    }
  };

  // Distinct sorted areas list for navigation tabs
  const areaList = React.useMemo(() => {
    const areas = new Set<string>();
    tasks.forEach((t) => {
      if (t.learning_area_title) areas.add(t.learning_area_title);
    });
    // Order canonically if possible
    const canonicalOrder = [
      'Python',
      'Data Handling & Visualization',
      'Data Structures & Algorithms',
      'Mathematics & Statistics',
      'Machine Learning Concepts',
      'SQL for Data & ML',
      'Live Project & Presentation',
    ];
    return Array.from(areas).sort((a, b) => {
      const idxA = canonicalOrder.indexOf(a);
      const idxB = canonicalOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [tasks]);

  const toggleAreaCollapse = (areaName: string) => {
    setCollapsedAreas((prev) => ({
      ...prev,
      [areaName]: !prev[areaName],
    }));
  };

  // Filtration logic
  const filtered = tasks.filter((t) => {
    if (selectedCategory && t.learning_area_title !== selectedCategory) return false;
    if (selectedArea !== 'ALL' && t.learning_area_title !== selectedArea) return false;
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

  // Group filtered tasks into Area Cards with prioritization inside each area
  const groupedAreas = React.useMemo(() => {
    const map = new Map<string, Task[]>();
    const priorityScore: Record<string, number> = {
      URGENT: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    filtered.forEach((task) => {
      const area = task.learning_area_title || 'General Tasks';
      if (!map.has(area)) {
        map.set(area, []);
      }
      map.get(area)!.push(task);
    });

    // Sort tasks in each area:
    // 1. Pending (TODO, IN_PROGRESS) before COMPLETED
    // 2. Higher priority first (URGENT > HIGH > MEDIUM > LOW)
    // 3. Fallback to topic_id or id
    map.forEach((taskList) => {
      taskList.sort((a, b) => {
        if (a.user_status === 'COMPLETED' && b.user_status !== 'COMPLETED') return 1;
        if (a.user_status !== 'COMPLETED' && b.user_status === 'COMPLETED') return -1;
        const pA = priorityScore[a.priority] || 0;
        const pB = priorityScore[b.priority] || 0;
        if (pB !== pA) return pB - pA;
        return (a.topic_id || a.id) - (b.topic_id || b.id);
      });
    });

    return map;
  }, [filtered]);

  // Scope-aware counts for status pills (scoped to selected category if entered)
  const scopeTasks = selectedCategory
    ? tasks.filter((t) => t.learning_area_title === selectedCategory)
    : tasks;

  const totalCount = scopeTasks.length;
  const todoCount = scopeTasks.filter((t) => t.user_status === 'TODO').length;
  const inProgressCount = scopeTasks.filter((t) => t.user_status === 'IN_PROGRESS').length;
  const completedCount = scopeTasks.filter((t) => t.user_status === 'COMPLETED').length;

  const hasActiveFilters =
    selectedArea !== 'ALL' ||
    statusFilter !== 'ALL' ||
    moduleFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedArea('ALL');
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
      {/* Top Navigation & Breadcrumbs Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8ECE6] hover:bg-[#DDE2DA] dark:bg-[#1E2320] dark:hover:bg-[#262C28] text-[#161917] dark:text-[#9DE8BA] border border-[#CCD2C8] dark:border-[#2F3732] text-xs font-bold transition-all shadow-xs hover:scale-[1.01] active:scale-[0.99]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#161917] dark:text-[#9DE8BA]" />
              <span>Back to Dashboard</span>
            </button>
          )}

          {selectedCategory ? (
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8ECE6] hover:bg-[#DDE2DA] dark:bg-[#1E2320] dark:hover:bg-[#262C28] text-[#161917] dark:text-[#9DE8BA] border border-[#CCD2C8] dark:border-[#2F3732] text-xs font-bold transition-all shadow-xs hover:scale-[1.01] active:scale-[0.99]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#161917] dark:text-[#9DE8BA]" />
              <span>All Categories</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs text-[#888F89] dark:text-[#767C77] font-mono">
              <BookOpen className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#9DE8BA]" />
              <span>Curriculum Execution Hub</span>
            </div>
          )}

          {selectedCategory && (
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-[#888F89] dark:text-[#767C77]">/</span>
              <span className="font-bold text-[#161917] dark:text-white">
                {selectedCategory}
              </span>
            </div>
          )}
        </div>

        {/* View Switcher: Category Cards vs All Workouts */}
        <div className="flex items-center space-x-1 bg-[#F0F1EC] dark:bg-[#202422] p-1 rounded-full border border-[#E3E5DE] dark:border-[#2E3330] text-xs self-start sm:self-auto">
          <button
            onClick={() => {
              setViewMode('categories');
              setSelectedCategory(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
              viewMode === 'categories' && !selectedCategory
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Category Cards</span>
          </button>
          <button
            onClick={() => {
              setViewMode('all');
              setSelectedCategory(null);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
              viewMode === 'all'
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>All Workouts ({totalCount})</span>
          </button>
        </div>
      </div>

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase text-[#888F89] dark:text-[#767C77] font-semibold">
            {selectedCategory ? 'CURRICULUM CATEGORY' : 'PRACTICAL EXECUTION'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#161917] dark:text-white tracking-tight mt-0.5">
            {selectedCategory ? selectedCategory : 'Tasks & Workouts'}
          </h1>
          <p className="text-xs text-[#6B7280] dark:text-[#8E948F] font-mono mt-1">
            {selectedCategory
              ? CATEGORY_META[selectedCategory]?.description || 'Prioritized technical workouts & machine tasks.'
              : 'Choose a primary category card below to enter and complete its machine tasks and workouts.'}
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
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs ${moduleFilter !== 'ALL'
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
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${moduleFilter === opt.value
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
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs ${typeFilter !== 'ALL'
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
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${typeFilter === opt.value
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
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs ${priorityFilter !== 'ALL'
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
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${priorityFilter === opt.value
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

        {/* Right: Status Segmented Control & Top Expand/Collapse Buttons */}
        <div className="flex items-center space-x-2 self-start lg:self-auto shrink-0 flex-wrap gap-y-2">
          {/* Status Segmented Control with Live Item Counts */}
          <div className="flex items-center space-x-1 bg-[#F0F1EC] dark:bg-[#202422] p-1 rounded-full border border-[#E3E5DE] dark:border-[#2E3330] text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${statusFilter === 'ALL'
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
                }`}
            >
              All <span className="text-[10px] font-mono opacity-70">({totalCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('TODO')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${statusFilter === 'TODO'
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
                }`}
            >
              Todo <span className="text-[10px] font-mono opacity-70">({todoCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${statusFilter === 'IN_PROGRESS'
                ? 'bg-white dark:bg-[#161917] text-[#634800] dark:text-[#FCE8A6] shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
                }`}
            >
              In Progress <span className="text-[10px] font-mono opacity-70">({inProgressCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${statusFilter === 'COMPLETED'
                ? 'bg-white dark:bg-[#161917] text-[#19522F] dark:text-[#A3E8B5] shadow-xs'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
                }`}
            >
              Done <span className="text-[10px] font-mono opacity-70">({completedCount})</span>
            </button>
          </div>

          {/* Expand / Collapse All Toggle (Always visible in initial viewport) */}
          <div className="flex items-center space-x-1 bg-[#F0F1EC] dark:bg-[#202422] p-1 rounded-full border border-[#E3E5DE] dark:border-[#2E3330] text-xs font-semibold">
            <button
              onClick={() => setCollapsedAreas({})}
              title="Expand all cards"
              className="px-2.5 py-1 rounded-full text-[#525752] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white hover:bg-white dark:hover:bg-[#161917] transition-all"
            >
              Expand All
            </button>
            <span className="text-[#888F89] dark:text-[#666B67]">•</span>
            <button
              onClick={() => {
                const next: Record<string, boolean> = {};
                areaList.forEach((a) => (next[a] = true));
                setCollapsedAreas(next);
              }}
              title="Collapse all cards"
              className="px-2.5 py-1 rounded-full text-[#525752] dark:text-[#A3AAA4] hover:text-[#161917] dark:hover:text-white hover:bg-white dark:hover:bg-[#161917] transition-all"
            >
              Collapse All
            </button>
          </div>
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
                    accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp"
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
                        PDF, Image (PNG/JPG), DOCX, or MD specifications
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
                  Open Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Machine Task Deconstruction Studio Modal */}
      {showDeconstructStudio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121513] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Studio Header */}
            <div className="p-5 sm:p-6 border-b border-[#F0F1EC] dark:border-[#202422] flex items-center justify-between shrink-0 bg-[#FAFAF8] dark:bg-[#161917]/70">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-[#9DE8BA]/20 text-[#0D381E] dark:text-[#9DE8BA]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#161917] dark:text-white">
                      Machine Task Architecture & Deconstruction Studio
                    </h2>
                    {parsedDoc && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#E5E7EB] dark:bg-[#202422] text-[#4B5563] dark:text-[#9CA3AF]">
                        {parsedDoc.file_type.toUpperCase()} SPEC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#8E948F]">
                    {parsedDoc?.filename ? `Attached: ${parsedDoc.filename}` : 'Review, structure, and architect machine task requirements'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDeconstructStudio(false);
                  setParsedDoc(null);
                  setDeconstructedData(null);
                }}
                className="p-1.5 rounded-full text-[#6B7280] hover:text-[#161917] dark:hover:text-white hover:bg-[#E5E7EB] dark:hover:bg-[#202422] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Parsing Document Loading Overlay */}
            {isParsingDoc ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-10 h-10 border-3 border-[#9DE8BA] border-t-transparent rounded-full animate-spin" />
                <div>
                  <h3 className="text-sm font-bold text-[#161917] dark:text-white">
                    Extracting Document Specification...
                  </h3>
                  <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-1 max-w-sm">
                    Parsing text, diagrams, and formatting from your uploaded PDF or image.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Meta Configuration Toolbar */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#1A1E1B] border border-[#E3E5DE] dark:border-[#262A27]">
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#8E948F] uppercase tracking-wider mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={studioTitle}
                      onChange={(e) => setStudioTitle(e.target.value)}
                      placeholder="e.g. Week 1 Custom CLI Cache Parser"
                      className="w-full bg-white dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#161917] dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#8E948F] uppercase tracking-wider mb-1">
                      Stage / Module
                    </label>
                    <select
                      value={studioModule}
                      onChange={(e) => setStudioModule(e.target.value)}
                      className="w-full bg-white dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#161917] dark:text-white focus:outline-none"
                    >
                      <option value="BM1">BM1 (Benchmark 1)</option>
                      <option value="BM2">BM2 (Locked)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#8E948F] uppercase tracking-wider mb-1">
                      Week Pacing
                    </label>
                    <select
                      value={studioWeek}
                      onChange={(e) => setStudioWeek(Number(e.target.value))}
                      className="w-full bg-white dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#161917] dark:text-white focus:outline-none"
                    >
                      <option value={1}>Week 1</option>
                      <option value={2}>Week 2</option>
                      <option value={3}>Week 3</option>
                      <option value={4}>Week 4</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-[#6B7280] dark:text-[#8E948F] uppercase tracking-wider mb-1">
                      Learning Area Card
                    </label>
                    <select
                      value={studioLearningArea}
                      onChange={(e) => setStudioLearningArea(e.target.value)}
                      className="w-full bg-white dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#161917] dark:text-white focus:outline-none"
                    >
                      {areaList.map((areaName) => (
                        <option key={areaName} value={areaName}>
                          {areaName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* AI Architectural Deconstruction Banner */}
                <div className="p-4 rounded-2xl bg-linear-to-r from-[#9DE8BA]/15 via-[#6EE7B7]/10 to-transparent dark:from-[#9DE8BA]/10 dark:to-transparent border border-[#9DE8BA]/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-[#0D381E] dark:text-[#9DE8BA] flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>LLM Cognitive Deconstructor & Architecture Generator</span>
                      </h4>
                      <p className="text-[11px] text-[#4B5563] dark:text-[#A3AAA4] mt-0.5">
                        Reduces cognitive overload by converting raw specs into modular system design, explicit edge-case checklists, and a 4-phase weekly roadmap.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeconstruct}
                      disabled={isDeconstructing || !studioExtractedText.trim()}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-[#0D381E] dark:bg-[#9DE8BA] text-white dark:text-[#0D381E] text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0 shadow-xs"
                    >
                      {isDeconstructing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Architecting Spec...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Deconstruct & Plan Architecture</span>
                        </>
                      )}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={studioCustomInstruction}
                    onChange={(e) => setStudioCustomInstruction(e.target.value)}
                    placeholder="Optional design emphasis (e.g. 'Use Click library for CLI', 'Focus on concurrency edge cases', 'Low memory usage')..."
                    className="w-full bg-white/80 dark:bg-[#161917]/80 border border-[#9DE8BA]/40 rounded-xl px-3 py-1.5 text-xs text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
                  />
                </div>

                {/* Studio Tabs Navigation */}
                <div className="flex items-center space-x-2 border-b border-[#F0F1EC] dark:border-[#202422] pb-2">
                  <button
                    type="button"
                    onClick={() => setStudioTab('spec')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      studioTab === 'spec'
                        ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                        : 'text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC] dark:hover:bg-[#202422]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>1. Extracted Spec</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioTab('architecture')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      studioTab === 'architecture'
                        ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                        : 'text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC] dark:hover:bg-[#202422]'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>2. Architecture & Modules</span>
                    {deconstructedData?.architecture && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioTab('requirements')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      studioTab === 'requirements'
                        ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                        : 'text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC] dark:hover:bg-[#202422]'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>3. Requirements & Edge Cases</span>
                    {deconstructedData?.requirements_matrix && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudioTab('milestones')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      studioTab === 'milestones'
                        ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                        : 'text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC] dark:hover:bg-[#202422]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>4. Phased Milestones (Anti-Overwhelm)</span>
                    {deconstructedData?.milestone_roadmap && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    )}
                  </button>
                </div>

                {/* Tab 1: Extracted Specification */}
                {studioTab === 'spec' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#6B7280] dark:text-[#8E948F]">
                      <span className="font-semibold">Review and edit the extracted specification text:</span>
                      <span className="font-mono text-[11px]">
                        {studioExtractedText.length} chars • {studioExtractedText.split(/\s+/).filter(Boolean).length} words
                      </span>
                    </div>
                    <textarea
                      rows={14}
                      value={studioExtractedText}
                      onChange={(e) => setStudioExtractedText(e.target.value)}
                      placeholder="Extracted document specification will appear here..."
                      className="w-full bg-[#F7F8F5] dark:bg-[#1A1E1B] border border-[#E3E5DE] dark:border-[#262A27] rounded-2xl p-4 text-xs font-mono leading-relaxed text-[#161917] dark:text-white focus:outline-none resize-y"
                    />
                  </div>
                )}

                {/* Tab 2: System Architecture & Modules */}
                {studioTab === 'architecture' && (
                  <div className="space-y-4">
                    {deconstructedData?.architecture ? (
                      <>
                        {deconstructedData.architecture.pattern && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#6B7280] dark:text-[#8E948F]">
                              ARCHITECTURAL PATTERN:
                            </span>
                            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#D4E2F8] dark:bg-[#1E3A68] text-[#1E3A68] dark:text-[#93C5FD]">
                              {deconstructedData.architecture.pattern}
                            </span>
                          </div>
                        )}

                        {/* Component Hierarchy */}
                        {deconstructedData.architecture.components && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-[#161917] dark:text-white uppercase tracking-wider">
                              Component & Module Contracts
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {deconstructedData.architecture.components.map((c, i) => (
                                <div
                                  key={i}
                                  className="p-3.5 rounded-2xl bg-[#F7F8F5] dark:bg-[#1A1E1B] border border-[#E3E5DE] dark:border-[#262A27] space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold font-mono text-[#0D381E] dark:text-[#9DE8BA]">
                                      {c.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#6B7280] dark:text-[#8E948F]">
                                      Module #{i + 1}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB]">
                                    {c.responsibility}
                                  </p>
                                  {c.methods_or_interfaces?.length ? (
                                    <div className="pt-1 flex flex-wrap gap-1">
                                      {c.methods_or_interfaces.map((m, mi) => (
                                        <span
                                          key={mi}
                                          className="text-[10px] font-mono bg-white dark:bg-[#262A27] px-2 py-0.5 rounded border border-[#E5E7EB] dark:border-[#374151] text-[#374151] dark:text-[#9CA3AF]"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Data Flow */}
                        {deconstructedData.architecture.data_flow && (
                          <div className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#1A1E1B] border border-[#E3E5DE] dark:border-[#262A27] space-y-1.5">
                            <h4 className="text-xs font-bold text-[#161917] dark:text-white uppercase tracking-wider">
                              Data Flow & Lifecycle
                            </h4>
                            <p className="text-xs leading-relaxed text-[#4B5563] dark:text-[#D1D5DB]">
                              {deconstructedData.architecture.data_flow}
                            </p>
                          </div>
                        )}

                        {/* ASCII Diagram */}
                        {deconstructedData.architecture.diagram_ascii && (
                          <div className="space-y-1.5">
                            <h4 className="text-xs font-bold text-[#161917] dark:text-white uppercase tracking-wider">
                              System Architecture Diagram
                            </h4>
                            <pre className="p-4 rounded-2xl bg-[#161917] text-[#9DE8BA] font-mono text-xs overflow-x-auto leading-relaxed border border-[#2E3330]">
                              {deconstructedData.architecture.diagram_ascii}
                            </pre>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-[#E3E5DE] dark:border-[#2E3330] space-y-3">
                        <Cpu className="w-8 h-8 mx-auto text-[#888F89]" />
                        <h4 className="text-xs font-bold text-[#161917] dark:text-white">
                          No Architecture Generated Yet
                        </h4>
                        <p className="text-xs text-[#6B7280] dark:text-[#8E948F] max-w-md mx-auto">
                          Click <strong>"Deconstruct & Plan Architecture"</strong> above to have the LLM decompose this task into clean module boundaries and ASCII data flow.
                        </p>
                        <button
                          type="button"
                          onClick={handleDeconstruct}
                          disabled={isDeconstructing || !studioExtractedText.trim()}
                          className="px-4 py-2 rounded-xl bg-[#0D381E] dark:bg-[#9DE8BA] text-white dark:text-[#0D381E] text-xs font-bold hover:opacity-90"
                        >
                          Generate Architecture Now
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 3: Requirements & Edge Cases */}
                {studioTab === 'requirements' && (
                  <div className="space-y-4">
                    {deconstructedData?.requirements_matrix ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Core Requirements */}
                        <div className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#1A1E1B] border border-[#E3E5DE] dark:border-[#262A27] space-y-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                            <h4 className="text-xs font-bold text-[#161917] dark:text-white uppercase tracking-wider">
                              Core Requirements
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {(deconstructedData.requirements_matrix.core_requirements || []).map((r, i) => (
                              <li key={i} className="text-xs text-[#374151] dark:text-[#D1D5DB] flex items-start space-x-2">
                                <span className="text-[#10B981] font-bold">✓</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Critical Edge Cases */}
                        <div className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#1A1E1B] border border-[#E3E5DE] dark:border-[#262A27] space-y-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                            <h4 className="text-xs font-bold text-[#161917] dark:text-white uppercase tracking-wider">
                              Critical Edge Cases
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {(deconstructedData.requirements_matrix.edge_cases || []).map((e, i) => (
                              <li key={i} className="text-xs text-[#374151] dark:text-[#D1D5DB] flex items-start space-x-2">
                                <span className="text-[#F59E0B] font-bold">⚠️</span>
                                <span>{e}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Testing Criteria */}
                        <div className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#1A1E1B] border border-[#E3E5DE] dark:border-[#262A27] space-y-2.5">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                            <h4 className="text-xs font-bold text-[#161917] dark:text-white uppercase tracking-wider">
                              Testing & Verifications
                            </h4>
                          </div>
                          <ul className="space-y-2">
                            {(deconstructedData.requirements_matrix.testing_criteria || []).map((t, i) => (
                              <li key={i} className="text-xs text-[#374151] dark:text-[#D1D5DB] flex items-start space-x-2">
                                <span className="text-[#3B82F6] font-bold">🧪</span>
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-[#E3E5DE] dark:border-[#2E3330] space-y-3">
                        <CheckSquare className="w-8 h-8 mx-auto text-[#888F89]" />
                        <h4 className="text-xs font-bold text-[#161917] dark:text-white">
                          No Requirements Matrix Generated
                        </h4>
                        <p className="text-xs text-[#6B7280] dark:text-[#8E948F] max-w-md mx-auto">
                          Run the AI Cognitive Deconstructor to extract Must-Haves, Edge Cases, and automated test criteria.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Phased Milestones & Weekly Pacing */}
                {studioTab === 'milestones' && (
                  <div className="space-y-4">
                    {deconstructedData?.milestone_roadmap?.length ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {deconstructedData.milestone_roadmap.map((m, i) => (
                            <div
                              key={i}
                              className="p-4 rounded-2xl bg-[#F7F8F5] dark:bg-[#1A1E1B] border border-[#E3E5DE] dark:border-[#262A27] space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#161917] dark:text-white">
                                  Phase {m.phase}: {m.title}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E5E7EB] dark:bg-[#202422] text-[#4B5563] dark:text-[#9CA3AF]">
                                  {m.pacing}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-[#121513] border border-[#E5E7EB] dark:border-[#262A27]">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] block">
                                  Cognitive Focus:
                                </span>
                                <p className="text-xs text-[#0D381E] dark:text-[#9DE8BA] font-medium mt-0.5">
                                  {m.cognitive_focus}
                                </p>
                              </div>

                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] block">
                                  Deliverables:
                                </span>
                                {m.deliverables.map((d, di) => (
                                  <div key={di} className="text-xs text-[#374151] dark:text-[#D1D5DB] flex items-center space-x-1.5">
                                    <span className="text-[#10B981]">▸</span>
                                    <span>{d}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Phased Workouts Generation Option */}
                        <div className="p-4 rounded-2xl bg-[#CDE9D6]/30 dark:bg-[#1A2E20]/40 border border-[#9DE8BA]/40 flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="createPhased"
                            checked={createPhasedWorkouts}
                            onChange={(e) => setCreatePhasedWorkouts(e.target.checked)}
                            className="w-4 h-4 rounded text-[#0D381E] focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="createPhased" className="text-xs font-semibold text-[#161917] dark:text-white cursor-pointer select-none">
                            Automatically create {deconstructedData.suggested_subtasks?.length || 4} prioritized sub-task workouts in my <strong>{studioLearningArea}</strong> card for progressive execution.
                          </label>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-[#E3E5DE] dark:border-[#2E3330] space-y-3">
                        <Calendar className="w-8 h-8 mx-auto text-[#888F89]" />
                        <h4 className="text-xs font-bold text-[#161917] dark:text-white">
                          No Phased Milestones Yet
                        </h4>
                        <p className="text-xs text-[#6B7280] dark:text-[#8E948F] max-w-md mx-auto">
                          Click "Deconstruct & Plan Architecture" to decompose the task into 4 low-stress implementation phases.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Studio Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#F0F1EC] dark:border-[#202422] flex items-center justify-between shrink-0 bg-[#FAFAF8] dark:bg-[#161917]/70">
              <button
                type="button"
                onClick={() => {
                  setShowDeconstructStudio(false);
                  setParsedDoc(null);
                  setDeconstructedData(null);
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#6B7280] dark:text-[#8E948F] hover:bg-[#F0F1EC] dark:hover:bg-[#202422] transition-colors"
              >
                Discard
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleSaveStructuredTask}
                  disabled={savingStructuredTask || !studioTitle.trim()}
                  className="px-6 py-2.5 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm flex items-center space-x-2"
                >
                  {savingStructuredTask ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Saving Task & Workouts...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        Save & Create Machine Task
                        {createPhasedWorkouts && deconstructedData?.suggested_subtasks?.length
                          ? ` (+ ${deconstructedData.suggested_subtasks.length} Phased Workouts)`
                          : ''}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
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
                <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full ${focusedTask.task_type === 'MACHINE_TASK' || focusedTask.task_type === 'CODING'
                  ? 'bg-[#FDD7AE] text-[#7A3E00]'
                  : focusedTask.task_type === 'PRACTICE'
                    ? 'bg-[#CDE9D6] text-[#19522F]'
                    : 'bg-[#D4E2F8] text-[#1E3A68]'
                  }`}>
                  {focusedTask.task_type.replace('_', ' ')}
                </span>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${focusedTask.priority === 'URGENT'
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
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono transition-colors ${focusedTask.user_status === 'TODO'
                      ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                      : 'bg-white dark:bg-[#161917] text-[#6B7280] hover:text-[#161917]'
                      }`}
                  >
                    TODO
                  </button>
                  <button
                    onClick={() => handleStatusChange(focusedTask.id, 'IN_PROGRESS')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono transition-colors ${focusedTask.user_status === 'IN_PROGRESS'
                      ? 'bg-[#FCE8A6] text-[#634800]'
                      : 'bg-white dark:bg-[#161917] text-[#6B7280] hover:text-[#161917]'
                      }`}
                  >
                    IN PROGRESS
                  </button>
                  <button
                    onClick={() => handleStatusChange(focusedTask.id, 'COMPLETED')}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold font-mono transition-colors ${focusedTask.user_status === 'COMPLETED'
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

      {/* Category Pills Bar (when category is selected or in All Workouts mode) */}
      {(selectedCategory !== null || viewMode === 'all') && (
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setViewMode('categories');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-xs flex items-center space-x-1.5 ${
                selectedCategory === null
                  ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                  : 'bg-white dark:bg-[#161917] text-[#525752] dark:text-[#A3AAA4] border border-[#E3E5DE] dark:border-[#262A27] hover:border-[#161917] dark:hover:border-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Categories ({areaList.length})</span>
            </button>
            {areaList.map((areaName) => {
              const areaTasks = tasks.filter((t) => t.learning_area_title === areaName);
              const areaDone = areaTasks.filter((t) => t.user_status === 'COMPLETED').length;
              const isSelected = selectedCategory === areaName;
              return (
                <button
                  key={areaName}
                  onClick={() => setSelectedCategory(areaName)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center space-x-1.5 transition-all shadow-xs ${
                    isSelected
                      ? 'bg-[#161917] text-white dark:bg-white dark:text-[#161917]'
                      : 'bg-white dark:bg-[#161917] text-[#525752] dark:text-[#A3AAA4] border border-[#E3E5DE] dark:border-[#262A27] hover:border-[#161917] dark:hover:border-white'
                  }`}
                >
                  <span>{areaName}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-[#161917]/20 dark:text-[#161917]'
                        : 'bg-[#F0F1EC] dark:bg-[#202422] text-[#888F89]'
                    }`}
                  >
                    {areaDone}/{areaTasks.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Category Header Banner (When user has entered a category) */}
      {selectedCategory && (
        <div className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {(() => {
              const meta = CATEGORY_META[selectedCategory] || {
                icon: BookOpen,
                colorBgLight: 'bg-emerald-500/10 border-emerald-500/20',
                colorBgDark: 'dark:bg-emerald-500/15 dark:border-emerald-500/30',
                textColor: 'text-emerald-600 dark:text-emerald-400',
                badge: 'Curriculum Area',
              };
              const IconComp = meta.icon;
              return (
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${meta.colorBgLight} ${meta.colorBgDark} ${meta.textColor}`}
                >
                  <IconComp className="w-6 h-6" />
                </div>
              );
            })()}
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-xl font-bold text-[#161917] dark:text-white">
                  {selectedCategory}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#161917] text-white dark:bg-white dark:text-[#161917]">
                  {tasks.find((t) => t.learning_area_title === selectedCategory)?.module_code || 'BM1'}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border border-[#E3E5DE] dark:border-[#2E3330]">
                  {CATEGORY_META[selectedCategory]?.badge || 'Workouts'}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {completedCount}/{totalCount} Completed
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#8E948F] mt-1 max-w-2xl leading-relaxed">
                {CATEGORY_META[selectedCategory]?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-[#E8ECE6] hover:bg-[#DDE2DA] dark:bg-[#1E2320] dark:hover:bg-[#282F2A] text-[#161917] dark:text-[#9DE8BA] border border-[#CCD2C8] dark:border-[#2F3732] text-xs font-bold transition-all shadow-xs hover:scale-[1.01] active:scale-[0.99]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#161917] dark:text-[#9DE8BA]" />
              <span>Back to Categories</span>
            </button>
          </div>
        </div>
      )}

      {/* Main View Switching: Primary Category Cards vs Workouts */}
      {selectedCategory === null && viewMode === 'categories' ? (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#161917] dark:text-white tracking-tight">
                Curriculum Categories
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#8E948F] font-mono">
                Click any category card to enter and view its prioritized tasks, machine tests, and coding exercises.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#E5E7EB] dark:bg-[#202422] text-[#4B5563] dark:text-[#9CA3AF]">
              {areaList.length} Categories • {tasks.length} Total Workouts
            </span>
          </div>

          {/* Primary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {areaList.map((areaName) => {
              const meta = CATEGORY_META[areaName] || {
                icon: BookOpen,
                colorBgLight: 'bg-emerald-500/10 border-emerald-500/20',
                colorBgDark: 'dark:bg-emerald-500/15 dark:border-emerald-500/30',
                textColor: 'text-emerald-600 dark:text-emerald-400',
                badge: 'Curriculum Area',
                description: 'Prioritized technical workouts, coding exercises, and practice workouts.',
                defaultModule: 'BM1',
              };
              const IconComponent = meta.icon;

              const areaTasks = tasks.filter((t) => t.learning_area_title === areaName);
              const areaDone = areaTasks.filter((t) => t.user_status === 'COMPLETED').length;
              const areaTotal = areaTasks.length;
              const percent = areaTotal > 0 ? Math.round((areaDone / areaTotal) * 100) : 0;

              const urgentCount = areaTasks.filter((t) => t.priority === 'URGENT').length;
              const highCount = areaTasks.filter((t) => t.priority === 'HIGH').length;
              const moduleCode = areaTasks[0]?.module_code || meta.defaultModule || 'BM1';

              // Search query filtering
              const query = searchQuery.trim().toLowerCase();
              const matchingWorkoutCount = query
                ? areaTasks.filter(
                    (t) =>
                      t.title.toLowerCase().includes(query) ||
                      t.description?.toLowerCase().includes(query)
                  ).length
                : 0;

              if (query && !areaName.toLowerCase().includes(query) && matchingWorkoutCount === 0) {
                return null;
              }

              return (
                <div
                  key={areaName}
                  onClick={() => setSelectedCategory(areaName)}
                  className="group relative bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] hover:border-[#161917] dark:hover:border-[#9DE8BA] rounded-3xl p-6 transition-all duration-200 shadow-xs hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Top Row: Module Badge, Area Badge, and Category Icon */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#161917] text-white dark:bg-white dark:text-[#161917]">
                          {moduleCode}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#F0F1EC] dark:bg-[#202422] text-[#525752] dark:text-[#A3AAA4] border border-[#E3E5DE] dark:border-[#2E3330]">
                          {meta.badge}
                        </span>
                      </div>

                      <div
                        className={`w-10 h-10 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 ${meta.colorBgLight} ${meta.colorBgDark} ${meta.textColor}`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Category Title & Summary */}
                    <div>
                      <h3 className="text-lg font-bold text-[#161917] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#9DE8BA] transition-colors tracking-tight">
                        {areaName}
                      </h3>
                      <p className="text-xs text-[#6B7280] dark:text-[#8E948F] leading-relaxed mt-1.5 line-clamp-3">
                        {meta.description}
                      </p>
                    </div>

                    {/* Priority breakdown & matching tags */}
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-1">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F0F1EC] dark:bg-[#202422] text-[#161917] dark:text-white">
                        {areaTotal} {areaTotal === 1 ? 'Workout' : 'Workouts'}
                      </span>
                      {urgentCount > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                          {urgentCount} Urgent
                        </span>
                      )}
                      {highCount > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                          {highCount} High
                        </span>
                      )}
                      {matchingWorkoutCount > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {matchingWorkoutCount} matches
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Progress Bar & Enter Action Button */}
                  <div className="pt-5 mt-4 border-t border-[#F0F1EC] dark:border-[#222624] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#888F89] dark:text-[#767C77]">Progression</span>
                      <span className="font-bold text-[#161917] dark:text-white">
                        {areaDone}/{areaTotal} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#F0F1EC] dark:bg-[#202422] rounded-full overflow-hidden border border-[#E3E5DE] dark:border-[#2E3330]">
                      <div
                        className="h-full bg-[#10B981] dark:bg-[#9DE8BA] transition-all duration-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-[#888F89] dark:text-[#767C77]">
                        Click card to enter
                      </span>
                      <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#161917] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#9DE8BA] transition-colors">
                        <span>Enter Category</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#888F89]">
          Loading tasks and workouts...
        </div>
      ) : groupedAreas.size > 0 ? (
        <div className="space-y-6">
          {Array.from(groupedAreas.entries()).map(([areaTitle, areaTasks]) => {
            const isCollapsed = collapsedAreas[areaTitle];
            const areaDone = areaTasks.filter((t) => t.user_status === 'COMPLETED').length;
            const areaTotal = areaTasks.length;
            const percent = Math.round((areaDone / areaTotal) * 100);

            // If inside a selectedCategory, render the workouts grid directly
            if (selectedCategory) {
              return (
                <div key={areaTitle} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {areaTasks.map((task) => {
                      const isDone = task.user_status === 'COMPLETED';
                      const isInProg = task.user_status === 'IN_PROGRESS';

                      return (
                        <div
                          key={task.id}
                          onClick={() => handleOpenTask(task)}
                          className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:-translate-y-0.5 hover:shadow-md cursor-pointer group ${
                            isDone
                              ? 'bg-[#F9FAF8] dark:bg-[#1A1E1C] border-[#E3E5DE] dark:border-[#262A27] opacity-80'
                              : 'bg-white dark:bg-[#1F2421] border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white'
                          }`}
                        >
                          <div>
                            {/* Priority & Type Badges */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                    task.priority === 'URGENT'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : task.priority === 'HIGH'
                                        ? 'bg-[#FCE8A6] text-[#634800]'
                                        : 'bg-[#F0F1EC] dark:bg-[#2A302D] text-[#6B7280]'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                                    task.task_type === 'MACHINE_TASK' || task.task_type === 'CODING'
                                      ? 'bg-[#FDD7AE] text-[#7A3E00]'
                                      : task.task_type === 'PRACTICE'
                                        ? 'bg-[#CDE9D6] text-[#19522F]'
                                        : 'bg-[#D4E2F8] text-[#1E3A68]'
                                  }`}
                                >
                                  {task.task_type.replace('_', ' ')}
                                </span>
                              </div>

                              {/* Toggle Completion */}
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

                            {/* Title */}
                            <h3
                              className={`text-sm font-bold tracking-tight mb-1.5 group-hover:text-[#2563EB] dark:group-hover:text-[#9DE8BA] transition-colors ${
                                isDone
                                  ? 'line-through text-[#888F89] dark:text-[#666B67]'
                                  : 'text-[#161917] dark:text-white'
                              }`}
                            >
                              {task.title}
                            </h3>

                            {/* Description */}
                            {task.description && (
                              <p className="text-xs text-[#6B7280] dark:text-[#8E948F] line-clamp-2 leading-relaxed mb-3">
                                {task.description}
                              </p>
                            )}

                            {/* Topic Title Link */}
                            {task.topic_title && (
                              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#888F89] dark:text-[#767C77] mb-3">
                                <span className="truncate">Topic: {task.topic_title}</span>
                              </div>
                            )}
                          </div>

                          {/* Card Footer: Status Pill Selector + Action Button */}
                          <div className="pt-3 border-t border-[#F0F1EC] dark:border-[#2A302D] flex items-center justify-between gap-2">
                            <CardStatusDropdown
                              status={task.user_status}
                              onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                            />

                            <span className="text-xs font-semibold text-[#161917] dark:text-white flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={areaTitle}
                className="bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                {/* Area Card Header with Progress and Controls */}
                <div
                  onClick={() => toggleAreaCollapse(areaTitle)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none group pb-1"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-[#2563EB] dark:text-[#9DE8BA]" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h2 className="text-base sm:text-lg font-bold text-[#161917] dark:text-white group-hover:text-[#2563EB] dark:group-hover:text-[#9DE8BA] transition-colors">
                          {areaTitle}
                        </h2>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0F1EC] dark:bg-[#202422] text-[#6B7280] dark:text-[#8E948F] font-semibold">
                          {areaTotal} {areaTotal === 1 ? 'workout' : 'workouts'}
                        </span>
                      </div>
                      <p className="text-xs text-[#888F89] dark:text-[#767C77] font-mono mt-0.5">
                        Prioritized technical workouts & practical problem sets
                      </p>
                    </div>
                  </div>

                  {/* Right Header: Progress Bar and Collapse Toggle */}
                  <div className="flex items-center space-x-3.5 self-end sm:self-auto">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-24 sm:w-32 h-2 bg-[#F0F1EC] dark:bg-[#202422] rounded-full overflow-hidden border border-[#E3E5DE] dark:border-[#2E3330]">
                        <div
                          className="h-full bg-[#10B981] dark:bg-[#9DE8BA] transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#161917] dark:text-white">
                        {areaDone}/{areaTotal}
                      </span>
                    </div>

                    <button
                      type="button"
                      aria-label={isCollapsed ? 'Expand area' : 'Collapse area'}
                      className="p-1 rounded-full text-[#888F89] group-hover:text-[#161917] dark:group-hover:text-white transition-colors"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Prioritized Task Cards Grid */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                    {areaTasks.map((task) => {
                      const isDone = task.user_status === 'COMPLETED';
                      const isInProg = task.user_status === 'IN_PROGRESS';

                      return (
                        <div
                          key={task.id}
                          onClick={() => handleOpenTask(task)}
                          className={`rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs hover:-translate-y-0.5 hover:shadow-md cursor-pointer group ${
                            isDone
                              ? 'bg-[#F9FAF8] dark:bg-[#1A1E1C] border-[#E3E5DE] dark:border-[#262A27] opacity-80'
                              : 'bg-white dark:bg-[#1F2421] border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white'
                          }`}
                        >
                          <div>
                            {/* Priority & Type Badges */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                <span
                                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                    task.priority === 'URGENT'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                      : task.priority === 'HIGH'
                                        ? 'bg-[#FCE8A6] text-[#634800]'
                                        : 'bg-[#F0F1EC] dark:bg-[#2A302D] text-[#6B7280]'
                                  }`}
                                >
                                  {task.priority}
                                </span>
                                <span
                                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                                    task.task_type === 'MACHINE_TASK' || task.task_type === 'CODING'
                                      ? 'bg-[#FDD7AE] text-[#7A3E00]'
                                      : task.task_type === 'PRACTICE'
                                        ? 'bg-[#CDE9D6] text-[#19522F]'
                                        : 'bg-[#D4E2F8] text-[#1E3A68]'
                                  }`}
                                >
                                  {task.task_type.replace('_', ' ')}
                                </span>
                              </div>

                              {/* Toggle Completion */}
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

                            {/* Title */}
                            <h3
                              className={`text-sm font-bold tracking-tight mb-1.5 group-hover:text-[#2563EB] dark:group-hover:text-[#9DE8BA] transition-colors ${
                                isDone
                                  ? 'line-through text-[#888F89] dark:text-[#666B67]'
                                  : 'text-[#161917] dark:text-white'
                              }`}
                            >
                              {task.title}
                            </h3>

                            {/* Description */}
                            {task.description && (
                              <p className="text-xs text-[#6B7280] dark:text-[#8E948F] line-clamp-2 leading-relaxed mb-3">
                                {task.description}
                              </p>
                            )}

                            {/* Topic Title Link */}
                            {task.topic_title && (
                              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-[#888F89] dark:text-[#767C77] mb-3">
                                <span className="truncate">Topic: {task.topic_title}</span>
                              </div>
                            )}
                          </div>

                          {/* Card Footer: Status Pill Selector + Action Button */}
                          <div className="pt-3 border-t border-[#F0F1EC] dark:border-[#2A302D] flex items-center justify-between gap-2">
                            <CardStatusDropdown
                              status={task.user_status}
                              onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                            />

                            <span className="text-xs font-semibold text-[#161917] dark:text-white flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                              <span>Details</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
