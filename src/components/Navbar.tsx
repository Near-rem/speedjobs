import React, { useState } from 'react';
import {
  Zap,
  Briefcase,
  Layers,
  UserCheck,
  Building2,
  Clock,
  Sparkles,
  Globe,
  Lock,
  LogOut,
  ShieldCheck,
  User,
  Home
} from 'lucide-react';
import { CandidateProfile, JobApplication } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { SupportedLocale } from '../i18n/types';
import { UserSession } from '../services/authService';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  applications: JobApplication[];
  profile: CandidateProfile;
  session: UserSession | null;
  onOpenSecurity: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  applications,
  profile,
  session,
  onOpenSecurity,
  onLogout,
}) => {
  const { locale, setLocale, t } = useI18n();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const activeAppCount = applications.filter(
    (a) => a.status !== 'Declined' && a.status !== 'Hired'
  ).length;

  const languages: { code: SupportedLocale; label: string; flag: string }[] = [
    { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', label: 'Español (ES)', flag: '🇪🇸' },
  ];

  const isRoleEmpresa = session?.role === 'empresa';
  const isRoleFuncionario = session?.role === 'funcionario';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top security marquee */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-current" /> {t('brand.expressBadge')}
          </span>
          <span className="text-slate-300">{t('brand.guaranteeBanner')}</span>
        </div>

        <div className="flex items-center gap-4 text-xs shrink-0">
          {/* Security Center Link */}
          <button
            onClick={onOpenSecurity}
            className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>OWASP Blindado</span>
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>
                {locale === 'pt-BR' ? '🇧🇷 PT' : locale === 'es-ES' ? '🇪🇸 ES' : '🇺🇸 EN'}
              </span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-slate-800 text-xs animate-in fade-in">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLocale(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 cursor-pointer ${
                      locale === l.code ? 'font-bold text-blue-600 bg-blue-50/50' : ''
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-black text-xl tracking-tight text-slate-900">
                  <span>Speed</span>
                  <span className="text-blue-600">Jobs</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none">
                  {t('brand.tagline')}
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => onNavigate('/')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentRoute === '/'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Início</span>
              </button>

              <button
                onClick={() => onNavigate('/vagas')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  currentRoute === '/vagas'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Explorar Vagas</span>
              </button>

              {/* ROLE RESTRICTIONS: Funcionário Only */}
              {(!session || isRoleFuncionario) && (
                <>
                  <button
                    onClick={() => onNavigate('/fast-tracker')}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentRoute === '/fast-tracker'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Fast Tracker</span>
                    {activeAppCount > 0 && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {activeAppCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onNavigate('/speedpass')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentRoute === '/speedpass'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>SpeedPass</span>
                  </button>

                  <button
                    onClick={() => onNavigate('/simulador')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentRoute === '/simulador'
                        ? 'bg-amber-50 text-amber-800'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Simulador 15-Min</span>
                  </button>
                </>
              )}

              {/* ROLE RESTRICTIONS: Empresa Only */}
              {isRoleEmpresa && (
                <button
                  onClick={() => onNavigate('/empresa')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentRoute === '/empresa'
                      ? 'bg-amber-50 text-amber-800 font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>Painel da Empresa</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Empresa Only button: Publicar Vaga */}
            {isRoleEmpresa && (
              <button
                onClick={() => onNavigate('/empresa')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all hover:shadow cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Publicar Vaga Flash</span>
              </button>
            )}

            {/* Authenticated user vs Guest */}
            {session ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50">
                  <span className={`w-2 h-2 rounded-full ${isRoleEmpresa ? 'bg-amber-500' : 'bg-blue-600'}`}></span>
                  <div className="text-left text-xs leading-none">
                    <span className="font-bold text-slate-800 block truncate max-w-[110px]">
                      {session.name}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {isRoleEmpresa ? 'Empresa' : 'Funcionário'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Sair com Segurança"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Entrar
                </button>
                <button
                  onClick={() => onNavigate('/cadastro')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  Criar Conta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50/90 px-2 py-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => onNavigate('/')}
          className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
            currentRoute === '/' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          Início
        </button>
        <button
          onClick={() => onNavigate('/vagas')}
          className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
            currentRoute === '/vagas' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          Vagas
        </button>

        {isRoleEmpresa ? (
          <button
            onClick={() => onNavigate('/empresa')}
            className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
              currentRoute === '/empresa' ? 'bg-white shadow-xs text-amber-700 font-bold' : 'text-slate-600'
            }`}
          >
            Empresa
          </button>
        ) : (
          <>
            <button
              onClick={() => onNavigate('/fast-tracker')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
                currentRoute === '/fast-tracker' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              Tracker ({activeAppCount})
            </button>
            <button
              onClick={() => onNavigate('/speedpass')}
              className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
                currentRoute === '/speedpass' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              SpeedPass
            </button>
          </>
        )}
      </div>
    </header>
  );
};
