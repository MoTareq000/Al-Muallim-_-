"use client";

import React, { useEffect, useRef } from "react";

export default function StarDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Create 300 slow-moving particle dots
    const dotsCount = 300;
    const dots = Array.from({ length: dotsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.8 + 0.2,
      speedY: Math.random() * 0.08 + 0.03, // Ultra slow upward drift
      speedX: (Math.random() - 0.5) * 0.04,
      pulseSpeed: Math.random() * 0.008 + 0.002,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dotsCount; i++) {
        const dot = dots[i];

        // Move dot slowly
        dot.y -= dot.speedY;
        dot.x += dot.speedX;

        // Gentle twinkle pulse
        dot.alpha += Math.sin(Date.now() * dot.pulseSpeed) * 0.005;

        // Wrap around top boundary
        if (dot.y < 0) {
          dot.y = height;
          dot.x = Math.random() * width;
        }

        // Wrap around horizontal boundaries
        if (dot.x < 0) dot.x = width;
        if (dot.x > width) dot.x = 0;

        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.15, Math.min(0.85, dot.alpha))})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
