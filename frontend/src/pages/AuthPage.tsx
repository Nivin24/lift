import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoDark from '../assets/logo-dark.png';
import logoLight from '../assets/logo-light.png';
import {
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  LogIn,
  Sun,
  Moon,
  Check,
  Eye,
  EyeOff,
  Database,
  Smartphone,
  Zap,
  Layers,
} from 'lucide-react';

export const AuthPage: React.FC<{ onSkipToDev?: () => void }> = ({ onSkipToDev }) => {
  const { theme, toggleTheme, activeLogo } = useTheme();
  const { login, register, forgotPassword, resetPassword, switchDemoUser } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password reset step
  const [resetVerified, setResetVerified] = useState(false);
  const [verifiedTarget, setVerifiedTarget] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const clearMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Please enter both your username/email and password.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      await login(usernameOrEmail.trim(), password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect credentials. Try Quick Dev Login or reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      await register(username.trim(), email.trim(), password, fullName.trim() || undefined);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. The username or email may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim()) {
      setErrorMessage('Please enter your username or registered email.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      const res = await forgotPassword(usernameOrEmail.trim());
      setSuccessMessage(res.message);
      if (res.user_exists) {
        setResetVerified(true);
        setVerifiedTarget(res.username || usernameOrEmail.trim());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify user account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    clearMessages();
    try {
      await resetPassword(verifiedTarget || usernameOrEmail.trim(), password);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (userKey: 'user1' | 'user2') => {
    setIsLoading(true);
    clearMessages();
    try {
      await switchDemoUser(userKey);
      if (onSkipToDev) onSkipToDev();
    } catch (err: any) {
      setErrorMessage('Failed to sign in with demo user.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedLogo = activeLogo || (theme === 'dark' ? logoDark : logoLight);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#F0F1EC] dark:bg-[#0B0D0C] text-[#161917] dark:text-[#F0F1EC] transition-colors relative overflow-hidden select-none">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-[#9DE8BA]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar with Proper Logo */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <img
            src={displayedLogo}
            alt="LIFT Official Logo"
            className="w-11 h-11 rounded-2xl object-contain p-1 border border-[#D5D8D0] dark:border-[#2E3330] bg-[#FFFFFF] dark:bg-[#161917] shadow-sm hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-lg tracking-wider text-[#161917] dark:text-[#FFFFFF]">
                LIFT
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#9DE8BA]/20 text-[#0D381E] dark:text-[#9DE8BA] border border-[#9DE8BA]/30">
                BM1 → BM2 → TOI
              </span>
            </div>
            <p className="text-[11px] text-[#70746E] dark:text-[#888F89]">
              Engineering Curriculum & Practice Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#FFFFFF] dark:bg-[#161917] hover:bg-[#E5E8E0] dark:hover:bg-[#202422] transition-colors shadow-xs"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} className="text-[#9DE8BA]" />
            ) : (
              <Moon size={18} className="text-[#70746E]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left Side: Brand Story & Quick Dev Personas */}
        <div className="w-full lg:w-1/2 flex flex-col space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF]/90 dark:bg-[#161917]/90 border border-[#D5D8D0] dark:border-[#2E3330] w-fit shadow-xs">
            <Layers size={14} className="text-[#9DE8BA]" />
            <span className="text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4]">
              Multi-Track Curriculum & Offline Local Sync
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#161917] dark:text-[#FFFFFF] leading-[1.15]">
            Master engineering with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-[#9DE8BA] dark:to-teal-300">
              unbroken focus.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#525650] dark:text-[#A3AAA4] max-w-lg leading-relaxed">
            Your personal curriculum tracker, smart practice workspace, syllabus checklists, and real-time offline sync between your browser and iPhone.
          </p>

          {/* Quick Developer / Demo Personas Card */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#161917] border border-[#D5D8D0] dark:border-[#2E3330] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#161917] dark:text-[#FFFFFF]">
                  ⚡ 1-Click Developer Mode
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#70746E] dark:text-[#888F89]">
                Instant Switcher
              </span>
            </div>

            <p className="text-xs text-[#70746E] dark:text-[#888F89]">
              Test user data and local progress persistence without manually typing passwords:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleQuickDemo('user1')}
                disabled={isLoading}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] hover:border-[#9DE8BA] hover:bg-[#9DE8BA]/10 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 dark:bg-[#9DE8BA]/20 text-emerald-700 dark:text-[#9DE8BA] flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  NB
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#161917] dark:text-[#FFFFFF] truncate">
                    Nivin Benny
                  </div>
                  <div className="text-[10px] text-[#70746E] dark:text-[#888F89] font-mono truncate">
                    user1 (BM1 Lead)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('user2')}
                disabled={isLoading}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] hover:border-[#9DE8BA] hover:bg-[#9DE8BA]/10 transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 dark:bg-cyan-400/20 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  SP
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#161917] dark:text-[#FFFFFF] truncate">
                    Study Partner
                  </div>
                  <div className="text-[10px] text-[#70746E] dark:text-[#888F89] font-mono truncate">
                    user2 (Collaborator)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2 text-xs text-[#525650] dark:text-[#A3AAA4]">
              <Database size={15} className="text-[#9DE8BA] shrink-0" />
              <span>Async Local Sync</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#525650] dark:text-[#A3AAA4]">
              <Smartphone size={15} className="text-[#9DE8BA] shrink-0" />
              <span>Native iOS Parity</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#525650] dark:text-[#A3AAA4]">
              <ShieldCheck size={15} className="text-[#9DE8BA] shrink-0" />
              <span>Encrypted Storage</span>
            </div>
          </div>
        </div>

        {/* Right Side: Differentiated Auth Cards */}
        <div className="w-full lg:w-[490px]">
          {/* Top Mode Segmented Selector */}
          <div className="grid grid-cols-3 p-1.5 rounded-2xl bg-[#E5E8E0] dark:bg-[#202422] border border-[#D5D8D0] dark:border-[#2E3330] mb-4 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                clearMessages();
              }}
              className={`py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signin'
                  ? 'bg-[#FFFFFF] dark:bg-[#161917] text-[#161917] dark:text-[#FFFFFF] shadow-sm font-semibold'
                  : 'text-[#70746E] dark:text-[#888F89] hover:text-[#161917] dark:hover:text-[#FFFFFF]'
              }`}
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearMessages();
              }}
              className={`py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-[#FFFFFF] dark:bg-[#161917] text-[#161917] dark:text-[#FFFFFF] shadow-sm font-semibold'
                  : 'text-[#70746E] dark:text-[#888F89] hover:text-[#161917] dark:hover:text-[#FFFFFF]'
              }`}
            >
              <UserPlus size={13} />
              <span>Sign Up</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('forgot');
                clearMessages();
              }}
              className={`py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'forgot'
                  ? 'bg-[#FFFFFF] dark:bg-[#161917] text-[#161917] dark:text-[#FFFFFF] shadow-sm font-semibold'
                  : 'text-[#70746E] dark:text-[#888F89] hover:text-[#161917] dark:hover:text-[#FFFFFF]'
              }`}
            >
              <KeyRound size={13} />
              <span>Reset Pass</span>
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-[#9DE8BA]">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* CARD 1: SIGN IN CARD */}
          {mode === 'signin' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#161917] border-2 border-emerald-500/30 dark:border-[#9DE8BA]/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-[#9DE8BA]/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-[#9DE8BA]/15 text-emerald-700 dark:text-[#9DE8BA] flex items-center justify-center">
                    <LogIn size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#161917] dark:text-[#FFFFFF]">
                      Welcome Back
                    </h2>
                    <p className="text-xs text-[#70746E] dark:text-[#888F89]">
                      Sign in to resume your BM1 study track
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F0F1EC] dark:bg-[#202422] text-[#70746E] dark:text-[#A3AAA4] border border-[#D5D8D0] dark:border-[#2E3330]">
                  ACCESS
                </span>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1.5 uppercase tracking-wider">
                    Username or Email
                  </label>
                  <div className="relative">
                    <UserIcon
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#70746E] dark:text-[#888F89]"
                    />
                    <input
                      type="text"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="e.g. user1 or nivin@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        clearMessages();
                      }}
                      className="text-xs text-emerald-600 dark:text-[#9DE8BA] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#70746E] dark:text-[#888F89]"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#70746E] dark:text-[#888F89] hover:text-[#161917] dark:hover:text-[#FFFFFF]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-[#161917] dark:bg-[#9DE8BA] text-[#FFFFFF] dark:text-[#0D381E] font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to LIFT Workspace</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-[#E5E8E0] dark:border-[#262A27] flex items-center justify-between text-xs text-[#70746E] dark:text-[#888F89]">
                <span>Need a new account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    clearMessages();
                  }}
                  className="font-semibold text-emerald-600 dark:text-[#9DE8BA] hover:underline"
                >
                  Sign Up Free →
                </button>
              </div>
            </div>
          )}

          {/* CARD 2: SIGN UP CARD */}
          {mode === 'signup' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#161917] border-2 border-sky-500/30 dark:border-teal-400/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 dark:bg-teal-400/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/15 dark:bg-teal-400/15 text-sky-700 dark:text-teal-300 flex items-center justify-center">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#161917] dark:text-[#FFFFFF]">
                      Create Student Account
                    </h2>
                    <p className="text-xs text-[#70746E] dark:text-[#888F89]">
                      Enrolls in BM1 curriculum with automated offline sync
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F0F1EC] dark:bg-[#202422] text-[#70746E] dark:text-[#A3AAA4] border border-[#D5D8D0] dark:border-[#2E3330]">
                  NEW
                </span>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1 uppercase tracking-wider">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Nivin Benny"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1 uppercase tracking-wider">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. nivin24"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nivin@example.com"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1 uppercase tracking-wider">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1 uppercase tracking-wider">
                      Confirm *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#70746E] dark:text-[#888F89]">
                  <CheckCircle2 size={13} className="text-[#9DE8BA] shrink-0" />
                  <span>Includes offline local storage and personalized task tracking</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-[#161917] dark:bg-[#9DE8BA] text-[#FFFFFF] dark:text-[#0D381E] font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Complete Registration & Launch</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-[#E5E8E0] dark:border-[#262A27] flex items-center justify-between text-xs text-[#70746E] dark:text-[#888F89]">
                <span>Already have an account?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    clearMessages();
                  }}
                  className="font-semibold text-emerald-600 dark:text-[#9DE8BA] hover:underline"
                >
                  Sign In instead →
                </button>
              </div>
            </div>
          )}

          {/* CARD 3: RESET PASSWORD CARD */}
          {mode === 'forgot' && (
            <div className="p-6 md:p-8 rounded-3xl bg-[#FFFFFF] dark:bg-[#161917] border-2 border-amber-500/30 dark:border-amber-400/30 shadow-2xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/10 rounded-bl-full pointer-events-none" />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#161917] dark:text-[#FFFFFF]">
                      Account Recovery
                    </h2>
                    <p className="text-xs text-[#70746E] dark:text-[#888F89]">
                      Verify your account to set a new password
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F0F1EC] dark:bg-[#202422] text-[#70746E] dark:text-[#A3AAA4] border border-[#D5D8D0] dark:border-[#2E3330]">
                  RECOVERY
                </span>
              </div>

              {!resetVerified ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-[#70746E] dark:text-[#888F89] leading-relaxed">
                    Step 1 of 2: Enter your username or email address. We will verify your account profile immediately.
                  </p>

                  <div>
                    <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1.5 uppercase tracking-wider">
                      Username or Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#70746E] dark:text-[#888F89]"
                      />
                      <input
                        type="text"
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                        placeholder="e.g. user1 or nivin@example.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#161917] dark:bg-[#9DE8BA] text-[#FFFFFF] dark:text-[#0D381E] font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify Identity</span>
                        <KeyRound size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-[#9DE8BA] flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>
                      Identity verified for <strong className="font-semibold">{verifiedTarget}</strong>. Step 2 of 2: Set your new password:
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1 uppercase tracking-wider">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-[#70746E] dark:text-[#A3AAA4] mb-1 uppercase tracking-wider">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5D8D0] dark:border-[#2E3330] bg-[#F7F8F5] dark:bg-[#202422] text-[#161917] dark:text-[#FFFFFF] text-sm focus:outline-none focus:border-[#9DE8BA] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-[#161917] dark:bg-[#9DE8BA] text-[#FFFFFF] dark:text-[#0D381E] font-medium text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Update Password & Enter Workspace</span>
                        <Check size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="mt-5 pt-4 border-t border-[#E5E8E0] dark:border-[#262A27] flex items-center justify-between text-xs text-[#70746E] dark:text-[#888F89]">
                <span>Remember your password?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    clearMessages();
                  }}
                  className="font-semibold text-emerald-600 dark:text-[#9DE8BA] hover:underline"
                >
                  Return to Sign In →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#70746E] dark:text-[#888F89] gap-2 border-t border-[#D5D8D0]/50 dark:border-[#2E3330]/50">
        <div>
          LIFT Learning Platform • BM1 Foundation Curriculum • Real-Time Local Sync
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>v1.2.0</span>
          <span>•</span>
          <span>FastAPI + SQLite</span>
          <span>•</span>
          <span>React 18 + React Native</span>
        </div>
      </footer>
    </div>
  );
};
