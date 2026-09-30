import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo-dark.png';
import logoLight from '../assets/logo-light.png';
import {
  Compass,
  GraduationCap,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Layers,
  Database,
  Code2,
  Cpu,
  Shield,
  Cloud,
  Check,
  Briefcase,
  BookOpen,
  Award,
  Zap,
} from 'lucide-react';

interface DomainOption {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  isAvailable: boolean;
  description: string;
  icon: React.ElementType;
  highlights: string[];
}

const DOMAIN_OPTIONS: DomainOption[] = [
  {
    id: 'data_science',
    name: 'Data Science & Analytics (BM1 → BM2 → TOI)',
    badge: 'LIVE CURRICULUM',
    badgeColor: 'bg-emerald-500/20 text-emerald-800 dark:text-[#9DE8BA] border-emerald-500/30',
    isAvailable: true,
    description: 'Master Python, Pandas & NumPy data handling, DSA, Mathematics, ML fundamentals, SQL, and practical machine tasks.',
    icon: Database,
    highlights: ['7 Core Learning Areas', '42 Practical Tasks', 'TOI Mock Q&A Included'],
  },
  {
    id: 'python_react_fullstack',
    name: 'Python Full-Stack with React',
    badge: 'ENROLLMENT OPEN',
    badgeColor: 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/30',
    isAvailable: false,
    description: 'Build enterprise web platforms using FastAPI, Django, React 19, TypeScript, and modern PostgreSQL backends.',
    icon: Code2,
    highlights: ['FastAPI & React 19', 'Relational DB Modeling', 'Full-Stack Portfolio'],
  },
  {
    id: 'mern',
    name: 'MERN Stack Engineering',
    badge: 'ENROLLMENT OPEN',
    badgeColor: 'bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/30',
    isAvailable: false,
    description: 'Modern JavaScript runtime engineering with Node.js, Express microservices, MongoDB Atlas, and reactive Next.js frontends.',
    icon: Layers,
    highlights: ['Microservice Architecture', 'JWT & OAuth Systems', 'Scalable Next.js'],
  },
  {
    id: 'machine_learning',
    name: 'Machine Learning & Deep Learning',
    badge: 'COMING SOON',
    badgeColor: 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/30',
    isAvailable: false,
    description: 'Train production ML models, PyTorch deep neural networks, transformer LLM fine-tuning, and automated MLOps pipelines.',
    icon: Cpu,
    highlights: ['PyTorch & Transformers', 'Computer Vision & NLP', 'MLOps Deployments'],
  },
  {
    id: 'cyber_security',
    name: 'Cybersecurity & Ethical Hacking',
    badge: 'COMING SOON',
    badgeColor: 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30',
    isAvailable: false,
    description: 'Defensive architecture, network vulnerability analysis, SOC operations, penetration testing, and OWASP compliance.',
    icon: Shield,
    highlights: ['Network Forensics', 'Penetration Testing', 'SOC Operations'],
  },
  {
    id: 'cloud_devops',
    name: 'Cloud Architecture & DevOps',
    badge: 'COMING SOON',
    badgeColor: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30',
    isAvailable: false,
    description: 'Orchestrate distributed resilient infrastructure with Docker, Kubernetes, Terraform IaC, and GitHub Actions CI/CD.',
    icon: Cloud,
    highlights: ['Docker & Kubernetes', 'Multi-Cloud AWS/GCP', 'Automated CI/CD'],
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    title: 'Beginner / Fresh Graduate',
    desc: 'Starting from core programming fundamentals. Need structured step-by-step milestone guides.',
    icon: BookOpen,
  },
  {
    id: 'intermediate',
    title: 'Self-Taught / Intermediate Developer',
    desc: 'Already know syntax and basic scripts. Focused on clearing benchmarks, building portfolio code.',
    icon: Code2,
  },
  {
    id: 'transitioning',
    title: 'Career Switcher into Tech',
    desc: 'Transitioning from non-coding or adjacent career. Maximizing practical task completion for quick hiring.',
    icon: Briefcase,
  },
  {
    id: 'advanced',
    title: 'Working Engineer Upskilling',
    desc: 'Refreshing core algorithms, machine task architectures, and technical interview rigor.',
    icon: Award,
  },
];

const PRIMARY_GOALS = [
  {
    id: 'crack_bm1_toi',
    title: 'Clear BM1 Benchmark & Pass TOI Interview',
    desc: 'Primary priority: pass the machine tasks, code reviews, and theoretical evaluation.',
  },
  {
    id: 'portfolio_projects',
    title: 'Build Comprehensive Benchmark Capstone Projects',
    desc: 'Create verified, production-grade applications to highlight in resume and GitHub.',
  },
  {
    id: 'placement_prep',
    title: 'Fast-Track Technical Job & Placement Prep',
    desc: 'Focus on high-yield interview questions, real-time code challenges, and mock quizzes.',
  },
  {
    id: 'systems_mastery',
    title: 'Deep Engineering Competency & Practical Fluency',
    desc: 'Master the technical discipline thoroughly with unbroken daily focus and habits.',
  },
];

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user, updateOnboarding } = useAuth();
  const { theme, activeLogo } = useTheme();

  const [step, setStep] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<string>(user?.selected_domain || 'data_science');
  const [experienceLevel, setExperienceLevel] = useState<string>(user?.experience_level || 'beginner');
  const [primaryGoal, setPrimaryGoal] = useState<string>(user?.primary_goal || 'crack_bm1_toi');
  const [dailyHours, setDailyHours] = useState<number>(user?.daily_commitment_hours || 2.0);
  const [targetDate, setTargetDate] = useState<string>(user?.target_completion_date || '60_days');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const displayedLogo = activeLogo || (theme === 'dark' ? logoDark : logoLight);

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      await updateOnboarding({
        selected_domain: selectedDomain,
        experience_level: experienceLevel,
        primary_goal: primaryGoal,
        daily_commitment_hours: dailyHours,
        target_completion_date: targetDate,
        onboarding_completed: true,
      });
      onComplete();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      // Still allow progression into workspace
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F0F1EC] dark:bg-[#0B0D0C] text-[#161917] dark:text-[#F0F1EC] transition-colors p-4 md:p-8">
      {/* Top Header Bar */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between pb-6 border-b border-[#D5D8D0] dark:border-[#262A27]">
        <div className="flex items-center gap-3">
          <img
            src={displayedLogo}
            alt="LIFT Logo"
            className="w-10 h-10 rounded-2xl object-contain p-1 border border-[#D5D8D0] dark:border-[#2E3330] bg-[#FFFFFF] dark:bg-[#161917] shadow-sm"
          />
          <div>
            <h1 className="font-mono font-bold text-base text-[#161917] dark:text-[#FFFFFF] tracking-wide">
              LIFT STUDENT ONBOARDING
            </h1>
            <p className="text-[11px] text-[#70746E] dark:text-[#888F89]">
              Configure your personal curriculum track & study pacing
            </p>
          </div>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-7 h-7 rounded-xl text-xs font-mono font-bold transition-colors ${
                step === s
                  ? 'bg-[#161917] dark:bg-[#9DE8BA] text-[#FFFFFF] dark:text-[#0D381E]'
                  : step > s
                  ? 'bg-emerald-500/20 text-emerald-800 dark:text-[#9DE8BA]'
                  : 'bg-[#E5E8E0] dark:bg-[#202422] text-[#70746E] dark:text-[#888F89]'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-8 flex flex-col justify-center">
        {/* STEP 1: CHOOSE DOMAIN / TRACK */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#262A27] text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-2">
                <Compass size={14} className="text-[#9DE8BA]" />
                <span>STEP 1 OF 4 • CURRICULUM SELECTION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161917] dark:text-[#FFFFFF]">
                Choose your Primary Engineering Track
              </h2>
              <p className="text-sm text-[#70746E] dark:text-[#888F89] mt-1 max-w-xl">
                The Data Science & Analytics BM1 track is currently fully live with active questions and real tasks. You can switch or preview other tracks anytime as features expand.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {DOMAIN_OPTIONS.map((domain) => {
                const IconComponent = domain.icon;
                const isSelected = selectedDomain === domain.id;

                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 dark:border-[#9DE8BA] bg-[#FFFFFF] dark:bg-[#161917] shadow-md ring-2 ring-[#9DE8BA]/20'
                        : 'border-[#D5D8D0] dark:border-[#262A27] bg-[#F7F8F5] dark:bg-[#161917]/70 hover:border-[#A3AAA4] dark:hover:border-[#383E3A]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-500/20 text-emerald-800 dark:text-[#9DE8BA]'
                                : 'bg-[#E5E8E0] dark:bg-[#202422] text-[#70746E] dark:text-[#888F89]'
                            }`}
                          >
                            <IconComponent size={18} />
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${domain.badgeColor}`}
                          >
                            {domain.badge}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-[#9DE8BA] flex items-center justify-center text-[#FFFFFF] dark:text-[#0D381E]">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-[#161917] dark:text-[#FFFFFF] mb-1">
                        {domain.name}
                      </h3>
                      <p className="text-xs text-[#70746E] dark:text-[#888F89] leading-relaxed mb-3">
                        {domain.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E5E8E0] dark:border-[#262A27] flex flex-wrap gap-1.5">
                      {domain.highlights.map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#E5E8E0]/70 dark:bg-[#202422] text-[#525650] dark:text-[#A3AAA4]"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE LEVEL */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#262A27] text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-2">
                <GraduationCap size={14} className="text-[#9DE8BA]" />
                <span>STEP 2 OF 4 • BACKGROUND EVALUATION</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161917] dark:text-[#FFFFFF]">
                What is your Current Technical Background?
              </h2>
              <p className="text-sm text-[#70746E] dark:text-[#888F89] mt-1 max-w-xl">
                We calibrate topic difficulty recommendations and question hints according to your starting tier.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {EXPERIENCE_LEVELS.map((level) => {
                const IconComponent = level.icon;
                const isSelected = experienceLevel === level.id;

                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => setExperienceLevel(level.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-emerald-500 dark:border-[#9DE8BA] bg-[#FFFFFF] dark:bg-[#161917] shadow-md ring-2 ring-[#9DE8BA]/20'
                        : 'border-[#D5D8D0] dark:border-[#262A27] bg-[#F7F8F5] dark:bg-[#161917]/70 hover:border-[#A3AAA4] dark:hover:border-[#383E3A]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-[#9DE8BA]'
                          : 'bg-[#E5E8E0] dark:bg-[#202422] text-[#70746E] dark:text-[#888F89]'
                      }`}
                    >
                      <IconComponent size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-[#161917] dark:text-[#FFFFFF]">
                          {level.title}
                        </h3>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 dark:bg-[#9DE8BA] flex items-center justify-center text-[#FFFFFF] dark:text-[#0D381E]">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#70746E] dark:text-[#888F89] leading-relaxed">
                        {level.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: PRIMARY GOAL */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#262A27] text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-2">
                <Target size={14} className="text-[#9DE8BA]" />
                <span>STEP 3 OF 4 • TARGET MILESTONE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161917] dark:text-[#FFFFFF]">
                What is your Primary Target Milestone?
              </h2>
              <p className="text-sm text-[#70746E] dark:text-[#888F89] mt-1 max-w-xl">
                This configures your dashboard focus cards and prioritization in the tasks tab.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {PRIMARY_GOALS.map((goal) => {
                const isSelected = primaryGoal === goal.id;

                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => setPrimaryGoal(goal.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-500 dark:border-[#9DE8BA] bg-[#FFFFFF] dark:bg-[#161917] shadow-md ring-2 ring-[#9DE8BA]/20'
                        : 'border-[#D5D8D0] dark:border-[#262A27] bg-[#F7F8F5] dark:bg-[#161917]/70 hover:border-[#A3AAA4] dark:hover:border-[#383E3A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[#161917] dark:text-[#FFFFFF]">
                        {goal.title}
                      </h3>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-[#9DE8BA] flex items-center justify-center text-[#FFFFFF] dark:text-[#0D381E] shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#70746E] dark:text-[#888F89] leading-relaxed">
                      {goal.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: STUDY PACING & TIMELINE */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#262A27] text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-2">
                <Clock size={14} className="text-[#9DE8BA]" />
                <span>STEP 4 OF 4 • STUDY CADENCE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161917] dark:text-[#FFFFFF]">
                Daily Commitment & Target Horizon
              </h2>
              <p className="text-sm text-[#70746E] dark:text-[#888F89] mt-1 max-w-xl">
                We compute your pacing analytics, weekly burn-down charts, and estimated completion date from this pace.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Daily Hours Commitment */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#262A27] shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <Clock size={18} className="text-[#9DE8BA]" />
                  <h3 className="text-sm font-bold text-[#161917] dark:text-[#FFFFFF]">
                    Daily Learning Commitment
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { hours: 1.5, label: '1 - 2 Hrs', sub: 'Paced' },
                    { hours: 3.0, label: '2 - 4 Hrs', sub: 'Optimal' },
                    { hours: 5.0, label: '4+ Hrs', sub: 'Bootcamp' },
                  ].map((item) => (
                    <button
                      key={item.hours}
                      type="button"
                      onClick={() => setDailyHours(item.hours)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        dailyHours === item.hours
                          ? 'border-emerald-500 dark:border-[#9DE8BA] bg-emerald-500/10 dark:bg-[#9DE8BA]/10 font-bold'
                          : 'border-[#D5D8D0] dark:border-[#262A27] bg-[#F7F8F5] dark:bg-[#202422]'
                      }`}
                    >
                      <div className="text-xs text-[#161917] dark:text-[#FFFFFF]">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#70746E] dark:text-[#888F89]">
                        {item.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Horizon */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#262A27] shadow-sm space-y-4">
                <div className="flex items-center gap-2.5">
                  <Calendar size={18} className="text-[#9DE8BA]" />
                  <h3 className="text-sm font-bold text-[#161917] dark:text-[#FFFFFF]">
                    Target Completion Horizon
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { val: '30_days', label: '30 Days', sub: 'Sprint' },
                    { val: '60_days', label: '60 Days', sub: 'Standard' },
                    { val: '90_days', label: '90 Days', sub: 'Mastery' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setTargetDate(item.val)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        targetDate === item.val
                          ? 'border-emerald-500 dark:border-[#9DE8BA] bg-emerald-500/10 dark:bg-[#9DE8BA]/10 font-bold'
                          : 'border-[#D5D8D0] dark:border-[#262A27] bg-[#F7F8F5] dark:bg-[#202422]'
                      }`}
                    >
                      <div className="text-xs text-[#161917] dark:text-[#FFFFFF]">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-[#70746E] dark:text-[#888F89]">
                        {item.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Pill */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-700 dark:text-[#9DE8BA] shrink-0" />
                <div className="text-xs text-emerald-800 dark:text-[#9DE8BA]">
                  Profile ready for <span className="font-bold">{user?.full_name || user?.username}</span>: Active curriculum set to{' '}
                  <span className="font-bold underline">{DOMAIN_OPTIONS.find((d) => d.id === selectedDomain)?.name}</span>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#D5D8D0] dark:border-[#262A27]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#FFFFFF] dark:bg-[#161917] text-[#161917] dark:text-[#FFFFFF] text-xs font-semibold flex items-center gap-2 hover:bg-[#E5E8E0] dark:hover:bg-[#202422] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#161917] dark:bg-[#9DE8BA] text-[#FFFFFF] dark:text-[#0D381E] text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 rounded-xl bg-[#161917] dark:bg-[#9DE8BA] text-[#FFFFFF] dark:text-[#0D381E] text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Profile & Launch Workspace</span>
                  <Check size={14} strokeWidth={3} />
                </>
              )}
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto pt-6 border-t border-[#D5D8D0]/60 dark:border-[#262A27] text-center text-xs text-[#70746E] dark:text-[#888F89]">
        LIFT Learning Platform • Student Preferences and Tracks are safely backed up in SQLite & Cloud Sync.
      </footer>
    </div>
  );
};
