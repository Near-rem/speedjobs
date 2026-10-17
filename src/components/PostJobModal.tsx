import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Sparkles,
  DollarSign,
  Building2,
  MapPin,
  Clock,
  Plus,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Copy,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Receipt,
  Loader2
} from 'lucide-react';
import {
  Job,
  JobType,
  RemoteType,
  UrgencyTier,
  ExperienceLevel
} from '../types';
import { useI18n } from '../i18n/I18nContext';
import { UserSession, authService } from '../services/authService';
import { csrfService } from '../security/csrf';
import { sanitizeString } from '../security/sanitizer';
import {
  getStoredCompanyProfile,
  isCompanyProfileComplete
} from '../utils/storage';

interface PostJobModalProps {
  isOpen: boolean;
  session: UserSession | null;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
  onGoToCompanyProfile?: () => void;
}

type ModalStep = 'form' | 'payment' | 'receipt';

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  session,
  onClose,
  onJobCreated,
  onGoToCompanyProfile,
}) => {
  const { t } = useI18n();

  // Multi-step state: Form -> Payment (R$ 1,00) -> Digital Receipt
  const [step, setStep] = useState<ModalStep>('form');

  // Form fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [remoteType, setRemoteType] = useState<RemoteType>('Remote');
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [urgency, setUrgency] = useState<UrgencyTier>('Flash (24h)');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Mid');
  const [salaryMin, setSalaryMin] = useState<number>(9000);
  const [salaryMax, setSalaryMax] = useState<number>(14000);
  const [salaryPeriod, setSalaryPeriod] = useState<'yr' | 'hr'>('yr');
  const [skillsStr, setSkillsStr] = useState('React, TypeScript, Node.js, Tailwind');
  const [description, setDescription] = useState('');
  const [hiringSpeedDays, setHiringSpeedDays] = useState(1);
  const [logo, setLogo] = useState('⚡');

  // Payment simulated state
  const [copiedPix, setCopiedPix] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [paidJob, setPaidJob] = useState<Job | null>(null);

  // Security & Validation
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const companyProfile = session?.email
    ? getStoredCompanyProfile(session.email)
    : getStoredCompanyProfile();

  const completeness = isCompanyProfileComplete(companyProfile);

  // Pre-fill company info when opening
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setErrorMsg(null);
      setIsProcessingPayment(false);
      setCopiedPix(false);
      setPaymentTransactionId(`PIX-BRL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`);

      if (companyProfile) {
        setCompany(companyProfile.tradeName || companyProfile.companyName || session?.companyName || '');
        if (companyProfile.logoUrl) {
          setLogo(companyProfile.logoUrl);
        }
        if (companyProfile.location?.city && companyProfile.location?.state) {
          setLocation(`${companyProfile.location.city}, ${companyProfile.location.state}`);
        }
      }
    }
  }, [isOpen, session, companyProfile]);

  if (!isOpen) return null;

  // Template pre-fill
  const fillTemplate = (type: 'fullstack' | 'ai' | 'design') => {
    if (type === 'fullstack') {
      setTitle('Desenvolvedor Full Stack Sênior (React / Node.js)');
      setDepartment('Engenharia de Software');
      setUrgency('Flash (24h)');
      setHiringSpeedDays(1);
      setSalaryMin(12000);
      setSalaryMax(18000);
      setSkillsStr('React, TypeScript, Node.js, PostgreSQL, Docker, Tailwind');
      setDescription(
        'Buscamos engenheiro full-stack de alto calibre para liderar novas funcionalidades com deploy imediato. Entrevista de 15 minutos agendada hoje e proposta em até 24 horas.'
      );
    } else if (type === 'ai') {
      setTitle('Engenheiro de IA / LLM (Python / PyTorch)');
      setDepartment('Inteligência Artificial');
      setUrgency('Flash (24h)');
      setHiringSpeedDays(1);
      setSalaryMin(16000);
      setSalaryMax(24000);
      setSkillsStr('Python, PyTorch, LangChain, Vector DB, FastAPI');
      setDescription(
        'Desenvolvimento e fine-tuning de modelos generativos integrados aos nossos produtos. Resposta em menos de 24 horas garantida.'
      );
    } else {
      setTitle('Product Designer Sênior (Figma / Design Systems)');
      setDepartment('Design de Produto');
      setUrgency('Urgent (48h)');
      setHiringSpeedDays(2);
      setSalaryMin(10000);
      setSalaryMax(15000);
      setSkillsStr('Figma, Design Systems, UX Research, Prototipagem Rápida');
      setDescription(
        'Criar interfaces elegantes, ágeis e acessíveis com foco em produtos SaaS modernos. Contratação em 48h.'
      );
    }
  };

  const handleAdvanceToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Strict validation
    if (!title.trim()) {
      setErrorMsg('Informe o título do cargo / vaga.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Por favor, informe uma breve descrição da vaga.');
      return;
    }

    // Advance to R$ 1,00 Payment Step
    setStep('payment');
  };

  const pixCodePayload = `00020126580014br.gov.bcb.pix0136speedjobs-pay-${paymentTransactionId || '1BRL'}52040000530398654041.005802BR5913SpeedJobs Corp6009Sao Paulo62070503***6304E8A1`;

  const handleCopyPix = () => {
    navigator.clipboard?.writeText(pixCodePayload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleConfirmPixPayment = () => {
    setIsProcessingPayment(true);
    setErrorMsg(null);

    // Simulate instant Pix banking reconciliation (1.5 seconds)
    setTimeout(() => {
      // CSRF check
      const token = csrfService.getToken();
      if (!csrfService.validateToken(token)) {
        setIsProcessingPayment(false);
        setErrorMsg(t('auth.csrfError'));
        return;
      }

      const skills = skillsStr
        .split(',')
        .map((s) => sanitizeString(s))
        .filter(Boolean);

      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: sanitizeString(title) || 'Especialista em Software',
        company: companyProfile?.tradeName || sanitizeString(company) || 'Empresa SpeedJobs',
        logo: companyProfile?.logoUrl || logo || '⚡',
        location: location || (companyProfile?.location?.city ? `${companyProfile.location.city}, ${companyProfile.location.state}` : 'São Paulo, SP'),
        remoteType,
        salaryMin: Math.max(0, Number(salaryMin) || 8000),
        salaryMax: Math.max(0, Number(salaryMax) || 12000),
        salaryPeriod,
        jobType,
        urgency,
        skills: skills.length > 0 ? skills : ['React', 'TypeScript'],
        experienceLevel,
        description:
          sanitizeString(description) ||
          'Vaga expressa com contratação acelerada e processo seletivo em até 24 horas.',
        responsibilities: [
          'Desenvolver soluções escaláveis com alto padrão de qualidade e performance',
          'Participar de revisões de arquitetura ágeis e deploy contínuo',
          'Colaborar diretamente com o time de produto e liderança técnica'
        ],
        requirements: [
          'Experiência sólida na stack requisitada e boas práticas de engenharia',
          'Autonomia e comunicação clara para entregas em ambientes rápidos',
          'Foco em resolução ágil de problemas'
        ],
        benefits: [
          'Garantia de feedback do processo em até 24-48 horas',
          'Remuneração compatível com o mercado e bônus de performance',
          'Auxílio home-office e plano de saúde'
        ],
        postedAt: 'Agora mesmo',
        hiringSpeedDays: Math.max(1, Number(hiringSpeedDays) || 1),
        applicantsCount: 0,
        featured: true,
        speedInterviewAvailable: true,
        department: sanitizeString(department) || 'Tecnologia',
        postedByEmail: session?.email,
        paidPostFee: true,
        paymentId: paymentTransactionId,
        companyTaxId: companyProfile?.taxId,
      };

      setPaidJob(newJob);
      setIsProcessingPayment(false);
      setStep('receipt');
    }, 1500);
  };

  const handleFinishAndPublish = () => {
    if (paidJob) {
      onJobCreated(paidJob);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 transition-colors">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black shadow-xs">
              <Zap className="w-5 h-5 fill-slate-950" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 dark:text-white text-lg">
                  Publicar Vaga de Contratação Expressa
                </h3>
                <span className="text-[11px] font-black uppercase bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                  Taxa R$ 1,00
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'form'
                  ? 'Passo 1 de 2: Detalhes da Vaga Flash'
                  : step === 'payment'
                  ? 'Passo 2 de 2: Taxa Simbólica de R$ 1,00 via Pix'
                  : 'Vaga Publicada com Sucesso!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY CONTENT */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          {/* GUARD: IF COMPANY PROFILE IS NOT COMPLETE */}
          {!completeness.isComplete ? (
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 mx-auto flex items-center justify-center shadow-xs">
                <Building2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-3 py-1 rounded-full">
                  Perfil da Empresa Obrigatório
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Preencha a aba &quot;Meu Perfil&quot; antes de contratar
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Para manter a segurança contra vagas falsas e proporcionar máxima transparência aos candidatos, é obrigatório cadastrar a <strong>Foto da empresa</strong>, <strong>Localização</strong>, <strong>CNPJ ou MEI</strong> e os <strong>Horários e dias de funcionamento (abre e fecha)</strong>.
                </p>
              </div>

              {/* Checklist */}
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 block">Itens pendentes no seu perfil:</span>
                {completeness.missingFields.map((field) => (
                  <div key={field} className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{field}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onGoToCompanyProfile) onGoToCompanyProfile();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Preencher Meu Perfil Agora</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : step === 'form' ? (
            /* STEP 1: JOB CREATION FORM */
            <form onSubmit={handleAdvanceToPayment} className="space-y-5">
              {/* Profile Verified pill */}
              <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    {companyProfile?.logoUrl ? (
                      <img
                        src={companyProfile.logoUrl}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 m-1.5" />
                    )}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      {companyProfile?.tradeName || companyProfile?.companyName}
                    </span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      CNPJ/MEI: {companyProfile?.taxId} • Perfil Verificado
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                  Post: R$ 1,00
                </span>
              </div>

              {/* Template Presets */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Modelos Rápidos:
                </span>
                <button
                  type="button"
                  onClick={() => fillTemplate('fullstack')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  Full Stack (24h)
                </button>
                <button
                  type="button"
                  onClick={() => fillTemplate('ai')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  Machine Learning
                </button>
                <button
                  type="button"
                  onClick={() => fillTemplate('design')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  UI/UX Designer
                </button>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título da Vaga / Cargo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Desenvolvedor Full Stack Sênior (React / Node)"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Department & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Departamento / Área
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Ex: Engenharia de Software"
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nível de Urgência da Contratação
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as UrgencyTier)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Flash (24h)">⚡ Flash (Decisão em 24h)</option>
                    <option value="Urgent (48h)">🔥 Urgente (Decisão em 48h)</option>
                    <option value="Same-Week">📅 Mesma Semana</option>
                    <option value="Standard">📋 Padrão</option>
                  </select>
                </div>
              </div>

              {/* Modality, JobType, Level */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Modalidade
                  </label>
                  <select
                    value={remoteType}
                    onChange={(e) => setRemoteType(e.target.value as RemoteType)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Remote">100% Remoto</option>
                    <option value="Hybrid">Híbrido</option>
                    <option value="On-site">Presencial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Regime de Trabalho
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value as JobType)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Full-time">CLT / Full-time</option>
                    <option value="Contract">PJ / Prestação</option>
                    <option value="Part-time">Meio Período</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Senioridade
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Entry">Estágio / Trainee</option>
                    <option value="Junior">Júnior</option>
                    <option value="Mid">Pleno</option>
                    <option value="Senior">Sênior</option>
                    <option value="Lead">Especialista / Lead</option>
                  </select>
                </div>
              </div>

              {/* Salary Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faixa Salarial Mínima (R$)
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faixa Salarial Máxima (R$)
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Habilidades & Competências (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  placeholder="React, TypeScript, Node.js, SQL"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição da Vaga & Desafios
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o escopo das entregas e as expectativas para a posição..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Advance to payment button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Avançar para Pagamento (R$ 1,00)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : step === 'payment' ? (
            /* STEP 2: PIX PAYMENT SCREEN (R$ 1,00) */
            <div className="space-y-6">
              {/* Price Callout */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 text-center space-y-2 shadow-lg border border-slate-800">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 font-black text-xs rounded-full">
                  <DollarSign className="w-3.5 h-3.5" /> Taxa de Publicação de Post
                </div>
                <div className="text-4xl font-black tracking-tight text-white">
                  R$ 1,00
                </div>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Cobrança simbólica de <strong>R$ 1,00</strong> para validar a autenticidade da vaga, eliminar spams e assegurar retorno em 24h para os candidatos.
                </p>
              </div>

              {/* PIX Details */}
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
                  {/* Styled Pix QR Code simulation */}
                  <div className="w-40 h-40 bg-white p-3 rounded-2xl border-2 border-indigo-200 shadow-sm flex flex-col items-center justify-center relative shrink-0">
                    <QrCode className="w-28 h-28 text-slate-900 stroke-[1.2]" />
                    <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider mt-1">
                      PIX BANCO CENTRAL
                    </span>
                  </div>

                  {/* Pix Copy and Paste */}
                  <div className="space-y-3 flex-1 w-full text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 font-bold block mb-1">
                        Chave Pix Copia e Cola:
                      </span>
                      <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all select-all">
                        {pixCodePayload}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedPix ? 'Código Pix Copiado!' : 'Copiar Código Pix'}</span>
                      </button>

                      <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Expira em 14:59 min</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Beneficiário: SpeedJobs Pagamentos Ltda</span>
                  <span>ID: {paymentTransactionId}</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  disabled={isProcessingPayment}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar aos dados da vaga</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPixPayment}
                  disabled={isProcessingPayment}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verificando Pix no Banco...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Pagamento de R$ 1,00</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 3: DIGITAL RECEIPT AND SUCCESS */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-extrabold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-0.5 rounded-full">
                  Pagamento Confirmado
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Vaga Publicada com Sucesso!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  A taxa de R$ 1,00 foi processada e seu post já está ativo e com destaque na plataforma.
                </p>
              </div>

              {/* Digital receipt card */}
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-left text-xs space-y-3 max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Comprovante de Publicação</span>
                  </div>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">R$ 1,00</span>
                </div>

                <div className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span>Vaga:</span>
                    <strong className="text-slate-800 dark:text-slate-100">{paidJob?.title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Empresa:</span>
                    <strong className="text-slate-800 dark:text-slate-100">{paidJob?.company}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CNPJ/MEI:</span>
                    <span className="font-mono">{companyProfile?.taxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transação:</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{paymentTransactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Autenticação:</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400">SHA256-PIX-VERIFIED</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinishAndPublish}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Ver Vaga no Feed de Contratação</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
