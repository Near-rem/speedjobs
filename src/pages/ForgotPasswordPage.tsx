import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { authService } from '../services/authService';
import { csrfService } from '../security/csrf';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset fields if token received
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  useEffect(() => {
    setCsrfToken(csrfService.getToken());
  }, []);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.requestPasswordReset(email, csrfToken);
    setIsLoading(false);

    if (res.success) {
      setInfoMsg(t('auth.resetCodeSent'));
      if (res.simulatedToken) {
        setSimulatedToken(res.simulatedToken);
      }
    } else {
      setErrorMsg(t(`auth.${res.error || 'genericAuthError'}`));
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedToken) return;
    if (newPassword !== confirmPassword) {
      setErrorMsg(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const res = await authService.resetPassword(simulatedToken, newPassword, csrfToken);
    setIsLoading(false);

    if (res.success) {
      setIsResetSuccess(true);
      setTimeout(() => {
        onNavigate('/login');
      }, 2000);
    } else {
      setErrorMsg(t(`auth.${res.error || 'genericAuthError'}`));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6">
        <button
          onClick={() => onNavigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o Login</span>
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
          <div className="p-6 bg-slate-900 dark:bg-slate-950 text-white text-center space-y-2 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 mx-auto flex items-center justify-center shadow-md">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight">{t('auth.forgotTitle')}</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Recupere o acesso à sua conta de forma segura e auditada
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5 text-xs">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isResetSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h4 className="font-bold text-base">Senha Redefinida com Sucesso!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Redirecionando você para a página de login segura...
                </p>
              </div>
            ) : simulatedToken ? (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 rounded-xl space-y-1">
                  <span className="font-bold block">Código de Redefinição Ativo:</span>
                  <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-[11px] block truncate text-blue-700 dark:text-blue-300">
                    {simulatedToken}
                  </code>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequestToken} className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Informe o e-mail associado à sua conta SpeedJobs. Enviaremos um código criptográfico para redefinição.
                </p>

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
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Enviando...' : t('auth.submitForgot')}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
