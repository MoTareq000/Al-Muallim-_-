"use client";

import React from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import CourseCardImage from "@/components/CourseCardImage";
import { useCourses } from "@/context/CourseContext";
import { HiOutlinePlus } from "react-icons/hi2";

export default function AvailableCoursesPage() {
  const { availableCourses, enrollCourse } = useCourses();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans select-none">
      {/* Dark Top Navbar */}
      <DashboardNavbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {/* Main Panel Container */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-10 min-h-[500px]">
          {/* Header Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-100">
            <div>
              <h1 className="text-2xl sm:text-3xl font-normal text-slate-700 font-sans">
                Available Courses
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Browse programming courses and click enroll to add them to your workspace.
              </p>
            </div>

            <Link
              href="/my-courses"
              className="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors shadow-2xs self-start sm:self-auto"
            >
              My Enrolled Courses →
            </Link>
          </div>

          {/* Available Courses Grid */}
          {availableCourses.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-lg">You are currently enrolled in all available courses!</p>
              <Link
                href="/my-courses"
                className="inline-block mt-4 text-sm text-[#38a1f3] hover:underline font-medium"
              >
                Go to My Courses →
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCourses.map((course) => (
                <div
                  key={course.id}
                  className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xs hover:shadow-2xl hover:border-[#38a1f3] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  {/* Clean Image Banner Header */}
                  <div className="h-44 relative overflow-hidden">
                    <CourseCardImage category={course.category} gradient={course.svgBg} />
                  </div>

                  {/* Card Content & Enrollment Action */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{course.category}</span>
                        <span>{course.lessonsCount} Lessons</span>
                      </div>

                      <h2 className="text-base font-bold text-slate-800 group-hover:text-[#0062b1] transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Enroll Button */}
                    <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {course.level}
                      </span>

                      <button
                        onClick={() => enrollCourse(course.id)}
                        className="bg-[#38a1f3] hover:bg-blue-600 text-white text-xs font-semibold px-5 py-2 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <HiOutlinePlus className="w-4 h-4" />
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
