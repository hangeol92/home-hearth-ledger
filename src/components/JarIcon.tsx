import { HandHeart, TrendingUp, PiggyBank, Home, Sprout } from 'lucide-react';
import { JARS, type JarId } from '@/types';

const iconMap = {
  HandHeart, TrendingUp, PiggyBank, Home, Sprout,
} as const;

export function getJarColor(id: JarId): string {
  return JARS.find(j => j.id === id)?.color || '#6B7280';
}

export function getJarDef(id: JarId) {
  return JARS.find(j => j.id === id)!;
}

export function JarIcon({ jar, size = 20 }: { jar: JarId; size?: number }) {
  const def = getJarDef(jar);
  const Icon = iconMap[def.icon as keyof typeof iconMap] || Home;
  const color = def.color;

  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0"
      style={{
        backgroundColor: `${color}20`,
        width: size + 16,
        height: size + 16,
      }}
    >
      <Icon size={size} style={{ color }} />
    </div>
  );
}
