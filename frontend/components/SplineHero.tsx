"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Spline with ssr: false so it ONLY executes on client browser
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function SplineHero() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null; // Gracefully stay empty if Spline fails to fetch
  }

  return (
    <div className="w-full h-full flex items-center justify-center pointer-events-auto">
      <Spline
        scene="https://prod.spline.design/9sOVDdW3bBSxuEPS/scene.splinecode"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
