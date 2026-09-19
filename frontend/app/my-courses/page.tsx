"use client";

import React from "react";
import Link from "next/link";
import DashboardNavbar from "@/components/DashboardNavbar";
import CourseCardImage from "@/components/CourseCardImage";
import { useCourses } from "@/context/CourseContext";

export default function MyCoursesPage() {
  const { myCourses, unenrollCourse } = useCourses();

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
                My Enrolled Courses
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Courses you have enrolled in. Click "Start" to begin learning with your AI Teacher.
              </p>
            </div>

            <Link
              href="/courses"
              className="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors shadow-2xs self-start sm:self-auto"
            >
              + More Courses
            </Link>
          </div>

          {/* Enrolled Courses Grid */}
          {myCourses.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-lg">You haven't enrolled in any courses yet.</p>
              <Link
                href="/courses"
                className="inline-block mt-4 text-sm text-[#38a1f3] hover:underline font-medium"
              >
                Explore Available Courses →
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xs hover:shadow-2xl hover:border-[#38a1f3] hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  {/* Clean Image Header */}
                  <div className="h-44 relative overflow-hidden">
                    <CourseCardImage category={course.category} gradient={course.svgBg} />
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{course.category}</span>
                        <span>{course.lessonsCount} Lessons</span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-800 group-hover:text-[#0062b1] transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Action Footer */}
                    <div className="mt-6 flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        onClick={() => unenrollCourse(course.id)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        Unenroll
                      </button>

                      {/* Bright Blue Start Button */}
                      <Link
                        href={`/my-courses/lesson?courseId=${course.id}`}
                        className="bg-[#38a1f3] hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-xl transition-colors shadow-xs active:scale-95"
                      >
                        Start
                      </Link>
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
