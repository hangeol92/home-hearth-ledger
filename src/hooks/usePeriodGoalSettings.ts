import { useState, useEffect } from 'react';

export interface PeriodGoalSettings {
  enabled: boolean;
  earlyPct: number;
  midPct: number;
  latePct: number;
}

const KEY = 'hhl_period_goal';
const DEFAULTS: PeriodGoalSettings = { enabled: false, earlyPct: 33, midPct: 33, latePct: 34 };

function load(): PeriodGoalSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function usePeriodGoalSettings() {
  const [settings, setSettings] = useState<PeriodGoalSettings>(load);

  // Refresh when navigating back to this page
  useEffect(() => {
    const handler = () => setSettings(load());
    window.addEventListener('focus', handler);
    document.addEventListener('visibilitychange', handler);
    return () => {
      window.removeEventListener('focus', handler);
      document.removeEventListener('visibilitychange', handler);
    };
  }, []);

  const save = (next: PeriodGoalSettings) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setSettings(next);
  };

  return { settings, save };
}
