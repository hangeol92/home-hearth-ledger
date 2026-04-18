import type { FamilyMember } from '@/types';
interface Props { member: FamilyMember; onChangeMember: () => void; }
export default function ActiveMemberBar({ member, onChangeMember }: Props) {
  return (
    <div className="flex items-center justify-between bg-gray-50 border-b px-5 py-2.5">
      <span className="text-sm font-medium">{member.name}</span>
      <button onClick={onChangeMember} className="text-sm text-teal-500">변경 ›</button>
    </div>
  );
}
