'use client';

import React from 'react';

// ==========================================
// SERVEOS BRAND LOGO WITH BOTANICAL LEAF EMBLEM
// ==========================================
export function ServeOSLogo({
  className = '',
  textClassName = 'text-xl',
  showTagline = false,
  size = 'md',
  variant = 'horizontal',
}: {
  className?: string;
  textClassName?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | string;
  variant?: 'horizontal' | 'image' | 'stacked' | 'icon-only';
}) {
  const iconHeights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
  };
  const iconH = iconHeights[size as keyof typeof iconHeights] || 'h-8';

  if (variant === 'image') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src="/images/serveos-logo-horizontal.png"
          alt="ServeOS"
          className={`${iconH} w-auto object-contain shrink-0`}
        />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <img
          src="/images/serveos-logo.png"
          alt="ServeOS"
          className="h-20 sm:h-24 w-auto object-contain drop-shadow-xs"
        />
        {showTagline && (
          <span className="text-[10px] tracking-widest font-bold text-[#556960] uppercase font-sans mt-1">
            RESTAURANT OPERATING SYSTEM
          </span>
        )}
      </div>
    );
  }

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center select-none ${className}`}>
        <img
          src="/images/serveos-icon.png"
          alt="ServeOS"
          className={`${iconH} w-auto object-contain shrink-0`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <img
        src="/images/serveos-icon.png"
        alt="ServeOS Logo"
        className={`${iconH} w-auto object-contain shrink-0`}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={`font-serif font-bold tracking-tight text-[#162820] ${textClassName}`}>
            Serve<span className="text-[#3a7d5c]">OS</span>
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] tracking-widest font-bold text-[#85988e] uppercase font-sans -mt-0.5">
            RESTAURANT OS
          </span>
        )}
      </div>
    </div>
  );
}

// ==========================================
// BOTANICAL MONSTERA & OLIVE BRANCH DECORATIONS
// ==========================================
export function BotanicalLeafBranch(_props?: any) {
  return null;
}

// Lush monstera leaf corner decoration (disabled)
export function MonsteraLeafCorner(_props?: any) {
  return null;
}

// Realistic potted indoor plant illustration (disabled)
export function PottedPlantIllustration(_props?: any) {
  return null;
}

// Handwritten script notes with curved arrows
export function HandwrittenNote({
  text,
  subtext,
  arrow = 'down-left',
  arrowDirection,
  className = '',
}: {
  text: string;
  subtext?: string;
  arrow?: 'down-left' | 'down-right' | 'up-right' | 'curved-down' | 'none';
  arrowDirection?: string;
  className?: string;
}) {
  const effectiveArrow = arrowDirection === 'up' ? 'up-right' : arrow;

  return (
    <div className={`inline-flex flex-col items-center select-none font-serif italic text-[#4a5e52] ${className}`}>
      <span className="text-xs sm:text-[13px] tracking-tight whitespace-nowrap drop-shadow-2xs">
        {text}
      </span>
      {subtext && (
        <span className="text-[11px] text-[#718578] -mt-0.5">
          {subtext}
        </span>
      )}

      {effectiveArrow === 'down-left' && (
        <svg viewBox="0 0 50 30" fill="none" className="w-8 h-5 text-[#8ca394] mt-0.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M45 5 Q25 8 10 25" />
          <path d="M8 17 L10 25 L18 24" />
        </svg>
      )}

      {effectiveArrow === 'down-right' && (
        <svg viewBox="0 0 50 30" fill="none" className="w-8 h-5 text-[#8ca394] mt-0.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 5 Q25 8 40 25" />
          <path d="M32 24 L40 25 L42 17" />
        </svg>
      )}

      {effectiveArrow === 'curved-down' && (
        <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-[#8ca394] mt-0.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 5 C25 10 30 25 20 35" />
          <path d="M26 31 L20 35 L16 29" />
        </svg>
      )}

      {effectiveArrow === 'up-right' && (
        <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-[#8ca394] mt-0.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 35 Q20 20 32 8" />
          <path d="M22 8 L32 8 L32 18" />
        </svg>
      )}
    </div>
  );
}
