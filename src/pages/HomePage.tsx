import React from 'react';
import {
  Zap,
  Briefcase,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  Flame,
  Star,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { Job, UserRole } from '../types';
import { UserSession } from '../services/authService';

interface HomePageProps {
  jobs: Job[];
  session: UserSession | null;
  onNavigate: (route: string) => void;
  onSelectJob: (job: Job) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  jobs,
  session,
  onNavigate,
  onSelectJob,
}) => {
  const { t } = useI18n();

  return (
    <div className="space-y-16 pb-16 transition-colors duration-200">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-sm shadow-inner">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Contratação Ultra-Rápida • Resposta Média em Menos de 18 Horas</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Blindado OWASP
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            O Mercado de Trabalho na Velocidade do <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-400 bg-clip-text text-transparent">SpeedJobs</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Elimine processos seletivos de meses. Candidaturas em 1-clique com <strong>SpeedPass Verificado</strong> para profissionais e contratação garantida em 24h a 48h para empresas.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => onNavigate('/vagas')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-xl text-sm shadow-xl shadow-blue-600/25 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <Search className="w-4 h-4" />
              <span>Explorar Vagas Abertas</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {!session ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onNavigate('/cadastro')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-7 py-4 rounded-xl text-sm transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Criar Conta (Empresa ou Candidato)</span>
                </button>
                <button
                  onClick={() => onNavigate('/login')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-200 font-bold px-6 py-4 rounded-xl text-sm transition-all cursor-pointer"
                >
                  <span>Entrar</span>
                </button>
              </div>
            ) : session.role === 'empresa' ? (
              <button
                onClick={() => onNavigate('/empresa')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-8 py-4 rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Building2 className="w-4 h-4" />
                <span>Painel da Empresa ({session.companyName || session.name})</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/speedpass')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-8 py-4 rounded-xl text-sm transition-all cursor-pointer shadow-lg"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-current" />
                <span>Meu SpeedPass ({session.name})</span>
              </button>
            )}
          </div>

          {/* Micro trust indicators */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem taxas para candidatos
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Candidatura instantânea em 0.4s
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Empresas verificadas e com SLA
            </span>
          </div>
        </div>
      </section>

      {/* METRICS & STATS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors">
          <div className="p-3 text-center sm:text-left border-r border-slate-100 dark:border-slate-800 last:border-0">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">18 Horas</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Tempo Médio de Resposta</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">⚡ 4x mais veloz</div>
          </div>
          <div className="p-3 text-center sm:text-left border-r border-slate-100 dark:border-slate-800 last:border-0">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">1.450+</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Vagas Flash Publicadas</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1">SLA de 24h a 48h</div>
          </div>
          <div className="p-3 text-center sm:text-left border-r border-slate-100 dark:border-slate-800 last:border-0">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">98.4%</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Índice de Retorno</div>
            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold mt-1">Sem candidaturas ignoradas</div>
          </div>
          <div className="p-3 text-center sm:text-left">
            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">256-bit</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">Criptografia PBKDF2</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">OWASP Top 10 Blindado</div>
          </div>
        </div>
      </section>

      {/* DUAL VALUE PROPOSITION (Empresas vs Funcionários) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Perfis Desenhados para Alta Eficiência
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Estrutura rígida de permissões e segurança adaptada às necessidades de cada lado da contratação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Candidato / Funcionário */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs hover:shadow-md transition-all space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Para Profissionais & Talentos
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Perfil Funcionário / Candidato
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Crie seu <strong>SpeedPass™</strong> com suas tecnologias verificadas, pretensão salarial e disponibilidade. Candidate-se em 1-clique sem preencher formulários repetitivos.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Candidatura instantânea com SpeedPass</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Acompanhamento no Fast Tracker com status transparente</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Simulador de Entrevista de 15 Minutos para treino de ritmo</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Restrição: Não publica vagas</span>
              <button
                onClick={() => onNavigate('/vagas')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
              >
                <span>Ver Vagas Disponíveis</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Empresa / Contratante */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs hover:shadow-md transition-all space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Para Empresas & Recrutadores
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Perfil Empresa / Contratante
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Publique vagas com urgência garantida (24h/48h). Receba candidatos pré-ranqueados por índice de compatibilidade e convide para um <strong>Speed Chat de 15 minutos</strong>.
                </p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Publicação rápida com modelos pré-configurados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Pipeline visual com convite de entrevista e propostas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Filtro de compatibilidade técnica em tempo real</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Restrição: Não se candidata a vagas</span>
              <button
                onClick={() => onNavigate(session?.role === 'empresa' ? '/empresa' : '/cadastro')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer"
              >
                <span>{session?.role === 'empresa' ? 'Acessar Painel da Empresa' : 'Cadastrar Empresa'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT FLASH JOBS PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-500 text-slate-950 font-black">
                <Flame className="w-4 h-4 fill-current" />
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Vagas Flash com Resposta em 24 Horas
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Posições ativas com compromisso de resposta rápida das equipes de contratação.
            </p>
          </div>

          <button
            onClick={() => onNavigate('/vagas')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
          >
            <span>Ver Todas as {jobs.length} Vagas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              onClick={() => {
                onSelectJob(job);
                onNavigate('/vagas');
              }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl shrink-0">
                    {job.logo}
                  </div>
                  <span className="text-[10px] font-black uppercase bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                    {job.urgency}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {job.title}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {job.company} • {job.location} ({job.remoteType})
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {job.skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {job.salaryPeriod === 'hr' ? `$${job.salaryMin}-$${job.salaryMax}/hr` : `$${Math.round(job.salaryMin/1000)}k-$${Math.round(job.salaryMax/1000)}k/ano`}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                  Ver Detalhes <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
              Comece Hoje Mesmo no SpeedJobs
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pronto para Acelerar sua Carreira ou seu Time?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Junte-se a milhares de engenheiros, designers e empresas inovadoras que contrataram com decisão em 48 horas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('/cadastro')}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer text-center"
            >
              Criar Conta Gratuita
            </button>
            <button
              onClick={() => onNavigate('/vagas')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
            >
              Explorar Vagas
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
