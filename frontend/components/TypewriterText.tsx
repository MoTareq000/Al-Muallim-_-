"use client";

import React, { useState, useEffect } from "react";

interface TypewriterTextProps {
  phrases?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  delayBetween?: number;
}

const defaultPhrases = [
  "Learn Programming for free!",
  "Master Python with AI Teacher!",
  "Build Real Projects for free!",
  "Debug Code with AI Assistance!",
];

export default function TypewriterText({
  phrases = defaultPhrases,
  typingSpeed = 90,
  deletingSpeed = 45,
  delayBetween = 2000,
}: TypewriterTextProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = phrases[phraseIndex];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          setCurrentText(fullText.substring(0, currentText.length + 1));

          if (currentText.length + 1 === fullText.length) {
            setTimeout(() => setIsDeleting(true), delayBetween);
          }
        } else {
          setCurrentText(fullText.substring(0, currentText.length - 1));

          if (currentText.length - 1 === 0) {
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, delayBetween]);

  return (
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-white flex items-center">
      <span>{currentText}</span>
      {/* Exact straight line blinking cursor | */}
      <span className="inline-block ml-0.5 font-light text-white animate-pulse">
        |
      </span>
    </h1>
  );
}
