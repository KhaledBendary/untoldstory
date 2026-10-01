/** Illustrated avatar for Nouran, the site's chat assistant — a simple vector
 * portrait so the widget has a face without depending on an external image. */
export default function NouranAvatar({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label="Nouran">
      <defs>
        <linearGradient id="nouran-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#b8824f" />
        </linearGradient>
        <linearGradient id="nouran-hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1a12" />
          <stop offset="100%" stopColor="#1a0f0a" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#nouran-bg)" />
      {/* hair back */}
      <path d="M14 30c0-11 8-20 18-20s18 9 18 20c0 3-1 7-2 10-1-6-2-10-4-10-1 4-2 7-4 7 0-4-1-7-2-7-1 4-2 6-4 6s-3-2-4-6c-1 0-2 3-2 7-2 0-3-3-4-7-2 0-3 4-4 10-1-3-2-7-2-10Z" fill="url(#nouran-hair)" />
      {/* face */}
      <path d="M22 28c0-7 4.5-12 10-12s10 5 10 12c0 8-4.5 15-10 15s-10-7-10-15Z" fill="#f0c9a0" />
      {/* hair front/fringe */}
      <path d="M21 27c1-7 5-11 11-11s10 4 11 11c-2-2-4-3-6-2-1-2-3-3-5-3s-4 1-5 3c-2-1-4 0-6 2Z" fill="url(#nouran-hair)" />
      {/* eyes */}
      <ellipse cx="27.5" cy="29" rx="1.6" ry="2" fill="#2a1a12" />
      <ellipse cx="36.5" cy="29" rx="1.6" ry="2" fill="#2a1a12" />
      {/* brows */}
      <path d="M25 25.5c1-.8 3-.8 4 0" stroke="#2a1a12" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M35 25.5c1-.8 3-.8 4 0" stroke="#2a1a12" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* smile */}
      <path d="M27 35c2 2 8 2 10 0" stroke="#8a4a3a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* blush */}
      <ellipse cx="24.5" cy="32.5" rx="1.8" ry="1.1" fill="#e8a888" opacity="0.6" />
      <ellipse cx="39.5" cy="32.5" rx="1.8" ry="1.1" fill="#e8a888" opacity="0.6" />
      {/* shoulders / top */}
      <path d="M14 58c2-9 9-15 18-15s16 6 18 15" fill="#5b3a8e" />
      {/* earrings */}
      <circle cx="21.5" cy="33" r="1" fill="#e8c88a" />
      <circle cx="42.5" cy="33" r="1" fill="#e8c88a" />
    </svg>
  );
}
