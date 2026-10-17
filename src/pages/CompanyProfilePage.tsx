import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  Sparkles,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  Globe,
  FileText,
  Calendar,
  Upload,
  Info
} from 'lucide-react';
import { CompanyProfile, CompanyLocation, CompanyWorkingHours } from '../types';
import {
  getStoredCompanyProfile,
  saveCompanyProfile,
  isCompanyProfileComplete
} from '../utils/storage';
import {
  formatCnpj,
  formatCep,
  formatPhone,
  isValidCnpj,
  isCompanyOpenNow,
  BRAZIL_STATES,
  WEEK_DAYS
} from '../utils/taxValidators';
import { UserSession } from '../services/authService';

interface CompanyProfilePageProps {
  session: UserSession | null;
  onNavigate: (route: string) => void;
  onOpenPostJob?: () => void;
}

const SAMPLE_LOGOS = [
  {
    label: 'Tech Hub Moderno',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Escritório Corporativo',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Startup Coworking',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Edifício Comercial',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
  },
];

export const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({
  session,
  onNavigate,
  onOpenPostJob,
}) => {
  const [profile, setProfile] = useState<CompanyProfile>(() =>
    getStoredCompanyProfile(session?.email)
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync if session changes
  useEffect(() => {
    if (session?.email) {
      const stored = getStoredCompanyProfile(session.email);
      setProfile(stored);
    }
  }, [session?.email]);

  const completeness = isCompanyProfileComplete(profile);
  const openStatus = isCompanyOpenNow(
    profile.workingHours?.days || [],
    profile.workingHours?.openTime || '',
    profile.workingHours?.closeTime || ''
  );

  // Handlers for taxId
  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpj(e.target.value);
    setProfile((prev) => ({ ...prev, taxId: formatted }));
  };

  // Handlers for CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setProfile((prev) => ({
      ...prev,
      location: { ...prev.location, cep: formatted },
    }));
  };

  // Handlers for Phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setProfile((prev) => ({ ...prev, phone: formatted }));
  };

  // Toggle Day
  const handleToggleDay = (day: string) => {
    const currentDays = profile.workingHours?.days || [];
    const updated = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    setProfile((prev) => ({
      ...prev,
      workingHours: { ...prev.workingHours, days: updated },
    }));
  };

  const handleApplyPresetDays = (preset: 'commercial' | 'commercialSaturday' | 'all') => {
    let days: string[] = [];
    if (preset === 'commercial') {
      days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    } else if (preset === 'commercialSaturday') {
      days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    } else {
      days = [...WEEK_DAYS];
    }
    setProfile((prev) => ({
      ...prev,
      workingHours: { ...prev.workingHours, days },
    }));
  };

  // Image Upload handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile((prev) => ({ ...prev, logoUrl: reader.result as string }));
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict validation
    if (!profile.logoUrl) {
      setErrorMessage('A foto ou logotipo da empresa é obrigatória.');
      return;
    }

    if (!isValidCnpj(profile.taxId)) {
      setErrorMessage('Informe um CNPJ ou MEI válido com 14 dígitos cadastrados.');
      return;
    }

    if (
      !profile.location.street ||
      !profile.location.number ||
      !profile.location.neighborhood ||
      !profile.location.city ||
      !profile.location.state
    ) {
      setErrorMessage('Por favor, preencha o endereço completo da empresa (localização).');
      return;
    }

    if (!profile.workingHours.days || profile.workingHours.days.length === 0) {
      setErrorMessage('Selecione pelo menos um dia de funcionamento da empresa.');
      return;
    }

    if (!profile.workingHours.openTime || !profile.workingHours.closeTime) {
      setErrorMessage('Informe os horários de abertura e fechamento da empresa.');
      return;
    }

    // Save
    const updated = saveCompanyProfile(profile, session?.email);
    setProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // If not empresa, show friendly access notice
  if (session && session.role !== 'empresa') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 mx-auto flex items-center justify-center">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Aba Exclusiva para Empresas</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          A aba &quot;Meu Perfil&quot; destina-se ao cadastramento de CNPJ/MEI, foto da empresa, localização e horários de funcionamento das empresas que publicam vagas.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('/vagas')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Explorar Vagas
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in transition-colors duration-200">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black">
              <Building2 className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              Aba Obrigatória • Perfil da Empresa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Meu Perfil da Empresa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Preencha todos os dados obrigatórios (Foto da Empresa, Localização, CNPJ/MEI e Horários de Abertura/Fechamento) para habilitar a publicação de vagas por <strong className="text-slate-800 dark:text-slate-200">R$ 1,00/post</strong>.
          </p>
        </div>

        {/* Completeness Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:min-w-[280px]">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-700 dark:text-slate-300">Status do Perfil</span>
            <span className={completeness.isComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {completeness.percentage}% Concluído
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                completeness.isComplete ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${completeness.percentage}%` }}
            ></div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {completeness.isComplete ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Perfil 100% Verificado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Faltam {completeness.missingFields.length} itens obrigatórios
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Requirements Warning Banner */}
      {!completeness.isComplete && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300/80 dark:border-amber-800 rounded-2xl p-5 text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs">
              <h3 className="font-extrabold text-sm text-amber-950 dark:text-amber-100">
                Atenção: É obrigatório completar o perfil da empresa antes de publicar vagas
              </h3>
              <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                Para manter a segurança e a transparência com os candidatos do SpeedJobs, você precisa preencher os seguintes campos obrigatórios:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 font-semibold">
                {completeness.missingFields.map((field) => (
                  <li key={field} className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    <span>Pendente: {field}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: FOTO DA EMPRESA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                <Camera className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  1. Foto ou Logotipo da Empresa <span className="text-rose-500">*</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Foto de fachada ou logotipo oficial da empresa visível nas vagas publicadas.
                </p>
              </div>
            </div>
            {profile.logoUrl ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Foto Carregada
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full">
                Obrigatório
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Image Preview Box */}
            <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-inner">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={profile.tradeName || 'Logo Empresa'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-3 text-slate-400 dark:text-slate-500">
                  <Camera className="w-8 h-8 mx-auto mb-1 stroke-[1.5]" />
                  <span className="text-[10px] block font-semibold leading-tight">Sem Foto</span>
                </div>
              )}
            </div>

            {/* Upload & Preset Options */}
            <div className="space-y-3 flex-1 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Fazer Upload da Imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      logoUrl: SAMPLE_LOGOS[0].url,
                    }))
                  }
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Usar Imagem Padrão
                </button>

                {profile.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, logoUrl: '' }))}
                    className="px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Remover
                  </button>
                )}
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Ou cole o link direto da imagem (URL)
                </label>
                <input
                  type="url"
                  value={profile.logoUrl}
                  onChange={(e) => setProfile((p) => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="https://suaempresa.com.br/logo.png"
                  className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Sample presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Presets rápidos:</span>
                {SAMPLE_LOGOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, logoUrl: sample.url }))}
                    className="text-[11px] px-2 py-0.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: IDENTIFICAÇÃO FISCAL (CNPJ OU MEI) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  2. Identificação Fiscal: CNPJ ou MEI <span className="text-rose-500">*</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comprovação de empresa ou microempreendedor individual ativo no Brasil.
                </p>
              </div>
            </div>
            {isValidCnpj(profile.taxId) ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> CNPJ/MEI Válido
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full">
                Obrigatório
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tipo de Documento */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Tipo de Registro Fiscal <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, taxIdType: 'CNPJ' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    profile.taxIdType === 'CNPJ'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  CNPJ (Empresa)
                </button>
                <button
                  type="button"
                  onClick={() => setProfile((p) => ({ ...p, taxIdType: 'MEI' }))}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                    profile.taxIdType === 'MEI'
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  MEI (Individual)
                </button>
              </div>
            </div>

            {/* Número do CNPJ / MEI */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Número do {profile.taxIdType} (14 dígitos) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.taxId}
                  onChange={handleTaxIdChange}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className={`w-full text-xs font-mono px-3.5 py-2.5 border rounded-xl focus:ring-2 focus:outline-hidden ${
                    profile.taxId && isValidCnpj(profile.taxId)
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 focus:ring-emerald-500'
                      : profile.taxId
                      ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-blue-500'
                  }`}
                />
                <div className="absolute right-3 top-2.5">
                  {profile.taxId && isValidCnpj(profile.taxId) && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Válido
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Formato padrão brasileiro com dígitos verificadores da Receita Federal.
              </p>
            </div>

            {/* Razão Social */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Razão Social (Nome Oficial Registrado) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.companyName}
                onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
                placeholder="Ex: Velocity Soluções Tecnológicas Ltda"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Nome Fantasia */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome Fantasia (Marca) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.tradeName}
                onChange={(e) => setProfile((p) => ({ ...p, tradeName: e.target.value }))}
                placeholder="Ex: HyperScale Labs"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCALIZAÇÃO DA EMPRESA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <MapPin className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  3. Localização da Empresa <span className="text-rose-500">*</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Endereço onde a empresa opera ou base corporativa para contratação.
                </p>
              </div>
            </div>
            {profile.location.street && profile.location.city && profile.location.state ? (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Endereço Informado
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-full">
                Obrigatório
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* CEP */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                CEP <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={9}
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Logradouro / Rua */}
            <div className="sm:col-span-2 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Logradouro / Avenida / Rua <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.street}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    location: { ...p.location, street: e.target.value },
                  }))
                }
                placeholder="Ex: Avenida Paulista"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Número */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Número <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.number}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    location: { ...p.location, number: e.target.value },
                  }))
                }
                placeholder="Ex: 1000"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Bairro */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bairro <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.neighborhood}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    location: { ...p.location, neighborhood: e.target.value },
                  }))
                }
                placeholder="Ex: Bela Vista"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Cidade */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cidade <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={profile.location.city}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    location: { ...p.location, city: e.target.value },
                  }))
                }
                placeholder="Ex: São Paulo"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Estado UF */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estado (UF) <span className="text-rose-500">*</span>
              </label>
              <select
                value={profile.location.state}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    location: { ...p.location, state: e.target.value },
                  }))
                }
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {BRAZIL_STATES.map((uf: string) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            {/* Complemento */}
            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Complemento (Opcional)
              </label>
              <input
                type="text"
                value={profile.location.complement || ''}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    location: { ...p.location, complement: e.target.value },
                  }))
                }
                placeholder="Ex: Sala 402, Bloco B, Edifício Skyline"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: HORÁRIOS E DIAS DE FUNCIONAMENTO (QUANDO ABRE E FECHA) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  4. Horários e Dias de Funcionamento (Abre e Fecha) <span className="text-rose-500">*</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defina os dias e os horários em que a empresa funciona para os candidatos.
                </p>
              </div>
            </div>

            {/* Dynamic Status Badge (Aberto agora vs Fechado) */}
            <div className="shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                  openStatus.isOpen
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    openStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400 dark:bg-slate-500'
                  }`}
                ></span>
                <span>{openStatus.statusText}</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Days Selection */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dias de Funcionamento da Empresa <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-slate-400">Atalhos:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDays('commercial')}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                  >
                    Seg a Sex
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDays('commercialSaturday')}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                  >
                    Seg a Sáb
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetDays('all')}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer font-medium"
                  >
                    Todos os Dias
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map((day: string) => {
                  const isSelected = profile.workingHours?.days?.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours: Abre e Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Horário de Abertura (Abre às) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={profile.workingHours.openTime}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      workingHours: { ...p.workingHours, openTime: e.target.value },
                    }))
                  }
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Horário de Fechamento (Fecha às) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={profile.workingHours.closeTime}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      workingHours: { ...p.workingHours, closeTime: e.target.value },
                    }))
                  }
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Intervalo / Almoço (Opcional)
                </label>
                <input
                  type="text"
                  value={profile.workingHours.lunchBreak || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      workingHours: { ...p.workingHours, lunchBreak: e.target.value },
                    }))
                  }
                  placeholder="Ex: 12:00 às 13:00"
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Observações de Atendimento
                </label>
                <input
                  type="text"
                  value={profile.workingHours.notes || ''}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      workingHours: { ...p.workingHours, notes: e.target.value },
                    }))
                  }
                  placeholder="Ex: Entrevistas técnicas rápidas de segunda a sexta com plantão aos sábados."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: CONTATOS & SOBRE A EMPRESA */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl">
              <Phone className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                5. Contato Comercial & Ramo de Atuação
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Canais para os candidatos entrarem em contato após aprovação ou agendamento de entrevista.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telefone Comercial / WhatsApp
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.phone}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-mail Corporativo de Contratação
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="recrutamento@empresa.com.br"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Website ou LinkedIn da Empresa
              </label>
              <input
                type="url"
                value={profile.website || ''}
                onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://empresa.com.br"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ramo de Atividade
              </label>
              <input
                type="text"
                value={profile.industry}
                onChange={(e) => setProfile((p) => ({ ...p, industry: e.target.value }))}
                placeholder="Ex: Tecnologia da Informação, Engenharia, Finanças, Varejo, Saúde"
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sobre a Empresa (Apresentação Institucional)
              </label>
              <textarea
                rows={3}
                value={profile.description}
                onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))}
                placeholder="Conte brevemente sobre o ambiente de trabalho, modelo de atuação e valores da sua empresa..."
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Perfil da empresa salvo com sucesso! Os dados foram sincronizados de forma segura.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="sticky bottom-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Dados protegidos por criptografia e sanitização anti-XSS</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Meu Perfil</span>
            </button>

            {completeness.isComplete && onOpenPostJob && (
              <button
                type="button"
                onClick={onOpenPostJob}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-6 py-3 rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>+ Criar Post de Vaga (R$ 1,00)</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
