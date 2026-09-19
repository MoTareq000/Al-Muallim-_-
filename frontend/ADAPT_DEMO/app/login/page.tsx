"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StarDots from "@/components/StarDots";
import Clouds from "@/components/Clouds";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-b from-[#063966] via-[#0a4778] to-[#093c68] text-white overflow-hidden flex flex-col justify-between items-center select-none">
      {/* Moving Star Dots Background */}
      <StarDots />

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-7xl px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.jpg" alt="AdaptAcademy Logo" className="h-10 w-10 object-cover rounded-xl shadow-md border border-white/20" />
          <span className="text-2xl font-bold tracking-tight text-white font-sans">
            AdaptAcademy
          </span>
        </Link>

        <Link
          href="/"
          className="text-sm font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </header>

      {/* Login Credentials Card Container */}
      <div className="relative z-20 w-full max-w-md px-6 py-10 my-auto">
        <div className="bg-[#082e50]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/40 text-left">
          {/* Card Title & Subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-sans">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Sign in with your credentials to access your AI Teacher
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  defaultValue="student@adaptacademy.com"
                  placeholder="student@adaptacademy.com"
                  className="w-full bg-[#05213b]/90 border border-slate-600/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Password
                </label>
                <a href="#forgot" className="text-xs text-cyan-300 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  defaultValue="password123"
                  placeholder="••••••••••••"
                  className="w-full bg-[#05213b]/90 border border-slate-600/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 transition-all outline-none"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="w-4 h-4 rounded border-slate-600 bg-[#05213b] text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0"
              />
              <label htmlFor="remember" className="text-xs text-slate-300 cursor-pointer">
                Remember me on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={() => handleLogin()}
              className="w-full bg-white hover:bg-slate-100 text-[#093d6b] font-semibold text-base py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] mt-2 cursor-pointer"
            >
              Sign In
            </button>
          </form>

          {/* Card Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-300">
              Don't have an account?{" "}
              <a href="#signup" className="text-white font-semibold hover:underline">
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Layered Clouds at Bottom */}
      <Clouds />
    </main>
  );
}
