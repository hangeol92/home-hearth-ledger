import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ReceiptParseResult } from '@/utils/receiptParser';

export interface ReceiptResultSheetProps {
  parseResult: ReceiptParseResult;
  onConfirm: (edited: ReceiptParseResult) => void;
  onClose: () => void;
}

export default function ReceiptResultSheet({ parseResult, onConfirm, onClose }: ReceiptResultSheetProps) {
  const { t } = useTranslation();
  const [storeName, setStoreName] = useState(parseResult.storeName ?? '');
  const [amount, setAmount] = useState(parseResult.amount?.toString() ?? '');
  const [date, setDate] = useState(parseResult.date ?? new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(parseResult.category ?? 'Other');

  const handleConfirm = () => {
    onConfirm({
      storeName: storeName || null,
      amount: amount ? parseFloat(amount) : null,
      date: date || null,
      category: category || null,
      rawText: parseResult.rawText,
    });
  };

  const categories = ['Food', 'Transport', 'Health', 'Shopping', 'Entertainment', 'Education', 'Other'] as const;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl px-5 pt-5 max-h-[80vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}>
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('receipt.resultTitle')}</h2>

        {/* Store name */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700 shrink-0 mr-3">{t('receipt.storeName')}</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            {parseResult.storeName
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
            <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
              className="text-right text-sm text-gray-900 bg-transparent border-none outline-none min-w-0 w-40"
              placeholder={t('receipt.storeNamePlaceholder')} />
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700 shrink-0 mr-3">{t('receipt.amount')}</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            {parseResult.amount
              ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              : <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="text-right text-sm text-gray-900 bg-transparent border-none outline-none min-w-0 w-32"
              placeholder={t('receipt.amountPlaceholder')} />
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700 shrink-0 mr-3">{t('receipt.date')}</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="text-right text-sm text-gray-900 bg-transparent border-none outline-none" />
          </div>
        </div>

        {/* Category */}
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700 shrink-0 mr-3">{t('receipt.category')}</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="text-right text-sm text-gray-900 bg-transparent border-none outline-none">
              {categories.map(c => (
                <option key={c} value={c}>{t(`receipt.categories.${c}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <button onClick={handleConfirm}
            className="w-full h-12 rounded-xl bg-teal-500 text-white font-semibold">
            {t('receipt.confirm')}
          </button>
          <button onClick={onClose}
            className="w-full text-sm text-gray-400 text-center py-2">
            {t('receipt.rescan')}
          </button>
        </div>
      </div>
    </div>
  );
}
