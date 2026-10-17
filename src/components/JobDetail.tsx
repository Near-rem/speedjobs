import React, { useState } from 'react';
import {
  Zap,
  Bookmark,
  Share2,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Sparkles,
  Users
} from 'lucide-react';
import { Job, CandidateProfile } from '../types';
import { calculateMatchScore } from '../utils/storage';
import { useI18n } from '../i18n/I18nContext';

import { UserSession } from '../services/authService';

interface JobDetailProps {
  job: Job | null;
  profile: CandidateProfile;
  session: UserSession | null;
  isSaved: boolean;
  onToggleSave: (jobId: string) => void;
  onSpeedApply: (job: Job) => void;
  isApplied: boolean;
}

export const JobDetail: React.FC<JobDetailProps> = ({
  job,
  profile,
  session,
  isSaved,
  onToggleSave,
  onSpeedApply,
  isApplied,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  if (!job) {
    return (
      <div className="h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center space-y-3 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Zap className="w-8 h-8 fill-blue-600/20 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t('jobs.selectJobPrompt')}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          {t('jobs.flashGuarantee')}
        </p>
      </div>
    );
  }

  const matchScore = calculateMatchScore(profile, job);
  const userSkillsLower = profile.skills.map((s) => s.toLowerCase());

  const matchedSkills = job.skills.filter((skill) =>
    userSkillsLower.includes(skill.toLowerCase())
  );
  const missingSkills = job.skills.filter(
    (skill) => !userSkillsLower.includes(skill.toLowerCase())
  );

  const formattedSalary =
    job.salaryPeriod === 'hr'
      ? `$${job.salaryMin} - $${job.salaryMax} / hr`
      : `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()} / year`;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-full overflow-hidden transition-colors duration-200">
      {/* Top action header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/70 dark:from-slate-800/80 to-white dark:to-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center text-3xl shrink-0">
              {job.logo}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{job.company}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{job.department}</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {t('jobs.verifiedRecruiter')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                {job.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  {formattedSalary}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location} ({job.remoteType})
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {job.postedAt}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded shadow">
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={() => onToggleSave(job.id)}
              className={`p-2 border rounded-lg transition-colors cursor-pointer ${
                isSaved
                  ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title={isSaved ? t('jobs.savedJob') : t('jobs.saveJob')}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Big Speed Apply Action Bar */}
        <div className="mt-5 p-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">Speed Hiring Active</span>
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                  {job.urgency}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {t('jobs.decisionGuaranteed', { days: job.hiringSpeedDays })}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            {session?.role === 'empresa' ? (
              <div className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold text-xs">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>Conta de Empresa: Apenas candidatos podem se candidatar</span>
              </div>
            ) : isApplied ? (
              <div className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('jobs.alreadyApplied')}</span>
              </div>
            ) : (
              <button
                onClick={() => onSpeedApply(job)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>{t('jobs.speedApplyBtn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable details content */}
      <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300 text-sm">
        {/* Match Score Card */}
        <div className="bg-gradient-to-br from-blue-50/80 dark:from-blue-950/40 via-indigo-50/40 dark:via-indigo-950/30 to-slate-50 dark:to-slate-900 border border-blue-100 dark:border-blue-900/60 rounded-xl p-4.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>SpeedPass Match Breakdown</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-blue-700 dark:text-blue-400">{matchScore}%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('jobs.compatibility')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Matched skills */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t('jobs.skillsMatch')} ({matchedSkills.length}/{job.skills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map((s) => (
                    <span
                      key={s}
                      className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-medium border border-emerald-200 dark:border-emerald-800"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </div>
            </div>

            {/* Missing skills */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{t('jobs.skillsBonus')} ({missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {missingSkills.length > 0 ? (
                  missingSkills.map((s) => (
                    <span
                      key={s}
                      className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded font-medium border border-amber-200 dark:border-amber-800"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{t('jobs.fullMatch')}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Role Description */}
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{t('jobs.aboutRole')}</h3>
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">{job.description}</p>
        </div>

        {/* Responsibilities */}
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2.5">{t('jobs.responsibilities')}</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            {job.responsibilities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2.5">{t('jobs.requirements')}</h3>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            {job.requirements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits */}
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2.5">{t('jobs.benefits')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {job.benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company Quick Profile */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0">
                {job.logo}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{job.company}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Tech / Startup
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> 20-150 employees
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-200">100% Express Response:</span>{' '}
              {t('jobs.flashGuarantee')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
