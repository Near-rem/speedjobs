import React, { useState } from 'react';
import {
  UserCheck,
  Zap,
  Save,
  Plus,
  X,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Clock,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Code2,
  Link2,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { CandidateProfile } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { sanitizeString, isValidEmail, isSafeUrl } from '../security/sanitizer';
import { csrfService } from '../security/csrf';

interface CandidateSpeedPassProps {
  profile: CandidateProfile;
  onSaveProfile: (profile: CandidateProfile) => void;
  onBrowseJobs: () => void;
}

export const CandidateSpeedPass: React.FC<CandidateSpeedPassProps> = ({
  profile,
  onSaveProfile,
  onBrowseJobs,
}) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<CandidateProfile>({ ...profile });
  const [newSkill, setNewSkill] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const popularSkills = [
    'React',
    'TypeScript',
    'Node.js',
    'Next.js',
    'Python',
    'Rust',
    'PostgreSQL',
    'AWS',
    'Docker',
    'Tailwind CSS',
    'GraphQL',
    'AI / LLM'
  ];

  const handleAddSkill = (skillToAdd: string) => {
    const trimmed = sanitizeString(skillToAdd);
    if (!trimmed) return;
    if (formData.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) return;

    setFormData({
      ...formData,
      skills: [...formData.skills, trimmed]
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove)
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate anti-CSRF
    const csrfToken = csrfService.getToken();
    if (!csrfService.validateToken(csrfToken)) {
      setErrorMsg(t('auth.csrfError'));
      return;
    }

    if (!isValidEmail(formData.email)) {
      setErrorMsg('E-mail inválido');
      return;
    }

    // Sanitize all inputs
    const sanitizedProfile: CandidateProfile = {
      fullName: sanitizeString(formData.fullName),
      title: sanitizeString(formData.title),
      email: sanitizeString(formData.email).toLowerCase(),
      phone: sanitizeString(formData.phone),
      location: sanitizeString(formData.location),
      skills: formData.skills.map((s) => sanitizeString(s)).filter(Boolean),
      experienceYears: Math.max(0, Math.min(40, Number(formData.experienceYears) || 0)),
      expectedSalary: Math.max(0, Number(formData.expectedSalary) || 0),
      availability: formData.availability,
      bio: sanitizeString(formData.bio),
      github: isSafeUrl(formData.github) ? formData.github : '',
      linkedin: isSafeUrl(formData.linkedin) ? formData.linkedin : '',
      portfolio: isSafeUrl(formData.portfolio) ? formData.portfolio : '',
      avatarUrl: formData.avatarUrl,
    };

    onSaveProfile(sanitizedProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('speedPass.title')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t('speedPass.subtitle')}
          </p>
        </div>

        <button
          onClick={onBrowseJobs}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Zap className="w-4 h-4 text-amber-400 fill-current" />
          <span>Ver Vagas Compatíveis</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SpeedPass ID Card Mockup */}
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={formData.avatarUrl}
                alt={formData.fullName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black tracking-tight">{formData.fullName}</h2>
                  <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" /> {t('speedPass.verifiedBadge')}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium">{formData.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {formData.location}
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-400 block">{t('speedPass.availability')}</span>
              <span className="inline-flex items-center gap-1.5 font-bold text-sm text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {formData.availability}
              </span>
              <div className="text-xs text-slate-300 font-semibold mt-2">
                Target: ${formData.expectedSalary.toLocaleString()} / yr
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 relative z-10">
            <span className="text-xs text-slate-400 font-semibold mr-1">
              {t('speedPass.verifiedSkills')}
            </span>
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{t('speedPass.editTitle')}</span>
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> OWASP Sanitized
              </span>
              {isSaved && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('speedPass.savedAlert')}
                </span>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.fullName')}</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.headline')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.email')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.phone')}</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.location')}</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.experience')}</label>
              <input
                type="number"
                min={0}
                max={30}
                value={formData.experienceYears}
                onChange={(e) =>
                  setFormData({ ...formData, experienceYears: Number(e.target.value) || 0 })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.salary')}</label>
              <input
                type="number"
                step={5000}
                value={formData.expectedSalary}
                onChange={(e) =>
                  setFormData({ ...formData, expectedSalary: Number(e.target.value) || 0 })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.availabilityWindow')}</label>
              <select
                value={formData.availability}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    availability: e.target.value as any
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              >
                <option value="Immediately">{t('speedPass.availImmediate')}</option>
                <option value="In 1-2 weeks">{t('speedPass.availTwoWeeks')}</option>
                <option value="In 1 month">{t('speedPass.availMonth')}</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">{t('speedPass.bio')}</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Skills Management */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-xs text-slate-900">
                {t('speedPass.skillsSection')} ({formData.skills.length})
              </label>
              <span className="text-[11px] text-slate-400">
                {t('speedPass.skillsHint')}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-blue-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(newSkill);
                  }
                }}
                placeholder={t('speedPass.addSkillPlaceholder')}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(newSkill)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('speedPass.addSkillBtn')}</span>
              </button>
            </div>

            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1">
                {t('speedPass.popularSuggestions')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {popularSkills
                  .filter((ps) => !formData.skills.includes(ps))
                  .map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => handleAddSkill(ps)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                    >
                      + {ps}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" /> GitHub Profile
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" /> LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Portfolio Site
              </label>
              <input
                type="url"
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Save Button */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('speedPass.updateBtn')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
