import type { SVGProps } from 'react';

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logo_gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Hexagon Network */}
      <path 
        d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2Z" 
        stroke="url(#logo_gradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Inner Connections (The "Agent" Core) */}
      <path 
        d="M20 11V17M20 23V29M14.8038 14L20 17M25.1962 14L20 17M14.8038 26L20 23M25.1962 26L20 23" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity="0.8"
      />
      
      {/* Central Node (The "Eye/Lens") */}
      <circle cx="20" cy="20" r="3" fill="currentColor" filter="url(#glow)" />
      
      {/* Orbiting Nodes */}
      <circle cx="20" cy="2" r="1.5" fill="currentColor" className="animate-pulse" />
      <circle cx="35.5" cy="29" r="1.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      <circle cx="4.5" cy="29" r="1.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '1s' }} />
    </svg>
  );
}
