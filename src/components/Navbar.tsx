import React from 'react';
import {
  Zap,
  Briefcase,
  Layers,
  UserCheck,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { CandidateProfile, JobApplication } from '../types';

export type ActiveTab = 'jobs' | 'tracker' | 'profile' | 'simulator' | 'employer';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  applications: JobApplication[];
  profile: CandidateProfile;
  onPostJobClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  applications,
  profile,
  onPostJobClick,
}) => {
  const activeAppCount = applications.filter(
    (a) => a.status !== 'Declined' && a.status !== 'Hired'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top flash marquee */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-current" /> Express
          </span>
          <span className="text-slate-300">
            SpeedJobs Guarantee: Average recruiter response under 18 hours across 24h Flash roles.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-400 text-xs">
          <span>Candidate: <strong className="text-slate-200">{profile.fullName}</strong></span>
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {profile.availability}
          </span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className="flex items-center gap-2.5 group text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-black text-xl tracking-tight text-slate-900">
                  <span>Speed</span>
                  <span className="text-blue-600">Jobs</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-none">
                  Rapid-hire talent marketplace
                </p>
              </div>
            </button>

            {/* Desktop Nav Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse Jobs</span>
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'tracker'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Fast Tracker</span>
                {activeAppCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                    {activeAppCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>SpeedPass</span>
              </button>

              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-amber-50 text-amber-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>15-Min Simulator</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                  Practice
                </span>
              </button>

              <button
                onClick={() => setActiveTab('employer')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'employer'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Employer Hub</span>
              </button>
            </nav>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPostJobClick}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-xs transition-all hover:shadow cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Post Flash Job</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1 pl-2 border border-slate-200 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                {profile.fullName.split(' ')[0]}
              </span>
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/30"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 bg-slate-50/80 px-2 py-1.5 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
            activeTab === 'jobs' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          Jobs
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
            activeTab === 'tracker' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          Tracker ({activeAppCount})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
            activeTab === 'profile' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          SpeedPass
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
            activeTab === 'simulator' ? 'bg-white shadow-xs text-amber-700 font-bold' : 'text-slate-600'
          }`}
        >
          15-Min Sim
        </button>
        <button
          onClick={() => setActiveTab('employer')}
          className={`px-3 py-1.5 rounded-md font-medium cursor-pointer ${
            activeTab === 'employer' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
          }`}
        >
          Employer
        </button>
      </div>
    </header>
  );
};
