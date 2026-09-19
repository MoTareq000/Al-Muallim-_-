"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import RobotIcon from "@/components/RobotIcon";
import CourseCardImage from "@/components/CourseCardImage";
import { useCourses } from "@/context/CourseContext";
import {
  HiOutlineBookOpen,
  HiOutlineQuestionMarkCircle,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentList,
  HiOutlineTrophy,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowUpRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlinePlay,
  HiOutlineSparkles,
} from "react-icons/hi2";

export default function DashboardPage() {
  const { myCourses } = useCourses();
  const [askInput, setAskInput] = useState("");
  const [aiResponse, setAiResponse] = useState("I'm ready! Ask me anything about Python, Web Dev, or code bugs.");
  const [isAiActive, setIsAiActive] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAskMe = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!askInput.trim()) {
      setAiResponse("Please type a question or code issue above!");
      setIsAiActive(true);
      return;
    }

    setIsThinking(true);
    setIsAiActive(true);
    setAiResponse("Thinking & analyzing your question...");

    setTimeout(() => {
      setIsThinking(false);
      setAiResponse(`Great question! Here is how to approach "${askInput}": Break it down step-by-step using Python functions or React state logic.`);
      setAskInput("");
    }, 1200);
  };

  const quickActions = [
    {
      title: "Quizzes",
      subtitle: "460 available",
      icon: <HiOutlineQuestionMarkCircle className="w-6 h-6 text-[#0062b1] group-hover:scale-110 transition-transform" />,
      iconBg: "bg-blue-50/80 border-blue-100",
      badge: "460 New",
      href: "/quizzes",
    },
    {
      title: "Certificates",
      subtitle: "0 earned",
      icon: <HiOutlineAcademicCap className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />,
      iconBg: "bg-sky-50/80 border-sky-100",
      badge: "Track",
      href: "#certificates",
    },
    {
      title: "My Requests",
      subtitle: "0 pending",
      icon: <HiOutlineClipboardDocumentList className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />,
      iconBg: "bg-indigo-50/80 border-indigo-100",
      badge: "0 Active",
      href: "#requests",
    },
    {
      title: "Leaderboard",
      subtitle: "Rank --",
      icon: <HiOutlineTrophy className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />,
      iconBg: "bg-[#fffbeb] border-amber-100",
      badge: "Global",
      href: "#leaderboard",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-16">
      {/* Top Navigation Bar */}
      <DashboardNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
        
        {/* RESPONSIVE GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT MAIN COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* 1. CLEAN MODERN WELCOME TEXT */}
            <div className="py-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans flex items-center gap-3">
                Welcome To{" "}
                <span className="flex items-center gap-2">
                  <img src="/logo.jpg" alt="Logo" className="h-10 w-10 object-cover rounded-xl shadow-md border border-slate-200" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] font-black">
                    AdaptAcademy
                  </span>
                </span>{" "}
                <span className="inline-block animate-wave font-normal">👋</span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-slate-600 mt-2 max-w-xl leading-relaxed">
                Continue your programming journey with interactive AI Teacher guidance.
              </p>
            </div>

            {/* 2. STATS & MY COURSES COUNTER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                    <HiOutlineBookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      My Enrolled Courses
                    </p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
                      {myCourses.length}
                    </p>
                  </div>
                </div>
                <Link
                  href="/my-courses"
                  className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
                >
                  View All →
                </Link>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <RobotIcon className="w-6 h-6 text-blue-600" isTalking={isAiActive} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      AI Tutor Status
                    </p>
                    <p className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active & Ready
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. QUICK ACTIONS SECTION */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-sans tracking-tight">
                  Quick Actions
                </h2>
                <span className="text-xs font-bold text-slate-400 font-mono tracking-wider uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  4 Interactive Tools
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="relative bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:border-[#38a1f3] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between h-36 group overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-2xl ${action.iconBg} border flex items-center justify-center shadow-2xs`}>
                        {action.icon}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-mono font-bold tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          {action.badge}
                        </span>
                        <HiOutlineArrowUpRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-[#0062b1]" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0062b1] transition-colors font-sans tracking-tight">
                        {action.title}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {action.subtitle}
                      </p>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* 4. MY WORKSPACE SLIDER */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-sans tracking-tight">
                    My Workspace
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Your active enrolled courses ready to start
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollSlider("left")}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0062b1] hover:border-cyan-400 transition-all shadow-2xs active:scale-95 cursor-pointer"
                    title="Previous"
                  >
                    <HiOutlineChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollSlider("right")}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0062b1] hover:border-cyan-400 transition-all shadow-2xs active:scale-95 cursor-pointer"
                    title="Next"
                  >
                    <HiOutlineChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {myCourses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-500">No courses enrolled yet.</p>
                  <Link
                    href="/courses"
                    className="inline-block mt-3 text-xs font-bold text-[#38a1f3] hover:underline"
                  >
                    + Browse Available Courses
                  </Link>
                </div>
              ) : (
                <div
                  ref={sliderRef}
                  className="flex gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 snap-x scrollbar-none"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {myCourses.map((c) => (
                    <div
                      key={c.id}
                      className="w-72 sm:w-80 shrink-0 snap-start bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-2xl hover:border-[#38a1f3] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="h-40 relative overflow-hidden">
                        <CourseCardImage category={c.category} gradient={c.svgBg} />
                      </div>

                      <div className="p-5 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                            <span>{c.category}</span>
                            <span>{c.lessonsCount} Lessons</span>
                          </div>

                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0062b1] transition-colors font-sans tracking-tight">
                            {c.title}
                          </h3>
                          <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {c.description}
                          </p>
                        </div>

                        <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {c.level}
                          </span>

                          <Link
                            href={`/my-courses`}
                            className="bg-[#38a1f3] hover:bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <HiOutlinePlay className="w-4 h-4 fill-current" />
                            <span>Start</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDEBAR COLUMN */}
          <div className="flex flex-col gap-6">
            
            {/* ALIVE ANIMATED AI TEACHER CARD (Connected directly to Robot SVG & Ask Me Button) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden group hover:shadow-md transition-all">
              {/* Header Title with Active Status */}
              <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] flex items-center gap-1.5">
                  <HiOutlineSparkles className="w-5 h-5 text-cyan-500 animate-spin" style={{ animationDuration: '8s' }} />
                  AI Teacher
                </h3>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </div>
              </div>

              {/* Connected AI Speech Bubble directly over Robot SVG */}
              <div className="relative w-full mb-2">
                <div className="bg-gradient-to-r from-[#063966] to-[#0062b1] text-white text-xs font-semibold p-3.5 rounded-2xl shadow-md border border-cyan-400/30 text-left relative transition-all duration-300">
                  <p className="leading-relaxed">
                    {isThinking ? (
                      <span className="flex items-center gap-2 text-cyan-200">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        AI is thinking...
                      </span>
                    ) : (
                      aiResponse
                    )}
                  </p>
                  {/* Tail pointing down to robot */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0062b1] rotate-45 border-r border-b border-cyan-400/30" />
                </div>
              </div>

              {/* Interactive Alive Robot SVG Container */}
              <div
                onMouseEnter={() => setIsAiActive(true)}
                onMouseLeave={() => setIsAiActive(false)}
                className="relative w-36 h-36 my-2 rounded-3xl bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent border border-cyan-500/20 flex items-center justify-center p-3 shadow-inner group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                <RobotIcon className="w-28 h-28 text-[#38a1f3] drop-shadow-[0_4px_16px_rgba(56,189,248,0.45)]" isTalking={isAiActive || isThinking} />
              </div>

              {/* Question Input Field */}
              <form onSubmit={handleAskMe} className="w-full mt-3">
                <input
                  type="text"
                  value={askInput}
                  onChange={(e) => {
                    setAskInput(e.target.value);
                    if (!isAiActive) setIsAiActive(true);
                  }}
                  placeholder="Ask a question or paste code..."
                  className="w-full bg-slate-50 border border-slate-200/90 focus:border-[#38a1f3] focus:ring-2 focus:ring-cyan-400/20 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none transition-all"
                />

                {/* Animated "Ask Me" Action Button Connected to Robot SVG */}
                <button
                  type="submit"
                  onMouseEnter={() => setIsAiActive(true)}
                  onMouseLeave={() => setIsAiActive(false)}
                  className="w-full mt-3 bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] hover:from-[#0062b1] hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm tracking-wide py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-cyan-500/40 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 uppercase relative overflow-hidden group/btn"
                >
                  {/* Glowing energy sweep effect inside button */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  
                  {/* Live Oscillating Audio Soundwave Bars */}
                  <div className="flex items-center gap-0.5">
                    <span className={`w-1 rounded-full bg-cyan-300 transition-all ${isAiActive ? "h-3.5 animate-pulse" : "h-2"}`} />
                    <span className={`w-1 rounded-full bg-cyan-200 transition-all ${isAiActive ? "h-4 animate-bounce" : "h-3"}`} />
                    <span className={`w-1 rounded-full bg-cyan-300 transition-all ${isAiActive ? "h-3.5 animate-pulse" : "h-2"}`} />
                  </div>

                  <HiOutlineChatBubbleLeftRight className="w-4.5 h-4.5 group-hover/btn:rotate-12 transition-transform" />
                  <span>Ask Me</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
