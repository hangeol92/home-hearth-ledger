import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Transaction } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTxColorClass(type: Transaction['type']) {
  return type === 'income' ? 'text-green-600' : 'text-red-500';
}

export function filterByMember<T extends { memberId: string }>(items: T[], memberId: string): T[] {
  return memberId === 'all' ? items : items.filter(t => t.memberId === memberId);
}
