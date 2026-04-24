// src/components/JarIcon.tsx
// Drop-in replacement — thin single-line SVG icons per jar.
// Same public API: JarIcon, getJarColor, getJarDef

import { JARS, type JarId } from '@/types';

export function getJarColor(id: JarId): string {
  return JARS.find(j => j.id === id)?.color || '#6B7280';
}

export function getJarDef(id: JarId) {
  return JARS.find(j => j.id === id) ?? JARS[0];
}

// ─── Thin line-art SVG paths (single-stroke style) ──────────────────────────
const S = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function GivingIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        {...S} stroke={color} strokeWidth={1.4}
        d="M12 21C12 21 3.5 14.5 3.5 8.8C3.5 6.1 5.6 4 8.3 4C9.9 4 11.3 4.8 12 6C12.7 4.8 14.1 4 15.7 4C18.4 4 20.5 6.1 20.5 8.8C20.5 14.5 12 21 12 21Z"
      />
      <path
        {...S} stroke={color} strokeWidth={1.1}
        d="M9 10c0-1.1.9-2 2-2"
      />
    </svg>
  );
}

function InvestingIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <polyline {...S} stroke={color} strokeWidth={1.4} points="3,18 9,11 13,15 21,6" />
      <polyline {...S} stroke={color} strokeWidth={1.4} points="16,6 21,6 21,11" />
    </svg>
  );
}

function SavingsIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {/* ear */}
      <path {...S} stroke={color} strokeWidth={1.4}
        d="M19 10c.9-.5 1.5-1.4 1.5-2.5C20.5 5.6 19.4 4.5 18 4.5c-.9 0-1.7.5-2.2 1.2" />
      {/* body */}
      <path {...S} stroke={color} strokeWidth={1.4}
        d="M4.5 13A7.5 6 0 1 0 12 7a7.5 6 0 0 0-7.5 6z" />
      {/* legs */}
      <path {...S} stroke={color} strokeWidth={1.3} d="M8 18.5v2M12 19.5v2M16 18.5v2" />
      {/* coin slot */}
      <path {...S} stroke={color} strokeWidth={1.3} d="M11 9.5h2" />
      {/* eye */}
      <circle cx="15.5" cy="12" r="0.8" fill={color} />
      {/* snout */}
      <ellipse {...S} stroke={color} strokeWidth={1.3} cx="7.5" cy="13.5" rx="2" ry="1.5" />
      <circle cx="7" cy="13.5" r="0.4" fill={color} />
      <circle cx="8" cy="13.5" r="0.4" fill={color} />
    </svg>
  );
}

function LivingIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path {...S} stroke={color} strokeWidth={1.4}
        d="M3 10l9-7 9 7v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path {...S} stroke={color} strokeWidth={1.4} d="M9 21v-9h6v9" />
    </svg>
  );
}

function SeedIcon({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path {...S} stroke={color} strokeWidth={1.4} d="M12 22v-9" />
      <path {...S} stroke={color} strokeWidth={1.4}
        d="M12 13C12 9 15.5 6 19 7.5C15.5 8 13.5 10.5 12 13" />
      <path {...S} stroke={color} strokeWidth={1.4}
        d="M12 17C12 13 8.5 10 5 11.5C8.5 12 10.5 14.5 12 17" />
    </svg>
  );
}

const JAR_SVG_MAP: Record<JarId, React.FC<{ color: string; size: number }>> = {
  giving:    GivingIcon,
  investing: InvestingIcon,
  savings:   SavingsIcon,
  living:    LivingIcon,
  seed:      SeedIcon,
};

// ─── Public component ────────────────────────────────────────────────────────
export function JarIcon({ jar, size = 20 }: { jar: JarId; size?: number }) {
  const def = getJarDef(jar);
  const color = def.color;
  const Icon = JAR_SVG_MAP[jar] ?? LivingIcon;

  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0"
      style={{
        backgroundColor: `${color}14`,
        width: size + 16,
        height: size + 16,
      }}
    >
      <Icon color={color} size={size} />
    </div>
  );
}

// Slim variant — no background pill, just the icon. Useful in list rows.
export function JarIconBare({ jar, size = 20 }: { jar: JarId; size?: number }) {
  const def = getJarDef(jar);
  const Icon = JAR_SVG_MAP[jar] ?? LivingIcon;
  return <Icon color={def.color} size={size} />;
}
