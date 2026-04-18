import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FamilyMember } from '@/types';
import MemberCard from './MemberCard';

interface Props {
  members: FamilyMember[];
  onSelect: (m: FamilyMember) => void;
  onClose: () => void;
}

export default function MemberSelectSheet({ members, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    const member = members.find(m => m.id === selected);
    if (member) onSelect(member);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-safe">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <p className="text-base font-bold text-gray-900 mb-1">{t('memberSheet.title')}</p>
        <p className="text-sm text-gray-400 mb-5">{t('memberSheet.subtitle')}</p>

        {members.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            <p>{t('memberSheet.noMembers')}</p>
            <p className="text-xs mt-1">{t('memberSheet.noMembersHint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {members.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                selected={selected === m.id}
                onClick={() => setSelected(m.id)}
              />
            ))}
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white font-semibold text-base disabled:opacity-30 active:scale-95 transition-all mb-3"
        >
          {t('memberSheet.confirm')}
        </button>
      </div>
    </div>
  );
}
