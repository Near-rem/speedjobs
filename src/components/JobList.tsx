import React, { useState, useMemo } from 'react';
import {
  Search,
  Zap,
  Bookmark,
  MapPin,
  Clock,
  DollarSign,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  ArrowUpDown,
  FilterX
} from 'lucide-react';
import { Job, CandidateProfile } from '../types';
import { calculateMatchScore } from '../utils/storage';
import { useI18n } from '../i18n/I18nContext';
import { sanitizeString } from '../security/sanitizer';

import { UserSession } from '../services/authService';

interface JobListProps {
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (job: Job) => void;
  onSpeedApply: (job: Job) => void;
  savedJobIds: string[];
  onToggleSave: (jobId: string) => void;
  profile: CandidateProfile;
  session: UserSession | null;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onSpeedApply,
  savedJobIds,
  onToggleSave,
  profile,
  session,
}) => {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [remoteFilter, setRemoteFilter] = useState<string>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('All');
  const [expFilter, setExpFilter] = useState<string>('All');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [onlySaved, setOnlySaved] = useState<boolean>(false);
  const [onlyHighMatch, setOnlyHighMatch] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'match' | 'fastest' | 'salary' | 'recent'>('match');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Pre-calculate match scores
  const jobsWithScore = useMemo(() => {
    return jobs.map((job) => ({
      ...job,
      matchScore: calculateMatchScore(profile, job),
    }));
  }, [jobs, profile]);

  // Filtered jobs with sanitized search query
  const filteredJobs = useMemo(() => {
    const cleanQuery = sanitizeString(searchTerm).toLowerCase();

    return jobsWithScore.filter((job) => {
      if (cleanQuery) {
        const matchesTitle = job.title.toLowerCase().includes(cleanQuery);
        const matchesCompany = job.company.toLowerCase().includes(cleanQuery);
        const matchesSkill = job.skills.some((s) => s.toLowerCase().includes(cleanQuery));
        const matchesLocation = job.location.toLowerCase().includes(cleanQuery);
        if (!matchesTitle && !matchesCompany && !matchesSkill && !matchesLocation) {
          return false;
        }
      }

      if (remoteFilter !== 'All' && job.remoteType !== remoteFilter) return false;
      if (urgencyFilter !== 'All' && job.urgency !== urgencyFilter) return false;
      if (expFilter !== 'All' && job.experienceLevel !== expFilter) return false;

      if (minSalary > 0) {
        const annualEquivalent = job.salaryPeriod === 'hr' ? job.salaryMin * 2000 : job.salaryMin;
        if (annualEquivalent < minSalary) return false;
      }

      if (onlySaved && !savedJobIds.includes(job.id)) return false;
      if (onlyHighMatch && job.matchScore < 80) return false;

      return true;
    });
  }, [jobsWithScore, searchTerm, remoteFilter, urgencyFilter, expFilter, minSalary, onlySaved, onlyHighMatch, savedJobIds]);

  // Sorted jobs
  const sortedJobs = useMemo(() => {
    return [...filteredJobs].sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'fastest') return a.hiringSpeedDays - b.hiringSpeedDays;
      if (sortBy === 'salary') {
        const salA = a.salaryPeriod === 'hr' ? a.salaryMax * 2000 : a.salaryMax;
        const salB = b.salaryPeriod === 'hr' ? b.salaryMax * 2000 : b.salaryMax;
        return salB - salA;
      }
      return 0;
    });
  }, [filteredJobs, sortBy]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setRemoteFilter('All');
    setUrgencyFilter('All');
    setExpFilter('All');
    setMinSalary(0);
    setOnlySaved(false);
    setOnlyHighMatch(false);
  };

  const hasActiveFilters =
    searchTerm ||
    remoteFilter !== 'All' ||
    urgencyFilter !== 'All' ||
    expFilter !== 'All' ||
    minSalary > 0 ||
    onlySaved ||
    onlyHighMatch;

  return (
    <div className="flex flex-col h-full space-y-4 transition-colors duration-200">
      {/* Quick Search and Primary Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('jobs.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                {t('jobs.clearSearch')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <div className="relative inline-flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 text-slate-500 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-8 pr-7 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="match">{t('jobs.sortMatch')}</option>
                <option value="fastest">{t('jobs.sortFastest')}</option>
                <option value="salary">{t('jobs.sortSalary')}</option>
                <option value="recent">{t('jobs.sortNewest')}</option>
              </select>
            </div>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`sm:hidden p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                hasActiveFilters
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className={`${
            showMobileFilters ? 'flex' : 'hidden'
          } sm:flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs`}
        >
          {/* Quick pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setUrgencyFilter(urgencyFilter === 'Flash (24h)' ? 'All' : 'Flash (24h)')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                urgencyFilter === 'Flash (24h)'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{t('jobs.filterFlash')}</span>
            </button>

            <button
              onClick={() => setRemoteFilter(remoteFilter === 'Remote' ? 'All' : 'Remote')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                remoteFilter === 'Remote'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t('jobs.filterRemote')}
            </button>

            <button
              onClick={() => setOnlyHighMatch(!onlyHighMatch)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                onlyHighMatch
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('jobs.filterHighMatch')}</span>
            </button>

            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                onlySaved
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{t('jobs.filterSaved')} ({savedJobIds.length})</span>
            </button>
          </div>

          {/* Experience level selector */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-slate-400 text-[11px]">{t('jobs.levelLabel')}</span>
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs cursor-pointer focus:outline-none"
            >
              <option value="All">{t('jobs.levelAll')}</option>
              <option value="Entry">Entry</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead / Staff</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-[11px] font-medium cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              {t('jobs.resetFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>
          {t('jobs.showingResults', { count: sortedJobs.length })}
        </span>
        {session?.role !== 'empresa' ? (
          <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            {t('jobs.speedApplyEnabled')}
          </span>
        ) : (
          <span className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium">
            Visualização de Vagas (Modo Empresa)
          </span>
        )}
      </div>

      {/* Job Cards Stream */}
      <div className="space-y-3 overflow-y-auto pr-1">
        {sortedJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center space-y-3 transition-colors">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{t('jobs.noJobsFound')}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {t('jobs.noJobsSub')}
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              {t('jobs.resetFilters')}
            </button>
          </div>
        ) : (
          sortedJobs.map((job) => {
            const isSelected = selectedJobId === job.id;
            const isSaved = savedJobIds.includes(job.id);
            const userSkillsLower = profile.skills.map((s) => s.toLowerCase());

            const formattedSalary =
              job.salaryPeriod === 'hr'
                ? `$${job.salaryMin} - $${job.salaryMax}/hr`
                : `$${Math.round(job.salaryMin / 1000)}k - $${Math.round(job.salaryMax / 1000)}k/yr`;

            const matchColor =
              job.matchScore >= 90
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : job.matchScore >= 75
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className={`group relative bg-white dark:bg-slate-900 rounded-xl border p-4.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                {/* Top card row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {job.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                          {job.company}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {job.postedAt}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  {/* Bookmark button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(job.id);
                    }}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isSaved
                        ? 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isSaved ? t('jobs.savedJob') : t('jobs.saveJob')}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Key specs pills */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                      job.urgency === 'Flash (24h)'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                    }`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{job.urgency}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${matchColor}`}
                  >
                    <span>{job.matchScore}% Match</span>
                  </span>

                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    <DollarSign className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    <span>{formattedSalary}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>
                      {job.location} ({job.remoteType})
                    </span>
                  </span>
                </div>

                <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills tags */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {job.skills.slice(0, 4).map((skill) => {
                    const isMatched = userSkillsLower.includes(skill.toLowerCase());
                    return (
                      <span
                        key={skill}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                          isMatched
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {isMatched ? '✓ ' : ''}
                        {skill}
                      </span>
                    );
                  })}
                  {job.skills.length > 4 && (
                    <span className="text-[10px] text-slate-400 font-medium">
                      +{job.skills.length - 4} more
                    </span>
                  )}
                </div>

                {/* Bottom card action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      {t('jobs.decisionGuaranteed', { days: job.hiringSpeedDays })}
                    </span>
                  </div>

                  {session?.role !== 'empresa' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSpeedApply(job);
                      }}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{t('jobs.speedApplyBtn')}</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      Visualizar detalhes →
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
