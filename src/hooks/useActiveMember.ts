import { useState, useCallback } from 'react';
import type { FamilyMember } from '@/types';

const SESSION_KEY = 'activeMember';

function readFromSession(): FamilyMember | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as FamilyMember) : null;
  } catch {
    return null;
  }
}

export function useActiveMember() {
  const [activeMember, setActiveMemberState] = useState<FamilyMember | null>(readFromSession);

  const setActiveMember = useCallback((m: FamilyMember) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(m));
    setActiveMemberState(m);
  }, []);

  const clearActiveMember = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setActiveMemberState(null);
  }, []);

  return { activeMember, setActiveMember, clearActiveMember };
}
