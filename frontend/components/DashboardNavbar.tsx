"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Available Courses", href: "/courses" },
    { name: "My Courses", href: "/my-courses" },
    { name: "Quizzes", href: "/quizzes" },
  ];

  return (
    <nav className="w-full bg-[#262d35] text-white px-6 py-3 shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section: Logo & Main Navigation Links */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-2.5"
          >
            <img src="/logo.jpg" alt="AdaptAcademy Logo" className="h-8 w-8 object-cover rounded-lg shadow-sm" />
            <span>AdaptAcademy</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-normal text-slate-200">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors py-1 ${
                    isActive
                      ? "text-white font-semibold border-b-2 border-cyan-400"
                      : "hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Section: Static Notification & Logout */}
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300">
          {/* Static Notification Bell Icon */}
          <div
            className="relative cursor-pointer hover:text-white transition-colors"
            title="Notifications"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight">
              67
            </span>
          </div>

          <Link
            href="/"
            className="hover:text-cyan-300 transition-colors cursor-pointer font-medium"
          >
            Logout
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-700/60 flex flex-col gap-3 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-cyan-300"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              Notifications
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                67
              </span>
            </span>
            <Link href="/" className="text-cyan-400 font-medium text-xs">
              Logout
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
