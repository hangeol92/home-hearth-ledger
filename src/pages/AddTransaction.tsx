import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
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
import { useTransactions, useMembers, useCurrency } from '@/hooks/useStore';
import {
  JARS, JAR_SUBCATEGORIES, SUBCATEGORY_ICONS,
  LIVING_SUBCATEGORIES, LIVING_MAIN_CATEGORY_ICONS,
  INCOME_MAIN_CATEGORIES, INCOME_CATEGORY_ICONS,
  CATEGORY_EMOJI_OPTIONS, MEMBER_ROLES,
  type MemberRole, type LivingMainCategory, type IncomeMainCategory,
} from '@/types';
import { useCustomCategories } from '@/hooks/useCustomCategories';
import type { TransactionType, JarId } from '@/types';
import type { ReceiptParseResult } from '@/utils/receiptParser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JarIcon, getJarColor } from '@/components/JarIcon';
import { useTranslation } from 'react-i18next';
import { useActiveMember } from '@/hooks/useActiveMember';
import MemberManageSheet from '@/components/member/MemberManageSheet';
import { CategoryIcon } from '@/components/icons/CategoryIcons';
import { MemberIcon } from '@/components/icons/MemberIcons';

export default function AddTransaction() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const isEdit = Boolean(id);

  const { transactions, add, update, remove } = useTransactions();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { members, save: saveMember, remove: removeMember } = useMembers();
  const { symbol } = useCurrency();
  const { t } = useTranslation();
  const { setActiveMember } = useActiveMember();

  const prefill = (state as { prefill?: ReceiptParseResult } | null)?.prefill;

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState(prefill?.amount != null ? String(prefill.amount) : '');
  const [jar, setJar] = useState<JarId>('living');
  const [subCategory, setSubCategory] = useState<string>(
    prefill?.category ?? JAR_SUBCATEGORIES.living[0]
  );
  const [note, setNote] = useState(prefill?.storeName ?? '');
  const [date, setDate] = useState<string>(
    prefill?.date ??
    (state as { date?: string } | null)?.date ??
    new Date().toISOString().split('T')[0]
  );
  const [memberId, setMemberId] = useState('');
  const [showManage, setShowManage] = useState(false);
  const [mainCategory, setMainCategory] = useState<string>('Food');
  const [incomeCategory, setIncomeCategory] = useState<IncomeMainCategory>('Salary');
  const { customMain, customSubs, addMainCategory, addSubCategory } = useCustomCategories();
  const [addingMainCat, setAddingMainCat] = useState(false);
  const [newMainName, setNewMainName] = useState('');
  const [newMainEmoji, setNewMainEmoji] = useState('📁');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [addingSubCat, setAddingSubCat] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [payer, setPayer] = useState<string>('shared');
  const [isPersonalMoney, setIsPersonalMoney] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    setType(tx.type);
    setAmount(String(tx.amount));
    setJar(tx.jar);
    setSubCategory(tx.subCategory);
    setNote(tx.note);
    setDate(tx.date);
    setMemberId(tx.memberId);
    if (tx.mainCategory) setMainCategory(tx.mainCategory as LivingMainCategory);
    if (tx.type === 'income' && tx.subCategory) setIncomeCategory(tx.subCategory as IncomeMainCategory);
    if (tx.payer) setPayer(tx.payer);
    if (tx.isPersonalMoney != null) setIsPersonalMoney(tx.isPersonalMoney);
  }, [id, isEdit, transactions]);

  const visibleMembers = members.filter(m => !m.hidden);
  const memberByRole = new Map(visibleMembers.filter(m => m.role).map(m => [m.role!, m]));
  const customMembers = visibleMembers.filter(m => !m.role);

  const isLivingExpense = type === 'expense' && jar === 'living';
  const builtInSubs = LIVING_SUBCATEGORIES[mainCategory as LivingMainCategory] ?? [];
  const livingSubCats = [...builtInSubs, ...(customSubs[mainCategory] ?? [])];
  const subCats = isLivingExpense ? livingSubCats : JAR_SUBCATEGORIES[jar];
  const parsedAmount = parseFloat(amount);
  const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const handleRoleTap = (roleId: MemberRole) => {
    const existing = memberByRole.get(roleId);
    if (!existing) return;
    setMemberId(existing.id);
    setActiveMember(existing);
    setPayer(existing.id);
  };

  const handleSave = async () => {
    if (!amountValid) return;
    const extraFields = {
      mainCategory: isLivingExpense ? mainCategory : undefined,
      payer: type === 'expense' ? payer : undefined,
      isPersonalMoney: type === 'expense' && payer !== 'shared' ? isPersonalMoney : undefined,
    };
    if (isEdit && id) {
      const original = transactions.find(t => t.id === id);
      if (!original) return;
      await update({
        ...original,
        type,
        amount: parsedAmount,
        jar: type === 'income' ? undefined as unknown as JarId : jar,
        subCategory: type === 'income' ? incomeCategory : subCategory,
        note, date, memberId,
        ...extraFields,
      });
    } else {
      await add({
        id: crypto.randomUUID(), type,
        amount: parsedAmount,
        jar: type === 'income' ? undefined as unknown as JarId : jar,
        subCategory: type === 'income' ? incomeCategory : subCategory,
        note, date, memberId,
        createdAt: new Date().toISOString(),
        ...extraFields,
      });
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {showManage && (
        <MemberManageSheet
          members={members}
          onClose={() => setShowManage(false)}
          onSave={saveMember}
          onRemove={removeMember}
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pb-4 pt-safe">
        <button onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-lg active:bg-secondary"
          aria-label="Back">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold flex-1">
          {isEdit ? t('add.editTitle') : t('add.title')}
        </h1>
        {isEdit && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-destructive active:bg-secondary"
            aria-label="Delete">
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.confirmDeleteTx')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.confirmDeleteTxDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { if (id) { await remove(id); navigate(-1); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="px-5 space-y-6">
        {/* 1. 금액 — 최상단, 자동 포커스 */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.amount')}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">{symbol}</span>
            <Input
              type="text"
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              className="pl-8 text-2xl font-bold h-14 rounded-xl"
              inputMode="decimal"
              pattern="[0-9]*"
              autoFocus
            />
          </div>
        </div>

        {/* 2. 타입 토글 */}
        <div className="flex rounded-xl bg-secondary p-1">
          {(['expense', 'income'] as const).map(tp => (
            <button key={tp} onClick={() => setType(tp)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all ${type === tp ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}>
              {tp === 'expense' ? t('add.expense') : t('add.income')}
            </button>
          ))}
        </div>

        {/* 3. 壺 + 카테고리 */}
        {type === 'expense' ? (
          <>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.jar')}</label>
              <div className="grid grid-cols-5 gap-2">
                {JARS.map(j => {
                  const active = jar === j.id;
                  return (
                    <button key={j.id}
                      onClick={() => {
                        setJar(j.id);
                        if (j.id === 'living') {
                          setMainCategory('Food');
                          setSubCategory(LIVING_SUBCATEGORIES.Food[0] ?? '');
                        } else {
                          setSubCategory(JAR_SUBCATEGORIES[j.id][0]);
                        }
                      }}
                      className="flex flex-col items-center gap-1.5 rounded-xl p-2 transition-all"
                      style={{ backgroundColor: active ? `${j.color}25` : 'hsl(var(--secondary))', outline: active ? `2px solid ${j.color}` : 'none' }}>
                      <JarIcon jar={j.id} size={18} />
                      <span className="text-[10px] font-medium leading-tight text-center">{t(`jars.${j.id}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isLivingExpense ? (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.mainCategory')}</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(Object.keys(LIVING_MAIN_CATEGORY_ICONS) as LivingMainCategory[]).map(cat => {
                      const active = mainCategory === cat;
                      return (
                        <button key={cat} onClick={() => {
                          setMainCategory(cat);
                          const subs = [...(LIVING_SUBCATEGORIES[cat] ?? []), ...(customSubs[cat] ?? [])];
                          setSubCategory(subs.length > 0 ? subs[0] : '');
                          setAddingSubCat(false);
                        }}
                          className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all active:scale-95"
                          style={{ backgroundColor: active ? '#10B98125' : 'hsl(var(--secondary))', outline: active ? '2px solid #10B981' : 'none', color: active ? '#10B981' : undefined }}>
                          <CategoryIcon category={cat} size={22} strokeWidth={active ? 1.8 : 1.3} />
                          <span className="text-[10px] font-medium text-center leading-tight w-full truncate px-0.5">
                            {t(`mainCat.${cat}`, { defaultValue: cat })}
                          </span>
                        </button>
                      );
                    })}
                    {customMain.map(cat => {
                      const active = mainCategory === cat.id;
                      return (
                        <button key={cat.id} onClick={() => {
                          setMainCategory(cat.id);
                          setSubCategory(customSubs[cat.id]?.[0] ?? '');
                          setAddingSubCat(false);
                        }}
                          className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all active:scale-95"
                          style={{ backgroundColor: active ? '#10B98125' : 'hsl(var(--secondary))', outline: active ? '2px solid #10B981' : 'none' }}>
                          <span className="text-xl leading-none">{cat.emoji || '📁'}</span>
                          <span className="text-[10px] font-medium text-center leading-tight w-full truncate px-0.5" style={{ color: active ? '#10B981' : undefined }}>
                            {cat.name}
                          </span>
                        </button>
                      );
                    })}
                    <button onClick={() => { setAddingMainCat(v => !v); setNewMainName(''); setNewMainEmoji('📁'); }}
                      className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 border-2 border-dashed border-gray-200 active:scale-95">
                      <span className="text-xl leading-none">＋</span>
                      <span className="text-[10px] font-medium text-center text-gray-400">추가</span>
                    </button>
                  </div>
                  {addingMainCat && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setShowEmojiPicker(v => !v)}
                          className="w-12 h-10 rounded-xl border-2 border-gray-200 text-xl flex items-center justify-center active:bg-gray-100">
                          {newMainEmoji}
                        </button>
                        <input value={newMainName} onChange={e => setNewMainName(e.target.value)}
                          placeholder="카테고리 이름" autoFocus
                          className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-teal-400"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newMainName.trim()) {
                              const newId = addMainCategory(newMainName.trim(), newMainEmoji);
                              setMainCategory(newId); setSubCategory(''); setAddingMainCat(false); setShowEmojiPicker(false);
                            }
                          }} />
                        <button onClick={() => {
                          if (!newMainName.trim()) return;
                          const newId = addMainCategory(newMainName.trim(), newMainEmoji);
                          setMainCategory(newId); setSubCategory(''); setAddingMainCat(false); setShowEmojiPicker(false);
                        }} className="h-10 px-3 rounded-xl bg-teal-500 text-white text-sm font-semibold shrink-0">확인</button>
                      </div>
                      {showEmojiPicker && (
                        <div className="rounded-xl border border-gray-200 bg-white p-2">
                          <div className="flex flex-wrap gap-1">
                            {CATEGORY_EMOJI_OPTIONS.map(e => (
                              <button key={e} onClick={() => { setNewMainEmoji(e); setShowEmojiPicker(false); }}
                                className={`h-9 w-9 text-xl rounded-lg flex items-center justify-center transition-all active:scale-90 ${newMainEmoji === e ? 'bg-teal-100 ring-2 ring-teal-400' : 'bg-gray-50 active:bg-gray-100'}`}>
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.subCategory')}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {livingSubCats.map(c => {
                      const active = subCategory === c;
                      const icon = SUBCATEGORY_ICONS[c];
                      return (
                        <button key={c} onClick={() => setSubCategory(c)}
                          className="flex items-center justify-center gap-1 rounded-xl py-2.5 px-2 transition-all active:scale-95"
                          style={{ backgroundColor: active ? '#10B98125' : 'hsl(var(--secondary))', outline: active ? '2px solid #10B981' : 'none' }}>
                          {icon && <span className="text-sm leading-none">{icon}</span>}
                          <span className="text-xs font-medium text-center truncate" style={{ color: active ? '#10B981' : undefined }}>
                            {t(`livingSub.${c}`, { defaultValue: c })}
                          </span>
                        </button>
                      );
                    })}
                    <button onClick={() => { setAddingSubCat(v => !v); setNewSubName(''); }}
                      className="flex items-center justify-center rounded-xl py-2.5 px-2 border-2 border-dashed border-gray-200 active:scale-95">
                      <span className="text-xs font-medium text-gray-400">＋ 추가</span>
                    </button>
                  </div>
                  {addingSubCat && (
                    <div className="mt-2 flex gap-2 items-center">
                      <input value={newSubName} onChange={e => setNewSubName(e.target.value)}
                        placeholder="세부항목 이름"
                        className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-teal-400"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newSubName.trim()) {
                            addSubCategory(mainCategory, newSubName.trim());
                            setSubCategory(newSubName.trim()); setAddingSubCat(false);
                          }
                        }} />
                      <button onClick={() => {
                        if (!newSubName.trim()) return;
                        addSubCategory(mainCategory, newSubName.trim());
                        setSubCategory(newSubName.trim()); setAddingSubCat(false);
                      }} className="h-10 px-3 rounded-xl bg-teal-500 text-white text-sm font-semibold">확인</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.subCategory')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {subCats.map(c => {
                    const active = subCategory === c;
                    const icon = SUBCATEGORY_ICONS[c] ?? '•••';
                    return (
                      <button key={c} onClick={() => setSubCategory(c)}
                        className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all active:scale-95"
                        style={{
                          backgroundColor: active ? `${getJarColor(jar)}25` : 'hsl(var(--secondary))',
                          outline: active ? `2px solid ${getJarColor(jar)}` : 'none',
                        }}>
                        <span className="text-xl leading-none">{icon}</span>
                        <span className="text-[10px] font-medium text-center leading-tight w-full truncate px-0.5"
                          style={{ color: active ? getJarColor(jar) : undefined }}>
                          {t(`sub.${c}`, { defaultValue: c })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.mainCategory')}</label>
            <div className="grid grid-cols-4 gap-2">
              {INCOME_MAIN_CATEGORIES.map(cat => {
                const active = incomeCategory === cat;
                return (
                  <button key={cat} onClick={() => setIncomeCategory(cat)}
                    className="flex flex-col items-center gap-1 rounded-xl py-2.5 px-1 transition-all active:scale-95"
                    style={{
                      backgroundColor: active ? '#2563d925' : 'hsl(var(--secondary))',
                      outline: active ? '2px solid #2563d9' : 'none',
                    }}>
                    <span className="text-xl leading-none">{INCOME_CATEGORY_ICONS[cat]}</span>
                    <span className="text-[10px] font-medium text-center leading-tight w-full truncate px-0.5"
                      style={{ color: active ? '#2563d9' : undefined }}>
                      {t(`incomeCat.${cat}`, { defaultValue: cat })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. 메모 */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.note')}</label>
          <Input value={note} onChange={e => setNote(e.target.value)}
            placeholder={t('add.notePlaceholder')} className="rounded-xl" />
        </div>

        {/* 5. 날짜 — 메모 다음으로 이동 */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">{t('add.date')}</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" />
        </div>

        {/* 6. 멤버 — 멤버가 없으면 섹션 전체 숨김, Payer 자동 연동 */}
        {visibleMembers.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-muted-foreground">{t('add.member')}</label>
              <button onClick={() => setShowManage(true)}
                className="flex items-center gap-1 text-xs font-medium text-teal-600 px-2 py-1 rounded-lg bg-teal-50">
                <Pencil className="h-3 w-3" /> Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {MEMBER_ROLES.map(def => {
                const registered = memberByRole.get(def.id);
                if (!registered) return null;
                const active = memberId === registered.id;
                return (
                  <button key={def.id}
                    onClick={() => handleRoleTap(def.id)}
                    className="flex flex-col items-center gap-1 rounded-xl p-2 transition-all active:scale-95"
                    style={{
                      backgroundColor: active ? `${def.color}25` : 'hsl(var(--secondary))',
                      outline: active ? `2px solid ${def.color}` : 'none',
                      minWidth: 64,
                    }}>
                    <div className="flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${def.color}20`, width: 32, height: 32, color: def.color }}>
                      {registered.emoji
                        ? <span style={{ fontSize: 16 }}>{registered.emoji}</span>
                        : <MemberIcon role={def.id} size={18} strokeWidth={1.3} />
                      }
                    </div>
                    <span className="text-[10px] font-medium leading-tight text-center w-full truncate">
                      {registered.name}
                    </span>
                  </button>
                );
              })}
              {customMembers.map(m => {
                const active = memberId === m.id;
                return (
                  <button key={m.id}
                    onClick={() => { setMemberId(m.id); setActiveMember(m); setPayer(m.id); }}
                    className="flex flex-col items-center gap-1 rounded-xl p-2 transition-all active:scale-95"
                    style={{
                      backgroundColor: active ? `${m.color}25` : 'hsl(var(--secondary))',
                      outline: active ? `2px solid ${m.color}` : 'none',
                    }}>
                    <div className="flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${m.color}20`, width: 32, height: 32 }}>
                      <span style={{ fontSize: 16 }}>{m.emoji || m.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] font-medium leading-tight text-center w-full truncate">
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 개인 지출 토글 — 멤버 선택 시 인라인으로 표시 */}
            {type === 'expense' && memberId && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{t('add.personalMoney')}</p>
                  <p className="text-xs text-muted-foreground">{t('add.personalMoneyHint')}</p>
                </div>
                <button
                  onClick={() => setIsPersonalMoney(v => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isPersonalMoney ? 'bg-teal-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPersonalMoney ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            )}
          </div>
        )}

        <Button onClick={handleSave} className="w-full h-12 rounded-xl text-base font-semibold" disabled={!amountValid}>
          {isEdit ? t('add.update') : t('add.save')}
        </Button>
      </div>
    </div>
  );
}
