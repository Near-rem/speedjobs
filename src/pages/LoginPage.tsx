import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Zap,
  Building2,
  UserCheck
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { authService, UserSession } from '../services/authService';
import { csrfService } from '../security/csrf';

interface LoginPageProps {
  onSuccess: (session: UserSession) => void;
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigate }) => {
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    setCsrfToken(csrfService.getToken());
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const fillCandidateDemo = () => {
    setEmail('alex.rivera@speedtalent.dev');
    setPassword('SpeedJobs@2026!');
    setErrorMsg(null);
  };

  const fillEmployerDemo = () => {
    setEmail('recrutador@hyperscale.com');
    setPassword('SpeedJobs@2026!');
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.login(email, password, csrfToken, rememberMe);
    setIsLoading(false);

    if (res.success) {
      const session = authService.getCurrentSession();
      if (session) {
        onSuccess(session);
        // Route according to role
        if (session.role === 'empresa') {
          onNavigate('/empresa');
        } else {
          onNavigate('/vagas');
        }
      }
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a Página Inicial</span>
        </button>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
          {/* Header */}
          <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white text-center space-y-2 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight">{t('auth.loginTitle')}</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Acesso seguro à plataforma SpeedJobs com criptografia PBKDF2
            </p>
          </div>

          {/* Security Badges */}
          <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> PBKDF2-SHA256
            </span>
            <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400">
              <KeyRound className="w-3.5 h-3.5" /> Anti-CSRF
            </span>
            <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-400">
              <Clock className="w-3.5 h-3.5" /> Anti-Brute Force
            </span>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Lockout Warning */}
            {lockoutSeconds > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Bloqueio Temporário Ativado</strong>
                  {t('auth.rateLimitBlocked', { seconds: lockoutSeconds })}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && lockoutSeconds === 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">{t('auth.passwordLabel')}</label>
                  <button
                    type="button"
                    onClick={() => onNavigate('/recuperar-senha')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer"
                  >
                    {t('auth.forgotPasswordLink')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 text-slate-900 dark:text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-blue-600 cursor-pointer"
                  />
                  <span>{t('auth.rememberMe')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || lockoutSeconds > 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
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

              {/* Quick Demo Credentials */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block text-center uppercase tracking-wider">
                  Contas de Demonstração Rápidas
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={fillCandidateDemo}
                    className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Funcionário
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 truncate">Alex Rivera (Candidato)</div>
                  </button>

                  <button
                    type="button"
                    onClick={fillEmployerDemo}
                    className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-left transition-colors cursor-pointer"
                  >
                    <div className="font-bold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Empresa
                    </div>
                    <div className="text-[10px] text-amber-700 dark:text-amber-400 truncate">HyperScale Labs</div>
                  </button>
                </div>
              </div>

              <div className="pt-3 text-center text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                {t('auth.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/cadastro')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  {t('auth.registerTitle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
