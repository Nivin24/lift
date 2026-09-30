import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    forgotPassword,
    resetPassword,
    switchDemoUser,
    logout,
  } = useAuth();
  const { activeLogo } = useTheme();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password reset step
  const [resetVerified, setResetVerified] = useState(false);
  const [verifiedTarget, setVerifiedTarget] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const resetFormState = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setPassword('');
    setConfirmPassword('');
    setResetVerified(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Please enter both your username/email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      await login(usernameOrEmail.trim(), password);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect credentials. Try again or use Quick Dev Login.');
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
    setErrorMessage('');
    try {
      await register(username.trim(), email.trim(), password, fullName.trim() || undefined);
      setIsAuthModalOpen(false);
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
    setErrorMessage('');
    try {
      const res = await forgotPassword(usernameOrEmail.trim());
      setSuccessMessage(res.message);
      if (res.user_exists) {
        setResetVerified(true);
        setVerifiedTarget(res.username || usernameOrEmail.trim());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify account.');
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
    setErrorMessage('');
    try {
      await resetPassword(verifiedTarget || usernameOrEmail.trim(), password);
      setSuccessMessage('Password reset successfully! Logged in.');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDevLogin = async (target: 'user1' | 'user2') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await switchDemoUser(target);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#161917] border border-[#E3E5DE] dark:border-[#262A27] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 overflow-hidden">
        {/* Header Close & Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img
              src={activeLogo}
              alt="LIFT Official Logo"
              className="w-9 h-9 rounded-xl object-contain p-0.5 border border-[#D5D8D0] dark:border-[#2E3330] bg-[#FFFFFF] dark:bg-[#161917] shadow-xs"
            />
            <div>
              <h2 className="text-base font-bold text-[#161917] dark:text-white tracking-tight">
                LIFT Workspace
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#888F89] dark:text-[#767C77]">
                Authenticated Learning Platform
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full text-[#888F89] hover:text-[#161917] dark:hover:text-white hover:bg-[#F0F1EC] dark:hover:bg-[#202422] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 bg-[#F0F1EC] dark:bg-[#202422] p-1 rounded-2xl border border-[#E3E5DE] dark:border-[#2E3330] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signin');
              resetFormState();
            }}
            className={`py-1.5 rounded-xl transition-all ${
              authModalMode === 'signin'
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs font-bold'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signup');
              resetFormState();
            }}
            className={`py-1.5 rounded-xl transition-all ${
              authModalMode === 'signup'
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs font-bold'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('forgot');
              resetFormState();
            }}
            className={`py-1.5 rounded-xl transition-all ${
              authModalMode === 'forgot'
                ? 'bg-white dark:bg-[#161917] text-[#161917] dark:text-white shadow-xs font-bold'
                : 'text-[#6B7280] dark:text-[#8E948F] hover:text-[#161917] dark:hover:text-white'
            }`}
          >
            Reset Key
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* SIGN IN FORM */}
        {authModalMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                Username or Email
              </label>
              <div className="relative">
                <UserIcon className="w-3.5 h-3.5 text-[#888F89] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. user1 or nivin@lift.local"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs pl-8 pr-3.5 py-2.5 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none focus:border-[#161917] dark:focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('forgot');
                    resetFormState();
                  }}
                  className="text-[11px] font-mono text-[#2563EB] dark:text-[#9DE8BA] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#888F89] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs pl-8 pr-3.5 py-2.5 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none focus:border-[#161917] dark:focus:border-white transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-bold hover:opacity-90 transition-opacity shadow-xs flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* SIGN UP FORM */}
        {authModalMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                Full Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Nivin Benny"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs px-3.5 py-2 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. nivin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs px-3.5 py-2 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nivin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs px-3.5 py-2 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs px-3.5 py-2 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                  Confirm
                </label>
                <input
                  type="password"
                  placeholder="Repeat pass"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs px-3.5 py-2 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-bold hover:opacity-90 transition-opacity shadow-xs flex items-center justify-center space-x-2 mt-1"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Start Learning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* FORGOT / RESET PASSWORD FORM */}
        {authModalMode === 'forgot' && (
          <div className="space-y-3.5">
            {!resetVerified ? (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                    Enter Username or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#888F89] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. user1 or nivin@lift.local"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs pl-8 pr-3.5 py-2.5 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-bold hover:opacity-90 transition-opacity shadow-xs flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Account</span>
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                    New Password for {verifiedTarget}
                  </label>
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs px-3.5 py-2.5 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#8E948F] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F0F1EC] dark:bg-[#202422] border border-[#E3E5DE] dark:border-[#2E3330] rounded-2xl text-xs px-3.5 py-2.5 text-[#161917] dark:text-white placeholder-[#888F89] focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-full bg-[#161917] dark:bg-white text-white dark:text-[#161917] text-xs font-bold hover:opacity-90 transition-opacity shadow-xs flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Update Password & Sign In</span>
                      <KeyRound className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* QUICK DEVELOPER / DEMO PERSON SWITCHER */}
        <div className="pt-3 border-t border-[#F0F1EC] dark:border-[#222624] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#888F89] dark:text-[#767C77] flex items-center space-x-1.5">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Dev Mode 1-Click Personas</span>
            </span>
            {user && (
              <span className="text-[10px] font-mono text-[#10B981] dark:text-[#9DE8BA]">
                Active: {user.full_name || user.username}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDevLogin('user1')}
              disabled={isLoading}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                user?.username === 'user1'
                  ? 'bg-[#EBF7EE] dark:bg-[#1A261E] border-[#10B981] dark:border-[#9DE8BA]'
                  : 'bg-[#F0F1EC] dark:bg-[#202422] border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-3.5 h-3.5 text-[#10B981] dark:text-[#9DE8BA]" />
                <span className="text-xs font-bold text-[#161917] dark:text-white">
                  Nivin
                </span>
              </div>
              <p className="text-[10px] text-[#6B7280] dark:text-[#8E948F] mt-0.5">
                Primary Developer (BM1 Active)
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDevLogin('user2')}
              disabled={isLoading}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                user?.username === 'user2'
                  ? 'bg-[#EBF7EE] dark:bg-[#1A261E] border-[#10B981] dark:border-[#9DE8BA]'
                  : 'bg-[#F0F1EC] dark:bg-[#202422] border-[#E3E5DE] dark:border-[#2E3330] hover:border-[#161917] dark:hover:border-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserIcon className="w-3.5 h-3.5 text-[#2563EB] dark:text-cyan-400" />
                <span className="text-xs font-bold text-[#161917] dark:text-white">
                  Study Partner
                </span>
              </div>
              <p className="text-[10px] text-[#6B7280] dark:text-[#8E948F] mt-0.5">
                Fresh Clean Progress
              </p>
            </button>
          </div>
        </div>

        {/* Active Session & Logout */}
        {user && (
          <div className="pt-2 flex items-center justify-between text-xs text-[#888F89] dark:text-[#767C77]">
            <span>Signed in as <strong className="text-[#161917] dark:text-white font-mono">{user.username}</strong></span>
            <button
              type="button"
              onClick={() => {
                logout();
                setIsAuthModalOpen(false);
              }}
              className="font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
