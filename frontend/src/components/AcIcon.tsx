export function AcIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="5" width="20" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15"/>
      <line x1="2.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.6"/>
      <line x1="12"   y1="6.5"  x2="12"   y2="10.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="10"   y1="8.5"  x2="14"   y2="8.5"  stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="10.6" y1="6.9"  x2="13.4" y2="10.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="13.4" y1="6.9"  x2="10.6" y2="10.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M3.5 17.5 Q7.5 21 12 17.5 Q16.5 14 20.5 17.5" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    </svg>
  )
}
