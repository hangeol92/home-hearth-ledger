import { useState, useEffect } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useCurrency, useMembers } from '@/hooks/useStore';
import { JarIcon } from '@/components/JarIcon';
import { ChevronLeft, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useActiveMember } from '@/hooks/useActiveMember';
import MemberSelectSheet from '@/components/member/MemberSelectSheet';
import { useReceiptScanner } from '@/hooks/useReceiptScanner';
import ScanActionSheet from '@/components/receipt/ScanActionSheet';
import ScanningScreen from '@/components/receipt/ScanningScreen';
import ReceiptResultSheet from '@/components/receipt/ReceiptResultSheet';
import PermissionGuide from '@/components/receipt/PermissionGuide';
import { useToast } from '@/hooks/use-toast';

function getWeekdays(locale: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2023, 0, i + 1); // 2023-01-01 is Sunday
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
  });
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { format } = useCurrency();
  const { members } = useMembers();
  const { activeMember, setActiveMember } = useActiveMember();
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [memberSheetTarget, setMemberSheetTarget] = useState<'manual' | 'scan'>('manual');
  const { toast } = useToast();
  const { status: scanStatus, result: scanResult, error: scanError, scanFromCamera, scanFromGallery, reset: resetScan } = useReceiptScanner();

  useEffect(() => {
    if (scanStatus === 'error' && scanError && scanError.type !== 'permission_denied') {
      const msg = scanError.type === 'web_only' ? t('receipt.webOnly') : t('receipt.ocrFailed');
      toast({ description: msg, variant: 'destructive', duration: 3000 });
      resetScan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanStatus, scanError]);
  const {
    year, month, selectedDate,
    byDate, expenseByDate, selectedTxs,
    prevMonth, nextMonth, selectDate, goToMonth,
    firstDayOfWeek, daysInMonth,
  } = useCalendar();

  const today = new Date().toISOString().split('T')[0];
  const weekdays = getWeekdays(i18n.language);

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = new Date(year, month).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-white pb-40" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Month picker popup */}
      {showMonthPicker && (() => {
        const now = new Date();
        const maxYear = now.getFullYear();
        const MONTHS = Array.from({ length: 12 }, (_, i) =>
          new Date(2000, i, 1).toLocaleDateString(i18n.language, { month: 'short' })
        );
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowMonthPicker(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs p-4">
              {/* Year navigator */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setPickerYear(y => y - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-base font-bold">{pickerYear}</span>
                <button
                  onClick={() => setPickerYear(y => y + 1)}
                  disabled={pickerYear >= maxYear}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              {/* Month grid */}
              <div className="grid grid-cols-4 gap-2">
                {MONTHS.map((label, idx) => {
                  const isActive = pickerYear === year && idx === month;
                  const isFuture = pickerYear > now.getFullYear() ||
                    (pickerYear === now.getFullYear() && idx > now.getMonth());
                  return (
                    <button
                      key={idx}
                      disabled={isFuture}
                      onClick={() => { goToMonth(pickerYear, idx); setShowMonthPicker(false); }}
                      className={`rounded-xl py-2 text-sm font-medium transition-all ${
                        isActive ? 'bg-gray-900 text-white' :
                        isFuture ? 'opacity-25 text-muted-foreground' :
                        'bg-gray-100 text-foreground active:scale-95'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.calendar')}</h1>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary active:bg-secondary/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => { setPickerYear(year); setShowMonthPicker(true); }}
            className="min-w-[80px] text-center text-sm font-semibold active:opacity-70"
          >
            {monthLabel}
          </button>
          <button
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary active:bg-secondary/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (activeMember || members.length === 0) {
                setShowActionSheet(true);
              } else {
                setMemberSheetTarget('scan');
                setShowMemberSheet(true);
              }
            }}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-2 mb-1">
        {weekdays.map((d, i) => (
          <div key={d} className={`py-1 text-center text-[11px] font-semibold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-primary' : 'text-muted-foreground'}`}>{d}</div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 px-2" style={{ gap: '2px 0' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasTx = (byDate.get(dateStr)?.length ?? 0) > 0;
          const colIdx = (firstDayOfWeek + day - 1) % 7;
          const isSunday = colIdx === 0;
          const isSaturday = colIdx === 6;

          const textColor = isSelected
            ? '#fff'
            : isSunday
              ? '#ef4444'
              : isSaturday
                ? 'var(--primary)'
                : 'var(--foreground)';

          const bgColor = isSelected
            ? '#111827'
            : isToday
              ? 'var(--primary-light, #eff4ff)'
              : 'transparent';

          return (
            <button
              key={dateStr}
              onClick={() => selectDate(dateStr)}
              className="flex flex-col items-center py-1.5 justify-start border-none bg-transparent cursor-pointer"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium"
                style={{ background: bgColor, color: textColor, fontWeight: isSelected || isToday ? 700 : 400 }}
              >
                {day}
              </div>
              {hasTx && (
                <div
                  className="rounded-full mt-0.5"
                  style={{
                    width: 4, height: 4,
                    background: isSelected ? '#fff' : 'var(--primary)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 선택일 거래 리스트 */}
      {selectedDate && (
        <div className="mt-4 px-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
          {selectedTxs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">{t('calendar.noTransactions')}</p>
          ) : (
            <div className="space-y-2">
              {selectedTxs.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-white border border-gray-100 shadow-sm p-3">
                  {tx.type === 'income'
                    ? <div className="flex shrink-0 items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: '#f4f4f5' }}><span style={{ fontSize: 18 }}>💼</span></div>
                    : <JarIcon jar={tx.jar} size={20} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {tx.type === 'income'
                        ? String(t(`incomeCat.${tx.subCategory}`, { defaultValue: tx.subCategory }))
                        : String(t(`sub.${tx.subCategory}`, { defaultValue: tx.subCategory }))}
                    </p>
                    {tx.note && <p className="text-xs text-gray-400 truncate">{tx.note}</p>}
                  </div>
                  <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{format(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 가계부 등록 플로팅 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 pb-safe">
        <button
          onClick={() => {
            if (activeMember || members.length === 0) {
              navigate('/add', { state: { date: selectedDate ?? today } });
            } else {
              setMemberSheetTarget('manual');
              setShowMemberSheet(true);
            }
          }}
          className="rounded-full bg-gray-900 px-10 py-3.5 text-sm font-semibold text-white shadow-xl active:scale-95 transition-transform"
        >
          {t('calendar.addTransaction')}
        </button>
      </div>

      {showMemberSheet && (
        <MemberSelectSheet
          members={members}
          onSelect={(m) => {
            setActiveMember(m);
            setShowMemberSheet(false);
            if (memberSheetTarget === 'manual') {
              navigate('/add', { state: { date: selectedDate ?? today } });
            } else {
              setShowActionSheet(true);
            }
          }}
          onClose={() => setShowMemberSheet(false)}
        />
      )}

      {showActionSheet && (
        <ScanActionSheet
          onCamera={() => {
            setShowActionSheet(false);
            scanFromCamera();
          }}
          onGallery={() => {
            setShowActionSheet(false);
            scanFromGallery();
          }}
          onManual={() => {
            setShowActionSheet(false);
            navigate('/add', { state: { date: selectedDate ?? today } });
          }}
          onClose={() => setShowActionSheet(false)}
        />
      )}

      {(scanStatus === 'scanning' || scanStatus === 'processing') && (
        <ScanningScreen status={scanStatus} />
      )}

      {scanStatus === 'done' && scanResult && (
        <ReceiptResultSheet
          parseResult={scanResult}
          onConfirm={(edited) => {
            navigate('/add', { state: { prefill: edited, date: selectedDate ?? today } });
            resetScan();
          }}
          onClose={resetScan}
        />
      )}

      {scanStatus === 'error' && scanError?.type === 'permission_denied' && (
        <PermissionGuide onClose={resetScan} />
      )}
    </div>
  );
}
