import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { JobList } from './components/JobList';
import { JobDetail } from './components/JobDetail';
import { SpeedApplyModal } from './components/SpeedApplyModal';
import { FastTracker } from './components/FastTracker';
import { CandidateSpeedPass } from './components/CandidateSpeedPass';
import { InterviewSimulator } from './components/InterviewSimulator';
import { EmployerPortal } from './components/EmployerPortal';
import { PostJobModal } from './components/PostJobModal';
import { SecurityAuditModal } from './components/auth/SecurityAuditModal';
import { authService, UserSession } from './services/authService';
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
import { ShieldCheck } from 'lucide-react';

function SpeedJobsMain() {
  const { t } = useI18n();

  // Route state initialized strictly without popups, defaulting to Home ('/')
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path && path !== '' ? path : '/';
    }
    return '/';
  });

  const [jobs, setJobs] = useState<Job[]>(() => getStoredJobs());
  const [selectedJob, setSelectedJob] = useState<Job | null>(() => {
    const initialJobs = getStoredJobs();
    return initialJobs.length > 0 ? initialJobs[0] : null;
  });
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => getSavedJobIds());
  const [profile, setProfile] = useState<CandidateProfile>(() => getStoredProfile());
  const [applications, setApplications] = useState<JobApplication[]>(() => getStoredApplications());

  // Authentication & Security state
  const [session, setSession] = useState<UserSession | null>(() => authService.getCurrentSession());
  const [securityModalOpen, setSecurityModalOpen] = useState<boolean>(false);

  // Modals state
  const [speedApplyJob, setSpeedApplyJob] = useState<Job | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);

  // Simulator target state
  const [simContext, setSimContext] = useState({
    title: 'Senior Full Stack Engineer',
    company: 'HyperScale Labs'
  });

  // Client-side Router navigation with browser history sync
  const navigate = (route: string) => {
    const cleanRoute = route.startsWith('/') ? route : `/${route}`;
    setCurrentRoute(cleanRoute);
    if (typeof window !== 'undefined' && window.location.pathname !== cleanRoute) {
      try {
        window.history.pushState({}, '', cleanRoute);
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
  };

  const handleToggleSave = (jobId: string) => {
    const updated = toggleSavedJobId(jobId);
    setSavedJobIds(updated);
  };

  const handleOpenSpeedApply = (job: Job) => {
    // RBAC check: Empresa accounts cannot apply
    const check = authService.assertCanApplyJobs(session);
    if (!check.allowed) {
      alert(check.error || 'Acesso restrito: Empresas não podem se candidatar.');
      return;
    }
    setSpeedApplyJob(job);
  };

  const handleSubmitApplication = (app: JobApplication) => {
    // Backend / Service RBAC enforcement
    const check = authService.assertCanApplyJobs(session);
    if (!check.allowed) {
      alert(check.error || 'Acesso restrito: Candidatura bloqueada por permissão RBAC.');
      return;
    }

    const updated = addApplication(app);
    setApplications(updated);

    // Increment applicants counter
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
    // Backend / Service RBAC enforcement
    const check = authService.assertCanPostJobs(session);
    if (!check.allowed) {
      alert(check.error || 'Acesso negado: Apenas contas de Empresa podem publicar vagas.');
      return;
    }

    const updated = [newJob, ...jobs];
    setJobs(updated);
    saveJobs(updated);
    setSelectedJob(newJob);
    navigate('/vagas');
  };

  const handleOpenSimulator = (title: string, company: string) => {
    setSimContext({ title, company });
    navigate('/simulador');
  };

  const handleAuthSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setProfile((prev) => ({
      ...prev,
      fullName: newSession.name,
      email: newSession.email,
    }));
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans">
      {/* Global Header with SpeedJobs Brand, Language Selector, and Action Buttons */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        applications={applications}
        profile={profile}
        session={session}
        onOpenSecurity={() => setSecurityModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* ROUTE: / (Home / Landing Page) */}
        {currentRoute === '/' && (
          <HomePage
            jobs={jobs}
            session={session}
            onNavigate={navigate}
            onSelectJob={handleSelectJob}
          />
        )}

        {/* ROUTE: /login (Dedicated Login Page) */}
        {currentRoute === '/login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onNavigate={navigate}
          />
        )}

        {/* ROUTE: /cadastro (Dedicated Registration Page with Role Choice) */}
        {currentRoute === '/cadastro' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onNavigate={navigate}
          />
        )}

        {/* ROUTE: /recuperar-senha (Dedicated Forgot Password Page) */}
        {currentRoute === '/recuperar-senha' && (
          <ForgotPasswordPage
            onNavigate={navigate}
          />
        )}

        {/* ROUTE: /vagas (Job Explorer) */}
        {currentRoute === '/vagas' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[650px]">
              {/* Left Column: Job Feed */}
              <div className="lg:col-span-5 h-full overflow-hidden flex flex-col">
                <JobList
                  jobs={jobs}
                  selectedJobId={selectedJob?.id ?? null}
                  onSelectJob={handleSelectJob}
                  onSpeedApply={handleOpenSpeedApply}
                  savedJobIds={savedJobIds}
                  onToggleSave={handleToggleSave}
                  profile={profile}
                  session={session}
                />
              </div>

              {/* Right Column: Job Detail */}
              <div className="hidden lg:flex lg:col-span-7 h-full overflow-hidden flex-col">
                <JobDetail
                  job={selectedJob}
                  profile={profile}
                  session={session}
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

        {/* ROUTE: /fast-tracker (Application Tracker - Candidates) */}
        {currentRoute === '/fast-tracker' && (
          <FastTracker
            applications={applications}
            onUpdateStatus={handleUpdateAppStatus}
            onRemoveApplication={handleRemoveApplication}
            onOpenSimulator={handleOpenSimulator}
            onBrowseJobs={() => navigate('/vagas')}
          />
        )}

        {/* ROUTE: /speedpass (Candidate SpeedPass) */}
        {currentRoute === '/speedpass' && (
          <CandidateSpeedPass
            profile={profile}
            onSaveProfile={handleSaveProfile}
            onBrowseJobs={() => navigate('/vagas')}
          />
        )}

        {/* ROUTE: /simulador (15-Min Speed Interview Simulator) */}
        {currentRoute === '/simulador' && (
          <InterviewSimulator
            initialJobTitle={simContext.title}
            initialCompany={simContext.company}
          />
        )}

        {/* ROUTE: /empresa (Employer Portal - Companies Only) */}
        {currentRoute === '/empresa' && (
          <EmployerPortal
            jobs={jobs}
            applications={applications}
            session={session}
            onNavigate={navigate}
            onOpenPostJob={() => setIsPostJobOpen(true)}
            onUpdateAppStatus={handleUpdateAppStatus}
            onSelectJob={(j) => {
              setSelectedJob(j);
              navigate('/vagas');
            }}
          />
        )}
      </main>

      {/* Security & Compliance Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>SpeedJobs Security Defense • OWASP Top 10 Protegido</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <button
              onClick={() => setSecurityModalOpen(true)}
              className="hover:text-blue-600 font-semibold cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auditoria Criptográfica</span>
            </button>
            <span>•</span>
            <span>PBKDF2-SHA256</span>
            <span>•</span>
            <span>Anti-CSRF Tokens</span>
            <span>•</span>
            <span>RBAC Estrito</span>
          </div>
        </div>
      </footer>

      {/* Global Speed Apply Modal (Candidates only) */}
      <SpeedApplyModal
        job={speedApplyJob}
        profile={profile}
        session={session}
        isOpen={!!speedApplyJob}
        onClose={() => setSpeedApplyJob(null)}
        onSubmitApplication={handleSubmitApplication}
        onGoToTracker={() => navigate('/fast-tracker')}
      />

      {/* Global Post Flash Job Modal (Empresas only) */}
      <PostJobModal
        isOpen={isPostJobOpen}
        session={session}
        onClose={() => setIsPostJobOpen(false)}
        onJobCreated={handleJobCreated}
      />

      {/* Security & Audit Modal */}
      <SecurityAuditModal
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      />
    </div>
  );
}

export function App() {
  return (
    <I18nProvider>
      <SpeedJobsMain />
    </I18nProvider>
  );
}

export default App;
