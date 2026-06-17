import * as localDb from '@/lib/db';
import * as apiTransactions from '@/api/transactions';
import * as apiBudgets from '@/api/budgets';
import * as apiMembers from '@/api/members';
import * as apiJars from '@/api/jars';
import { useAuth } from '@/hooks/useAuth';
import type { Transaction, Budget, FamilyMember, JarBalance, JarId } from '@/types';

export function useStorage() {
  const { session } = useAuth();
  const cloud = Boolean(session);

  return {
    // Transactions
    getAllTransactions: () =>
      cloud ? apiTransactions.getAllTransactions() : localDb.getAllTransactions(),

    getTransactionById: (id: string) =>
      cloud ? apiTransactions.getTransactionById(id) : localDb.getTransactionById(id),

    addTransaction: (tx: Transaction) =>
      cloud ? apiTransactions.addTransaction(tx) : localDb.addTransaction(tx),

    updateTransaction: (tx: Transaction) =>
      cloud ? apiTransactions.updateTransaction(tx) : localDb.updateTransaction(tx),

    deleteTransaction: (id: string) =>
      cloud ? apiTransactions.deleteTransaction(id) : localDb.deleteTransaction(id),

    // Members
    getAllMembers: () =>
      cloud ? apiMembers.getAllMembers() : localDb.getAllMembers(),

    saveMember: (m: FamilyMember) =>
      cloud ? apiMembers.saveMember(m) : localDb.saveMember(m),

    deleteMember: (id: string) =>
      cloud ? apiMembers.deleteMember(id) : localDb.deleteMember(id),

    // Budgets
    getAllBudgets: () =>
      cloud ? apiBudgets.getAllBudgets() : localDb.getAllBudgets(),

    saveBudget: (b: Budget) =>
      cloud ? apiBudgets.saveBudget(b) : localDb.saveBudget(b),

    deleteBudget: (id: string) =>
      cloud ? apiBudgets.deleteBudget(id) : localDb.deleteBudget(id),

    // Jars
    getAllJars: () =>
      cloud ? apiJars.getAllJars() : localDb.getAllJars(),

    saveJar: (jar: JarBalance) =>
      cloud ? apiJars.saveJar(jar) : localDb.saveJar(jar),

    adjustJarBalance: (id: JarId, delta: number) =>
      cloud ? apiJars.adjustJarBalance(id, delta) : localDb.adjustJarBalance(id, delta),

    reconcileJarBalances: () =>
      cloud ? Promise.resolve() : localDb.reconcileJarBalances(),
  };
}
