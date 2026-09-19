"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { initialCoursesData, Course } from "@/data/courses";
import { VoicePoweredOrb } from "@/components/ui/voice-powered-orb";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import {
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineAcademicCap,
  HiPlay,
  HiOutlineClipboardDocumentCheck,
} from "react-icons/hi2";
import { useVoiceTutor } from "@/hooks/useVoiceTutor";
import Whiteboard from "@/components/Whiteboard/Whiteboard";

function LessonPageContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "python-101";

  const course: Course =
    initialCoursesData.find((c: Course) => c.id === courseId) || initialCoursesData[0];

  const [completed, setCompleted] = useState(false);
  const [activeOutlineIndex, setActiveOutlineIndex] = useState(0);
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar' | null>(null);

  // Only initialize the voice tutor after language is selected
  const { state, scenes, elapsed, toggleRecording, transcript, activeQuiz, submitQuiz } = useVoiceTutor(
    language ? course.title : "__WAIT__",
    language || "en"
  );
  const isRecording = state === 'RECORDING';
  const isAiSpeaking = state === 'AI_SPEAKING';
  const isError = state === 'ERROR';

  const outlineItems = [
    { title: `Introduction to ${course.category}`, duration: "2m", isQuiz: false },
    { title: "Core Concepts & Variables", duration: "3m", isQuiz: false },
    { title: "Visualizing the Architecture", duration: "4m", isQuiz: false },
    { title: "Interactive Practice session", duration: "3m", isQuiz: false },
    { title: "Common Mistakes to Avoid", duration: "2m", isQuiz: false },
    { title: `${course.category} Mastery Quiz`, duration: "5m", isQuiz: true },
  ];

  // ── LANGUAGE SELECTION SCREEN ──
  if (language === null) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans select-none">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-xl w-full relative overflow-hidden border border-slate-100">
          {/* Decorative blobs */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0062b1] to-[#38a1f3] text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <HiOutlineAcademicCap className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Choose Your Language</h2>
            <p className="text-sm text-slate-500 mb-8">Select the language for your AI tutor's voice</p>
            
            <div className="w-full grid grid-cols-2 gap-4">
              {/* English Option */}
              <button
                onClick={() => setLanguage('en')}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 hover:bg-[#0062b1] border-2 border-slate-200 hover:border-[#0062b1] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <span className="text-4xl">🇬🇧</span>
                <span className="text-lg font-extrabold text-slate-800 group-hover:text-white transition-colors">English</span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-100 transition-colors">Full Experience</span>
              </button>
              
              {/* Arabic Option */}
              <button
                onClick={() => setLanguage('ar')}
                className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 hover:bg-[#0062b1] border-2 border-slate-200 hover:border-[#0062b1] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Beta Badge */}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase tracking-wide border border-amber-200">
                  Beta
                </span>
                <span className="text-4xl">🇪🇬</span>
                <span className="text-lg font-extrabold text-slate-800 group-hover:text-white transition-colors">العربية</span>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-100 transition-colors">Egyptian Arabic</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-16">
      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/my-courses"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#0062b1] bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-2xs transition-colors"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to My Courses
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-100 text-[#0062b1] font-bold">
              {course.category}
            </span>
            <HiOutlineChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-extrabold">{course.title}</span>
          </div>
        </div>

        {/* 2-COLUMN MAIN GRID WITH ENLARGED RIGHT PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* LEFT MAIN CONTENT COLUMN */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* ── AI TEACHER DYNAMIC VISUALS CANVAS ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm min-h-[660px] flex flex-col justify-between relative overflow-hidden">
              
              {/* Dynamic Rendering Area */}
              <div className="my-2 relative flex items-center justify-center min-h-[500px] rounded-2xl w-full">
                <Whiteboard scenes={scenes} elapsed={elapsed} width={1000} height={600} showAvatar={false} isSpeaking={isAiSpeaking} />
                
                {/* QUIZ OVERLAY ANIMATION */}
                {activeQuiz && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-3xl animate-in fade-in duration-500">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-in zoom-in-95 duration-500 delay-150 relative overflow-hidden border border-slate-100">
                      {/* Decorative background element */}
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                      
                      <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-50 text-[#0062b1] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                          <HiOutlineAcademicCap className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-extrabold text-slate-800 mb-8 leading-snug">
                          {activeQuiz.question}
                        </h3>
                        
                        <div className="w-full space-y-3">
                          {activeQuiz.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => submitQuiz(option)}
                              className="w-full group relative flex items-center justify-center p-4 rounded-xl font-bold text-sm bg-slate-50 hover:bg-[#0062b1] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0062b1] transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                            >
                              <span>{option}</span>
                              <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <HiOutlineChevronRight className="w-5 h-5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Board Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setCompleted(!completed)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    completed
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-[#38a1f3] hover:bg-blue-600 text-white shadow-md"
                  }`}
                >
                  <HiOutlineCheckCircle className="w-4 h-4" />
                  {completed ? "Completed!" : "Mark Completed"}
                </button>
              </div>
            </div>

            {/* ── LESSON OUTLINE CARD ── */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
              <h2 className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-4">
                Lesson Outline
              </h2>

              <div className="space-y-1">
                {outlineItems.map((item, idx) => {
                  const isActive = activeOutlineIndex === idx;
                  return (
                    <button
                      key={item.title}
                      onClick={() => setActiveOutlineIndex(idx)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-50/80 text-[#0062b1]"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        {item.isQuiz ? (
                          <HiOutlineClipboardDocumentCheck className={`w-4 h-4 shrink-0 ${isActive ? "text-[#0062b1]" : "text-slate-400"}`} />
                        ) : (
                          <HiPlay className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-[#0062b1]" : "text-slate-400 opacity-60"}`} />
                        )}
                        <span className="truncate tracking-tight">{item.title}</span>
                      </div>
                      <span className={`text-[11px] font-mono shrink-0 ${isActive ? "text-blue-500 font-bold" : "text-slate-400 font-semibold"}`}>
                        {item.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ANIMATED AI ROBOT WITH FIXED TEXT & CIRCULAR VOICE BUTTON */}
          <div className="lg:col-span-1 lg:sticky lg:top-4 w-full flex flex-col items-center justify-center py-2 relative">
            
            {/* FIXED SPEECH BUBBLE RIGHT AT ROBOT MOUTH */}
            <div className="relative -mb-4 z-20 max-w-xs w-full">
              <div className={`text-white text-xs font-bold p-3 px-4 rounded-2xl shadow-xl border flex flex-col gap-1 transition-colors duration-500 ${isError ? 'bg-red-500 border-red-300' : 'bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] border-cyan-300/40'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5 shrink-0">
                    <span className={`w-1 h-3 rounded-full ${isAiSpeaking ? 'bg-cyan-300 animate-bounce' : 'bg-cyan-300/50'}`} />
                    <span className={`w-1 h-4 rounded-full ${(isRecording || state === 'THINKING') ? "bg-emerald-300 animate-ping" : isAiSpeaking ? "bg-white animate-bounce" : "bg-white"}`} />
                    <span className={`w-1 h-2.5 rounded-full ${isAiSpeaking ? 'bg-cyan-200 animate-bounce' : 'bg-cyan-200/50'}`} />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-cyan-200">
                    {state === 'RECORDING' ? 'Listening' : state === 'THINKING' ? 'Thinking' : isAiSpeaking ? 'Explaining' : 'Ready'}
                  </span>
                </div>
                <p className="leading-snug font-medium text-sm">
                  {isError
                    ? "Connection Error!"
                    : isRecording
                      ? (transcript || '"Listening..." 🎙️')
                      : state === 'THINKING'
                        ? '"Thinking about that..." 🧠'
                        : isAiSpeaking
                          ? '"Explaining on the board..." 💬'
                          : '"Click mic to talk!" 🚀'}
                </p>
              </div>
              {/* Pointer tail pointing to mouth */}
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border-r border-b transition-colors duration-500 ${isError ? 'bg-red-500 border-red-400' : 'bg-[#0062b1] border-cyan-400/40'}`} />
            </div>

            {/* ANIMATED FLOATING ROBOT IMAGE */}
            <div className="relative w-full flex items-center justify-center bg-transparent">
              <img
                src="/assets/robot.png"
                alt="AI Teacher Robot"
                className={`w-full h-auto max-h-[500px] object-contain drop-shadow-2xl scale-105 sm:scale-115 transition-all duration-500 animate-[float_4s_ease-in-out_infinite] ${isAiSpeaking ? 'brightness-110 drop-shadow-[0_0_30px_rgba(56,161,243,0.4)]' : ''}`}
                style={{
                  animation: "float 4s ease-in-out infinite",
                }}
              />
            </div>

            {/* ── UNCARDED CIRCULAR VOICE BUTTON & ORB UNDER ROBOT ── */}
            <div className="mt-2 w-full flex flex-col items-center gap-3 bg-transparent z-20">
              
              {/* Voice Powered Orb (Visible when active or AI Speaking) */}
              {(isRecording || isAiSpeaking) && (
                <div className={`w-20 h-20 relative overflow-hidden rounded-full border-2 shadow-lg transition-all duration-300 ${isRecording ? 'border-emerald-300/80 shadow-emerald-500/30' : 'border-cyan-300/80 shadow-cyan-500/30 scale-90'}`}>
                  <VoicePoweredOrb
                    enableVoiceControl={isRecording || isAiSpeaking}
                    hue={isRecording ? 120 : 200}
                    onVoiceDetected={setVoiceDetected}
                    maxHoverIntensity={isAiSpeaking ? 0.3 : 0.8}
                  />
                </div>
              )}

              {/* Circular Student Voice Button */}
              <Button
                onClick={toggleRecording}
                disabled={isError}
                className={`w-16 h-16 rounded-full flex items-center justify-center p-0 transition-all shadow-xl cursor-pointer hover:scale-110 active:scale-95 ${
                  isError
                    ? "bg-slate-300 cursor-not-allowed opacity-50"
                    : isRecording
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-300 ring-4 ring-red-300/40 animate-pulse"
                      : "bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] hover:from-[#0062b1] hover:to-blue-600 text-white shadow-blue-400/50"
                }`}
                title={isRecording ? "Click to Stop & Send" : "Click to Speak"}
              >
                {isRecording ? (
                  <MicOff className="w-7 h-7" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
              </Button>

              <span className="text-[11px] font-bold text-slate-500 text-center tracking-wide">
                {isError ? "Server disconnected" : isRecording ? "Click to Stop & Send..." : "Click mic to speak"}
              </span>
            </div>
            
            {/* Inline keyframe injection for floating robot animation */}
            <style jsx>{`
              @keyframes float {
                0%, 100% {
                  transform: translateY(0px) scale(1.1);
                }
                50% {
                  transform: translateY(-14px) scale(1.12);
                }
              }
            `}</style>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LessonPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading Lesson...</div>}>
      <LessonPageContent />
    </React.Suspense>
  );
}
