import React from 'react';

interface LotusIconProps {
  className?: string;
  color?: string;
  secondaryColor?: string;
}

/**
 * Official Logo Image from User Asset
 */
export const OfficialLogoImage: React.FC<{ className?: string; alt?: string }> = ({
  className = 'w-10 h-10 sm:w-11 sm:h-11',
  alt = 'Urban Organic Logo',
}) => {
  return (
    <img
      src="/urban_organic_logo.jpg"
      alt={alt}
      className={`object-contain rounded-xl shadow-2xs shrink-0 ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};

/**
 * Exact Stylized Lotus Flower Brand Mark from Urban Organic Profile
 */
export const LotusMark: React.FC<LotusIconProps> = ({
  className = 'w-6 h-6',
  color = '#2A4B23',
  secondaryColor,
}) => {
  const c1 = color;
  const c2 = secondaryColor || color;

  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Urban Organic Lotus Mark"
    >
      {/* Center upright petal */}
      <path
        d="M50 10 C43 25 42 40 50 56 C58 40 57 25 50 10Z"
        fill={c1}
      />
      {/* Left upper petal */}
      <path
        d="M45.5 20 C32 30 28 45 39.5 61 C44.5 50 45.5 35 45.5 20Z"
        fill={c1}
      />
      {/* Right upper petal */}
      <path
        d="M54.5 20 C68 30 72 45 60.5 61 C55.5 50 54.5 35 54.5 20Z"
        fill={c1}
      />
      {/* Left lower cradling petal */}
      <path
        d="M33 39 C17 48 13 60 25.5 69 C35.5 65 37 53 33 39Z"
        fill={c2}
      />
      {/* Right lower cradling petal */}
      <path
        d="M67 39 C83 48 87 60 74.5 69 C64.5 65 63 53 67 39Z"
        fill={c2}
      />
    </svg>
  );
};

interface BrandLogoProps {
  variant?: 'primary' | 'horizontal' | 'mark' | 'badge' | 'image';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean; // If true, almond on dark green
  className?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  dark = false,
  className = '',
  showTagline = true,
}) => {
  const primaryColor = dark ? '#FBFAE3' : '#2A4B23';
  const secondaryColor = dark ? '#E8F5DF' : '#22733A';
  const textColor = dark ? '#FBFAE3' : '#18261B';
  const subtextColor = dark ? '#DFEAD7' : '#5A6B5D';

  if (variant === 'image') {
    const imgSize = {
      sm: 'w-8 h-8',
      md: 'w-11 h-11',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24',
    }[size];

    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <OfficialLogoImage className={imgSize} />
      </div>
    );
  }

  if (variant === 'mark') {
    const sizeClasses = {
      sm: 'w-5 h-5',
      md: 'w-7 h-7',
      lg: 'w-10 h-10',
      xl: 'w-14 h-14',
    }[size];

    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <LotusMark className={sizeClasses} color={primaryColor} secondaryColor={secondaryColor} />
      </div>
    );
  }

  if (variant === 'badge') {
    const badgeSizes = {
      sm: 'w-8 h-8 rounded-xl',
      md: 'w-11 h-11 rounded-2xl',
      lg: 'w-14 h-14 rounded-2xl',
      xl: 'w-20 h-20 rounded-3xl',
    }[size];

    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 shadow-xs border transition-transform overflow-hidden ${badgeSizes} ${
          dark
            ? 'bg-[#2A4B23] border-[#1F391A]'
            : 'bg-white border-[#E3E2C4]'
        } ${className}`}
      >
        <OfficialLogoImage className="w-full h-full object-cover" />
      </div>
    );
  }

  // Primary Stacked Logo (Emblem + URBAN ORGANIC + Tagline)
  if (variant === 'primary') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-xs border border-[#E4E2CD] bg-white p-1">
          <OfficialLogoImage className="w-full h-full object-contain" />
        </div>
        <span
          className="font-brand-serif font-bold text-base sm:text-lg tracking-[0.15em] uppercase mt-2"
          style={{ color: textColor }}
        >
          URBAN ORGANIC
        </span>
        {showTagline && (
          <span className="text-[11px] font-medium tracking-wide text-center" style={{ color: subtextColor }}>
            World's First Metabolic Wellness Food Brand
          </span>
        )}
      </div>
    );
  }

  // Horizontal Lockup for Header / Navigation
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Official Brand Logo Icon */}
      <div className="relative group shrink-0">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-[#E2E1C4] shadow-2xs bg-white p-0.5">
          <OfficialLogoImage className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Brand Title & Tagline */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-brand-serif font-bold text-lg sm:text-xl tracking-tight leading-tight truncate"
            style={{ color: textColor }}
          >
            URBAN ORGANIC
          </span>
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF3EC] text-[#2A4B23] border border-[#CCE2CE] whitespace-nowrap">
            World&apos;s 1st Metabolic Wellness Food
          </span>
        </div>
        <span className="text-xs font-medium text-[#5A6B5D] truncate">
          Sales Performance Dashboard
        </span>
      </div>
    </div>
  );
};
