"use client";
/**
 * AnimationEngine — drives the elapsed timer that the Whiteboard uses
 * to decide which scenes to show.
 *
 * Also manages audio playback. A part's generated narration is always the
 * preferred audio source, so students hear one continuous teacher voice while
 * the board progresses. Per-caption audio and browser speech are legacy
 * fallbacks only when a complete narration track is unavailable.
 */

import { useEffect, useRef } from "react";
import { useLessonStore } from "@/store/lessonStore";
import type { LessonPart, StoryboardScene } from "@/lib/types";

interface AnimationEngineProps {
  part: LessonPart;
  onPartComplete: () => void;
}

function getActiveCaption(scenes: StoryboardScene[], elapsed: number, lastClear: number): StoryboardScene | null {
  let latest: StoryboardScene | null = null;
  for (const s of scenes) {
    if (s.action_type !== "draw_caption") continue;
    if (s.time_offset > elapsed || s.time_offset <= lastClear) continue;
    if (!latest || s.time_offset > latest.time_offset) latest = s;
  }
  return latest;
}

function captionSlotSeconds(scenes: StoryboardScene[], active: StoryboardScene): number {
  const payload = active.payload as Record<string, unknown>;
  const estimated = Math.max(0.25, Number(payload.estimatedDurationSeconds) || 1.2);
  const next = scenes
    .filter((scene) => scene.action_type === "draw_caption" && scene.time_offset > active.time_offset)
    .sort((a, b) => a.time_offset - b.time_offset)[0];
  if (next) return Math.max(0.25, Math.min(estimated, next.time_offset - active.time_offset));
  return estimated;
}

export default function AnimationEngine({ part, onPartComplete }: AnimationEngineProps) {
  const { status, speed, setElapsed, setStatus } = useLessonStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const captionAudioRef = useRef<HTMLAudioElement | null>(null);
  const elapsedRef = useRef<number>(0);
  const tickRef = useRef<number>(100);
  const lastCaptionIdRef = useRef<string | null>(null);
  const fallbackNarrationStartedRef = useRef(false);
  const onPartCompleteRef = useRef(onPartComplete);

  useEffect(() => {
    onPartCompleteRef.current = onPartComplete;
  }, [onPartComplete]);

  const storeElapsed = useLessonStore((s) => s.elapsed);
  useEffect(() => {
    const jumped = Math.abs(storeElapsed - elapsedRef.current) > 0.35;
    if (jumped) {
      lastCaptionIdRef.current = null;
      fallbackNarrationStartedRef.current = false;
      captionAudioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) audioRef.current.currentTime = Math.max(0, storeElapsed);
    }
    elapsedRef.current = storeElapsed;
  }, [storeElapsed]);

  // Prefer one continuous narration track for the whole part. Caption-level
  // playback is only retained for legacy lessons with no part narration.
  useEffect(() => {
    lastCaptionIdRef.current = null;
    fallbackNarrationStartedRef.current = false;
    captionAudioRef.current?.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (part.audio_url) {
      if (!audioRef.current) audioRef.current = new Audio(part.audio_url);
      audioRef.current.src = part.audio_url;
    } else {
      audioRef.current = null;
    }
    return () => {
      audioRef.current?.pause();
      captionAudioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [part.id, part.audio_url]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
    if (captionAudioRef.current) captionAudioRef.current.playbackRate = speed;
    tickRef.current = speed >= 2 ? 50 : speed <= 0.5 ? 200 : 100;
  }, [speed]);

  const hasCaptionTimeline = part.scenes.some((s) => s.action_type === "draw_caption");

  // Main playback loop — continuous part narration first, then legacy fallback.
  useEffect(() => {
    if (status === "playing") {
      const speakFullNarration = () => {
        if (fallbackNarrationStartedRef.current || !part.narration || typeof window === "undefined" || !("speechSynthesis" in window)) return;
        fallbackNarrationStartedRef.current = true;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(part.narration);
        utterance.rate = Math.min(2, Math.max(0.5, speed));
        window.speechSynthesis.speak(utterance);
      };
      const speakCaption = (text: string) => {
        if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.min(2, Math.max(0.5, speed));
        window.speechSynthesis.speak(utterance);
      };
      const playCaptionAt = (at: number) => {
        const active = getActiveCaption(part.scenes, at, 0);
        const activeId = active ? `${active.id}-${active.time_offset}` : null;
        if (!activeId) return;

        if (activeId === lastCaptionIdRef.current) {
          if (captionAudioRef.current?.paused) captionAudioRef.current.play().catch(() => {});
          if (typeof window !== "undefined" && window.speechSynthesis?.paused) window.speechSynthesis.resume();
          return;
        }

        lastCaptionIdRef.current = activeId;
        captionAudioRef.current?.pause();
        if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();

        const payload = active!.payload as Record<string, unknown>;
        const text = String(payload.narrationText || payload.content || "").trim();
        const capUrl = typeof payload.audioUrl === "string" ? payload.audioUrl : "";
        if (capUrl) {
          if (!captionAudioRef.current) captionAudioRef.current = new Audio();
          const audio = captionAudioRef.current;
          audio.src = capUrl;
          audio.onerror = () => speakCaption(text);
          audio.onloadedmetadata = () => {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
            const exactRate = (audio.duration * speed) / captionSlotSeconds(part.scenes, active!);
            audio.playbackRate = Math.min(2, Math.max(0.5, exactRate));
          };
          audio.playbackRate = speed;
          audio.play().catch(() => speakCaption(text));
        } else {
          speakCaption(text);
        }
      };

      if (part.audio_url && audioRef.current) {
        if (Math.abs(audioRef.current.currentTime - elapsedRef.current) > 0.35) {
          audioRef.current.currentTime = Math.max(0, elapsedRef.current);
        }
        audioRef.current.playbackRate = speed;
        audioRef.current.play().catch(() => {});
      } else if (part.narration) {
        // Keep a fallback narration continuous as well; do not restart speech
        // for each caption as that causes the audible chunking problem.
        speakFullNarration();
      } else if (hasCaptionTimeline) {
        playCaptionAt(elapsedRef.current);
      }

      const tick = tickRef.current;
      timerRef.current = setInterval(() => {
        const delta = (tick / 1000) * speed;
        const next = elapsedRef.current + delta;
        elapsedRef.current = next;
        setElapsed(next);

        if (!part.audio_url && !part.narration && hasCaptionTimeline) playCaptionAt(next);

        if (next >= part.duration_seconds) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          audioRef.current?.pause();
          captionAudioRef.current?.pause();
          if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
          setStatus("idle");
          onPartCompleteRef.current();
        }
      }, tick);
    } else {
      audioRef.current?.pause();
      captionAudioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (status === "paused") window.speechSynthesis.pause();
        else window.speechSynthesis.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, speed, part.id, part.scenes, part.narration, part.audio_url, part.duration_seconds, hasCaptionTimeline, setElapsed, setStatus]);

  return null;
}
