export type TransactionType = 'income' | 'expense';

export type JarId = 'giving' | 'investing' | 'savings' | 'living' | 'seed';

export interface JarDef {
  id: JarId;
  defaultPct: number;
  color: string;
  icon: string; // lucide icon name
}

export const JARS: JarDef[] = [
  { id: 'giving',    defaultPct: 10, color: '#EC4899', icon: 'HandHeart' },
  { id: 'investing', defaultPct: 10, color: '#8B5CF6', icon: 'TrendingUp' },
  { id: 'savings',   defaultPct: 10, color: '#3B82F6', icon: 'PiggyBank' },
  { id: 'living',    defaultPct: 60, color: '#10B981', icon: 'Home' },
  { id: 'seed',      defaultPct: 10, color: '#F59E0B', icon: 'Sprout' },
];

export const JAR_SUBCATEGORIES: Record<JarId, string[]> = {
  giving:    ['Donation', 'Charity', 'Tithe', 'Other'],
  investing: ['Stocks', 'ETF', 'NISA', 'Crypto', 'Retirement', 'Other'],
  savings:   ['Emergency', 'Big Purchase', 'Travel', 'Other'],
  living:    ['Food', 'Rent', 'Utilities', 'Transport', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'],
  seed:      ['Opportunity', 'Helping Others', 'Business', 'Other'],
};

export const SUBCATEGORY_ICONS: Record<string, string> = {
  // giving
  Donation:       '🤲',
  Charity:        '❤️',
  Tithe:          '⛪',
  // investing
  Stocks:         '📈',
  ETF:            '📊',
  NISA:           '🏦',
  Crypto:         '🪙',
  Retirement:     '🌅',
  // savings
  Emergency:      '🚨',
  'Big Purchase': '🛍️',
  Travel:         '✈️',
  // living
  Food:           '🍽️',
  Rent:           '🏠',
  Utilities:      '💡',
  Transport:      '🚗',
  Shopping:       '🛒',
  Health:         '💊',
  Education:      '📚',
  Entertainment:  '🎮',
  // seed
  Opportunity:    '💎',
  'Helping Others': '🤝',
  Business:       '💼',
  // fallback
  Other:          '•••',
};

// Legacy categories (kept for migration / type compatibility)
export const EXPENSE_CATEGORIES = [
  'Food', 'Rent', 'Utilities', 'Transport', 'Shopping',
  'Health', 'Education', 'Entertainment', 'Other'
] as const;

export const INCOME_CATEGORIES = [
  'Salary', 'Bonus', 'Investment', 'Gift', 'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type Category = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  jar: JarId;
  subCategory: string;
  /** @deprecated kept for backwards compat with old data */
  category?: Category;
  note: string;
  date: string;
  memberId: string;
  createdAt: string;
  /** Allocation percentages snapshotted at income-creation time, so future
   *  edits/removals reverse the exact same split even if the user has since
   *  changed their jar allocations. Only set on income transactions. */
  allocationSnapshot?: Partial<Record<JarId, number>>;
}

export interface JarBalance {
  id: JarId;
  balance: number;
  allocationPct: number;
}

export interface Budget {
  id: string;
  jar: JarId;
  amount: number;
  month: string; // YYYY-MM
}

export type MemberRole =
  | 'dad' | 'mom' | 'son' | 'daughter'
  | 'grandfather' | 'grandmother'
  | 'boyfriend' | 'girlfriend';

export interface MemberRoleDef {
  id: MemberRole;
  emoji: string;
  color: string;
  labelKey: string;
}

export const MEMBER_ROLES: MemberRoleDef[] = [
  { id: 'dad',         emoji: '👨',  color: '#3B82F6', labelKey: 'members.roles.dad' },
  { id: 'mom',         emoji: '👩',  color: '#EC4899', labelKey: 'members.roles.mom' },
  { id: 'son',         emoji: '👦',  color: '#06B6D4', labelKey: 'members.roles.son' },
  { id: 'daughter',    emoji: '👧',  color: '#F43F5E', labelKey: 'members.roles.daughter' },
  { id: 'grandfather', emoji: '👴',  color: '#6B7280', labelKey: 'members.roles.grandfather' },
  { id: 'grandmother', emoji: '👵',  color: '#8B5CF6', labelKey: 'members.roles.grandmother' },
  { id: 'boyfriend',   emoji: '🧑',  color: '#14B8A6', labelKey: 'members.roles.boyfriend' },
  { id: 'girlfriend',  emoji: '👱',  color: '#F97316', labelKey: 'members.roles.girlfriend' },
];

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  role?: MemberRole;
  emoji?: string;
  hidden?: boolean;
}

export const MEMBER_EMOJI_OPTIONS = [
  '👨','👩','👦','👧','👴','👵','🧑','👱','🧒','👶',
  '🧔','👸','🤴','🧑‍🦱','🧑‍🦳','🧑‍🦲','🧑‍🦰','😊','🐱','🐶',
];

export const MEMBER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'
];

export const CURRENCIES = [
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
];

// Map old expense category → jar (for migration)
export const LEGACY_CATEGORY_TO_JAR: Record<string, JarId> = {
  Food: 'living', Rent: 'living', Utilities: 'living', Transport: 'living',
  Shopping: 'living', Health: 'living', Education: 'living',
  Entertainment: 'living', Other: 'living',
  Salary: 'living', Bonus: 'living', Investment: 'investing', Gift: 'giving',
};
