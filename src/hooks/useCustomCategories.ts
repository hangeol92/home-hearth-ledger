import { useState, useCallback } from 'react';

export interface CustomMainCat {
  id: string;
  name: string;
  emoji: string;
}

const MAIN_KEY = 'hhl_custom_main_cats';
const SUB_KEY  = 'hhl_custom_sub_cats';

function loadMain(): CustomMainCat[] {
  try { return JSON.parse(localStorage.getItem(MAIN_KEY) ?? '[]'); } catch { return []; }
}

function loadSubs(): Record<string, string[]> {
  try { return JSON.parse(localStorage.getItem(SUB_KEY) ?? '{}'); } catch { return {}; }
}

export function useCustomCategories() {
  const [customMain, setCustomMain] = useState<CustomMainCat[]>(loadMain);
  const [customSubs, setCustomSubs] = useState<Record<string, string[]>>(loadSubs);

  const addMainCategory = useCallback((name: string, emoji: string): string => {
    const id = `custom_${Date.now()}`;
    const next = [...loadMain(), { id, name, emoji }];
    localStorage.setItem(MAIN_KEY, JSON.stringify(next));
    setCustomMain(next);
    return id;
  }, []);

  const addSubCategory = useCallback((mainId: string, name: string) => {
    const prev = loadSubs();
    const next = { ...prev, [mainId]: [...(prev[mainId] ?? []), name] };
    localStorage.setItem(SUB_KEY, JSON.stringify(next));
    setCustomSubs(next);
  }, []);

  const removeMainCategory = useCallback((id: string) => {
    const next = loadMain().filter(c => c.id !== id);
    localStorage.setItem(MAIN_KEY, JSON.stringify(next));
    setCustomMain(next);
  }, []);

  return { customMain, customSubs, addMainCategory, addSubCategory, removeMainCategory };
}
