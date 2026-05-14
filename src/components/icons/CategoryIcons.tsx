import type { LivingMainCategory } from '@/types';

type Props = { size?: number; strokeWidth?: number };

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Food({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path {...S} strokeWidth={strokeWidth} d="M9 7 Q10 5 9 3" />
      <path {...S} strokeWidth={strokeWidth} d="M12 6 Q13 4 12 3" />
      <path {...S} strokeWidth={strokeWidth} d="M15 7 Q16 5 15 3" />
      <path {...S} strokeWidth={strokeWidth} d="M5 14 Q5 9 12 9 Q19 9 19 14" />
      <line {...S} strokeWidth={strokeWidth} x1="4" y1="14" x2="20" y2="14" />
      <path {...S} strokeWidth={strokeWidth} d="M7 17 Q7 19 9 19 L15 19 Q17 19 17 17" />
    </svg>
  );
}

function Transport({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path {...S} strokeWidth={strokeWidth} d="M2 14 L6 9 L8 8 L16 8 L18 9 L22 14 L22 15 L2 15 Z" />
      <path {...S} strokeWidth={strokeWidth} d="M8.5 8 L9.5 13 L14.5 13 L15.5 8" />
      <circle {...S} strokeWidth={strokeWidth} cx="7" cy="15" r="2.5" />
      <circle {...S} strokeWidth={strokeWidth} cx="17" cy="15" r="2.5" />
    </svg>
  );
}

function Utilities({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path {...S} strokeWidth={strokeWidth} d="M9 16 Q7.5 14 7.5 11 Q7.5 6 12 6 Q16.5 6 16.5 11 Q16.5 14 15 16" />
      <line {...S} strokeWidth={strokeWidth} x1="9" y1="16" x2="15" y2="16" />
      <line {...S} strokeWidth={strokeWidth} x1="9.5" y1="18" x2="14.5" y2="18" />
      <line {...S} strokeWidth={strokeWidth} x1="11" y1="20" x2="13" y2="20" />
      <line {...S} strokeWidth={strokeWidth} x1="12" y1="2.5" x2="12" y2="4" />
      <line {...S} strokeWidth={strokeWidth} x1="5.2" y1="5.2" x2="6.3" y2="6.3" />
      <line {...S} strokeWidth={strokeWidth} x1="18.8" y1="5.2" x2="17.7" y2="6.3" />
    </svg>
  );
}

function Necessities({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path {...S} strokeWidth={strokeWidth} d="M9 9 Q9 5 12 5 Q15 5 15 9" />
      <path {...S} strokeWidth={strokeWidth} d="M5 9 L4.5 20 L19.5 20 L19 9 Z" />
      <line {...S} strokeWidth={strokeWidth} x1="5.5" y1="13" x2="18.5" y2="13" />
    </svg>
  );
}

function Culture({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect {...S} strokeWidth={strokeWidth} x="2" y="7" width="14" height="10" rx="1.5" />
      <path {...S} strokeWidth={strokeWidth} d="M16 9 L22 7 L22 17 L16 15" />
    </svg>
  );
}

function Education({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path {...S} strokeWidth={strokeWidth} d="M12 6 Q8 4 4 6 L4 19 Q8 17 12 19 Q16 17 20 19 L20 6 Q16 4 12 6 Z" />
      <line {...S} strokeWidth={strokeWidth} x1="12" y1="6" x2="12" y2="19" />
    </svg>
  );
}

function Fashion({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path {...S} strokeWidth={strokeWidth} d="M12 4 Q15 4 15 6.5 Q15 8 12 8" />
      <path {...S} strokeWidth={strokeWidth} d="M12 8 Q8.5 8 4 16 L20 16 Q15.5 8 12 8" />
    </svg>
  );
}

function Health({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <line {...S} strokeWidth={strokeWidth} x1="6" y1="3" x2="6" y2="7" />
      <line {...S} strokeWidth={strokeWidth} x1="18" y1="3" x2="18" y2="7" />
      <path {...S} strokeWidth={strokeWidth} d="M6 7 Q6 15 12 15" />
      <path {...S} strokeWidth={strokeWidth} d="M18 7 Q18 15 12 15" />
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="18.5" r="3" />
    </svg>
  );
}

function Beauty({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="9" r="6" />
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="9" r="3.5" />
      <line {...S} strokeWidth={strokeWidth} x1="12" y1="15" x2="12" y2="21" />
      <line {...S} strokeWidth={strokeWidth} x1="9.5" y1="20" x2="14.5" y2="20" />
    </svg>
  );
}

function Travel({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect {...S} strokeWidth={strokeWidth} x="3" y="8" width="18" height="13" rx="2" />
      <path {...S} strokeWidth={strokeWidth} d="M9 8 L9 5 Q9 4 10.5 4 L13.5 4 Q15 4 15 5 L15 8" />
      <line {...S} strokeWidth={strokeWidth} x1="3" y1="14" x2="21" y2="14" />
    </svg>
  );
}

function Other({ size = 22 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="5" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

const ICONS: Record<LivingMainCategory, (props: Props) => JSX.Element> = {
  Food, Transport, Utilities, Necessities, Culture,
  Education, Fashion, Health, Beauty, Travel, Other,
};

export function CategoryIcon({ category, size = 20, strokeWidth = 1.3 }: {
  category: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = ICONS[category as LivingMainCategory] ?? Other;
  return <Icon size={size} strokeWidth={strokeWidth} />;
}
