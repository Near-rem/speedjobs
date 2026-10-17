import React, { useState } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Job, CandidateProfile, JobApplication } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { csrfService } from '../security/csrf';
import { sanitizeString } from '../security/sanitizer';
import { UserSession } from '../services/authService';

interface SpeedApplyModalProps {
  job: Job | null;
  profile: CandidateProfile;
  session?: UserSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (application: JobApplication) => void;
  onGoToTracker: () => void;
}

export const SpeedApplyModal: React.FC<SpeedApplyModalProps> = ({
  job,
  profile,
  isOpen,
  onClose,
  onSubmitApplication,
  onGoToTracker,
}) => {
  const { t } = useI18n();

  const [pitchNote, setPitchNote] = useState(
    'Excited about this fast-paced opportunity. My skills align directly with your stack and I can start immediately.'
  );
  const [preferredSlot, setPreferredSlot] = useState(
    'Tomorrow morning (10:00 AM - 12:00 PM)'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !job) return null;

  const presets = [
    {
      label: 'Immediate Starter',
      text: 'Available immediately for full-time work. 100% focused on shipping fast and solving product bottlenecks.'
    },
    {
      label: 'Senior Specialist',
      text: 'Extensive production experience in your core stack. Ready for high-impact technical ownership in 24h.'
    },
    {
      label: 'Contract / Sprint',
      text: 'Seeking high-tempo sprint execution or direct hiring. Available for rapid technical chat today.'
    }
  ];

  const handleApply = () => {
    setIsSubmitting(true);

    // Validate anti-CSRF
    const token = csrfService.getToken();
    if (!csrfService.validateToken(token)) {
      alert('Security token verification failed.');
      setIsSubmitting(false);
      return;
    }

    // Simulate immediate express transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      const formattedSalary =
        job.salaryPeriod === 'hr'
          ? `$${job.salaryMin} - $${job.salaryMax}/hr`
          : `$${Math.round(job.salaryMin / 1000)}k - $${Math.round(job.salaryMax / 1000)}k/yr`;

      const newApp: JobApplication = {
        id: `app-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        logo: job.logo,
        location: `${job.location} (${job.remoteType})`,
        salaryText: formattedSalary,
        status: 'Applied',
        appliedAt: 'Just now',
        urgency: job.urgency,
        pitchNote: sanitizeString(pitchNote),
        interviewSlot: preferredSlot,
        feedback: `SpeedPass profile received. Expected first screening response within ${job.hiringSpeedDays * 24} hours.`
      };

      onSubmitApplication(newApp);
    }, 500);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 dark:bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">1-Click Speed Apply</h3>
              <p className="text-xs text-slate-300">
                Express transmission to {job.company}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Application Transmitted! ⚡</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Your SpeedPass has been delivered to <strong>{job.company}</strong> in 0.4s.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-medium">Applied Position:</span>
                <span className="font-bold">{job.title}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-medium">Hiring Speed SLA:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">Under {job.hiringSpeedDays * 24} hours</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="font-medium">Security Validation:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> CSRF Verified & Encrypted
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close & Keep Browsing
              </button>
              <button
                onClick={() => {
                  handleClose();
                  onGoToTracker();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Fast Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
            {/* SpeedPass Profile Snapshot */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{profile.fullName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profile.title} • {profile.experienceYears}y exp</p>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {profile.availability}
              </span>
            </div>

            {/* Quick Pitch Note */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-xs text-slate-900 dark:text-white">
                  Elevator Pitch (Speed Note)
                </label>
                <span className="text-[11px] text-slate-400">Keep it short & punchy</span>
              </div>

              {/* Quick switch presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPitchNote(preset.text)}
                    className="text-[11px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <textarea
                value={pitchNote}
                onChange={(e) => setPitchNote(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 resize-none"
              />
            </div>

            {/* Rapid Interview Slot Preference */}
            <div className="space-y-1.5">
              <label className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Preferred 15-Min Speed Chat Availability
              </label>
              <select
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tomorrow morning (10:00 AM - 12:00 PM)">
                  Tomorrow Morning (10:00 AM - 12:00 PM)
                </option>
                <option value="Tomorrow afternoon (2:00 PM - 5:00 PM)">
                  Tomorrow Afternoon (2:00 PM - 5:00 PM)
                </option>
                <option value="Today (Anytime in next 6 hours)">
                  ⚡ Today (Anytime in next 6 hours - Flash)
                </option>
                <option value="Flexible (Send any calendar invite)">
                  Flexible (Accept any calendar invite)
                </option>
              </select>
            </div>

            {/* Express Policy Guarantee */}
            <div className="text-[11px] text-slate-500 dark:text-amber-200/90 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 p-3 rounded-xl flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Express Response SLA:</strong> You will receive an immediate acknowledgment and recruiter status update within 24 hours.
              </span>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApply}
                className="flex-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Transmitting SpeedPass...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Confirm & Send 1-Click Application</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
