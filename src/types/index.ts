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
  living:    ['Food', 'Rent', 'Transport', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'],
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
  Water:          '💧',
  Electricity:    '⚡',
  Gas:            '🔥',
  Internet:       '🌐',
  Telecom:        '📱',
  Transport:      '🚗',
  Shopping:       '🛒',
  Health:         '💊',
  Education:      '📚',
  Entertainment:  '🎮',
  // seed
  Opportunity:    '💎',
  'Helping Others': '🤝',
  Business:       '💼',
  'Special Expense': '💎',
  // transport
  'Bus/Subway':   '🚇',
  Taxi:           '🚕',
  Fuel:           '⛽',
  Parking:        '🅿️',
  // necessities
  Household:      '🏠',
  Hygiene:        '🧼',
  Kitchen:        '🍳',
  // culture
  Movies:         '🎬',
  Concert:        '🎵',
  Hobby:          '🎯',
  Games:          '🎮',
  // education
  Tuition:        '🏫',
  Books:          '📖',
  'Online Course':'💻',
  Stationery:     '✏️',
  // fashion
  Clothing:       '👕',
  Shoes:          '👟',
  Accessories:    '💍',
  // health
  Hospital:       '🏥',
  Pharmacy:       '💊',
  Fitness:        '🏋️',
  // beauty
  Haircut:        '✂️',
  Skincare:       '🧴',
  Cosmetics:      '💄',
  // travel
  Accommodation:  '🏨',
  Flight:         '✈️',
  Activities:     '🎯',
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

export const INCOME_MAIN_CATEGORIES = ['Salary', 'Bonus', 'Asset Adjustment', 'Other'] as const;
export type IncomeMainCategory = typeof INCOME_MAIN_CATEGORIES[number];

export const INCOME_CATEGORY_ICONS: Record<IncomeMainCategory, string> = {
  'Salary':           '💰',
  'Bonus':            '🎁',
  'Asset Adjustment': '📊',
  'Other':            '•••',
};

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
  allocationSnapshot?: Partial<Record<JarId, number>>;
  // ── Phase 2 additions (all optional for backwards compat) ──
  mainCategory?: string;      // 대분류 (Food / Transport / Necessities / Other)
  payer?: string;             // "공동" or member id; undefined treated as "공동"
  isPersonalMoney?: boolean;  // 개인돈 사용 여부
}

export interface JarBalance {
  id: JarId;
  balance: number;
  allocationPct: number;
  allocationMode?: 'percentage' | 'fixedAmount'; // default: 'percentage'
  allocationFixed?: number;                       // fixed ¥ amount when mode = fixedAmount
}

export interface Budget {
  id: string;
  jar: JarId;
  amount: number;
  month: string; // YYYY-MM
}

// ── 2-depth 생활비 카테고리 ────────────────────────────────────────────────────
export type LivingMainCategory =
  | 'Food' | 'Transport' | 'Utilities' | 'Necessities'
  | 'Culture' | 'Education' | 'Fashion' | 'Health' | 'Beauty' | 'Travel'
  | 'Other';

export const LIVING_MAIN_CATEGORY_ICONS: Record<LivingMainCategory, string> = {
  Food:        '🍽️',
  Transport:   '🚗',
  Utilities:   '💡',
  Necessities: '🛒',
  Culture:     '🎬',
  Education:   '📚',
  Fashion:     '👗',
  Health:      '💊',
  Beauty:      '💄',
  Travel:      '✈️',
  Other:       '•••',
};

export const LIVING_SUBCATEGORIES: Record<LivingMainCategory, string[]> = {
  Food:        ['Eating Out', 'Groceries', 'Snacks'],
  Transport:   ['Bus/Subway', 'Taxi', 'Fuel', 'Parking'],
  Utilities:   ['Water', 'Electricity', 'Gas', 'Internet', 'Telecom'],
  Necessities: ['Household', 'Hygiene', 'Kitchen'],
  Culture:     ['Movies', 'Concert', 'Hobby', 'Games'],
  Education:   ['Tuition', 'Books', 'Online Course', 'Stationery'],
  Fashion:     ['Clothing', 'Shoes', 'Accessories'],
  Health:      ['Hospital', 'Pharmacy', 'Fitness'],
  Beauty:      ['Haircut', 'Skincare', 'Cosmetics'],
  Travel:      ['Accommodation', 'Flight', 'Activities'],
  Other:       ['Special Expense'],
};

// ── 3구간 예산 ────────────────────────────────────────────────────────────────
export type BudgetPeriod = 'early' | 'mid' | 'late';

export const BUDGET_PERIOD_DAYS: Record<BudgetPeriod, { start: number; end: number }> = {
  early: { start: 1,  end: 10 },
  mid:   { start: 11, end: 20 },
  late:  { start: 21, end: 31 }, // 말일까지
};

export function getCurrentBudgetPeriod(): BudgetPeriod {
  const day = new Date().getDate();
  if (day <= 10) return 'early';
  if (day <= 20) return 'mid';
  return 'late';
}

export interface PeriodBudget {
  id: string;          // `${yearMonth}-${period}-${category}`
  yearMonth: string;   // "2025-01"
  period: BudgetPeriod;
  category: string;    // LivingMainCategory or jar id
  targetAmount: number;
}

// ── 공과금 ────────────────────────────────────────────────────────────────────
export interface UtilityBill {
  yearMonth: string;    // key: "2025-01"
  water?: number;       // 격월 (홀수달 or 짝수달)
  electricity?: number;
  gas?: number;
  internet?: number;
  telecom?: number;
}

// ── 특별지출 ──────────────────────────────────────────────────────────────────
export type SpecialExpenseFunding = 'bonus' | 'reserve' | 'monthly';

export interface SpecialExpensePayment {
  id: string;
  date: string;
  amount: number;
  memo?: string;
}

export interface SpecialExpense {
  id: string;
  name: string;
  totalAmount: number;
  fundingSource: SpecialExpenseFunding;
  payments: SpecialExpensePayment[];
  createdAt: string;
  memo?: string;
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

export const CATEGORY_EMOJI_OPTIONS = [
  '🍽️','🥘','🍜','🥗','🍕','🍔','☕','🧃',
  '🚗','🚇','✈️','🚲','🛵','🚌','⛽','🅿️',
  '💡','💧','⚡','🔥','🌐','📱','🏠','🔑',
  '🛒','🧴','🧼','🍳','🧹','🪣','🧺','🛋️',
  '🎬','🎵','🎮','🎯','🎨','📷','🎸','🎭',
  '📚','✏️','📖','💻','🏫','📐','🎓','📝',
  '👗','👕','👟','👜','💍','🧣','🧥','👒',
  '💊','🏥','💪','🧘','🏋️','🩺','🌡️','🚑',
  '💄','✂️','🧴','💅','🪞','🧖','🪥','🧖',
  '🏨','🗺️','🗼','🏖️','⛷️','🤿','🧳','🎡',
  '💰','💳','🏦','📊','📈','💎','🎁','🏷️',
  '📁','⭐','❤️','🔔','🌟','✨','🎀','🏅',
];

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
