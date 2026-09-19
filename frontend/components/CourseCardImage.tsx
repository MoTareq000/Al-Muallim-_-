import React from "react";

interface CourseCardImageProps {
  category: string;
  gradient: string;
}

export default function CourseCardImage({ category, gradient }: CourseCardImageProps) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-900">
      {/* Background Gradient & Animated Mesh */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr ${gradient} opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 ease-out`}
      />

      {/* Grid Pattern Accent */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] [background-size:14px_14px] group-hover:scale-110 transition-transform duration-500" />

      {/* Vector Coding Illustration Graphic */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-white group-hover:scale-105 transition-transform duration-500">
        {/* Code Window Graphic */}
        <div className="w-full max-w-[200px] bg-slate-950/60 backdrop-blur-md rounded-xl border border-white/20 p-3 shadow-lg group-hover:border-white/40 transition-colors">
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            <span className="text-[10px] font-mono text-cyan-300/80 ml-auto font-bold">
              .{category.toLowerCase().replace(/\s+/g, "")}
            </span>
          </div>
          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="h-1.5 w-3/4 bg-cyan-400/80 rounded" />
            <div className="h-1.5 w-1/2 bg-blue-300/60 rounded" />
            <div className="h-1.5 w-5/6 bg-indigo-300/50 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
