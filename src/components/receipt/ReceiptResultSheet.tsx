import { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ReceiptParseResult } from '@/utils/receiptParser';

export interface ReceiptResultSheetProps {
  parseResult: ReceiptParseResult;
  onConfirm: (edited: ReceiptParseResult) => void;
  onClose: () => void;
}

export default function ReceiptResultSheet({ parseResult, onConfirm, onClose }: ReceiptResultSheetProps) {
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-white rounded-t-3xl px-5 pt-5 max-h-[80vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-semibold text-gray-900 mb-6">인식 결과</h2>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">가게명</span>
          <div className="flex items-center gap-2">
            {parseResult.storeName ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            )}
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="text-right text-sm text-gray-900 bg-transparent border-none outline-none w-48"
              placeholder="가게명 입력"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">금액</span>
          <div className="flex items-center gap-2">
            {parseResult.amount ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            )}
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-right text-sm text-gray-900 bg-transparent border-none outline-none w-40"
              placeholder="금액 입력"
            />
            <span className="text-sm text-gray-500">원</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">날짜</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-right text-sm text-gray-900 bg-transparent border-none outline-none w-40"
            />
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-700">카테고리</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="text-right text-sm text-gray-900 bg-transparent border-none outline-none w-40"
            >
              <option value="Food">음식</option>
              <option value="Transport">교통</option>
              <option value="Health">의료</option>
              <option value="Shopping">쇼핑</option>
              <option value="Entertainment">오락</option>
              <option value="Education">교육</option>
              <option value="Other">기타</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-2 mb-4">
          <button
            onClick={handleConfirm}
            className="w-full h-12 rounded-xl bg-teal-500 text-white font-semibold"
          >
            이대로 등록
          </button>
          <button
            onClick={onClose}
            className="w-full text-sm text-gray-400 text-center py-2"
          >
            다시 스캔
          </button>
        </div>
      </div>
    </div>
  );
}
