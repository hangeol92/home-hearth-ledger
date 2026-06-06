import { useState, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions, useMembers, useCurrency } from '@/hooks/useStore';
import { JARS } from '@/types';
import type { JarId } from '@/types';
import { JarIcon } from '@/components/JarIcon';
import { Trash2, Pencil, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTxColorClass, filterByMember, toYearMonth, shiftMonth } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Swipe row ──────────────────────────────────────────────────────────────
const SNAP = 116; // width of action panel (px)

function SwipeRow({
  children,
  onEdit,
  onDelete,
  onClick,
  editLabel,
  deleteLabel,
}: {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  editLabel: string;
  deleteLabel: string;
}) {
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const startX = useRef(0);
  const startOff = useRef(0);
  const moved = useRef(false);
  const offsetRef = useRef(0);

  const syncOffset = (v: number) => {
    offsetRef.current = v;
    setOffset(v);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startOff.current = offsetRef.current;
    moved.current = false;
    setAnimating(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    const next = Math.max(-SNAP, Math.min(0, startOff.current + dx));
    syncOffset(next);
  };

  const handlePointerUp = () => {
    setAnimating(true);
    syncOffset(offsetRef.current < -SNAP / 2 ? -SNAP : 0);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    if (moved.current) { e.stopPropagation(); return; }
    if (offsetRef.current !== 0) { setAnimating(true); syncOffset(0); return; }
    onClick();
  };

  const closeAndRun = (fn: () => void) => {
    setAnimating(true);
    syncOffset(0);
    fn();
  };

  return (
    <div className="relative overflow-hidden rounded-xl shadow-sm mb-2">
      {/* action panel — revealed on swipe left */}
      <div
        className="absolute inset-y-0 right-0 flex"
        style={{ width: SNAP }}
      >
        <button
          className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-blue-500 text-white"
          onClick={() => closeAndRun(onEdit)}
        >
          <Pencil className="h-4 w-4" />
          <span className="text-[10px] font-medium">{editLabel}</span>
        </button>
        <button
          className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-destructive text-destructive-foreground"
          onClick={() => closeAndRun(onDelete)}
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-[10px] font-medium">{deleteLabel}</span>
        </button>
      </div>

      {/* sliding content */}
      <div
        className="relative z-10 bg-card"
        style={{
          transform: `translateX(${offset}px)`,
          transition: animating ? 'transform 0.22s ease' : 'none',
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleContentClick}
      >
        {children}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function History() {
  const navigate = useNavigate();
  const { transactions, remove } = useTransactions();
  const { members, getMemberName } = useMembers();
  const { format } = useCurrency();
  const { t, i18n } = useTranslation();

  const [filterMember, setFilterMember] = useState('all');
  const [filterJar, setFilterJar] = useState<'all' | JarId>('all');
  const [viewMonth, setViewMonth] = useState(toYearMonth(new Date()));
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const confirmDelete = async () => {
    if (pendingDeleteId) await remove(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const oldestMonth = transactions.length
    ? transactions.reduce((min, tx) => (tx.date < min ? tx.date : min), transactions[0].date).slice(0, 7)
    : viewMonth;
  const latestMonth = transactions.length
    ? transactions.reduce((max, tx) => (tx.date > max ? tx.date : max), transactions[0].date).slice(0, 7)
    : viewMonth;

  // Income auto-splits across all jars, so a single-jar filter shouldn't
  // include it (otherwise income shows up under whatever jar id was set,
  // historically 'living'). Expenses filter by their explicit jar.
  const filtered = filterByMember(transactions, filterMember)
    .filter(tx => filterJar === 'all' || (tx.type === 'expense' && tx.jar === filterJar))
    .filter(tx => tx.date.startsWith(viewMonth));

  const grouped = filtered.reduce<Record<string, typeof transactions>>((acc, tx) => {
    const month = tx.date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(tx);
    return acc;
  }, {});

  const monthLabel = new Date(viewMonth + '-02').toLocaleDateString(i18n.language, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <div className="px-5 pb-3 pt-safe">
        <h1 className="text-2xl font-bold">{t('history.title')}</h1>
      </div>

      {/* Month picker popup */}
      {showMonthPicker && (() => {
        const oldestYear = parseInt(oldestMonth.slice(0, 4));
        const currentYear = new Date().getFullYear();
        const currentMonth = toYearMonth(new Date());
        const latestYear = parseInt(latestMonth.slice(0, 4));
        const years = Array.from({ length: latestYear - oldestYear + 1 }, (_, i) => latestYear - i);
        const MONTHS = Array.from({ length: 12 }, (_, i) =>
          new Date(2000, i, 1).toLocaleDateString(i18n.language, { month: 'short' })
        );
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMonthPicker(false)} />
            <div className="relative bg-white rounded-b-3xl w-full max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                <p className="font-bold text-gray-900">{t('history.selectMonth', { defaultValue: '월 선택' })}</p>
                <button onClick={() => setShowMonthPicker(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto px-5 pb-8">
                {years.map(year => (
                  <div key={year} className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{year}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {MONTHS.map((label, idx) => {
                        const ym = `${year}-${String(idx + 1).padStart(2, '0')}`;
                        const disabled = ym < oldestMonth || ym > latestMonth;
                        const active = ym === viewMonth;
                        return (
                          <button
                            key={ym}
                            disabled={disabled}
                            onClick={() => { setViewMonth(ym); setShowMonthPicker(false); }}
                            className={`rounded-xl py-2.5 text-sm font-medium transition-all ${
                              active ? 'bg-gray-900 text-white' :
                              disabled ? 'opacity-25 text-muted-foreground' :
                              'bg-secondary text-foreground active:scale-95'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Month navigator */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between rounded-xl bg-secondary px-1 py-1">
          <button
            onClick={() => setViewMonth(v => shiftMonth(v, -1))}
            disabled={viewMonth <= oldestMonth}
            className="flex h-11 w-11 items-center justify-center rounded-lg disabled:opacity-30 active:bg-black/10"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowMonthPicker(true)}
            className="flex items-center gap-1 text-sm font-semibold active:opacity-70"
          >
            {monthLabel}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setViewMonth(v => shiftMonth(v, 1))}
            disabled={viewMonth >= latestMonth}
            className="flex h-11 w-11 items-center justify-center rounded-lg disabled:opacity-30 active:bg-black/10"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Member filter */}
      {members.length > 0 && (
        <div className="px-5 pb-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterMember('all')}
              className={`shrink-0 min-h-[40px] rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filterMember === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {t('history.all')}
            </button>
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => setFilterMember(m.id)}
                className={`shrink-0 flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filterMember === m.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                {m.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Jar filter */}
      <div className="px-5 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterJar('all')}
            className={`shrink-0 min-h-[40px] rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filterJar === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {t('history.all')}
          </button>
          {JARS.map(j => (
            <button
              key={j.id}
              onClick={() => setFilterJar(filterJar === j.id ? 'all' : j.id)}
              className="shrink-0 flex min-h-[40px] items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={
                filterJar === j.id
                  ? { backgroundColor: j.color, color: '#fff' }
                  : { backgroundColor: 'hsl(var(--secondary))', color: '#4e5968' }
              }
            >
              {filterJar !== j.id && <JarIcon jar={j.id} size={13} />}
              {t(`jars.${j.id}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={open => { if (!open) setPendingDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.confirmDeleteTx')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.confirmDeleteTxDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transaction list */}
      <div className="px-5">
        {Object.keys(grouped).length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">{t('history.empty')}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, txs]) => {
            const monthIncome = txs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
            const monthExpense = txs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
            return (
              <div key={month} className="mb-6">
                {/* Month header with summary */}
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    {new Date(month + '-02').toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex gap-3 text-xs">
                    {monthIncome > 0 && (
                      <span className="text-green-600 font-medium">+{format(monthIncome)}</span>
                    )}
                    {monthExpense > 0 && (
                      <span className="text-red-500 font-medium">-{format(monthExpense)}</span>
                    )}
                  </div>
                </div>

                {txs.map(tx => (
                  <SwipeRow
                    key={tx.id}
                    onClick={() => navigate(`/edit/${tx.id}`)}
                    onEdit={() => navigate(`/edit/${tx.id}`)}
                    onDelete={() => setPendingDeleteId(tx.id)}
                    editLabel={t('actions.edit')}
                    deleteLabel={t('actions.delete')}
                  >
                    <div className="flex items-center gap-3 p-3">
                      {tx.type === 'income'
                        ? <div className="flex shrink-0 items-center justify-center rounded-xl" style={{ width: 34, height: 34, background: '#f4f4f5' }}><span style={{ fontSize: 18 }}>💼</span></div>
                        : <JarIcon jar={tx.jar} size={18} />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {tx.type === 'income'
                            ? String(t(`incomeCat.${tx.subCategory}`, { defaultValue: tx.subCategory }))
                            : `${t(`jars.${tx.jar}`)} · ${String(t(`sub.${tx.subCategory}`, { defaultValue: tx.subCategory }))}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {tx.date.slice(5)} · {tx.note || getMemberName(tx.memberId)}
                        </p>
                      </div>
                      <p className={`font-semibold text-sm ${getTxColorClass(tx.type)}`}>
                        {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                      </p>
                    </div>
                  </SwipeRow>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
