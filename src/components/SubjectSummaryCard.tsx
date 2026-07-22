import React from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  CircleDot,
  Sparkles,
  Trophy,
  ArrowRight,
  Check,
  FileCheck2,
  ShieldCheck
} from "lucide-react";
import { calculateSubjectSummary } from "../utils/chapterProgressHelper";
import { ChapterNote, ChapterProgressData } from "../types";

interface SubjectSummaryCardProps {
  subject: string;
  notes: ChapterNote[];
  chapterProgressMap?: Record<string, ChapterProgressData>;
}

interface TimelineStage {
  label: string;
  shortLabel: string;
  icon: string;
  pct: number;
}

const TIMELINE_STAGES: TimelineStage[] = [
  { label: "Not Started", shortLabel: "Not Started", icon: "○", pct: 0 },
  { label: "Reading", shortLabel: "Reading", icon: "→", pct: 25 },
  { label: "Completed First Reading", shortLabel: "First Reading", icon: "✓", pct: 50 },
  { label: "First Revision Completed", shortLabel: "Revision 1", icon: "✓", pct: 65 },
  { label: "Second Revision Completed", shortLabel: "Revision 2", icon: "✓", pct: 80 },
  { label: "Third Revision Completed", shortLabel: "Revision 3", icon: "✓", pct: 90 },
  { label: "PYQs Solved", shortLabel: "PYQs", icon: "✓", pct: 95 },
  { label: "Fully Prepared", shortLabel: "Fully Prepared", icon: "🏆", pct: 100 }
];

export default function SubjectSummaryCard({
  subject,
  notes,
  chapterProgressMap
}: SubjectSummaryCardProps) {
  const summary = calculateSubjectSummary(subject, notes, chapterProgressMap);
  const overallPct = summary.overallProgressPercent;

  // Requirement 6: Preparation Status Badge
  let badgeConfig = {
    label: "Just Started",
    emoji: "🔴",
    bgClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60"
  };

  if (overallPct === 100) {
    badgeConfig = {
      label: "Fully Prepared",
      emoji: "🏆",
      bgClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
    };
  } else if (overallPct >= 70) {
    badgeConfig = {
      label: "Revision Phase",
      emoji: "🟢",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60"
    };
  } else if (overallPct >= 50) {
    badgeConfig = {
      label: "First Reading Complete",
      emoji: "🟡",
      bgClass: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60"
    };
  } else if (overallPct >= 25) {
    badgeConfig = {
      label: "In Progress",
      emoji: "🟠",
      bgClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/60"
    };
  }

  // Requirement 4: Calculate highest stage reached by majority (>= 50%) of chapters
  let highestMajorityStageIndex = 0;
  if (summary.totalChapters > 0) {
    const requiredMajority = Math.ceil(summary.totalChapters / 2);
    for (let i = TIMELINE_STAGES.length - 1; i >= 0; i--) {
      const stagePct = TIMELINE_STAGES[i].pct;
      // Count chapters with progress >= stagePct
      let chaptersAtOrAbove = 0;
      notes.forEach((note) => {
        const keyWithSubject = `${subject}_${note.id}`;
        const record = chapterProgressMap?.[keyWithSubject] || chapterProgressMap?.[note.id];
        const statusStr = record?.selectedStatus || "Not Started";
        const foundStage = TIMELINE_STAGES.find((s) => s.label === statusStr);
        const chapterPct = foundStage ? foundStage.pct : 0;
        if (chapterPct >= stagePct) {
          chaptersAtOrAbove++;
        }
      });

      if (chaptersAtOrAbove >= requiredMajority) {
        highestMajorityStageIndex = i;
        break;
      }
    }
  }

  // Requirement 7: Motivational message
  let motivationalMessage = "Start reading your first chapter to begin preparation.";
  const uncompletedCount = summary.totalChapters - summary.completed;

  if (summary.totalChapters === 0) {
    motivationalMessage = "No chapters added for this subject yet.";
  } else if (overallPct === 100) {
    motivationalMessage = "Excellent! All chapters are fully prepared.";
  } else if (uncompletedCount > 0) {
    motivationalMessage = `${uncompletedCount} ${uncompletedCount === 1 ? "chapter" : "chapters"} left to finish first reading.`;
  } else if ((summary.stageCounts["PYQs Solved"] || 0) < summary.totalChapters) {
    motivationalMessage = "Complete PYQs to become Fully Prepared.";
  } else {
    motivationalMessage = "Great progress! Keep revising to reach 100% preparation.";
  }

  // SVG dimensions for smooth animated circular progress
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-5 bg-gradient-to-br from-white via-slate-50/90 to-blue-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/20 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-4 relative overflow-hidden"
      id="study-progress-card"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Title & Badge */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Overall Preparation
            </h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block">
              {subject} • {summary.totalChapters} Chapters
            </span>
          </div>
        </div>

        {/* Preparation Status Badge */}
        <motion.div
          key={badgeConfig.label}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`px-3 py-1.2 rounded-full border text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs shrink-0 ${badgeConfig.bgClass}`}
        >
          <span>{badgeConfig.emoji}</span>
          <span>{badgeConfig.label}</span>
        </motion.div>
      </div>

      {/* Circular Progress & Key Metric Column */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2 bg-white/70 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 z-10 backdrop-blur-xs">
        {/* Large Animated Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-slate-100 dark:stroke-slate-800/80"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-blue-600 dark:stroke-blue-500"
              strokeWidth="9"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.span
              key={overallPct}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none"
            >
              {overallPct}%
            </motion.span>
            <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-tight mt-1">
              Subject Completed
            </span>
          </div>
        </div>

        {/* Breakdown Stats Below / Alongside Circle */}
        <div className="flex flex-col gap-2.5 w-full sm:w-auto min-w-[200px]">
          {/* Completed Chapters */}
          <div className="flex items-center justify-between text-xs font-bold gap-3 px-3 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Completed Chapters</span>
            </div>
            <span className="font-black text-emerald-700 dark:text-emerald-400">
              {summary.completed} / {summary.totalChapters}
            </span>
          </div>

          {/* Reading */}
          <div className="flex items-center justify-between text-xs font-bold gap-3 px-3 py-1.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100/80 dark:border-blue-900/40 text-blue-800 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Reading</span>
            </div>
            <span className="font-black text-blue-700 dark:text-blue-400">
              {summary.reading}
            </span>
          </div>

          {/* Not Started */}
          <div className="flex items-center justify-between text-xs font-bold gap-3 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
              <span>Not Started</span>
            </div>
            <span className="font-black text-slate-700 dark:text-slate-300">
              {summary.notStarted}
            </span>
          </div>
        </div>
      </div>

      {/* Requirement 4: Horizontal Progress Timeline */}
      <div className="flex flex-col gap-2 z-10 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Preparation Stage Timeline
          </span>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
            Majority at: {TIMELINE_STAGES[highestMajorityStageIndex].shortLabel}
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-none py-2 px-1">
          <div className="flex items-center justify-between min-w-[620px] relative">
            {/* Connector Line Background */}
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />

            {/* Active Connector Fill */}
            <motion.div
              className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 -translate-y-1/2 z-0 rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${(highestMajorityStageIndex / (TIMELINE_STAGES.length - 1)) * 95}%`
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            {TIMELINE_STAGES.map((stage, idx) => {
              const isReached = idx <= highestMajorityStageIndex;
              const isMajorityNode = idx === highestMajorityStageIndex;

              return (
                <div
                  key={stage.label}
                  className="flex flex-col items-center gap-1.5 z-10 relative group cursor-default"
                >
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                      isMajorityNode
                        ? "bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-500/30 scale-110"
                        : isReached
                        ? "bg-indigo-500 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {stage.icon}
                  </motion.div>

                  <span
                    className={`text-[9.5px] font-black tracking-tight text-center whitespace-nowrap px-1 rounded-sm ${
                      isMajorityNode
                        ? "text-blue-600 dark:text-blue-400 font-extrabold"
                        : isReached
                        ? "text-slate-700 dark:text-slate-200"
                        : "text-slate-400 dark:text-slate-600"
                    }`}
                  >
                    {stage.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Requirement 5: Four Compact Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 pt-1">
        {/* Total Chapters */}
        <div className="p-2.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Total
              </span>
              <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                {summary.totalChapters}
              </span>
            </div>
          </div>
        </div>

        {/* Reading */}
        <div className="p-2.5 bg-sky-50/70 dark:bg-sky-950/20 border border-sky-100/80 dark:border-sky-900/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 rounded-lg shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Reading
              </span>
              <span className="text-sm font-black text-sky-700 dark:text-sky-300">
                {summary.reading}
              </span>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Completed
              </span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                {summary.completed}
              </span>
            </div>
          </div>
        </div>

        {/* Fully Prepared */}
        <div className="p-2.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                Fully Prepared
              </span>
              <span className="text-sm font-black text-amber-700 dark:text-amber-300">
                {summary.fullyPrepared}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 7: Motivational Message */}
      <motion.div
        key={motivationalMessage}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-3.5 py-2.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/40 rounded-2xl flex items-center gap-2.5 z-10"
      >
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-tight">
          "{motivationalMessage}"
        </p>
      </motion.div>
    </motion.div>
  );
}
