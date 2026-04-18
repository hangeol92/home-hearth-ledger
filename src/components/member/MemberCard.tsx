import type { FamilyMember } from '@/types';
import { MemberRoleIcon } from '@/components/MemberRoleIcon';

interface Props {
  member: FamilyMember;
  selected: boolean;
  onClick: () => void;
}

export default function MemberCard({ member, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-2xl p-4 min-h-[110px] w-full transition-all active:scale-95 border-2 ${
        selected ? 'border-teal-500 bg-teal-50' : 'border-transparent bg-gray-50'
      }`}
    >
      <MemberRoleIcon member={member} size={28} />
      <span className="text-sm font-semibold text-gray-800 mt-2">{member.name}</span>
    </button>
  );
}
