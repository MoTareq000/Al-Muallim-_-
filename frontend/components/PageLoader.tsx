"use client";

import React, { useState, useEffect } from "react";

export default function PageLoader() {
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // 0.5 second initial loading timer
    const timer = setTimeout(() => {
      setLoading(false);
      // Remove from DOM after fade transition completes
      setTimeout(() => setShouldRender(false), 400);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0d4e82] transition-opacity duration-400 ease-out select-none ${
        loading ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Modern Spinning Square Shape */}
        <div className="relative w-14 h-14 animate-spin duration-700">
          <div className="w-full h-full bg-gradient-to-tr from-[#529edb] to-[#80c3f5] rounded-xl shadow-[0_0_20px_rgba(82,158,219,0.5)] transform rotate-45 border border-white/20" />
        </div>

        {/* Soft ground shadow underneath spinner */}
        <div className="w-12 h-2.5 bg-black/25 rounded-full blur-[4px] mt-6 animate-pulse" />
      </div>
    </div>
  );
}
