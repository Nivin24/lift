import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo-dark.png';
import logoLight from '../assets/logo-light.png';
import {
  Compass,
  GraduationCap,
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
  Hash,
  Clock,
  BookOpen,
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
    description: 'Python, NumPy & Pandas data pipelines, DSA, Statistics, Machine Learning fundamentals, SQL, and practical machine tasks.',
    icon: Database,
    highlights: ['7 Core Learning Areas', '42 Practical Tasks', 'TOI Mock Q&A Included'],
  },
  {
    id: 'python_react_fullstack',
    name: 'Python Full-Stack with React',
    badge: 'ENROLLMENT OPEN',
    badgeColor: 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/30',
    isAvailable: false,
    description: 'Enterprise web platforms using FastAPI, Django, React 19, TypeScript, and modern PostgreSQL backends.',
    icon: Code2,
    highlights: ['FastAPI & React 19', 'Relational DB Modeling', 'Full-Stack Portfolio'],
  },
  {
    id: 'mern',
    name: 'MERN Stack Engineering',
    badge: 'ENROLLMENT OPEN',
    badgeColor: 'bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/30',
    isAvailable: false,
    description: 'Node.js runtime engineering, Express microservices, MongoDB Atlas, and reactive Next.js frontends.',
    icon: Layers,
    highlights: ['Microservice Architecture', 'JWT & OAuth Systems', 'Scalable Next.js'],
  },
  {
    id: 'machine_learning',
    name: 'Machine Learning & Deep Learning',
    badge: 'COMING SOON',
    badgeColor: 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/30',
    isAvailable: false,
    description: 'PyTorch deep neural networks, transformer LLM fine-tuning, computer vision, and automated MLOps pipelines.',
    icon: Cpu,
    highlights: ['PyTorch & Transformers', 'Computer Vision & NLP', 'MLOps Deployments'],
  },
  {
    id: 'cyber_security',
    name: 'Cybersecurity & Ethical Hacking',
    badge: 'COMING SOON',
    badgeColor: 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30',
    isAvailable: false,
    description: 'Defensive architecture, network vulnerability analysis, SOC operations, penetration testing, and security compliance.',
    icon: Shield,
    highlights: ['Network Forensics', 'Penetration Testing', 'SOC Operations'],
  },
  {
    id: 'cloud_devops',
    name: 'Cloud Architecture & DevOps',
    badge: 'COMING SOON',
    badgeColor: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30',
    isAvailable: false,
    description: 'Distributed resilient infrastructure with Docker, Kubernetes, Terraform IaC, and GitHub Actions CI/CD.',
    icon: Cloud,
    highlights: ['Docker & Kubernetes', 'Multi-Cloud AWS/GCP', 'Automated CI/CD'],
  },
];

export const OnboardingView: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { user, updateOnboarding } = useAuth();
  const { theme, activeLogo } = useTheme();

  const [step, setStep] = useState<number>(1);
  const [selectedDomain, setSelectedDomain] = useState<string>(user?.selected_domain || 'data_science');
  const [courseDuration, setCourseDuration] = useState<'7_months' | '1_year'>(
    (user?.course_duration as '7_months' | '1_year') || '7_months'
  );
  const [batchNumber, setBatchNumber] = useState<string>(user?.batch_number || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const displayedLogo = activeLogo || (theme === 'dark' ? logoDark : logoLight);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleFinishOnboarding = async () => {
    if (!batchNumber.trim()) {
      setBatchError('Please provide your batch number (e.g. B-42, DS-108, or 2024-Q3)');
      return;
    }
    setBatchError(null);
    setIsSubmitting(true);
    try {
      await updateOnboarding({
        selected_domain: selectedDomain,
        course_duration: courseDuration,
        batch_number: batchNumber.trim(),
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
              LIFT STUDENT VERIFICATION
            </h1>
            <p className="text-[11px] text-[#70746E] dark:text-[#888F89]">
              Configure your completed course, program duration & batch cohort
            </p>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
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
        {/* STEP 1: CHOOSE DOMAIN / COURSE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#262A27] text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-2">
                <Compass size={14} className="text-[#9DE8BA]" />
                <span>STEP 1 OF 2 • SELECT COURSE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161917] dark:text-[#FFFFFF]">
                Which Course Have You Completed or Enrolled In?
              </h2>
              <p className="text-sm text-[#70746E] dark:text-[#888F89] mt-1 max-w-xl">
                The Data Science & Analytics BM1 track is currently fully live with active questions and real tasks. You can preview other tracks anytime as features expand.
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

        {/* STEP 2: DURATION & BATCH NUMBER */}
        {step === 2 && (
          <div className="space-y-8 max-w-2xl mx-auto w-full">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#262A27] text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-2">
                <GraduationCap size={14} className="text-[#9DE8BA]" />
                <span>STEP 2 OF 2 • STUDENT DETAILS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161917] dark:text-[#FFFFFF]">
                Course Duration & Batch Details
              </h2>
              <p className="text-sm text-[#70746E] dark:text-[#888F89] mt-1">
                Tell us which program length you completed and your cohort batch number so we can serve the correct benchmark curriculum data.
              </p>
            </div>

            {/* Program Duration Selector */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase text-[#70746E] dark:text-[#888F89] tracking-wider flex items-center gap-1.5">
                <Clock size={13} className="text-[#9DE8BA]" />
                <span>Program Duration Completed</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCourseDuration('7_months')}
                  className={`p-5 rounded-2xl border text-left transition-all relative ${
                    courseDuration === '7_months'
                      ? 'border-emerald-500 dark:border-[#9DE8BA] bg-[#FFFFFF] dark:bg-[#161917] shadow-md ring-2 ring-[#9DE8BA]/20'
                      : 'border-[#D5D8D0] dark:border-[#262A27] bg-[#F7F8F5] dark:bg-[#161917]/70 hover:border-[#A3AAA4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-[#9DE8BA] border border-emerald-500/30">
                      7 MONTHS
                    </span>
                    {courseDuration === '7_months' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-[#9DE8BA] flex items-center justify-center text-[#FFFFFF] dark:text-[#0D381E]">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-[#161917] dark:text-[#FFFFFF] mb-1">
                    7 Month Program
                  </h4>
                  <p className="text-xs text-[#70746E] dark:text-[#888F89] leading-relaxed">
                    Fast-track intensive diploma covering core modules, benchmark evaluations, and practical machine tests.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseDuration('1_year')}
                  className={`p-5 rounded-2xl border text-left transition-all relative ${
                    courseDuration === '1_year'
                      ? 'border-emerald-500 dark:border-[#9DE8BA] bg-[#FFFFFF] dark:bg-[#161917] shadow-md ring-2 ring-[#9DE8BA]/20'
                      : 'border-[#D5D8D0] dark:border-[#262A27] bg-[#F7F8F5] dark:bg-[#161917]/70 hover:border-[#A3AAA4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-500/30">
                      1 YEAR
                    </span>
                    {courseDuration === '1_year' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500 dark:bg-[#9DE8BA] flex items-center justify-center text-[#FFFFFF] dark:text-[#0D381E]">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-[#161917] dark:text-[#FFFFFF] mb-1">
                    1 Year Program
                  </h4>
                  <p className="text-xs text-[#70746E] dark:text-[#888F89] leading-relaxed">
                    Full comprehensive curriculum with extended practical labs, enterprise capstone, and advanced interview prep.
                  </p>
                </button>
              </div>
            </div>

            {/* Batch Number Input */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono font-bold uppercase text-[#70746E] dark:text-[#888F89] tracking-wider flex items-center gap-1.5">
                <Hash size={13} className="text-[#9DE8BA]" />
                <span>Student Batch Number</span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => {
                    setBatchNumber(e.target.value);
                    if (batchError) setBatchError(null);
                  }}
                  placeholder="e.g. B-42, DS-108, or 2024-Q3"
                  className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-mono transition-all bg-[#FFFFFF] dark:bg-[#161917] text-[#161917] dark:text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#9DE8BA] ${
                    batchError
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-[#D5D8D0] dark:border-[#262A27]'
                  }`}
                />
              </div>

              {batchError ? (
                <p className="text-xs text-red-500 font-mono">{batchError}</p>
              ) : (
                <p className="text-xs text-[#70746E] dark:text-[#888F89] font-mono leading-relaxed">
                  Tip: Your batch code ensures you receive the exact benchmark version, rubrics, and machine tasks assigned to your cohort.
                </p>
              )}
            </div>

            {/* Selection Summary Pill */}
            <div className="p-4 rounded-2xl bg-[#E5E8E0]/60 dark:bg-[#1A1D1B] border border-[#D5D8D0] dark:border-[#2E3330] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-[#9DE8BA] flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#161917] dark:text-[#FFFFFF]">
                    {DOMAIN_OPTIONS.find((d) => d.id === selectedDomain)?.name}
                  </p>
                  <p className="text-[11px] font-mono text-[#70746E] dark:text-[#888F89]">
                    Duration: {courseDuration === '7_months' ? '7 Months Program' : '1 Year Program'}
                    {batchNumber ? ` • Batch: ${batchNumber}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Buttons */}
      <footer className="w-full max-w-4xl mx-auto pt-6 border-t border-[#D5D8D0] dark:border-[#262A27] flex items-center justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#262A27] bg-[#FFFFFF] dark:bg-[#161917] text-xs font-mono font-bold text-[#161917] dark:text-[#F0F1EC] hover:bg-[#E5E8E0] dark:hover:bg-[#202422] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>BACK</span>
          </button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#161917] dark:bg-[#9DE8BA] text-xs font-mono font-bold text-[#FFFFFF] dark:text-[#0D381E] hover:opacity-90 shadow-sm transition-all"
          >
            <span>NEXT: DURATION & BATCH</span>
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishOnboarding}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-7 py-3 rounded-xl bg-[#161917] dark:bg-[#9DE8BA] text-xs font-mono font-bold text-[#FFFFFF] dark:text-[#0D381E] hover:opacity-90 shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>SAVING STUDENT PROFILE...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>CONFIRM & ENTER WORKSPACE</span>
              </>
            )}
          </button>
        )}
      </footer>
    </div>
  );
};
