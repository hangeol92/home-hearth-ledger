import { useState, useEffect } from 'react';
import { useCalendar } from '@/hooks/useCalendar';
import { useJars, useCurrency, useMembers } from '@/hooks/useStore';
import { JarIcon } from '@/components/JarIcon';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Search, SlidersHorizontal, BarChart2 } from 'lucide-react';
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
  const { jars } = useJars();
  const { members } = useMembers();
  const { activeMember, setActiveMember } = useActiveMember();
  const [showMemberSheet, setShowMemberSheet] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const { toast } = useToast();
  const { status: scanStatus, result: scanResult, error: scanError, scanFromCamera, scanFromGallery, reset: resetScan } = useReceiptScanner();

  useEffect(() => {
    if (scanStatus === 'error' && scanError && scanError.type !== 'permission_denied') {
      const msg = scanError.type === 'ocr_failed' ? t('receipt.ocrFailed') : t('receipt.webOnly');
      toast({ description: msg, variant: 'destructive', duration: 3000 });
      resetScan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanStatus, scanError]);
  const {
    year, month, selectedDate,
    totalIncome, totalExpense,
    expenseByDate, selectedTxs,
    prevMonth, nextMonth, selectDate,
    firstDayOfWeek, daysInMonth,
  } = useCalendar();

  const today = new Date().toISOString().split('T')[0];
  const totalBalance = jars.reduce((s, j) => s + j.balance, 0);
  const weekdays = getWeekdays(i18n.language);

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthLabel = new Date(year, month).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen bg-white pb-40 pt-safe">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
        <button className="flex items-center gap-1 text-lg font-bold" onClick={() => {}}>
          {monthLabel}
          <ChevronDown className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 text-gray-400 min-h-[44px]">
          <button className="flex items-center justify-center"><Search className="h-5 w-5" /></button>
          <button className="flex items-center justify-center"><SlidersHorizontal className="h-5 w-5" /></button>
          <button className="flex items-center justify-center"><BarChart2 className="h-5 w-5" /></button>
          <button
            onClick={() => {
              if (activeMember || members.length === 0) {
                setShowActionSheet(true);
              } else {
                setShowMemberSheet(true);
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="mx-4 mb-4 rounded-2xl bg-gray-50 px-5 py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[11px] text-gray-400 mb-0.5">{t('calendar.income')}</p>
            <p className="text-base font-bold text-emerald-600">{format(totalIncome)}</p>
          </div>
          <div className="border-l border-gray-200">
            <p className="text-[11px] text-gray-400 mb-0.5">{t('calendar.expense')}</p>
            <p className="text-base font-bold text-red-500">{format(totalExpense)}</p>
          </div>
          <div className="border-l border-gray-200">
            <p className="text-[11px] text-gray-400 mb-0.5">{t('calendar.balance')}</p>
            <p className="text-base font-bold">{format(totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* 월 이동 */}
      <div className="flex items-center justify-between px-4 mb-1">
        <button onClick={prevMonth}><ChevronLeft className="h-5 w-5 text-gray-400" /></button>
        <button onClick={nextMonth}><ChevronRight className="h-5 w-5 text-gray-400" /></button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 px-2">
        {weekdays.map((d, i) => (
          <div key={d} className={`py-1 text-center text-[11px] font-medium ${i === 0 ? 'text-red-400' : 'text-gray-500'}`}>{d}</div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 px-2">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="min-h-[44px]" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const expense = expenseByDate.get(dateStr) ?? 0;
          const isSunday = (firstDayOfWeek + day - 1) % 7 === 0;

          return (
            <button
              key={dateStr}
              onClick={() => selectDate(dateStr)}
              className="flex flex-col items-center py-1 min-h-[44px] justify-start"
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium
                ${isToday ? 'bg-gray-900 text-white' :
                  isSelected ? 'bg-blue-50 text-blue-600' : ''}
                ${isSunday && !isToday && !isSelected ? 'text-red-400' : ''}
              `}>
                {day}
              </span>
              {expense > 0 && (
                <span className="text-[9px] text-red-500 leading-none mt-0.5 truncate w-full text-center">
                  {format(expense)}
                </span>
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
                  <JarIcon jar={tx.jar} size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.subCategory}</p>
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
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-40 pb-safe mb-20">
        <button
          onClick={() => {
            if (activeMember || members.length === 0) {
              setShowActionSheet(true);
            } else {
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
            setShowActionSheet(true);
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
