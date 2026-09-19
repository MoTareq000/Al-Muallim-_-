/* eslint-disable */
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Course, initialCoursesData } from "@/data/courses";

interface CourseContextType {
  courses: Course[];
  enrollCourse: (courseId: string) => void;
  unenrollCourse: (courseId: string) => void;
  myCourses: Course[];
  availableCourses: Course[];
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(initialCoursesData);

  // Load from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem("adapt_courses");
    if (saved) {
      try {
        setCourses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved courses", e);
      }
    }
  }, []);

  // Save to localStorage when updated
  const saveCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem("adapt_courses", JSON.stringify(newCourses));
  };

  const enrollCourse = (courseId: string) => {
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, enrolled: true } : c
    );
    saveCourses(updated);
  };

  const unenrollCourse = (courseId: string) => {
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, enrolled: false } : c
    );
    saveCourses(updated);
  };

  const myCourses = courses.filter((c) => c.enrolled);
  const availableCourses = courses.filter((c) => !c.enrolled);

  return (
    <CourseContext.Provider
      value={{
        courses,
        enrollCourse,
        unenrollCourse,
        myCourses,
        availableCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourses must be used within a CourseProvider");
  }
  return context;
}
