import React from 'react';

interface LotusIconProps {
  className?: string;
  color?: string;
  secondaryColor?: string;
}

/**
 * Exact Stylized Lotus Flower Brand Mark from Urban Organic Profile (Pages 1, 2, 6, 7)
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
  variant?: 'primary' | 'horizontal' | 'mark' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dark?: boolean; // If true, almond on dark green
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  dark = false,
  className = '',
}) => {
  const primaryColor = dark ? '#FBFAE3' : '#2A4B23';
  const secondaryColor = dark ? '#E8F5DF' : '#22733A';
  const textColor = dark ? '#FBFAE3' : '#2A4B23';
  const subtextColor = dark ? '#DFEAD7' : '#5A6B5D';

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

    const iconSizes = {
      sm: 'w-5 h-4',
      md: 'w-7 h-5',
      lg: 'w-9 h-7',
      xl: 'w-13 h-10',
    }[size];

    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 shadow-xs border transition-transform ${badgeSizes} ${
          dark
            ? 'bg-[#2A4B23] border-[#1F391A]'
            : 'bg-[#FBFAE3] border-[#E3E2C4]'
        } ${className}`}
      >
        <LotusMark className={iconSizes} color={primaryColor} secondaryColor={secondaryColor} />
      </div>
    );
  }

  // Primary Stacked Logo (Like Page 1 & 6 of Brand Profile: U [Lotus] O + URBAN ORGANIC)
  if (variant === 'primary') {
    return (
      <div className={`inline-flex flex-col items-center select-none ${className}`}>
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className="font-brand-serif font-bold text-2xl sm:text-3xl tracking-tight"
            style={{ color: textColor }}
          >
            U
          </span>
          <LotusMark className="w-8 h-6 sm:w-9 sm:h-7 mx-0.5" color={primaryColor} secondaryColor={secondaryColor} />
          <span
            className="font-brand-serif font-bold text-2xl sm:text-3xl tracking-tight"
            style={{ color: textColor }}
          >
            O
          </span>
        </div>
        <span
          className="font-brand-serif font-semibold text-[10px] sm:text-xs tracking-[0.25em] uppercase mt-1"
          style={{ color: textColor }}
        >
          URBAN ORGANIC
        </span>
      </div>
    );
  }

  // Horizontal Lockup for Header / Navigation
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Stylized U O Emblem */}
      <div
        className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 shadow-2xs ${
          dark
            ? 'bg-[#2A4B23] border-[#1F391A]'
            : 'bg-[#FBFAE3] border-[#E2E1C4]'
        }`}
      >
        <span
          className="font-brand-serif font-bold text-lg sm:text-xl leading-none"
          style={{ color: primaryColor }}
        >
          U
        </span>
        <LotusMark className="w-5 h-4 sm:w-6 sm:h-5" color={primaryColor} secondaryColor={secondaryColor} />
        <span
          className="font-brand-serif font-bold text-lg sm:text-xl leading-none"
          style={{ color: primaryColor }}
        >
          O
        </span>
      </div>

      {/* Brand Title & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className="font-brand-serif font-bold text-lg sm:text-xl tracking-tight leading-tight"
            style={{ color: textColor }}
          >
            URBAN ORGANIC
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3EC] text-[#2A4B23] border border-[#CCE2CE]">
            Rooted in Tradition
          </span>
        </div>
        <span className="text-xs font-medium" style={{ color: subtextColor }}>
          Sales Performance Dashboard
        </span>
      </div>
    </div>
  );
};
