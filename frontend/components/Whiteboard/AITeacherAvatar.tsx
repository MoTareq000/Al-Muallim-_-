"use client";

import React, { useMemo } from "react";
import type { StoryboardScene } from "@/lib/types";

interface AITeacherAvatarProps {
  scenes: StoryboardScene[];
  elapsed: number;
  viewWidth: number;
  viewHeight: number;
  zoom: number;
  isActive: boolean;
}

export default function AITeacherAvatar({ viewWidth, viewHeight, zoom, isActive }: AITeacherAvatarProps) {
  const pixW = viewWidth * zoom;
  const pixH = viewHeight * zoom;
  const avatarW = Math.round(pixW * 0.22);
  const avatarH = Math.round(avatarW * 1.55);
  const pos = useMemo(
    () => ({ x: pixW - avatarW - 16, y: pixH - avatarH - 8 }),
    [pixW, pixH, avatarW, avatarH]
  );

  if (!isActive) return null;

  return (
    <>
      <style>{`
        @keyframes avatarFloat {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          30%      { transform: translateY(-5px) rotate(0.4deg); }
          70%      { transform: translateY(3px) rotate(-0.3deg); }
        }
        @keyframes avatarBlink {
          0%,18%,22%,100% { transform: scaleY(1); }
          20%              { transform: scaleY(0.05); }
          48%,52%          { transform: scaleY(1); }
          50%              { transform: scaleY(0.05); }
          78%,82%          { transform: scaleY(1); }
          80%              { transform: scaleY(0.05); }
        }
        @keyframes avatarMouth {
          0%,100% { transform: scaleY(1); }
          8%      { transform: scaleY(1.5); }
          16%     { transform: scaleY(1.1); }
          24%     { transform: scaleY(1.6); }
          32%     { transform: scaleY(1.15); }
          40%     { transform: scaleY(1.45); }
          48%     { transform: scaleY(1); }
          56%     { transform: scaleY(1); }
          64%     { transform: scaleY(1.55); }
          72%     { transform: scaleY(1.1); }
          80%     { transform: scaleY(1.5); }
          88%     { transform: scaleY(1.2); }
          96%     { transform: scaleY(1.35); }
        }
        @keyframes armWaveLeft {
          0%,100% { transform: rotate(0deg); }
          20%     { transform: rotate(-22deg); }
          40%     { transform: rotate(8deg); }
          60%     { transform: rotate(-18deg); }
          80%     { transform: rotate(5deg); }
        }
        @keyframes armPointRight {
          0%,100% { transform: rotate(0deg); }
          25%     { transform: rotate(18deg); }
          50%     { transform: rotate(-8deg); }
          75%     { transform: rotate(22deg); }
        }
        @keyframes handGesture {
          0%,100% { transform: rotate(0deg) translateY(0px); }
          33%     { transform: rotate(-12deg) translateY(-4px); }
          66%     { transform: rotate(10deg) translateY(2px); }
        }
        .avatar-float   { animation: avatarFloat 5s ease-in-out infinite; transform-origin: center bottom; }
        .avatar-blink   { animation: avatarBlink 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .avatar-mouth   { animation: avatarMouth 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .arm-left       { animation: armWaveLeft 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: 70% 15%; }
        .arm-right      { animation: armPointRight 3.8s ease-in-out infinite; transform-box: fill-box; transform-origin: 30% 15%; }
        .hand-left      { animation: handGesture 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 0%; }
        .hand-right     { animation: handGesture 3.8s ease-in-out infinite 0.4s; transform-box: fill-box; transform-origin: 50% 0%; }
      `}</style>

      <div
        className="absolute pointer-events-none"
        style={{ zIndex: 30, left: pos.x, top: pos.y, width: avatarW, height: avatarH, filter: "drop-shadow(0 8px 24px rgba(15,23,42,0.18))" }}
      >
        <div className="avatar-float" style={{ width: "100%", height: "100%" }}>
          <svg
            viewBox="0 0 280 430"
            width={avatarW}
            height={avatarH}
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            {/* ── Body (suit/torso) ── */}
            <rect x="80" y="210" width="120" height="160" rx="18" fill="#1e293b" />
            {/* Shirt collar */}
            <polygon points="140,210 118,240 140,255 162,240" fill="#f8fafc" />
            {/* Tie */}
            <polygon points="140,240 133,260 140,310 147,260" fill="#e63946" />
            {/* Suit lapels */}
            <polygon points="118,210 80,240 100,370 140,255" fill="#0f172a" />
            <polygon points="162,210 200,240 180,370 140,255" fill="#0f172a" />
            {/* Suit buttons */}
            <circle cx="140" cy="320" r="3" fill="#334155" />
            <circle cx="140" cy="340" r="3" fill="#334155" />

            {/* ── Left arm (waves) ── */}
            <g className="arm-left">
              {/* Upper arm */}
              <rect x="42" y="215" width="42" height="22" rx="11" fill="#1e293b" transform="rotate(15,63,226)" />
              {/* Forearm */}
              <g className="hand-left">
                <rect x="20" y="248" width="38" height="20" rx="10" fill="#1e293b" transform="rotate(-5,39,258)" />
                {/* Hand */}
                <ellipse cx="16" cy="262" rx="14" ry="11" fill="#f4c89a" />
                {/* Fingers */}
                <rect x="4"  cy="252" width="7" height="16" rx="3.5" fill="#f4c89a" transform="rotate(-15,7,260)" />
                <rect x="12" cy="250" width="7" height="18" rx="3.5" fill="#f4c89a" transform="rotate(-5,15,259)" />
                <rect x="20" cy="251" width="7" height="17" rx="3.5" fill="#f4c89a" transform="rotate(5,23,259)" />
                <rect x="27" cy="253" width="6" height="15" rx="3" fill="#f4c89a" transform="rotate(12,30,260)" />
              </g>
            </g>

            {/* ── Right arm (points at board) ── */}
            <g className="arm-right">
              {/* Upper arm */}
              <rect x="196" y="215" width="42" height="22" rx="11" fill="#1e293b" transform="rotate(-15,217,226)" />
              {/* Forearm */}
              <g className="hand-right">
                <rect x="222" y="248" width="38" height="20" rx="10" fill="#1e293b" transform="rotate(5,241,258)" />
                {/* Hand */}
                <ellipse cx="264" cy="262" rx="14" ry="11" fill="#f4c89a" />
                {/* Index finger pointing */}
                <rect x="270" y="250" width="7" height="22" rx="3.5" fill="#f4c89a" transform="rotate(-10,273,261)" />
                {/* Other fingers curled */}
                <rect x="260" y="255" width="6" height="13" rx="3" fill="#e8a87c" transform="rotate(5,263,261)" />
                <rect x="253" y="257" width="6" height="12" rx="3" fill="#e8a87c" transform="rotate(10,256,263)" />
                <rect x="247" y="259" width="5" height="11" rx="2.5" fill="#e8a87c" transform="rotate(15,249,264)" />
              </g>
            </g>

            {/* ── Neck ── */}
            <rect x="122" y="185" width="36" height="30" rx="8" fill="#f4c89a" />

            {/* ── Head ── */}
            <ellipse cx="140" cy="155" rx="58" ry="65" fill="#f4c89a" />
            {/* Ear left */}
            <ellipse cx="83" cy="158" rx="10" ry="14" fill="#f4c89a" />
            <ellipse cx="83" cy="158" rx="6" ry="9" fill="#e8a87c" />
            {/* Ear right */}
            <ellipse cx="197" cy="158" rx="10" ry="14" fill="#f4c89a" />
            <ellipse cx="197" cy="158" rx="6" ry="9" fill="#e8a87c" />

            {/* ── Hair ── */}
            <ellipse cx="140" cy="100" rx="58" ry="38" fill="#1a0a00" />
            <ellipse cx="140" cy="92" rx="52" ry="30" fill="#2d1200" />
            {/* Hair fade into forehead */}
            <ellipse cx="140" cy="118" rx="56" ry="22" fill="#f4c89a" />

            {/* ── Eyebrows ── */}
            <path d="M108 128 Q120 122 132 126" stroke="#2d1200" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M148 126 Q160 122 172 128" stroke="#2d1200" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* ── Eyes (with blink) ── */}
            <g className="avatar-blink">
              {/* Left eye white */}
              <ellipse cx="120" cy="148" rx="16" ry="13" fill="white" />
              {/* Left iris */}
              <circle cx="120" cy="149" r="8" fill="#3b5bdb" />
              <circle cx="120" cy="149" r="4.5" fill="#1a1a2e" />
              <circle cx="123" cy="146" r="2" fill="white" />
              {/* Right eye white */}
              <ellipse cx="160" cy="148" rx="16" ry="13" fill="white" />
              {/* Right iris */}
              <circle cx="160" cy="149" r="8" fill="#3b5bdb" />
              <circle cx="160" cy="149" r="4.5" fill="#1a1a2e" />
              <circle cx="163" cy="146" r="2" fill="white" />
              {/* Eyelids (drawn on top, same color as skin, scale to blink) */}
              <ellipse cx="120" cy="141" rx="16" ry="7" fill="#f4c89a" />
              <ellipse cx="160" cy="141" rx="16" ry="7" fill="#f4c89a" />
            </g>

            {/* ── Nose ── */}
            <path d="M136 158 Q132 172 136 178 Q140 181 144 178 Q148 172 144 158" fill="#e8a87c" opacity="0.6" />
            <circle cx="134" cy="177" r="4" fill="#e0956a" opacity="0.5" />
            <circle cx="146" cy="177" r="4" fill="#e0956a" opacity="0.5" />

            {/* ── Mouth (animates open/close) ── */}
            <g className="avatar-mouth">
              {/* Lips */}
              <path d="M122 192 Q140 200 158 192" stroke="#c0614a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M122 192 Q130 188 140 187 Q150 188 158 192" fill="#e07060" />
              {/* Teeth (visible when mouth opens) */}
              <rect x="128" y="192" width="24" height="8" rx="3" fill="white" />
              <path d="M122 192 Q140 205 158 192" fill="#c0614a" />
            </g>

            {/* ── Glasses (optional — gives teacher look) ── */}
            <rect x="100" y="138" width="34" height="22" rx="8" fill="none" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="146" y="138" width="34" height="22" rx="8" fill="none" stroke="#1e293b" strokeWidth="2.5" />
            <line x1="134" y1="149" x2="146" y2="149" stroke="#1e293b" strokeWidth="2" />
            <line x1="100" y1="149" x2="88"  y2="152" stroke="#1e293b" strokeWidth="2" />
            <line x1="180" y1="149" x2="192" y2="152" stroke="#1e293b" strokeWidth="2" />

            {/* ── Subtle glow ring (active indicator) ── */}
            <ellipse cx="140" cy="420" rx="55" ry="8" fill="#3b5bdb" opacity="0.18" />
          </svg>
        </div>
      </div>
    </>
  );
}
