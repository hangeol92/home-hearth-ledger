export type TransactionType = 'income' | 'expense';

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
  category: Category;
  note: string;
  date: string; // ISO date string
  memberId: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  amount: number;
  month: string; // YYYY-MM
}

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
}

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
