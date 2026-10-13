export type RemoteType = 'Remote' | 'Hybrid' | 'On-site';
export type JobType = 'Full-time' | 'Contract' | 'Part-time' | 'Freelance';
export type UrgencyTier = 'Flash (24h)' | 'Urgent (48h)' | 'Same-Week' | 'Standard';
export type ExperienceLevel = 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
export type UserRole = 'funcionario' | 'empresa' | 'admin';

export interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  remoteType: RemoteType;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: 'yr' | 'hr';
  jobType: JobType;
  urgency: UrgencyTier;
  skills: string[];
  experienceLevel: ExperienceLevel;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  postedAt: string;
  hiringSpeedDays: number;
  applicantsCount: number;
  featured?: boolean;
  speedInterviewAvailable?: boolean;
  department: string;
  postedByEmail?: string;
}

export interface CandidateProfile {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experienceYears: number;
  expectedSalary: number;
  availability: 'Immediately' | 'In 1-2 weeks' | 'In 1 month';
  bio: string;
  github: string;
  linkedin: string;
  portfolio: string;
  avatarUrl: string;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Fast Screened'
  | 'Speed Interview'
  | 'Offer Extended'
  | 'Hired'
  | 'Declined';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  logo: string;
  location: string;
  salaryText: string;
  status: ApplicationStatus;
  appliedAt: string;
  urgency: UrgencyTier;
  pitchNote?: string;
  interviewSlot?: string;
  feedback?: string;
  candidateEmail?: string;
}

export interface InterviewSession {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  type: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meetingLink: string;
  notes?: string;
}
