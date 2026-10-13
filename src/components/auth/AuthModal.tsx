import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import { authService, UserSession } from '../../services/authService';
import { csrfService } from '../../security/csrf';
import { evaluatePasswordStrength } from '../../security/crypto';

export type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Password reset token state
  const [resetToken, setResetToken] = useState('');
  const [simulatedTokenNotice, setSimulatedTokenNotice] = useState<string | null>(null);

  // UI / Security states
  const [csrfToken, setCsrfToken] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCsrfToken(csrfService.getToken());
      setMode(initialMode);
      setErrorMsg(null);
      setInfoMsg(null);
      setSimulatedTokenNotice(null);
    }
  }, [isOpen, initialMode]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  const passwordStrength = evaluatePasswordStrength(password);

  const handleDemoFill = () => {
    setEmail('alex.rivera@speedtalent.dev');
    setPassword('SpeedJobs@2026!');
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.login(email, password, csrfToken, rememberMe);
    setIsLoading(false);

    if (res.success) {
      const session = authService.getCurrentSession();
      if (session) onSuccess(session);
      onClose();
    } else {
      if (res.lockoutSeconds && res.lockoutSeconds > 0) {
        setLockoutSeconds(res.lockoutSeconds);
        setErrorMsg(t('auth.rateLimitBlocked', { seconds: res.lockoutSeconds }));
      } else if (res.remainingAttempts !== undefined && res.remainingAttempts < 3) {
        setErrorMsg(
          `${t('auth.genericAuthError')} ${t('auth.rateLimitWarning', {
            attempts: res.remainingAttempts,
          })}`
        );
      } else {
        setErrorMsg(t(`auth.${res.error || 'genericAuthError'}`));
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg(t('auth.passwordMismatch'));
      return;
    }
    if (!termsAccepted) {
      setErrorMsg(t('auth.termsAgreement'));
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.register(fullName, email, password, 'funcionario', csrfToken);
    setIsLoading(false);

    if (res.success) {
      const session = authService.getCurrentSession();
      if (session) onSuccess(session);
      onClose();
    } else {
      setErrorMsg(t(`auth.${res.error || 'genericAuthError'}`));
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.requestPasswordReset(email, csrfToken);
    setIsLoading(false);

    if (res.success) {
      setInfoMsg(t('auth.resetCodeSent'));
      if (res.simulatedToken) {
        setSimulatedTokenNotice(res.simulatedToken);
        setResetToken(res.simulatedToken);
      }
    } else {
      setErrorMsg(t(`auth.${res.error || 'genericAuthError'}`));
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.resetPassword(resetToken, password, csrfToken);
    setIsLoading(false);

    if (res.success) {
      setInfoMsg('Password updated successfully. Please sign in.');
      setMode('login');
      setPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(t(`auth.${res.error || 'genericAuthError'}`));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {mode === 'login' && t('auth.loginTitle')}
                {mode === 'register' && t('auth.registerTitle')}
                {mode === 'forgot' && t('auth.forgotTitle')}
                {mode === 'reset' && t('auth.resetTitle')}
              </h3>
              <p className="text-xs text-slate-400">SpeedJobs Security Layer • OWASP Top 10</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Badges Ribbon */}
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <span className="flex items-center gap-1 text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" /> PBKDF2-SHA256
          </span>
          <span className="flex items-center gap-1 text-blue-700">
            <KeyRound className="w-3.5 h-3.5" /> Anti-CSRF
          </span>
          <span className="flex items-center gap-1 text-indigo-700">
            <Clock className="w-3.5 h-3.5" /> Rate-Limited
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Lockout Warning */}
          {lockoutSeconds > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Acesso Bloqueado Temporariamente</strong>
                {t('auth.rateLimitBlocked', { seconds: lockoutSeconds })}
              </div>
            </div>
          )}

          {/* Generic Error Notice */}
          {errorMsg && lockoutSeconds === 0 && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Notice */}
          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span>{infoMsg}</span>
                {simulatedTokenNotice && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/80">
                    <span className="font-semibold block">Código de Redefinição Gerado:</span>
                    <code className="bg-white px-2 py-0.5 rounded border border-emerald-300 font-mono text-[11px] select-all">
                      {simulatedTokenNotice}
                    </code>
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="ml-2 underline font-bold cursor-pointer"
                    >
                      Prosseguir para redefinição
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">{t('auth.passwordLabel')}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    {t('auth.forgotPasswordLink')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-blue-600 cursor-pointer"
                  />
                  <span>{t('auth.rememberMe')}</span>
                </label>

                {/* Quick fill demo button */}
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded font-semibold cursor-pointer transition-colors"
                >
                  🔑 Preencher Demo
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || lockoutSeconds > 0}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('auth.submitLogin')}</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-slate-500 border-t border-slate-100">
                {t('auth.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {t('auth.registerTitle')}
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.fullNameLabel')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Força da Senha:</span>
                      <span
                        className={`font-bold ${
                          passwordStrength.level === 'strong'
                            ? 'text-emerald-600'
                            : passwordStrength.level === 'good'
                            ? 'text-blue-600'
                            : passwordStrength.level === 'fair'
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {passwordStrength.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          passwordStrength.score >= 1 ? 'bg-rose-500' : 'bg-slate-200'
                        }`}
                      ></div>
                      <div
                        className={`h-full ${
                          passwordStrength.score >= 2 ? 'bg-amber-500' : 'bg-slate-200'
                        }`}
                      ></div>
                      <div
                        className={`h-full ${
                          passwordStrength.score >= 3 ? 'bg-blue-500' : 'bg-slate-200'
                        }`}
                      ></div>
                      <div
                        className={`h-full ${
                          passwordStrength.score >= 4 ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer text-slate-600 pt-1">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded accent-blue-600 mt-0.5 cursor-pointer"
                />
                <span className="text-[11px] leading-tight">{t('auth.termsAgreement')}</span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>{t('auth.submitRegister')}</span>
                )}
              </button>

              <div className="pt-2 text-center text-slate-500 border-t border-slate-100">
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {t('nav.signIn')}
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4 text-xs">
              <p className="text-slate-600">{t('auth.forgotSubtitle')}</p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>{t('auth.submitForgot')}</span>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {t('auth.backToLogin')}
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código de Redefinição
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Código de uso único"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>{t('auth.submitReset')}</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
