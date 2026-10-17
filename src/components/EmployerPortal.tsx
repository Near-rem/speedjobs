import React from 'react';
import {
  Building2,
  Users,
  Clock,
  Plus,
  Video,
  Award,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  Lock,
  Store,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  MapPin
} from 'lucide-react';
import { Job, JobApplication, ApplicationStatus } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { UserSession } from '../services/authService';
import { getStoredCompanyProfile, isCompanyProfileComplete } from '../utils/storage';
import { isCompanyOpenNow } from '../utils/taxValidators';

interface EmployerPortalProps {
  jobs: Job[];
  applications: JobApplication[];
  session: UserSession | null;
  onNavigate: (route: string) => void;
  onOpenPostJob: () => void;
  onSelectJob: (job: Job) => void;
  onUpdateAppStatus: (appId: string, status: ApplicationStatus) => void;
}

export const EmployerPortal: React.FC<EmployerPortalProps> = ({
  jobs,
  applications,
  session,
  onNavigate,
  onOpenPostJob,
  onSelectJob,
  onUpdateAppStatus,
}) => {
  const { t } = useI18n();

  const companyProfile = getStoredCompanyProfile(session?.email);
  const completeness = isCompanyProfileComplete(companyProfile);
  const openStatus = isCompanyOpenNow(
    companyProfile.workingHours?.days || [],
    companyProfile.workingHours?.openTime || '',
    companyProfile.workingHours?.closeTime || ''
  );

  // RBAC Frontend Security Check
  if (!session || session.role !== 'empresa') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider bg-rose-50 dark:bg-rose-950/50 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            Acesso Restrito • RBAC Ativo
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Painel Exclusivo para Contratantes
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            {session
              ? `Sua conta atual está configurada como "${session.role.toUpperCase()}". Candidatos não possuem permissão para gerenciar ou criar vagas.`
              : 'Você precisa entrar com uma conta de Empresa para acessar as ferramentas de gestão de vagas e pipeline de contratação rápida.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {!session ? (
            <>
              <button
                onClick={() => onNavigate('/login')}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Fazer Login como Empresa
              </button>
              <button
                onClick={() => onNavigate('/cadastro')}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cadastrar Conta Empresa
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('/vagas')}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Ir para Vagas de Candidatos
            </button>
          )}
          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Voltar para o Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 transition-colors duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('employer.title')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('employer.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/meu-perfil')}
            className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Store className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Meu Perfil</span>
          </button>

          <button
            onClick={onOpenPostJob}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Publicar Vaga</span>
            <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              R$ 1,00
            </span>
          </button>
        </div>
      </div>

      {/* Mandatory Company Profile Banner */}
      {!completeness.isComplete ? (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-300 dark:border-amber-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Aba &quot;Meu Perfil&quot; Pendente de Conclusão (Obrigatório)
                  </h3>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full">
                    Bloqueia criação de posts
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  Para publicar vagas por R$ 1,00, a empresa deve obrigatoriamente preencher: <strong>Foto da Empresa</strong>, <strong>Localização Completa</strong>, <strong>CNPJ ou MEI</strong> e <strong>Horários e Dias de Funcionamento</strong>.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  {completeness.missingFields.map((f) => (
                    <span key={f} className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded">
                      • {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/meu-perfil')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <span>Completar Meu Perfil Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              {companyProfile.logoUrl ? (
                <img
                  src={companyProfile.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-slate-400 m-3" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                  {companyProfile.tradeName || companyProfile.companyName}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Perfil Verificado
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {companyProfile.taxIdType}: {companyProfile.taxId}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {companyProfile.location.city || 'São Paulo'} - {companyProfile.location.state || 'SP'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {openStatus.statusText}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/meu-perfil')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Editar Meu Perfil
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Taxa por Post</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">R$ 1,00</div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
            Pix Instantâneo Ativo
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('employer.activePostings')}</span>
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{jobs.length}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            ⚡ 24h SLA Garantido
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('employer.candidatesReview')}</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{applications.length}</div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">SpeedPass pré-verificados</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('employer.avgTtf')}</span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">2.1 dias</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Média tradicional: 36 dias
          </p>
        </div>
      </div>

      {/* Applicant Review Queue */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{t('employer.pipelineTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('employer.pipelineSub')}</p>
          </div>
          <span className="text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full">
            {applications.length} Candidatos
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {applications.length === 0 ? (
            <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-xs">
              Nenhuma candidatura pendente no momento.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{app.jobTitle}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs text-slate-600 dark:text-slate-300">{app.company}</span>
                    <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                      {app.status}
                    </span>
                  </div>

                  {app.pitchNote && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/70 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      &quot;{app.pitchNote}&quot;
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-3">
                    <span>Enviado: {app.appliedAt}</span>
                    <span>•</span>
                    <span>Disponibilidade: {app.interviewSlot || 'Aberta'}</span>
                  </div>
                </div>

                {/* Recruiter Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onUpdateAppStatus(app.id, 'Speed Interview')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 fill-current" />
                    <span>{t('employer.inviteChat')}</span>
                  </button>

                  <button
                    onClick={() => onUpdateAppStatus(app.id, 'Offer Extended')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{t('employer.sendOffer')}</span>
                  </button>

                  <button
                    onClick={() => onUpdateAppStatus(app.id, 'Declined')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title={t('employer.passAction')}
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Jobs List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">{t('employer.activePostings')}</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">{jobs.length} vagas publicadas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.slice(0, 6).map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 bg-slate-50/40 dark:bg-slate-800/40"
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0">
                {job.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{job.title}</h4>
                  <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    {job.urgency}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {job.company} • {job.location} ({job.remoteType})
                </div>
                <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                  {job.applicantsCount} candidatos • ~{job.hiringSpeedDays}d turnaround
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
