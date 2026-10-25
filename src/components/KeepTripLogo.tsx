import React from 'react';

interface KeepTripLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  inverted?: boolean;
}

export const KeepTripLogo: React.FC<KeepTripLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  inverted = false
}) => {
  const iconSizes = {
    sm: 'w-5 h-6',
    md: 'w-6 h-7',
    lg: 'w-8 h-9'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const strokeColor = inverted ? '#ffffff' : '#1E2856';
  const pinColor = '#EFA03D'; // Dawn color token

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Arch Door Icon with Pin inside */}
      <svg
        viewBox="0 0 28 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} shrink-0`}
      >
        {/* Arch Door Outline */}
        <path
          d="M4 30V14C4 8.47715 8.47715 4 14 4C19.5228 4 24 8.47715 24 14V30"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Map Pin inside in Dawn color */}
        <circle cx="14" cy="14" r="3.5" fill={pinColor} />
        <path
          d="M14 17.5L14 20"
          stroke={pinColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`font-extrabold tracking-tight ${textSizes[size]} ${
            inverted ? 'text-white' : 'text-[#1E2856]'
          }`}
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          KeepTrip
        </span>
      )}
    </div>
  );
};
