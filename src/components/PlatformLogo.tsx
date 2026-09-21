import React from 'react';

interface PlatformLogoProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Normalizes platform name to canonical key
 */
export function normalizePlatformName(name: string): string {
  const p = (name || '').toLowerCase().trim();
  if (p.includes('amazon')) return 'amazon';
  if (p.includes('flipkart')) return 'flipkart';
  if (p.includes('jiomart') || p.includes('jio mart') || p.includes('jio')) return 'jiomart';
  if (p.includes('myntra')) return 'myntra';
  if (p.includes('blinkit') || p.includes('grofers')) return 'blinkit';
  if (p.includes('zepto')) return 'zepto';
  if (p.includes('instamart') || p.includes('swiggy')) return 'swiggy';
  if (p.includes('nykaa')) return 'nykaa';
  if (p.includes('bigbasket') || p.includes('bbnow') || p.includes('bb now')) return 'bigbasket';
  if (p.includes('meesho')) return 'meesho';
  if (p.includes('tata') || p.includes('1mg') || p.includes('neu')) return 'tataneu';
  if (p.includes('website') || p.includes('shopify') || p.includes('online') || p.includes('d2c') || p.includes('web')) return 'website';
  if (p.includes('offline') || p.includes('retail') || p.includes('direct') || p.includes('store') || p.includes('b2b')) return 'offline';
  return 'default';
}

/**
 * High-fidelity, official brand vector logos for e-commerce & quick-commerce channels
 */
export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  platform,
  size = 'md',
  className = '',
}) => {
  const key = normalizePlatformName(platform);

  // Dimension presets
  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-sm',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-base',
  }[size];

  // Render authentic brand logo
  switch (key) {
    case 'amazon':
      return (
        <div
          className={`${sizeClasses} bg-white border border-[#E6E1D8] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Amazon"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* Amazon 'a' with the iconic orange smile arrow */}
            <path
              d="M24 6C14.059 6 6 14.059 6 24s8.059 18 18 18 18-8.059 18-18S33.941 6 24 6z"
              fill="#FFFFFF"
            />
            {/* Lowercase 'a' */}
            <path
              d="M26.2 23.9c-.3-.2-.8-.4-1.4-.5-.6-.1-1.3-.2-2-.2-1.3 0-2.3.3-2.9.8-.6.5-.9 1.2-.9 2.1 0 .9.3 1.6.9 2.1.6.5 1.5.8 2.6.8.9 0 1.7-.2 2.4-.6.7-.4 1.1-.9 1.3-1.6v-2.9zm3.5 5.5c-.5.6-1.1 1.1-1.9 1.4-.8.4-1.7.5-2.7.5-1.5 0-2.8-.4-3.8-1.2-1-.8-1.5-2-1.5-3.4 0-1.5.6-2.7 1.8-3.5 1.2-.8 2.9-1.2 5.1-1.2.9 0 1.8.1 2.6.2v-.8c0-.9-.3-1.6-.8-2.1-.5-.5-1.4-.8-2.5-.8-1 0-1.8.2-2.5.6-.7.4-1.2.9-1.5 1.5l-2.8-1.8c.6-1 1.5-1.8 2.7-2.4 1.2-.6 2.6-.9 4.2-.9 2.2 0 3.9.6 5.1 1.7 1.2 1.1 1.7 2.8 1.7 5v8.5h-3.4v-1.3z"
              fill="#232F3E"
            />
            {/* Iconic Orange Smile Arrow */}
            <path
              d="M13.2 32.8c5.8 4.2 14.4 4.4 20.6.2.3-.2.8.2.5.5-6.6 4.9-15.8 4.8-21.7-.1-.2-.3.2-.8.6-.6z"
              fill="#FF9900"
            />
            <path
              d="M34.5 31.8c-.8.1-1.9.8-2.2 1.3-.2.3.1.6.4.5 1.2-.4 2.8-.7 3.6-.9.2 0 .3-.2.2-.4-.2-.5-1.2-.6-2-.5z"
              fill="#FF9900"
            />
          </svg>
        </div>
      );

    case 'flipkart':
      return (
        <div
          className={`${sizeClasses} bg-[#2874F0] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Flipkart"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* Flipkart Shopping Bag in Yellow */}
            <path
              d="M13 15h22l-2.5 24H15.5L13 15z"
              fill="#FFDF00"
            />
            {/* Bag Handle */}
            <path
              d="M20 15v-4a4 4 0 0 1 8 0v4"
              stroke="#FFDF00"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Slanted 'f' with speed lines */}
            <path
              d="M26.5 21.5h-4v2.5h3.5v2.5H22.5v7h-3v-7H18v-2.5h1.5V21c0-2.2 1.6-4 4-4h3v4.5z"
              fill="#2874F0"
            />
            {/* Speed stripe on the bag */}
            <path
              d="M11 19h5M10 23h4"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );

    case 'jiomart':
      return (
        <div
          className={`${sizeClasses} bg-[#00843D] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="JioMart"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* Background disc */}
            <circle cx="24" cy="24" r="22" fill="#00843D" />
            {/* Red Jio circular badge at top right */}
            <circle cx="34" cy="14" r="8" fill="#E21B22" />
            <text
              x="34"
              y="17"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              Jio
            </text>
            {/* Shopping Cart / Mart symbol in white */}
            <path
              d="M12 16h4l3.5 13h13l3-9H19"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Cart wheels */}
            <circle cx="21" cy="33.5" r="2.5" fill="#FFFFFF" />
            <circle cx="31" cy="33.5" r="2.5" fill="#FFFFFF" />
            {/* Leaf / Fresh accent */}
            <path
              d="M27 21c2-3 5-3 5-3s0 3-2 4-3-1-3-1z"
              fill="#74C043"
            />
          </svg>
        </div>
      );

    case 'myntra':
      return (
        <div
          className={`${sizeClasses} bg-white border border-[#F0EBE3] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Myntra"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* Myntra overlapping vibrant 4-color M curves */}
            <g transform="translate(4, 8)">
              {/* Left curve (Deep Pink/Magenta) */}
              <path
                d="M5 26C3 20 5 10 9 6c4-4 8 0 9 4-3 5-6 12-7 16H5z"
                fill="#F13AB1"
              />
              {/* Left diagonal (Vibrant Orange) */}
              <path
                d="M11 26c3-6 7-14 10-18 3-4 6-2 7 2-3 6-7 14-9 16h-8z"
                fill="#FF5722"
              />
              {/* Right diagonal (Yellow/Orange) */}
              <path
                d="M20 26c3-6 7-14 9-17 3-4 7-2 8 2-3 6-7 13-9 15h-8z"
                fill="#FFC107"
              />
              {/* Right curve (Bright Pink/Red) */}
              <path
                d="M28 26c2-4 5-11 7-15 3-4 6-1 7 3-2 6-4 11-6 12h-8z"
                fill="#E91E63"
              />
            </g>
          </svg>
        </div>
      );

    case 'blinkit':
      return (
        <div
          className={`${sizeClasses} bg-[#F8CB46] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Blinkit"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* Blinkit canonical bold 'b' in rich forest green */}
            <circle cx="24" cy="24" r="22" fill="#F8CB46" />
            <path
              d="M17 11h5v8.2c1.2-1.5 2.9-2.4 5-2.4 4.5 0 8 3.5 8 8.6s-3.5 8.6-8 8.6c-2.1 0-3.8-.9-5-2.4V34H17V11zm5 14.4c0 2.8 1.9 4.8 4.5 4.8s4.5-2 4.5-4.8-1.9-4.8-4.5-4.8-4.5 2-4.5 4.8z"
              fill="#0C831F"
            />
          </svg>
        </div>
      );

    case 'zepto':
      return (
        <div
          className={`${sizeClasses} bg-[#36005D] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Zepto"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* Zepto purple background with bold stylized coral/pink 'z' */}
            <circle cx="24" cy="24" r="22" fill="#36005D" />
            <path
              d="M14 16h18l-11 13h11v4H14l11-13H14v-4z"
              fill="#FF3269"
            />
            {/* Quick lightning accent dot */}
            <circle cx="35" cy="17" r="2.5" fill="#FFC700" />
          </svg>
        </div>
      );

    case 'swiggy':
      return (
        <div
          className={`${sizeClasses} bg-[#FC8019] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Swiggy Instamart"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* Swiggy Orange with Iconic White Pin 'S' */}
            <circle cx="24" cy="24" r="22" fill="#FC8019" />
            <path
              d="M24 10c-5.5 0-10 4.5-10 10 0 7.8 9.2 17.5 9.6 17.9.2.2.6.2.8 0 .4-.4 9.6-10.1 9.6-17.9 0-5.5-4.5-10-10-10zm0 18.2c-3.2 0-5.2-1.7-5.2-3.8 0-1.7 1.3-2.9 3.4-3.5 1.5-.4 2.5-.8 2.5-1.5 0-.6-.5-1-1.4-1-.9 0-1.8.4-2.5 1l-1.5-1.7c1.2-1 2.6-1.5 4.1-1.5 2.6 0 4.5 1.5 4.5 3.5 0 1.6-1.1 2.8-3.2 3.4-1.6.5-2.6.8-2.6 1.6 0 .7.6 1.1 1.7 1.1 1.1 0 2.2-.5 3-1.2l1.4 1.7c-1.2 1.3-2.7 1.9-4.2 1.9z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      );

    case 'nykaa':
      return (
        <div
          className={`${sizeClasses} bg-[#FC2779] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Nykaa"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* Nykaa Hot Pink with bold italic white 'N' and star sparkle */}
            <circle cx="24" cy="24" r="22" fill="#FC2779" />
            <path
              d="M16 33l5-18h4.5l5 12V15H35l-5 18h-4.5L20 21v12h-4z"
              fill="#FFFFFF"
            />
            {/* Sparkle */}
            <path
              d="M33 11l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z"
              fill="#FFE600"
            />
          </svg>
        </div>
      );

    case 'bigbasket':
      return (
        <div
          className={`${sizeClasses} bg-white border border-[#E6E1D8] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="BigBasket"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            {/* BigBasket Red and Green brand colors */}
            <rect x="12" y="16" width="24" height="20" rx="3" fill="#D2232A" />
            <path d="M18 16V12a6 6 0 0 1 12 0v4" stroke="#84C225" strokeWidth="3" strokeLinecap="round" />
            <text
              x="24"
              y="30"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
            >
              bb
            </text>
          </svg>
        </div>
      );

    case 'meesho':
      return (
        <div
          className={`${sizeClasses} bg-[#721C59] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Meesho"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            <circle cx="24" cy="24" r="22" fill="#721C59" />
            <path
              d="M15 32V18l6 8 6-8v14h-3V23l-4.5 6h-1L18 23v9h-3z"
              fill="#F43397"
            />
          </svg>
        </div>
      );

    case 'tataneu':
      return (
        <div
          className={`${sizeClasses} bg-[#100B2B] shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden ${className}`}
          title="Tata Neu / 1mg"
        >
          <svg viewBox="0 0 48 48" className="w-full h-full" fill="none">
            <circle cx="24" cy="24" r="22" fill="#100B2B" />
            <circle cx="24" cy="24" r="16" stroke="#9050FA" strokeWidth="3" strokeDasharray="6 3" />
            <text
              x="24"
              y="28"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="10"
              fontWeight="800"
              fontFamily="system-ui, sans-serif"
            >
              Neu
            </text>
          </svg>
        </div>
      );

    case 'website':
      return (
        <div
          className={`${sizeClasses} bg-[#234E33] text-white shadow-2xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden ${className}`}
          title="Direct Website / Shopify D2C"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" stroke="#8FE4A8" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#FFFFFF" />
          </svg>
        </div>
      );

    case 'offline':
      return (
        <div
          className={`${sizeClasses} bg-[#334155] text-white shadow-2xs flex items-center justify-center p-1.5 shrink-0 overflow-hidden ${className}`}
          title="Offline Retail / Direct Store"
        >
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="#475569" stroke="#E2E8F0" />
            <polyline points="9 22 9 12 15 12 15 22" stroke="#FFFFFF" />
          </svg>
        </div>
      );

    default:
      // High-elegance fallback with brand initial
      return (
        <div
          className={`${sizeClasses} bg-[#18261B] text-white font-bold flex items-center justify-center shadow-2xs shrink-0 ${className}`}
          title={platform}
        >
          {platform ? platform.slice(0, 2).toUpperCase() : 'PO'}
        </div>
      );
  }
};
