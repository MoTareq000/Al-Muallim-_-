"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import DashboardNavbar from "@/components/DashboardNavbar";
import { getQuizById } from "@/data/quizzesData";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineSparkles,
  HiOutlineTrophy,
  HiOutlineArrowPath,
  HiOutlineArrowLeft,
} from "react-icons/hi2";

export default function TakeQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const quiz = getQuizById(resolvedParams.quizId);

  if (!quiz) {
    return notFound();
  }

  // Question Navigation & Answer States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Store selected answer for each question: { [questionIndex]: optionIndex }
  const [userAnswers, setUserAnswers] = useState<{ [qIndex: number]: number }>({});
  
  // Store whether answer was revealed/submitted for each question
  const [submittedQuestions, setSubmittedQuestions] = useState<{ [qIndex: number]: boolean }>({});
  
  // Final quiz submission state
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Handle option selection
  const handleSelectOption = (optionIndex: number) => {
    if (submittedQuestions[currentQuestionIndex] || isQuizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  // Submit single question answer to reveal AI explanation
  const handleConfirmAnswer = () => {
    if (userAnswers[currentQuestionIndex] === undefined) return;
    setSubmittedQuestions((prev) => ({
      ...prev,
      [currentQuestionIndex]: true,
    }));
  };

  // Previous Question button handler
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Next Question button handler
  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  // Final Submit Quiz handler
  const handleSubmitQuiz = () => {
    setIsQuizSubmitted(true);
  };

  // Calculate final score
  const calculateScore = () => {
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });
    return correctCount;
  };

  const finalScore = calculateScore();
  const xpEarned = Math.round((finalScore / totalQuestions) * quiz.xpReward);

  const handleRetakeQuiz = () => {
    setUserAnswers({});
    setSubmittedQuestions({});
    setCurrentQuestionIndex(0);
    setIsQuizSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none pb-16">
      {/* Top Navbar */}
      <DashboardNavbar />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10">
        
        {/* Top Breadcrumb & Exit Quiz */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href={`/quizzes/${quiz.id}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0062b1] transition-colors group"
          >
            <HiOutlineArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Exit Test</span>
          </Link>

          <span className="text-xs font-mono font-extrabold text-[#0062b1] bg-cyan-50 px-3 py-1 rounded-full border border-cyan-100">
            {quiz.title}
          </span>
        </div>

        {!isQuizSubmitted ? (
          /* SINGLE QUESTION PAGE VIEW */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-md flex flex-col justify-between min-h-[520px]">
            
            <div>
              {/* Question Header & Progress Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <span className="text-xs font-mono font-extrabold text-[#0062b1] uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {currentQuestion.question}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-400">Progress</span>
                  <p className="text-sm font-black text-cyan-600">
                    {Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)}%
                  </p>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] h-2.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                  }}
                />
              </div>

              {/* Optional Code Snippet */}
              {currentQuestion.codeSnippet && (
                <div className="bg-[#1e242b] text-cyan-300 p-4 sm:p-5 rounded-2xl font-mono text-xs sm:text-sm mb-6 overflow-x-auto border border-slate-800 shadow-inner">
                  <pre>{currentQuestion.codeSnippet}</pre>
                </div>
              )}

              {/* Options Selection List */}
              <div className="space-y-3.5 my-4">
                {currentQuestion.options.map((optionText, idx) => {
                  const isSelected = userAnswers[currentQuestionIndex] === idx;
                  const isAnswerRevealed = submittedQuestions[currentQuestionIndex];
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let optionStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300";

                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs";
                    } else if (isSelected) {
                      optionStyle = "bg-rose-50 border-rose-500 text-rose-900 font-bold shadow-xs";
                    }
                  } else if (isSelected) {
                    optionStyle = "bg-blue-50 border-[#38a1f3] text-[#0062b1] font-bold shadow-xs ring-2 ring-cyan-400/20";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerRevealed}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <span className="flex items-center gap-3.5">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? "bg-[#0062b1] text-white"
                              : "bg-white border border-slate-300 text-slate-700"
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{optionText}</span>
                      </span>

                      {isAnswerRevealed && isCorrect && (
                        <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerRevealed && isSelected && !isCorrect && (
                        <HiOutlineXCircle className="w-6 h-6 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Reveal Explanation if Answer Confirmed */}
              {submittedQuestions[currentQuestionIndex] && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-cyan-200 p-4 rounded-2xl text-xs text-slate-700 mt-5 flex items-start gap-3">
                  <HiOutlineSparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-[#0062b1]">AI Teacher Explanation:</p>
                    <p className="mt-0.5 leading-relaxed font-semibold">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* PREV & NEXT PAGE NAVIGATION CONTROLS */}
            <div className="pt-6 mt-8 border-t border-slate-100 flex items-center justify-between gap-4">
              
              {/* PREVIOUS BUTTON */}
              <button
                onClick={handlePrevQuestion}
                disabled={isFirstQuestion}
                className={`px-6 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  isFirstQuestion
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs active:scale-95"
                }`}
              >
                <HiOutlineChevronLeft className="w-4.5 h-4.5" />
                <span>Prev</span>
              </button>

              {/* Optional Check Answer Button if option chosen but not yet submitted */}
              {userAnswers[currentQuestionIndex] !== undefined && !submittedQuestions[currentQuestionIndex] && (
                <button
                  onClick={handleConfirmAnswer}
                  className="px-5 py-2.5 bg-cyan-50 hover:bg-cyan-100 text-[#0062b1] border border-cyan-200 rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  Check Explanation
                </button>
              )}

              {/* NEXT / SUBMIT BUTTON */}
              {!isLastQuestion ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3.5 bg-[#38a1f3] hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Next</span>
                  <HiOutlineChevronRight className="w-4.5 h-4.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] hover:from-[#0062b1] hover:to-blue-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95 uppercase tracking-wide"
                >
                  <span>Submit Quiz</span>
                  <HiOutlineCheckCircle className="w-5 h-5" />
                </button>
              )}
            </div>

          </div>
        ) : (
          /* FINAL QUIZ SUBMISSION RESULTS VIEW */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
              <HiOutlineTrophy className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-slate-900">Quiz Completed! 🎉</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Great job! Here is your performance report for <strong>{quiz.title}</strong>
            </p>

            {/* Score & XP Cards */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 my-8 max-w-md mx-auto flex items-center justify-around">
              <div>
                <p className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Score</p>
                <p className="text-4xl font-black text-slate-900 mt-1">
                  {finalScore} / {totalQuestions}
                </p>
              </div>
              <div className="h-12 w-px bg-slate-200" />
              <div>
                <p className="text-xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">XP Reward</p>
                <p className="text-4xl font-black text-emerald-600 mt-1">
                  +{xpEarned} XP
                </p>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleRetakeQuiz}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <HiOutlineArrowPath className="w-4.5 h-4.5" />
                <span>Retake Test</span>
              </button>

              <Link
                href="/quizzes"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#063966] via-[#0062b1] to-[#38a1f3] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center cursor-pointer uppercase tracking-wider"
              >
                Back to All Quizzes
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
