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
import { Job, CandidateProfile, RemoteType, UrgencyTier, ExperienceLevel } from '../types';
import { calculateMatchScore } from '../utils/storage';

interface JobListProps {
  jobs: Job[];
  selectedJobId: string | null;
  onSelectJob: (job: Job) => void;
  onSpeedApply: (job: Job) => void;
  savedJobIds: string[];
  onToggleSave: (jobId: string) => void;
  profile: CandidateProfile;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  selectedJobId,
  onSelectJob,
  onSpeedApply,
  savedJobIds,
  onToggleSave,
  profile,
}) => {
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

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobsWithScore.filter((job) => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(query);
        const matchesCompany = job.company.toLowerCase().includes(query);
        const matchesSkill = job.skills.some((s) => s.toLowerCase().includes(query));
        const matchesLocation = job.location.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCompany && !matchesSkill && !matchesLocation) {
          return false;
        }
      }

      // Remote filter
      if (remoteFilter !== 'All' && job.remoteType !== remoteFilter) {
        return false;
      }

      // Urgency filter
      if (urgencyFilter !== 'All' && job.urgency !== urgencyFilter) {
        return false;
      }

      // Experience filter
      if (expFilter !== 'All' && job.experienceLevel !== expFilter) {
        return false;
      }

      // Min salary filter
      if (minSalary > 0) {
        const annualEquivalent = job.salaryPeriod === 'hr' ? job.salaryMin * 2000 : job.salaryMin;
        if (annualEquivalent < minSalary) return false;
      }

      // Saved only
      if (onlySaved && !savedJobIds.includes(job.id)) {
        return false;
      }

      // High match only (>80%)
      if (onlyHighMatch && job.matchScore < 80) {
        return false;
      }

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
      return 0; // default order / recent
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
    <div className="flex flex-col h-full space-y-4">
      {/* Quick Search and Primary Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role, company, or skill (e.g. React, Rust, AI)..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
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
                className="pl-8 pr-7 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer focus:outline-none"
              >
                <option value="match">⚡ Best Match</option>
                <option value="fastest">🚀 Fastest Hire (&lt;24h)</option>
                <option value="salary">💰 Top Salary</option>
                <option value="recent">⏱️ Newest</option>
              </select>
            </div>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`sm:hidden p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${
                hasActiveFilters
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-slate-200 text-slate-700 bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          className={`${
            showMobileFilters ? 'flex' : 'hidden'
          } sm:flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs`}
        >
          {/* Quick pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setUrgencyFilter(urgencyFilter === 'Flash (24h)' ? 'All' : 'Flash (24h)')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                urgencyFilter === 'Flash (24h)'
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Flash 24h</span>
            </button>

            <button
              onClick={() => setRemoteFilter(remoteFilter === 'Remote' ? 'All' : 'Remote')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                remoteFilter === 'Remote'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Remote Only
            </button>

            <button
              onClick={() => setOnlyHighMatch(!onlyHighMatch)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                onlyHighMatch
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Match &gt;80%</span>
            </button>

            <button
              onClick={() => setOnlySaved(!onlySaved)}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                onlySaved
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedJobIds.length})</span>
            </button>
          </div>

          {/* Experience level selector */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-slate-400 text-[11px]">Level:</span>
            <select
              value={expFilter}
              onChange={(e) => setExpFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs cursor-pointer focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Entry">Entry</option>
              <option value="Junior">Junior</option>
              <option value="Mid">Mid-Level</option>
              <option value="Senior">Senior</option>
              <option value="Lead">Lead/Staff</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" />
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header Info */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <span>
          Showing <strong className="text-slate-800">{sortedJobs.length}</strong> express open positions
        </span>
        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          ⚡ 1-Click Speed Apply enabled
        </span>
      </div>

      {/* Job Cards Stream */}
      <div className="space-y-3 overflow-y-auto pr-1">
        {sortedJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No matching positions found</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Try relaxing your filters or search keywords to discover more fast-track roles.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
            >
              Reset all filters
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

            // Color coding for match score
            const matchColor =
              job.matchScore >= 90
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : job.matchScore >= 75
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className={`group relative bg-white rounded-xl border p-4.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Top card row: Logo, Company, Title, Urgency, Bookmark */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                      {job.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-slate-600">
                          {job.company}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {job.postedAt}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-snug">
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
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isSaved ? 'Saved job' : 'Save job'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Key specs pills */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {/* Urgency Badge */}
                  <span
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                      job.urgency === 'Flash (24h)'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{job.urgency}</span>
                  </span>

                  {/* Match Score Badge */}
                  <span
                    className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md border ${matchColor}`}
                  >
                    <span>{job.matchScore}% Match</span>
                  </span>

                  {/* Salary Pill */}
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    <DollarSign className="w-3 h-3 text-slate-500" />
                    <span>{formattedSalary}</span>
                  </span>

                  {/* Location & Remote */}
                  <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>
                      {job.location} ({job.remoteType})
                    </span>
                  </span>
                </div>

                {/* Brief description snippet */}
                <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
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
                            ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
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
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      Hiring in <strong>~{job.hiringSpeedDays} day{job.hiringSpeedDays > 1 ? 's' : ''}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>{job.applicantsCount} applicants</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSpeedApply(job);
                    }}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Speed Apply</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
