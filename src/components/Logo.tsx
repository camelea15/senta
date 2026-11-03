import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'responsive';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSizes = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    responsive: 'w-5 h-5 sm:w-8 sm:h-8',
  };

  const textSizes = {
    xs: 'text-base tracking-[0.16em]',
    sm: 'text-lg tracking-[0.2em]',
    md: 'text-2xl tracking-[0.25em]',
    lg: 'text-3xl tracking-[0.3em]',
    responsive: 'text-base sm:text-2xl tracking-[0.16em] sm:tracking-[0.25em]',
  };

  const gapSizes = {
    xs: 'gap-2',
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
    responsive: 'gap-2 sm:gap-2.5',
  };

  return (
    <div className={`inline-flex items-center ${gapSizes[size]} select-none ${className}`}>
      {/* Refined Minimalist Perfume Bottle Emblem */}
      <svg
        viewBox="0 0 32 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} text-[#C69A55] shrink-0 transition-transform hover:scale-105 duration-300`}
      >
        {/* Bottle Cap */}
        <rect x="11" y="2" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        {/* Sprayer Neck */}
        <path d="M14 8V11H18V8" stroke="currentColor" strokeWidth="1.2" />
        {/* Bottle Shoulders & Body */}
        <path
          d="M6 13C6 11.8954 6.89543 11 8 11H24C25.1046 11 26 11.8954 26 13V30C26 32.2091 24.2091 34 22 34H10C7.79086 34 6 32.2091 6 30V13Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {/* Inner Liquid Level Arch */}
        <path
          d="M9 20C11.5 21.5 20.5 21.5 23 20V29C23 30.6569 21.6569 32 20 32H12C10.3431 32 9 30.6569 9 29V20Z"
          fill="currentColor"
          fillOpacity="0.12"
        />
        {/* Center Diamond / Crest */}
        <path
          d="M16 16L18.5 19L16 22L13.5 19L16 16Z"
          stroke="currentColor"
          strokeWidth="1"
          fill="currentColor"
          fillOpacity="0.2"
        />
      </svg>

      {/* Brand Wordmark */}
      <div className="flex flex-col">
        <span className={`font-serif font-bold text-[#F8F1E8] uppercase ${textSizes[size]}`}>
          SENTA<span className="text-[#C69A55]">.DZ</span>
        </span>
      </div>
    </div>
  );
};
