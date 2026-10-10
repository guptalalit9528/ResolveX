import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'image';
  size?: 'sm' | 'md' | 'lg';
}

export const ResolveXLogo: React.FC<LogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
}) => {
  const sizeMap = {
    sm: { height: 32, markSize: 32 },
    md: { height: 44, markSize: 44 },
    lg: { height: 60, markSize: 60 },
  };

  const currentSize = sizeMap[size];

  if (variant === 'image') {
    return (
      <img
        src="/resolvex-logo.png"
        alt="ResolveX Logo - Every Problem Deserves a Resolution"
        className={`object-contain ${className}`}
        style={{ height: `${currentSize.height * 1.5}px` }}
      />
    );
  }

  const mark = (
    <svg
      viewBox="0 0 64 64"
      width={currentSize.markSize}
      height={currentSize.markSize}
      className="flex-shrink-0"
      aria-label="ResolveX Mark"
    >
      <defs>
        <linearGradient id="logo-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A5CD6" />
          <stop offset="100%" stopColor="#0AA0FF" />
        </linearGradient>
        <linearGradient id="logo-teal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10C98A" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      {/* Background Rounded Tile */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#0B1F4B" />
      {/* Road / Vertical stem */}
      <rect x="14" y="14" width="10" height="36" rx="3" fill="url(#logo-blue)" />
      <line x1="19" y1="20" x2="19" y2="26" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="34" x2="19" y2="40" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      {/* Pin Loop with Checkmark */}
      <path d="M24 14 h15 c8 0 13 5 13 11 c0 6 -5 11 -13 11 h-15 z" fill="url(#logo-teal)" />
      <path
        d="M33 24 l4 4 l8 -8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Diagonal R Leg */}
      <path d="M32 36 l16 14 h-12 l-12 -14 z" fill="url(#logo-blue)" />
    </svg>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{mark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {mark}
      <div className="flex flex-col">
        <span className="font-extrabold text-2xl tracking-tight leading-none text-navy-900 dark:text-white">
          Resolve<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-sky">X</span>
        </span>
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-1">
          Every Problem Deserves a Resolution.
        </span>
      </div>
    </div>
  );
};
