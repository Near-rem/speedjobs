import { Job, CandidateProfile, JobApplication, InterviewSession, CompanyProfile } from '../types';
import { SEED_JOBS, INITIAL_PROFILE, INITIAL_APPLICATIONS } from '../data/seedJobs';

const JOBS_KEY = 'speedjobs_jobs_v1';
const SAVED_JOBS_KEY = 'speedjobs_saved_ids_v1';
const PROFILE_KEY = 'speedjobs_profile_v1';
const APPLICATIONS_KEY = 'speedjobs_applications_v1';
const INTERVIEWS_KEY = 'speedjobs_interviews_v1';
const COMPANY_PROFILE_PREFIX = 'speedjobs_company_profile_v2_';

export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  id: 'comp-hyperscale-1',
  companyName: 'HyperScale Labs Tecnologia Ltda',
  tradeName: 'HyperScale Labs',
  taxId: '12.345.678/0001-90',
  taxIdType: 'CNPJ',
  logoUrl: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=300&auto=format&fit=crop&q=80',
  location: {
    cep: '01310-100',
    street: 'Avenida Paulista',
    number: '1000',
    complement: 'Andar 14, Conjunto 142',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    fullAddress: 'Avenida Paulista, 1000 - Bela Vista, São Paulo - SP, CEP 01310-100',
  },
  workingHours: {
    days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
    openTime: '08:00',
    closeTime: '18:00',
    lunchBreak: '12:00 às 13:00',
    notes: 'Entrevistas técnicas expressas das 09h às 17h',
  },
  phone: '(11) 3045-8900',
  email: 'recrutador@hyperscale.com',
  website: 'https://hyperscale.io',
  industry: 'Tecnologia da Informação & Software',
  description: 'Hub de inovação e engenharia de software com foco em sistemas de alta escalabilidade e recrutamento acelerado.',
  isComplete: true,
  updatedAt: new Date().toISOString(),
};

export function getStoredJobs(): Job[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (!raw) return SEED_JOBS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_JOBS;
  } catch {
    return SEED_JOBS;
  }
}

export function saveJobs(jobs: Job[]): void {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save jobs', e);
  }
}

export function getSavedJobIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_JOBS_KEY);
    return raw ? JSON.parse(raw) : ['job-1', 'job-3'];
  } catch {
    return [];
  }
}

export function toggleSavedJobId(id: string): string[] {
  const current = getSavedJobIds();
  const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  try {
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to toggle saved job', e);
  }
  return updated;
}

export function getStoredProfile(): CandidateProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PROFILE;
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveProfile(profile: CandidateProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function getStoredApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) return INITIAL_APPLICATIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_APPLICATIONS;
  } catch {
    return INITIAL_APPLICATIONS;
  }
}

export function saveApplications(apps: JobApplication[]): void {
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save applications', e);
  }
}

export function addApplication(app: JobApplication): JobApplication[] {
  const current = getStoredApplications();
  const updated = [app, ...current.filter((x) => x.jobId !== app.jobId)];
  saveApplications(updated);
  return updated;
}

export function getStoredInterviews(): InterviewSession[] {
  try {
    const raw = localStorage.getItem(INTERVIEWS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'int-1',
      jobId: 'job-1',
      jobTitle: 'Senior Full Stack Engineer (React & Node)',
      company: 'HyperScale Labs',
      type: '15-Min Speed Chat',
      date: 'Tomorrow',
      time: '10:30 AM PST',
      durationMinutes: 15,
      status: 'Scheduled',
      meetingLink: 'https://speedjobs.live/room/hyper-alex-8821',
      notes: 'Focus on recent React performance optimizations and state management tradeoffs.'
    }
  ];
}

export function saveInterviews(interviews: InterviewSession[]): void {
  try {
    localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(interviews));
  } catch (e) {
    console.error('Failed to save interviews', e);
  }
}

/**
 * Calculates a match percentage between candidate profile and job requirements
 */
export function calculateMatchScore(profile: CandidateProfile, job: Job): number {
  if (!profile.skills || profile.skills.length === 0) return 60;
  if (!job.skills || job.skills.length === 0) return 80;

  const candidateSkillsLower = profile.skills.map((s) => s.toLowerCase().trim());
  let matchedCount = 0;

  job.skills.forEach((skill) => {
    const sLower = skill.toLowerCase().trim();
    if (candidateSkillsLower.some((cs) => cs.includes(sLower) || sLower.includes(cs))) {
      matchedCount += 1;
    }
  });

  const skillScore = (matchedCount / job.skills.length) * 60; // Up to 60 pts
  
  // Experience score: up to 25 pts
  let expScore = 15;
  if (job.experienceLevel === 'Entry' || job.experienceLevel === 'Junior') {
    expScore = 25;
  } else if (job.experienceLevel === 'Mid' && profile.experienceYears >= 3) {
    expScore = 25;
  } else if (job.experienceLevel === 'Senior' && profile.experienceYears >= 5) {
    expScore = 25;
  } else if (job.experienceLevel === 'Lead' && profile.experienceYears >= 7) {
    expScore = 25;
  }

  // Availability bonus: 15 pts if immediately
  const availScore = profile.availability === 'Immediately' ? 15 : 10;

  const total = Math.min(99, Math.round(skillScore + expScore + availScore));
  return Math.max(45, total);
}

/**
 * Validação rigorosa se o perfil da empresa está completo
 * Requisitos obrigatórios: Foto da empresa, CNPJ/MEI, Localização completa e Horários de funcionamento
 */
export function isCompanyProfileComplete(profile: CompanyProfile | null): {
  isComplete: boolean;
  missingFields: string[];
  percentage: number;
} {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ['Foto da Empresa', 'CNPJ ou MEI', 'Localização Completa', 'Horários e Dias de Funcionamento'],
      percentage: 0,
    };
  }

  const missing: string[] = [];
  let points = 0;
  const totalPoints = 4;

  // 1. Foto / Logotipo da empresa
  if (profile.logoUrl && profile.logoUrl.trim().length > 3) {
    points += 1;
  } else {
    missing.push('Foto / Logotipo da Empresa');
  }

  // 2. CNPJ ou MEI
  const cleanTax = (profile.taxId || '').replace(/\D/g, '');
  if (cleanTax.length === 14) {
    points += 1;
  } else {
    missing.push('CNPJ ou MEI Válido (14 dígitos)');
  }

  // 3. Localização
  const loc = profile.location;
  if (loc && loc.street?.trim() && loc.number?.trim() && loc.city?.trim() && loc.state?.trim() && loc.cep?.trim()) {
    points += 1;
  } else {
    missing.push('Localização Completa (Endereço, Cidade, Estado e CEP)');
  }

  // 4. Horários e Dias de Funcionamento
  const wh = profile.workingHours;
  if (wh && Array.isArray(wh.days) && wh.days.length > 0 && wh.openTime?.trim() && wh.closeTime?.trim()) {
    points += 1;
  } else {
    missing.push('Horários e Dias de Funcionamento (Quando Abre e Fecha)');
  }

  const percentage = Math.round((points / totalPoints) * 100);
  const isComplete = points === totalPoints;

  return {
    isComplete,
    missingFields: missing,
    percentage,
  };
}

export function getStoredCompanyProfile(email?: string): CompanyProfile {
  const normalizedKey = `${COMPANY_PROFILE_PREFIX}${email ? email.toLowerCase().trim() : 'default'}`;
  try {
    const raw = localStorage.getItem(normalizedKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const check = isCompanyProfileComplete(parsed);
        return {
          ...parsed,
          isComplete: check.isComplete,
        };
      }
    }
  } catch (e) {
    console.error('Error loading company profile', e);
  }

  // If loading for demo company or fallback
  if (email && email.toLowerCase().includes('hyperscale')) {
    return INITIAL_COMPANY_PROFILE;
  }

  // Blank template for new companies to fill out
  return {
    companyName: '',
    tradeName: '',
    taxId: '',
    taxIdType: 'CNPJ',
    logoUrl: '',
    location: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      fullAddress: '',
    },
    workingHours: {
      days: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      openTime: '08:00',
      closeTime: '18:00',
      lunchBreak: '',
      notes: '',
    },
    phone: '',
    email: email || '',
    website: '',
    industry: 'Serviços & Tecnologia',
    description: '',
    isComplete: false,
    updatedAt: new Date().toISOString(),
  };
}

export function saveCompanyProfile(profile: CompanyProfile, email?: string): CompanyProfile {
  const normalizedKey = `${COMPANY_PROFILE_PREFIX}${email ? email.toLowerCase().trim() : 'default'}`;
  const check = isCompanyProfileComplete(profile);
  const toSave: CompanyProfile = {
    ...profile,
    isComplete: check.isComplete,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(normalizedKey, JSON.stringify(toSave));
  } catch (e) {
    console.error('Error saving company profile', e);
  }
  return toSave;
}
