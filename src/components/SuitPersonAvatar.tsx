import { useState } from 'react';

interface SuitPersonAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SuitPersonAvatarProps['size']>, string> = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-28 h-28',
};

export function SuitPersonAvatar({
  src,
  alt,
  size = 'md',
  className = '',
}: SuitPersonAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const trimmedSrc = src?.trim() ?? '';
  const showPhoto = Boolean(trimmedSrc.length > 0 && failedSrc !== trimmedSrc);

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 bg-[#e8f0f1] border border-[#0f4c5c]/15 flex items-center justify-center ${SIZE_CLASSES[size]} ${className}`}
    >
      {showPhoto ? (
        <img
          src={trimmedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(trimmedSrc)}
          className="w-full h-full object-cover"
        />
      ) : (
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          role="img"
          aria-label={alt}
        >
          <rect width="120" height="120" fill="#e8f0f1" />
          {/* Head */}
          <circle cx="60" cy="41" r="19" fill="#0f4c5c" opacity="0.88" />
          {/* Neck */}
          <rect x="53" y="57" width="14" height="12" rx="4" fill="#0f4c5c" opacity="0.72" />
          {/* Shoulders / Suit Jacket */}
          <path
            d="M20 116C22 86 38 72 60 72C82 72 98 86 100 116H20Z"
            fill="#0f4c5c"
          />
          {/* White Dress Shirt V-Collar */}
          <path d="M47 72L60 99L73 72H47Z" fill="#ffffff" />
          {/* Suit Jacket Lapels */}
          <path d="M47 72L39 85L51 94L60 99L47 72Z" fill="#0a3642" />
          <path d="M73 72L81 85L69 94L60 99L73 72Z" fill="#0a3642" />
          {/* Necktie Knot & Blade */}
          <polygon points="56,72 64,72 62,80 58,80" fill="#136f63" />
          <polygon points="58,80 62,80 65,103 60,111 55,103" fill="#136f63" />
        </svg>
      )}
    </div>
  );
}
