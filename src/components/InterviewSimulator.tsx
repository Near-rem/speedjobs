import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  Award,
  Sparkles,
  Flame
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface InterviewSimulatorProps {
  initialJobTitle?: string;
  initialCompany?: string;
}

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({
  initialJobTitle = 'Senior Full Stack Engineer',
  initialCompany = 'HyperScale Labs',
}) => {
  const { t } = useI18n();
  const [jobTitle, setJobTitle] = useState(initialJobTitle);
  const [company, setCompany] = useState(initialCompany);

  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completed, setCompleted] = useState<boolean>(false);

  // Self Evaluation ratings
  const [ratingClarity, setRatingClarity] = useState<number>(4);
  const [ratingDepth, setRatingDepth] = useState<number>(5);
  const [ratingPacing, setRatingPacing] = useState<number>(4);

  const timerRef = useRef<any>(null);

  const questionPrompts = [
    {
      stage: 'Stage 1: Elevator Pitch (0-2m)',
      question: 'Give your high-impact 60-second summary: who you are, what you build best, and why you are excited for this rapid-hire role.',
      tip: 'Focus on shipped production wins and speed of iteration, not your entire college history.'
    },
    {
      stage: 'Stage 2: Architecture & Project Deep-Dive (2-7m)',
      question: 'Walk through the most complex system you built or optimized recently. What were the bottlenecks, and how did you diagnose them?',
      tip: 'Mention metrics (e.g. latency decreased from 400ms to 60ms, zero-downtime migration).'
    },
    {
      stage: 'Stage 3: Rapid Technical Tradeoffs (7-12m)',
      question: 'When a critical production bug hits during a high-speed sprint, how do you decide whether to roll back vs hotfix forward?',
      tip: 'Demonstrate bias for customer reliability while maintaining team velocity.'
    },
    {
      stage: 'Stage 4: Closing Alignment & Questions (12-15m)',
      question: 'What question will you ask the engineering leader about their deployment frequency, code review turnaround, and team autonomy?',
      tip: 'Ask: "What does the first 30 days of success look like for this position?"'
    }
  ];

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            setCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    if (completed) setCompleted(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(15 * 60);
    setCompleted(false);
  };

  const addMinute = () => {
    setTimeLeft((prev) => prev + 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const elapsed = 15 * 60 - timeLeft;
  let activeStageIndex = 0;
  if (elapsed >= 12 * 60) activeStageIndex = 3;
  else if (elapsed >= 7 * 60) activeStageIndex = 2;
  else if (elapsed >= 2 * 60) activeStageIndex = 1;
  else activeStageIndex = 0;

  const currentPrompt = questionPrompts[activeStageIndex];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-slate-950 font-black">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('simulator.title')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t('simulator.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Target Company"
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
          />
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Target Role"
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer & Stage Guidance */}
        <div className="lg:col-span-2 space-y-5">
          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl relative overflow-hidden text-center">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                {t('simulator.practiceLabel')}: <strong>{jobTitle}</strong> @ {company}
              </span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Toggle audio cues"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Clock */}
            <div
              className={`text-6xl sm:text-7xl font-mono font-black tracking-widest my-4 ${
                timeLeft < 180 ? 'text-amber-400 animate-pulse' : 'text-white'
              }`}
            >
              {formattedTime}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleTimer}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>{t('simulator.pauseSprint')}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{timeLeft === 900 ? t('simulator.startSprint') : t('simulator.resumeSprint')}</span>
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title={t('simulator.resetSprint')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={addMinute}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                +1 min
              </button>
            </div>

            {/* Stage Progress Pills */}
            <div className="grid grid-cols-4 gap-2 mt-6 pt-5 border-t border-slate-800 text-[11px]">
              {questionPrompts.map((p, idx) => {
                const isActive = activeStageIndex === idx;
                const isPast = activeStageIndex > idx;
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400'
                        : isPast
                        ? 'bg-slate-800/80 text-emerald-400'
                        : 'bg-slate-800/40 text-slate-500'
                    }`}
                  >
                    <div className="font-semibold text-[10px] uppercase">Part {idx + 1}</div>
                    <div className="truncate text-xs">{p.stage.split(':')[1]?.trim() || p.stage}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prompt Guidance Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 uppercase tracking-wide">
                {currentPrompt.stage}
              </span>
              <span className="text-xs text-slate-400">
                Pacing Guide: {activeStageIndex === 0 ? 'Be fast & memorable' : 'Focus on impact'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              "{currentPrompt.question}"
            </h3>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-900">{t('simulator.proTip')}</strong>{' '}
                {currentPrompt.tip}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{t('simulator.scratchpadTitle')}</span>
              </h3>
              <span className="text-[11px] text-slate-400">Notes & Bullets</span>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('simulator.scratchpadPlaceholder')}
              rows={6}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{t('simulator.scorecardTitle')}</span>
              </h3>
              <span className="text-[11px] text-emerald-600 font-bold">Self-Review</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t('simulator.clarityBrevity')}</span>
                  <span className="text-blue-600 font-bold">{ratingClarity}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingClarity}
                  onChange={(e) => setRatingClarity(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t('simulator.techDepth')}</span>
                  <span className="text-blue-600 font-bold">{ratingDepth}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingDepth}
                  onChange={(e) => setRatingDepth(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t('simulator.pacingDiscipline')}</span>
                  <span className="text-blue-600 font-bold">{ratingPacing}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={ratingPacing}
                  onChange={(e) => setRatingPacing(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{t('simulator.overallReadiness')}</span>
              <span className="font-black text-slate-900 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                {Math.round(((ratingClarity + ratingDepth + ratingPacing) / 15) * 100)}% Match
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
