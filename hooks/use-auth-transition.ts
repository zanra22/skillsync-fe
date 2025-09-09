"use client";

import { useState, useRef, useEffect } from 'react';

export type AuthMode = 'signin' | 'signup';

export function useAuthTransition(initialMode: AuthMode = 'signin') {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode || isTransitioning) return;

    setIsTransitioning(true);
    
    // Add transition class
    if (containerRef.current) {
      containerRef.current.style.transform = newMode === 'signup' ? 'translateX(-50%)' : 'translateX(0%)';
    }

    // Update mode after transition starts
    setTimeout(() => {
      setMode(newMode);
      setIsTransitioning(false);
    }, 300); // Match CSS transition duration
  };

  const switchToSignIn = () => switchMode('signin');
  const switchToSignUp = () => switchMode('signup');

  return {
    mode,
    isTransitioning,
    switchToSignIn,
    switchToSignUp,
    containerRef,
  };
}
