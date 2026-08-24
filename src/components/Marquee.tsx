import type { CSSProperties, ReactNode } from 'react';

export default function Marquee({ children, duration = 40, reverse = false, className = '' }: {
  children: ReactNode; duration?: number; reverse?: boolean; className?: string;
}) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div
        className={`inline-flex items-center ${reverse ? 'animate-marquee-rev' : 'animate-marquee'}`}
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
      >
        <div className="inline-flex items-center shrink-0">{children}</div>
        <div className="inline-flex items-center shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
