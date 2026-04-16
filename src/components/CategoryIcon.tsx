import { 
  Utensils, Home as HomeIcon, Zap, Bus, ShoppingBag, Heart, 
  GraduationCap, Gamepad2, MoreHorizontal, Briefcase, Gift, TrendingUp, DollarSign
} from 'lucide-react';
import type { Category } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Food: Utensils,
  Rent: HomeIcon,
  Utilities: Zap,
  Transport: Bus,
  Shopping: ShoppingBag,
  Health: Heart,
  Education: GraduationCap,
  Entertainment: Gamepad2,
  Salary: Briefcase,
  Bonus: DollarSign,
  Investment: TrendingUp,
  Gift: Gift,
  Other: MoreHorizontal,
};

const colorMap: Record<string, string> = {
  Food: '#EF4444',
  Rent: '#8B5CF6',
  Utilities: '#F59E0B',
  Transport: '#3B82F6',
  Shopping: '#EC4899',
  Health: '#10B981',
  Education: '#06B6D4',
  Entertainment: '#F97316',
  Salary: '#10B981',
  Bonus: '#3B82F6',
  Investment: '#8B5CF6',
  Gift: '#EC4899',
  Other: '#6B7280',
};

export function CategoryIcon({ category, size = 20 }: { category: Category; size?: number }) {
  const Icon = iconMap[category] || MoreHorizontal;
  const color = colorMap[category] || '#6B7280';

  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{ 
        backgroundColor: `${color}15`, 
        width: size + 16, 
        height: size + 16 
      }}
    >
      <Icon size={size} style={{ color }} />
    </div>
  );
}

export function getCategoryColor(category: string): string {
  return colorMap[category] || '#6B7280';
}
