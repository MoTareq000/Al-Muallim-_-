"use client";

import React from "react";

export default function Clouds() {
  return (
    <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none select-none h-32 sm:h-44 md:h-56">
      {/* Layer 1 - Deep Blue Back Cloud */}
      <div className="absolute bottom-0 left-0 right-0 w-full animate-cloud-slow opacity-95">
        <svg
          viewBox="0 0 1440 140"
          preserveAspectRatio="none"
          className="w-[115%] -ml-[7%] h-24 sm:h-36 md:h-44 text-[#4883ba]"
        >
          <path
            fill="currentColor"
            d="M0,80 C150,40 300,100 450,60 C600,20 750,80 900,40 C1050,0 1200,60 1350,30 C1400,20 1420,40 1440,30 L1440,140 L0,140 Z"
          />
        </svg>
      </div>

      {/* Layer 2 - Mid Sky Blue Cloud */}
      <div className="absolute bottom-0 left-0 right-0 w-full animate-cloud-medium opacity-95">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-[120%] -ml-[10%] h-20 sm:h-32 md:h-40 text-[#85b5e3]"
        >
          <path
            fill="currentColor"
            d="M0,60 C180,30 360,80 540,40 C720,0 900,60 1080,30 C1260,0 1380,50 1440,30 L1440,120 L0,120 Z"
          />
        </svg>
      </div>

      {/* Layer 3 - Light Blue Cloud */}
      <div className="absolute bottom-0 left-0 right-0 w-full animate-cloud-fast">
        <svg
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          className="w-[125%] -ml-[12%] h-16 sm:h-28 md:h-32 text-[#c5e0fb]"
        >
          <path
            fill="currentColor"
            d="M0,50 C120,20 240,70 360,30 C480,0 600,50 720,20 C840,-10 960,40 1080,15 C1200,-10 1320,40 1440,20 L1440,100 L0,100 Z"
          />
        </svg>
      </div>

      {/* Layer 4 - Soft White Front Cloud Cushion */}
      <div className="absolute bottom-0 left-0 right-0 w-full animate-cloud-slow">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="w-[110%] -ml-[5%] h-12 sm:h-20 md:h-24 text-[#edf5ff]"
        >
          <path
            fill="currentColor"
            d="M0,40 C100,20 200,60 300,30 C400,0 500,50 600,20 C700,-10 800,40 900,10 C1000,-10 1100,35 1200,10 C1300,-10 1400,30 1440,15 L1440,80 L0,80 Z"
          />
        </svg>
      </div>
    </div>
  );
}
