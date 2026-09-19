"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getQuizById } from "@/data/quizzesData";
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineClock,
  HiOutlineTrophy,
  HiOutlineBookOpen,
  HiOutlineCheckCircle,
  HiOutlinePlay,
  HiOutlineArrowLeft,
  HiOutlineSparkles,
} from "react-icons/hi2";

export default function QuizDetailPage({ params }: { params: Promise<{ quizId: string }> }) {
  const resolvedParams = use(params);
  const quiz = getQuizById(resolvedParams.quizId);

  if (!quiz) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-16">
      {/* Top Navbar */}
      <DashboardNavbar />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
        
        {/* Back Link */}
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0062b1] transition-colors mb-6 group"
        >
          <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Quizzes</span>
        </Link>

        {/* QUIZ OVERVIEW CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-md">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[#0062b1] font-mono font-bold text-xs">
                {quiz.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-mono font-bold text-xs">
                {quiz.level}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <HiOutlineQuestionMarkCircle className="w-4.5 h-4.5 text-cyan-600" />
                {quiz.questions.length} Questions
              </span>
              <span className="flex items-center gap-1">
                <HiOutlineClock className="w-4.5 h-4.5 text-amber-500" />
                {quiz.estimatedMinutes} Mins
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-extrabold">
                <HiOutlineTrophy className="w-4.5 h-4.5" />
                +{quiz.xpReward} XP
              </span>
            </div>
          </div>

          {/* Title & Course Source */}
          <div className="mt-6">
            <span className="text-xs font-mono font-extrabold text-[#0062b1] uppercase tracking-wider">
              Course: {quiz.courseTitle}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {quiz.title}
            </h1>
            <p className="text-sm font-semibold text-slate-600 mt-3 leading-relaxed">
              {quiz.description}
            </p>
          </div>

          {/* Detailed Overview Section */}
          <div className="mt-8 bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <HiOutlineBookOpen className="w-5 h-5 text-[#0062b1]" />
              <span>Test Overview & Objectives</span>
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-2 leading-relaxed">
              {quiz.fullOverview}
            </p>

            {/* Key Topics List */}
            <div className="mt-5">
              <p className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Topics Covered in This Test:
              </p>
              <ul className="space-y-2">
                {quiz.topicsCovered.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                    <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Test Guidelines */}
          <div className="mt-6 bg-cyan-50/60 border border-cyan-100 rounded-2xl p-5 flex items-start gap-3">
            <HiOutlineSparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <p className="font-extrabold text-[#0062b1]">Test Format Instructions:</p>
              <p className="mt-1 leading-relaxed font-semibold">
                • Each question is presented on its own page.<br />
                • You can navigate back and forth using the <strong>Previous</strong> and <strong>Next</strong> buttons.<br />
                • Submit your test on the final question to receive instant score breakdown and AI feedback!
              </p>
            </div>
          </div>

          {/* START TEST PRIMARY BUTTON */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400">Ready to test your skills?</p>
              <p className="text-sm font-black text-slate-800">
                {quiz.questions.length} Questions • {quiz.estimatedMinutes} Minutes Max
              </p>
            </div>

            {/* NAVIGATE TO ACTUAL TEST RUNNER PAGE */}
            <Link
              href={`/quizzes/${quiz.id}/take`}
              className="w-full sm:w-auto bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] hover:from-[#0062b1] hover:to-blue-500 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 uppercase tracking-wide"
            >
              <HiOutlinePlay className="w-5 h-5 fill-current" />
              <span>Start Test Now</span>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
