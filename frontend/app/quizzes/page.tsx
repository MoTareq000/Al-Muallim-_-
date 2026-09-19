"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useCourses } from "@/context/CourseContext";
import { ALL_QUIZZES } from "@/data/quizzesData";
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineAcademicCap,
  HiOutlinePlay,
  HiOutlineTrophy,
  HiOutlineClock,
  HiOutlineBookOpen,
  HiBolt,
  HiOutlineSparkles,
} from "react-icons/hi2";

// Per-category color accent config
const CATEGORY_STYLES: Record<
  string,
  { bar: string; badge: string; hover: string; glow: string }
> = {
  Python: {
    bar: "bg-gradient-to-b from-blue-500 to-indigo-600",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    hover: "group-hover:text-blue-600",
    glow: "hover:shadow-blue-200/60",
  },
  "Web Development": {
    bar: "bg-gradient-to-b from-violet-500 to-purple-700",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    hover: "group-hover:text-violet-600",
    glow: "hover:shadow-violet-200/60",
  },
  "C++": {
    bar: "bg-gradient-to-b from-rose-500 to-pink-700",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    hover: "group-hover:text-rose-600",
    glow: "hover:shadow-rose-200/60",
  },
  "Artificial Intelligence": {
    bar: "bg-gradient-to-b from-emerald-400 to-teal-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hover: "group-hover:text-emerald-600",
    glow: "hover:shadow-emerald-200/60",
  },
  JavaScript: {
    bar: "bg-gradient-to-b from-amber-400 to-orange-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    hover: "group-hover:text-amber-600",
    glow: "hover:shadow-amber-200/60",
  },
};

const DEFAULT_STYLE = {
  bar: "bg-gradient-to-b from-[#38a1f3] to-[#0062b1]",
  badge: "bg-cyan-50 text-[#0062b1] border-cyan-100",
  hover: "group-hover:text-[#0062b1]",
  glow: "hover:shadow-blue-200/60",
};

function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? DEFAULT_STYLE;
}

export default function QuizzesPage() {
  const { myCourses } = useCourses();

  // Default tab: my-courses
  const [activeTab, setActiveTab] = useState<"my-courses" | "all">("my-courses");

  const myCourseIds = myCourses.map((c) => c.id);
  const myCourseQuizzes = ALL_QUIZZES.filter((q) => myCourseIds.includes(q.courseId));
  const displayedQuizzes = activeTab === "my-courses" ? myCourseQuizzes : ALL_QUIZZES;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-20">
      <DashboardNavbar />

      {/* ── HERO HEADER ── */}
      <div className="bg-gradient-to-br from-[#063966] via-[#0b4d8a] to-[#0e6ec2] px-6 sm:px-10 pt-10 pb-14 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-40 rounded-full bg-[#38a1f3]/20 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
              <HiOutlineSparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[11px] font-black tracking-widest uppercase text-cyan-200">
                AI-Powered Quizzes
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Test Your Knowledge
            </h1>
            <p className="mt-2 text-sm sm:text-base text-blue-200 font-medium max-w-lg leading-relaxed">
              Earn XP, unlock achievements, and get instant AI explanations as you learn.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">My Quizzes</p>
              <p className="text-2xl font-black text-white mt-0.5">{myCourseQuizzes.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider">Available</p>
              <p className="text-2xl font-black text-cyan-300 mt-0.5">{ALL_QUIZZES.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB SWITCHER (floated over hero bottom) ── */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-8 -mt-5 mb-8 relative z-10">
        <div className="inline-flex bg-white border border-slate-200 shadow-lg shadow-slate-200/50 rounded-2xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("my-courses")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              activeTab === "my-courses"
                ? "bg-[#063966] text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <HiOutlineBookOpen className="w-4 h-4" />
            My Enrolled Courses
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "my-courses" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {myCourseQuizzes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
              activeTab === "all"
                ? "bg-[#063966] text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            <HiOutlineAcademicCap className="w-4 h-4" />
            All Available
            <span
              className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {ALL_QUIZZES.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8">

        {/* My Courses context strip */}
        {activeTab === "my-courses" && myCourseQuizzes.length > 0 && (
          <div className="flex items-center gap-3 mb-6 px-1">
            <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-[#0062b1] text-[11px] font-black px-3 py-1.5 rounded-full">
              <HiBolt className="w-3.5 h-3.5" />
              Showing quizzes for your {myCourses.length} enrolled course{myCourses.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Empty state */}
        {displayedQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <HiOutlineBookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-800">No quizzes for your enrolled courses yet.</h3>
            <p className="text-xs text-slate-500 mt-1.5">Enroll in more courses or browse all available quizzes.</p>
            <button
              onClick={() => setActiveTab("all")}
              className="mt-5 px-6 py-2.5 rounded-xl bg-[#0062b1] hover:bg-[#063966] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
            >
              Browse All Quizzes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedQuizzes.map((quiz) => {
              const style = getCategoryStyle(quiz.category);
              return (
                <div
                  key={quiz.id}
                  className={`bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl ${style.glow} hover:-translate-y-1.5 transition-all duration-300 flex overflow-hidden group`}
                >
                  {/* Left color accent bar */}
                  <div className={`w-1.5 shrink-0 ${style.bar}`} />

                  <div className="flex flex-col flex-1 p-5">
                    {/* Top row: category badge + level */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${style.badge}`}>
                        {quiz.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                        {quiz.level}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-[15px] font-black text-slate-900 ${style.hover} transition-colors tracking-tight leading-snug`}>
                      {quiz.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                      {quiz.description}
                    </p>

                    {/* Course label */}
                    <p className="text-[10px] text-slate-400 font-bold mt-2.5">
                      📚 <span className="text-slate-600 font-extrabold">{quiz.courseTitle}</span>
                    </p>

                    {/* Stat pills */}
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1 text-[10px] font-bold text-slate-600">
                        <HiOutlineQuestionMarkCircle className="w-3 h-3 text-cyan-500" />
                        {quiz.questions.length} Questions
                      </span>
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 text-[10px] font-bold text-amber-700">
                        <HiOutlineClock className="w-3 h-3" />
                        {quiz.estimatedMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        <HiOutlineTrophy className="w-3 h-3" />+{quiz.xpReward} XP
                      </span>
                    </div>

                    {/* Action row */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold">Tap to see overview →</span>
                      <Link
                        href={`/quizzes/${quiz.id}`}
                        className="flex items-center gap-1.5 bg-[#0062b1] hover:bg-[#063966] active:scale-95 text-white text-[11px] font-black px-4 py-2 rounded-xl shadow-sm shadow-blue-300/30 hover:shadow-md transition-all"
                      >
                        <HiOutlinePlay className="w-3.5 h-3.5 fill-current" />
                        Start
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
