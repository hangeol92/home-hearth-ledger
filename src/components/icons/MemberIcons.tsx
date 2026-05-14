import type { MemberRole } from '@/types';

type Props = { size?: number; strokeWidth?: number };

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Dad({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="7.5" r="3.5" />
      <path {...S} strokeWidth={strokeWidth} d="M6 21 Q6 16.5 8.5 13.5 Q10 12 12 12 Q14 12 15.5 13.5 Q18 16.5 18 21" />
    </svg>
  );
}

function Mom({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="8" r="3.5" />
      <path {...S} strokeWidth={strokeWidth} d="M8.5 6 Q8.5 2.5 12 3 Q15.5 2.5 15.5 6" />
      <path {...S} strokeWidth={strokeWidth} d="M6 21 Q6 17 8 14 Q10 12.5 12 12.5 Q14 12.5 16 14 Q18 17 18 21" />
    </svg>
  );
}

function Son({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="9" r="4.5" />
      <path {...S} strokeWidth={strokeWidth} d="M7 21 Q7 18 9 15.5 Q10.5 14 12 14 Q13.5 14 15 15.5 Q17 18 17 21" />
    </svg>
  );
}

function Daughter({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="9" r="4.5" />
      <path {...S} strokeWidth={strokeWidth} d="M9.5 5.5 Q9 3.5 11 4" />
      <path {...S} strokeWidth={strokeWidth} d="M14.5 5.5 Q15 3.5 13 4" />
      <path {...S} strokeWidth={strokeWidth} d="M7 21 Q7 18 9 15.5 Q10.5 14 12 14 Q13.5 14 15 15.5 Q17 18 17 21" />
    </svg>
  );
}

function Grandfather({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="10" cy="7" r="3" />
      <path {...S} strokeWidth={strokeWidth} d="M4.5 21 Q5 17 7.5 14 Q9 12.5 10 11.5 Q12 10.5 14 12" />
      <line {...S} strokeWidth={strokeWidth} x1="14" y1="12" x2="17" y2="21" />
      <path {...S} strokeWidth={strokeWidth} d="M12.5 10.5 Q14 9.5 14 12" />
    </svg>
  );
}

function Grandmother({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="8.5" r="3" />
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="4.5" r="2" />
      <path {...S} strokeWidth={strokeWidth} d="M6 21 Q6.5 17 8.5 14.5 Q10 13 12 13 Q14 13 15.5 14.5 Q17.5 17 18 21" />
    </svg>
  );
}

function Boyfriend({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="7.5" r="3.5" />
      <path {...S} strokeWidth={strokeWidth} d="M6 21 Q6 16.5 8.5 13.5 Q10 12 12 12 Q14 12 15.5 13.5 Q18 16.5 18 21" />
      <line {...S} strokeWidth={strokeWidth} x1="8.5" y1="13.5" x2="5" y2="17" />
      <line {...S} strokeWidth={strokeWidth} x1="15.5" y1="13.5" x2="19" y2="17" />
    </svg>
  );
}

function Girlfriend({ size = 22, strokeWidth = 1.3 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle {...S} strokeWidth={strokeWidth} cx="12" cy="8" r="3.5" />
      <path {...S} strokeWidth={strokeWidth} d="M8.5 6 Q7 5 7.5 8 Q8 11 9.5 13" />
      <path {...S} strokeWidth={strokeWidth} d="M15.5 6 Q17 5 16.5 8 Q16 11 14.5 13" />
      <path {...S} strokeWidth={strokeWidth} d="M9.5 13 Q10.5 12.5 12 12.5 Q13.5 12.5 14.5 13 Q16.5 16.5 17 21 L7 21 Q7.5 16.5 9.5 13" />
    </svg>
  );
}

const MEMBER_ICONS: Record<MemberRole, (props: Props) => JSX.Element> = {
  dad: Dad,
  mom: Mom,
  son: Son,
  daughter: Daughter,
  grandfather: Grandfather,
  grandmother: Grandmother,
  boyfriend: Boyfriend,
  girlfriend: Girlfriend,
};

export function MemberIcon({ role, size = 20, strokeWidth = 1.3 }: {
  role: MemberRole;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = MEMBER_ICONS[role] ?? Dad;
  return <Icon size={size} strokeWidth={strokeWidth} />;
}
