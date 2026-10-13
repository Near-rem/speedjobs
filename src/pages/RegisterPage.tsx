import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Building2,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { authService, UserSession } from '../services/authService';
import { csrfService } from '../security/csrf';
import { evaluatePasswordStrength } from '../security/crypto';
import { UserRole } from '../types';

interface RegisterPageProps {
  onSuccess: (session: UserSession) => void;
  onNavigate: (route: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onNavigate }) => {
  const { t } = useI18n();

  const [role, setRole] = useState<UserRole>('funcionario');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCsrfToken(csrfService.getToken());
  }, []);

  const passwordStrength = evaluatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg(t('auth.passwordMismatch'));
      return;
    }
    if (!termsAccepted) {
      setErrorMsg(t('auth.termsAgreement'));
      return;
    }

    setIsLoading(true);
    const res = await authService.register(
      fullName,
      email,
      password,
      role,
      csrfToken,
      companyName
    );
    setIsLoading(false);

    if (res.success) {
      const session = authService.getCurrentSession();
      if (session) {
        onSuccess(session);
        if (role === 'empresa') {
          onNavigate('/empresa');
        } else {
          onNavigate('/vagas');
        }
      }
    } else {
      setErrorMsg(t(`auth.${res.error || 'genericAuthError'}`));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-xl w-full space-y-6">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a Página Inicial</span>
        </button>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white text-center space-y-2 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 mx-auto flex items-center justify-center shadow-md">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black tracking-tight">{t('auth.registerTitle')}</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Selecione seu perfil e cadastre-se na rede SpeedJobs com segurança criptografada
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Error Notice */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* EXPLICIT ROLE SELECTOR */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-900 text-xs">
                  1. Escolha o Tipo de Conta <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option: Funcionário / Candidato */}
                  <div
                    onClick={() => setRole('funcionario')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      role === 'funcionario'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          role === 'funcionario'
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {role === 'funcionario' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        )}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Funcionário / Candidato</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Busca vagas e se candidata com SpeedPass.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100/80 text-[10px] text-rose-600 font-semibold">
                      ⚠️ Restrição: Não pode publicar vagas.
                    </div>
                  </div>

                  {/* Option: Empresa / Contratante */}
                  <div
                    onClick={() => setRole('empresa')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      role === 'empresa'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          role === 'empresa'
                            ? 'border-amber-600 bg-amber-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {role === 'empresa' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        )}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Empresa / Contratante</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Cria vagas, gerencia candidatos e faz ofertas.
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100/80 text-[10px] text-rose-600 font-semibold">
                      ⚠️ Restrição: Não pode se candidatar a vagas.
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. REGISTRATION DETAILS */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-900 text-xs">
                  2. Dados do Usuário & Acesso
                </label>

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
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                    />
                  </div>
                </div>

                {role === 'empresa' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nome da Empresa / Organização
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: HyperScale Labs Ltda"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                      />
                    </div>
                  </div>
                )}

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
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
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
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

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
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                    />
                  </div>
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
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Concluir Cadastro ({role === 'empresa' ? 'Empresa' : 'Funcionário'})</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-slate-500 border-t border-slate-100">
                {t('auth.hasAccount')}{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {t('nav.signIn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
