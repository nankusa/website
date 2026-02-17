'use client'

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  from?: object;
  to?: object;
  threshold?: number;
  rootMargin?: string;
  onComplete?: () => void;
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  onComplete
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll('.char');

    gsap.set(chars, from);

    const isInViewport = () => {
      const rect = container.getBoundingClientRect();
      return rect.top <= (window.innerHeight * threshold);
    };

    const shouldUseScrollTrigger = !isInViewport();

    const animationConfig = {
      ...to,
      duration,
      ease,
      delay: delay / 1000,
      stagger: 0.03,
      onComplete
    };

    const scrollTriggerConfig = shouldUseScrollTrigger ? {
      trigger: container,
      start: `top ${threshold * 100}%`,
      once: true
    } : undefined;

    gsap.to(chars, {
      ...animationConfig,
      scrollTrigger: scrollTriggerConfig
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.killTweensOf(chars);
    };
  }, [text, delay, duration, ease, from, to, threshold, rootMargin, onComplete]);

  return (
    <p ref={containerRef} className={className}>
      {text.split('').map((char, index) => (
        <span key={index} className="char inline-block">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </p>
  );
}
