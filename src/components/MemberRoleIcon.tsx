import { MEMBER_ROLES, type FamilyMember, type MemberRole } from '@/types';
import { MemberIcon } from '@/components/icons/MemberIcons';

function getRoleDef(role: string) {
  return MEMBER_ROLES.find(r => r.id === role);
}

interface Props {
  member: FamilyMember;
  size?: number;
}

export function MemberRoleIcon({ member, size = 20 }: Props) {
  const role = member.role ? getRoleDef(member.role) : null;
  const color = role?.color ?? member.color;

  return (
    <div
      className="flex items-center justify-center rounded-xl shrink-0"
      style={{
        backgroundColor: `${color}20`,
        width: size + 16,
        height: size + 16,
        color,
      }}
    >
      {member.emoji ? (
        <span style={{ fontSize: size }}>{member.emoji}</span>
      ) : member.role ? (
        <MemberIcon role={member.role as MemberRole} size={size} />
      ) : (
        <span
          className="font-bold text-white flex items-center justify-center rounded-full"
          style={{
            backgroundColor: color,
            width: size,
            height: size,
            fontSize: size * 0.5,
          }}
        >
          {member.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
