import React, { useState } from 'react';
import {
  X,
  Zap,
  Sparkles,
  DollarSign,
  Building2,
  MapPin,
  Clock,
  Plus
} from 'lucide-react';
import { Job, UrgencyTier, RemoteType, JobType, ExperienceLevel } from '../types';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobCreated: (job: Job) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onJobCreated,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [logo, setLogo] = useState('⚡');
  const [location, setLocation] = useState('San Francisco, CA');
  const [remoteType, setRemoteType] = useState<RemoteType>('Remote');
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [urgency, setUrgency] = useState<UrgencyTier>('Flash (24h)');
  const [department, setDepartment] = useState('Engineering');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Senior');
  const [salaryMin, setSalaryMin] = useState(140000);
  const [salaryMax, setSalaryMax] = useState(180000);
  const [salaryPeriod, setSalaryPeriod] = useState<'yr' | 'hr'>('yr');
  const [skillsStr, setSkillsStr] = useState('React, TypeScript, Node.js, Tailwind CSS');
  const [description, setDescription] = useState('');
  const [hiringSpeedDays, setHiringSpeedDays] = useState(1);

  // Template fillers
  const fillTemplate = (preset: 'fullstack' | 'ai' | 'design') => {
    if (preset === 'fullstack') {
      setTitle('Senior Full Stack Architect (React & Go)');
      setCompany('VelocityWorks');
      setLogo('⚡');
      setLocation('San Francisco, CA');
      setRemoteType('Remote');
      setJobType('Full-time');
      setUrgency('Flash (24h)');
      setDepartment('Engineering');
      setExperienceLevel('Senior');
      setSalaryMin(165000);
      setSalaryMax(210000);
      setSalaryPeriod('yr');
      setSkillsStr('React, Go, TypeScript, PostgreSQL, Docker, AWS');
      setDescription('Join our core product team to scale real-time collaboration engines. We interview in 24 hours and make fast offers.');
      setHiringSpeedDays(1);
    } else if (preset === 'ai') {
      setTitle('Lead Machine Learning Engineer');
      setCompany('Synapse Core');
      setLogo('🧠');
      setLocation('New York, NY');
      setRemoteType('Remote');
      setJobType('Full-time');
      setUrgency('Flash (24h)');
      setDepartment('AI & Research');
      setExperienceLevel('Lead');
      setSalaryMin(190000);
      setSalaryMax(240000);
      setSalaryPeriod('yr');
      setSkillsStr('Python, PyTorch, LLMs, LangChain, Kubernetes, TypeScript');
      setDescription('Build and fine-tune multimodal generative models with low-latency streaming infrastructure.');
      setHiringSpeedDays(1);
    } else {
      setTitle('Senior Product & Visual Designer');
      setCompany('Studio Rapid');
      setLogo('🎨');
      setLocation('Austin, TX');
      setRemoteType('Hybrid');
      setJobType('Full-time');
      setUrgency('Urgent (48h)');
      setDepartment('Design');
      setExperienceLevel('Mid');
      setSalaryMin(125000);
      setSalaryMax(155000);
      setSalaryPeriod('yr');
      setSkillsStr('Figma, Design Systems, Prototyping, CSS, UX Research');
      setDescription('Design delightful interfaces for high-growth tech products with extreme craft.');
      setHiringSpeedDays(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title: title || 'Senior Software Engineer',
      company: company || 'FastGrowth Tech',
      logo: logo || '⚡',
      location: location || 'Remote',
      remoteType,
      salaryMin: Number(salaryMin) || 120000,
      salaryMax: Number(salaryMax) || 160000,
      salaryPeriod,
      jobType,
      urgency,
      skills: skills.length > 0 ? skills : ['React', 'TypeScript'],
      experienceLevel,
      description: description || 'High velocity position with express hiring timeline.',
      responsibilities: [
        'Ship high quality features in continuous integration environment',
        'Participate in rapid technical architecture reviews',
        'Maintain system reliability and performance'
      ],
      requirements: [
        'Demonstrated production track record',
        'Strong problem solving and autonomy',
        'Excellent written and async communication'
      ],
      benefits: [
        'Express hiring decision in 24-48 hours',
        'Competitive equity and health package',
        'Remote equipment allowance'
      ],
      postedAt: 'Just now',
      hiringSpeedDays: Number(hiringSpeedDays) || 1,
      applicantsCount: 0,
      featured: true,
      speedInterviewAvailable: true,
      department: department || 'Engineering'
    };

    onJobCreated(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Post a Speed Job</h3>
              <p className="text-xs text-slate-300">
                Express listing with 24-48 hour candidate turnaround guarantee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Template Fillers */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 flex-wrap text-xs shrink-0">
          <span className="font-semibold text-slate-500">Fast Templates:</span>
          <button
            type="button"
            onClick={() => fillTemplate('fullstack')}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium transition-colors cursor-pointer"
          >
            ⚡ Full Stack Eng
          </button>
          <button
            type="button"
            onClick={() => fillTemplate('ai')}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium transition-colors cursor-pointer"
          >
            🧠 AI / ML Lead
          </button>
          <button
            type="button"
            onClick={() => fillTemplate('design')}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 rounded border border-slate-200 font-medium transition-colors cursor-pointer"
          >
            🎨 Product Designer
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. HyperScale Tech"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Logo Emoji / Icon</label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center text-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering, Design, AI..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Workplace Setting</label>
              <select
                value={remoteType}
                onChange={(e) => setRemoteType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Urgency Tier</label>
              <select
                value={urgency}
                onChange={(e) => {
                  setUrgency(e.target.value as any);
                  setHiringSpeedDays(e.target.value === 'Flash (24h)' ? 1 : 2);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-amber-800"
              >
                <option value="Flash (24h)">⚡ Flash (24h Response)</option>
                <option value="Urgent (48h)">⚡ Urgent (48h Response)</option>
                <option value="Same-Week">Same-Week Hiring</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Entry">Entry</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead / Staff</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Salary / Rate</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Max Salary / Rate</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Job Description & Mission</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg resize-none"
              placeholder="Tell candidates what they will ship in the first 2 weeks..."
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Publish Flash Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
