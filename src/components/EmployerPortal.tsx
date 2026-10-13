import React from 'react';
import {
  Building2,
  Zap,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Video,
  XCircle,
  Plus
} from 'lucide-react';
import { Job, JobApplication, ApplicationStatus } from '../types';

interface EmployerPortalProps {
  jobs: Job[];
  applications: JobApplication[];
  onOpenPostJob: () => void;
  onUpdateAppStatus: (id: string, status: ApplicationStatus) => void;
  onSelectJob: (job: Job) => void;
}

export const EmployerPortal: React.FC<EmployerPortalProps> = ({
  jobs,
  applications,
  onOpenPostJob,
  onUpdateAppStatus,
  onSelectJob,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Employer Hiring Command Center
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Accelerate your hiring cycle from 30 days down to 48 hours with SpeedPass candidates.
          </p>
        </div>

        <button
          onClick={onOpenPostJob}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Flash Role</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Speed Postings</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{jobs.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            ⚡ All covered by 24h candidate SLA
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Candidates in Express Review</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{applications.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Pre-verified SpeedPass profiles</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Average SpeedJobs TTF</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">2.1 days</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Industry average: 36 days
          </p>
        </div>
      </div>

      {/* Applicant Review Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-base text-slate-900">Applicant Express Pipeline</h3>
            <p className="text-xs text-slate-500">
              Take fast action on high-compatibility candidates
            </p>
          </div>
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
            {applications.length} Applicants
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {applications.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              No applications submitted yet. Open the job board to test 1-Click Speed Apply!
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">{app.jobTitle}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-600">{app.company}</span>
                    <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                      {app.status}
                    </span>
                  </div>

                  {app.pitchNote && (
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      "{app.pitchNote}"
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>Applied: {app.appliedAt}</span>
                    <span>•</span>
                    <span>Slot: {app.interviewSlot || 'Open calendar'}</span>
                  </div>
                </div>

                {/* Recruiter Instant Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onUpdateAppStatus(app.id, 'Speed Interview')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 fill-current" />
                    <span>Invite to 15-Min Chat</span>
                  </button>

                  <button
                    onClick={() => onUpdateAppStatus(app.id, 'Offer Extended')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Send Fast Offer</span>
                  </button>

                  <button
                    onClick={() => onUpdateAppStatus(app.id, 'Declined')}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Pass"
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Live Active Postings</h3>
          <span className="text-xs text-slate-500">{jobs.length} published roles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.slice(0, 6).map((job) => (
            <div
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer flex items-start gap-3 bg-slate-50/40"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0">
                {job.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{job.title}</h4>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {job.urgency}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {job.company} • {job.location} ({job.remoteType})
                </div>
                <div className="text-[11px] text-blue-600 font-semibold mt-1">
                  {job.applicantsCount} SpeedPass applicants • ~{job.hiringSpeedDays}d turnaround
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
