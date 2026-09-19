"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-8 py-6 w-full max-w-7xl mx-auto flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <img src="/logo.jpg" alt="AdaptAcademy Logo" className="h-10 w-10 object-cover rounded-xl shadow-md border border-white/20" />
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
          AdaptAcademy
        </span>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-normal text-white/90">
        <Link
          href="#get-started"
          className="hover:text-white transition-opacity"
        >
          Get Started
        </Link>
        <Link href="#courses" className="hover:text-white transition-opacity">
          Courses
        </Link>

        {/* White Pill Login Button */}
        <Link
          href="/login"
          className="ml-2 bg-white text-[#0a3d69] hover:bg-slate-100 px-6 py-1.5 rounded-full text-sm font-semibold transition-all shadow-sm"
        >
          Login
        </Link>
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden text-white focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {mobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#063966]/95 backdrop-blur-md px-6 py-4 flex flex-col gap-4 text-white border-b border-white/10 shadow-lg">
          <Link href="#get-started" className="hover:text-cyan-200">
            Get Started
          </Link>
          <Link href="#courses" className="hover:text-cyan-200">
            Courses
          </Link>
          <Link href="#ai-teacher" className="hover:text-cyan-200">
            AI Teacher
          </Link>
          <Link
            href="/login"
            className="w-full text-center py-2 bg-white text-[#0a3d69] rounded-full font-semibold shadow"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
