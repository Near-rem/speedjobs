import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { JobList } from './components/JobList';
import { JobDetail } from './components/JobDetail';
import { SpeedApplyModal } from './components/SpeedApplyModal';
import { FastTracker } from './components/FastTracker';
import { CandidateSpeedPass } from './components/CandidateSpeedPass';
import { InterviewSimulator } from './components/InterviewSimulator';
import { EmployerPortal } from './components/EmployerPortal';
import { PostJobModal } from './components/PostJobModal';
import {
  getStoredJobs,
  saveJobs,
  getSavedJobIds,
  toggleSavedJobId,
  getStoredProfile,
  saveProfile,
  getStoredApplications,
  addApplication,
  saveApplications
} from './utils/storage';
import { Job, CandidateProfile, JobApplication, ApplicationStatus } from './types';
import { Zap, Heart, Shield, ArrowUpRight } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('jobs');
  const [jobs, setJobs] = useState<Job[]>(() => getStoredJobs());
  const [selectedJob, setSelectedJob] = useState<Job | null>(() => {
    const initialJobs = getStoredJobs();
    return initialJobs.length > 0 ? initialJobs[0] : null;
  });
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => getSavedJobIds());
  const [profile, setProfile] = useState<CandidateProfile>(() => getStoredProfile());
  const [applications, setApplications] = useState<JobApplication[]>(() => getStoredApplications());

  // Modals state
  const [speedApplyJob, setSpeedApplyJob] = useState<Job | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  // Simulator target state
  const [simContext, setSimContext] = useState({
    title: 'Senior Full Stack Engineer',
    company: 'HyperScale Labs'
  });

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
  };

  const handleToggleSave = (jobId: string) => {
    const updated = toggleSavedJobId(jobId);
    setSavedJobIds(updated);
  };

  const handleOpenSpeedApply = (job: Job) => {
    setSpeedApplyJob(job);
  };

  const handleSubmitApplication = (app: JobApplication) => {
    const updated = addApplication(app);
    setApplications(updated);

    // Also update applicants count on the job
    setJobs((prev) => {
      const next = prev.map((j) =>
        j.id === app.jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j
      );
      saveJobs(next);
      return next;
    });
  };

  const handleUpdateAppStatus = (appId: string, status: ApplicationStatus) => {
    const updated = applications.map((a) => (a.id === appId ? { ...a, status } : a));
    setApplications(updated);
    saveApplications(updated);
  };

  const handleRemoveApplication = (appId: string) => {
    const updated = applications.filter((a) => a.id !== appId);
    setApplications(updated);
    saveApplications(updated);
  };

  const handleSaveProfile = (updatedProfile: CandidateProfile) => {
    setProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  const handleJobCreated = (newJob: Job) => {
    const updated = [newJob, ...jobs];
    setJobs(updated);
    saveJobs(updated);
    setSelectedJob(newJob);
    setActiveTab('jobs');
  };

  const handleOpenSimulator = (title: string, company: string) => {
    setSimContext({ title, company });
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        applications={applications}
        profile={profile}
        onPostJobClick={() => setIsPostJobOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'jobs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[650px]">
              {/* Left Column: Job Feed (5 cols on large screen) */}
              <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
                <JobList
                  jobs={jobs}
                  selectedJobId={selectedJob?.id ?? null}
                  onSelectJob={handleSelectJob}
                  onSpeedApply={handleOpenSpeedApply}
                  savedJobIds={savedJobIds}
                  onToggleSave={handleToggleSave}
                  profile={profile}
                />
              </div>

              {/* Right Column: Job Detail (7 cols on large screen) */}
              <div className="hidden lg:flex lg:col-span-7 h-full overflow-hidden flex-col">
                <JobDetail
                  job={selectedJob}
                  profile={profile}
                  isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
                  onToggleSave={handleToggleSave}
                  onSpeedApply={handleOpenSpeedApply}
                  isApplied={
                    selectedJob
                      ? applications.some((a) => a.jobId === selectedJob.id)
                      : false
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracker' && (
          <FastTracker
            applications={applications}
            onUpdateStatus={handleUpdateAppStatus}
            onRemoveApplication={handleRemoveApplication}
            onOpenSimulator={handleOpenSimulator}
            onBrowseJobs={() => setActiveTab('jobs')}
          />
        )}

        {activeTab === 'profile' && (
          <CandidateSpeedPass
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onBrowseJobs={() => setActiveTab('jobs')}
          />
        )}

        {activeTab === 'simulator' && (
          <InterviewSimulator
            initialJobTitle={simContext.title}
            initialCompany={simContext.company}
          />
        )}

        {activeTab === 'employer' && (
          <EmployerPortal
            jobs={jobs}
            applications={applications}
            onOpenPostJob={() => setIsPostJobOpen(true)}
            onUpdateAppStatus={handleUpdateAppStatus}
            onSelectJob={(j) => {
              setSelectedJob(j);
              setActiveTab('jobs');
            }}
          />
        )}
      </main>

      {/* Global Speed Apply Modal */}
      <SpeedApplyModal
        job={speedApplyJob}
        profile={profile}
        isOpen={!!speedApplyJob}
        onClose={() => setSpeedApplyJob(null)}
        onSubmitApplication={handleSubmitApplication}
        onGoToTracker={() => setActiveTab('tracker')}
      />

      {/* Global Post Flash Job Modal */}
      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
        onJobCreated={handleJobCreated}
      />
    </div>
  );
}

export default App;
