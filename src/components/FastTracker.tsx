import React, { useState } from 'react';
import {
  Layers,
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Trash2,
  Video,
  Award
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface FastTrackerProps {
  applications: JobApplication[];
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onRemoveApplication: (id: string) => void;
  onOpenSimulator: (jobTitle: string, company: string) => void;
  onBrowseJobs: () => void;
}

export const FastTracker: React.FC<FastTrackerProps> = ({
  applications,
  onUpdateStatus,
  onRemoveApplication,
  onOpenSimulator,
  onBrowseJobs,
}) => {
  const { t } = useI18n();
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'All') return true;
    return app.status === filterStatus;
  });

  const stages: ApplicationStatus[] = [
    'Applied',
    'Fast Screened',
    'Speed Interview',
    'Offer Extended'
  ];

  const getStageIndex = (status: ApplicationStatus) => {
    return stages.indexOf(status);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Fast Screened':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Speed Interview':
        return 'bg-amber-500 text-slate-950 font-black';
      case 'Offer Extended':
        return 'bg-emerald-500 text-white font-black';
      case 'Hired':
        return 'bg-emerald-600 text-white font-black';
      case 'Declined':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const activeCount = applications.filter(
    (a) => a.status !== 'Declined' && a.status !== 'Hired'
  ).length;
  const interviewCount = applications.filter(
    (a) => a.status === 'Speed Interview'
  ).length;
  const offerCount = applications.filter((a) => a.status === 'Offer Extended').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('tracker.title')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t('tracker.subtitle')}
          </p>
        </div>

        <button
          onClick={onBrowseJobs}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer self-start md:self-auto"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{t('tracker.applyMore')}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t('tracker.activeRoles')}</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Under express review</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t('tracker.speedInterviews')}</span>
            <Video className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{interviewCount}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Invited / Active</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t('tracker.avgResponse')}</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">14.2 hrs</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">⚡ 4x faster</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t('tracker.offersExtended')}</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-2">{offerCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Ready for review</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs overflow-x-auto">
        {['All', 'Applied', 'Fast Screened', 'Speed Interview', 'Offer Extended'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${
              filterStatus === st
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">{t('tracker.emptyTitle')}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {t('tracker.emptySubtitle')}
            </p>
            <button
              onClick={onBrowseJobs}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
            >
              {t('nav.browseJobs')}
            </button>
          </div>
        ) : (
          filteredApps.map((app) => {
            const currentStageIndex = getStageIndex(app.status);

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow transition-shadow space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                      {app.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{app.company}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{app.location}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{app.jobTitle}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Applied {app.appliedAt} • {app.salaryText}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>

                    <button
                      onClick={() => onRemoveApplication(app.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={t('tracker.withdrawTitle')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Timeline Step Indicator */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                    {stages.map((st, idx) => {
                      const isPast = currentStageIndex > idx;
                      const isCurrent = currentStageIndex === idx;

                      return (
                        <div key={st} className="space-y-1.5">
                          <div className="flex items-center justify-center">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isCurrent
                                  ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-200'
                                  : isPast
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}
                            >
                              {isPast ? '✓' : idx + 1}
                            </div>
                          </div>
                          <span
                            className={
                              isCurrent
                                ? 'text-slate-900 font-bold'
                                : isPast
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }
                          >
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recruiter Feedback */}
                {app.feedback && (
                  <div className="text-xs bg-blue-50/70 border border-blue-100 p-3 rounded-lg text-slate-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-blue-900">{t('tracker.recruiterStatus')}</strong> {app.feedback}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  <div className="text-slate-500 flex items-center gap-1.5">
                    {app.interviewSlot ? (
                      <>
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>Slot: <strong className="text-slate-700">{app.interviewSlot}</strong></span>
                      </>
                    ) : (
                      <span>SLA: &lt;24 hours</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {app.status === 'Speed Interview' && (
                      <button
                        onClick={() => onOpenSimulator(app.jobTitle, app.company)}
                        className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-1.5 rounded-lg font-black transition-colors cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 fill-current" />
                        <span>{t('tracker.practiceInSimulator')}</span>
                      </button>
                    )}

                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value as ApplicationStatus)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Applied">Status: Applied</option>
                      <option value="Fast Screened">Status: Fast Screened</option>
                      <option value="Speed Interview">Status: Speed Interview</option>
                      <option value="Offer Extended">Status: Offer Extended</option>
                      <option value="Hired">Status: Hired</option>
                      <option value="Declined">Status: Declined</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
