import { Job, CandidateProfile, JobApplication, InterviewSession } from '../types';
import { SEED_JOBS, INITIAL_PROFILE, INITIAL_APPLICATIONS } from '../data/seedJobs';

const JOBS_KEY = 'speedjobs_jobs_v1';
const SAVED_JOBS_KEY = 'speedjobs_saved_ids_v1';
const PROFILE_KEY = 'speedjobs_profile_v1';
const APPLICATIONS_KEY = 'speedjobs_applications_v1';
const INTERVIEWS_KEY = 'speedjobs_interviews_v1';

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
