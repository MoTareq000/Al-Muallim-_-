"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TypewriterText from "@/components/TypewriterText";
import Clouds from "@/components/Clouds";
import StarDots from "@/components/StarDots";
import SplineHero from "@/components/SplineHero";
import PageLoader from "@/components/PageLoader";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-[#063966] via-[#0a4778] to-[#093c68] text-white overflow-hidden flex flex-col justify-between select-none">
      {/* 0.5s Modern Page Loader */}
      <PageLoader />

      {/* Header Navigation */}
      <Navbar />

      {/* Moving Star Particle Dots Background */}
      <StarDots />

      {/* Spline 3D Scene on Left Side */}
      <div className="absolute inset-0 w-full h-full z-10 flex items-center justify-start pointer-events-auto">
        <div className="w-full md:w-[50%] h-[75%] md:h-full flex items-center">
          <SplineHero />
        </div>
      </div>

      {/* Hero Content Area */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-8 md:px-16 max-w-7xl w-full mx-auto pb-24 pointer-events-none">
        <div className="flex flex-col items-center md:items-start text-center md:text-left md:ml-[46%] max-w-xl pointer-events-auto">
          {/* Main Headline with typewriter effect & cursor */}
          <div className="min-h-[100px] flex items-center">
            <TypewriterText />
          </div>

          {/* White Get Started Button */}
          <div id="get-started" className="mt-6">
            <Link
              href="/login"
              className="inline-block bg-white hover:bg-slate-100 text-[#093d6b] font-medium text-base px-8 py-3.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Animated Multi-layered Fluffy Clouds */}
      <Clouds />
    </main>
  );
}
