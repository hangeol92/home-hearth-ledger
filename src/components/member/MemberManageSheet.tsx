import { useState } from 'react';
import { X, Plus, Check, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MEMBER_ROLES, MEMBER_COLORS, MEMBER_EMOJI_OPTIONS, type MemberRole } from '@/types';
import type { FamilyMember } from '@/types';
import { useTranslation } from 'react-i18next';

export default function MemberManageSheet({
  members, onClose, onSave, onRemove,
}: {
  members: FamilyMember[];
  onClose: () => void;
  onSave: (m: FamilyMember) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmoji, setEditEmoji] = useState('');
  const [editColor, setEditColor] = useState('');

  const [addStep, setAddStep] = useState<'idle' | 'role' | 'form'>('idle');
  const [pendingRole, setPendingRole] = useState<MemberRole | 'custom' | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newColor, setNewColor] = useState(MEMBER_COLORS[0]);

  const registeredRoles = new Set(members.map(m => m.role).filter(Boolean));

  const startEdit = (m: FamilyMember) => {
    const def = m.role ? MEMBER_ROLES.find(r => r.id === m.role) : null;
    setEditingId(m.id);
    setEditName(m.name);
    setEditEmoji(m.emoji ?? def?.emoji ?? '');
    setEditColor(m.color);
  };

  const saveEdit = async () => {
    const m = members.find(m => m.id === editingId);
    if (!m || !editName.trim()) return;
    const def = m.role ? MEMBER_ROLES.find(r => r.id === m.role) : null;
    await onSave({
      ...m,
      name: editName.trim(),
      emoji: editEmoji && editEmoji !== (def?.emoji ?? '') ? editEmoji : undefined,
      color: editColor,
    });
    setEditingId(null);
  };

  const toggleHidden = async (m: FamilyMember) => {
    await onSave({ ...m, hidden: !m.hidden });
  };

  const selectRole = (roleId: MemberRole | 'custom') => {
    if (roleId !== 'custom') {
      const def = MEMBER_ROLES.find(r => r.id === roleId)!;
      setNewName(t(def.labelKey));
      setNewEmoji(def.emoji);
      setNewColor(def.color);
    } else {
      setNewName('');
      setNewEmoji('');
      setNewColor(MEMBER_COLORS[0]);
    }
    setPendingRole(roleId);
    setAddStep('form');
  };

  const handleAddConfirm = async () => {
    if (!newName.trim()) return;
    const isRole = pendingRole && pendingRole !== 'custom';
    const def = isRole ? MEMBER_ROLES.find(r => r.id === pendingRole) : null;
    await onSave({
      id: crypto.randomUUID(),
      name: newName.trim(),
      color: isRole ? (def?.color ?? newColor) : newColor,
      role: isRole ? (pendingRole as MemberRole) : undefined,
      emoji: newEmoji && newEmoji !== (def?.emoji ?? '') ? newEmoji : undefined,
    });
    setAddStep('idle');
    setNewName('');
    setNewEmoji('');
  };

  const getDisplayEmoji = (m: FamilyMember) => {
    if (m.emoji) return m.emoji;
    if (m.role) return MEMBER_ROLES.find(r => r.id === m.role)?.emoji ?? '';
    return '';
  };

  const getColor = (m: FamilyMember) =>
    m.role ? (MEMBER_ROLES.find(r => r.id === m.role)?.color ?? m.color) : m.color;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full absolute top-2 left-1/2 -translate-x-1/2" />
          <p className="font-bold text-gray-900 mt-2">{t('members.title')}</p>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {addStep !== 'idle' ? (
          <div className="px-5 pb-8 overflow-y-auto">
            {addStep === 'role' ? (
              <>
                <p className="text-sm text-gray-500 mb-3">{t('members.roleSection')}</p>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {MEMBER_ROLES.map(def => {
                    const taken = registeredRoles.has(def.id);
                    return (
                      <button key={def.id} onClick={() => !taken && selectRole(def.id)} disabled={taken}
                        className={`flex flex-col items-center gap-1 rounded-2xl p-3 bg-gray-50 transition-all ${taken ? 'opacity-30' : 'active:scale-95'}`}>
                        <span className="text-2xl">{def.emoji}</span>
                        <span className="text-[11px] font-medium text-gray-700 text-center">{t(def.labelKey)}</span>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => selectRole('custom')}
                  className="flex items-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-200 p-3 text-sm text-gray-500 mb-4">
                  <Plus className="h-4 w-4" />{t('members.customSection')}
                </button>
                <button onClick={() => setAddStep('idle')} className="text-sm text-gray-400">{t('actions.cancel')}</button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${newColor}20` }}>
                    {newEmoji || '😊'}
                  </div>
                  <Input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder={t('members.name')} className="rounded-xl" autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAddConfirm()} />
                </div>
                <p className="text-xs text-gray-400 mb-2">{t('members.chooseEmoji', { defaultValue: 'Icon' })}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {MEMBER_EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => setNewEmoji(e)}
                      className={`h-9 w-9 text-xl rounded-xl flex items-center justify-center ${newEmoji === e ? 'ring-2 ring-teal-500 bg-teal-50' : 'bg-gray-100'}`}>
                      {e}
                    </button>
                  ))}
                </div>
                {pendingRole === 'custom' && (
                  <>
                    <p className="text-xs text-gray-400 mb-2">{t('members.chooseColor', { defaultValue: 'Color' })}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {MEMBER_COLORS.map(c => (
                        <button key={c} onClick={() => setNewColor(c)}
                          className={`h-8 w-8 rounded-full ${newColor === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setAddStep('role')}
                    className="h-11 w-11 rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
                    <X className="h-5 w-5" />
                  </button>
                  <button onClick={handleAddConfirm} disabled={!newName.trim()}
                    className="flex-1 h-11 rounded-xl bg-gray-900 text-white font-semibold text-sm disabled:opacity-30">
                    {t('members.addBtn')}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-y-auto px-5 pb-6">
            <div className="space-y-1 mb-4">
              {members.map(m => {
                const emoji = getDisplayEmoji(m);
                const color = getColor(m);
                const roleDef = m.role ? MEMBER_ROLES.find(r => r.id === m.role) : null;
                const isEditing = editingId === m.id;

                return (
                  <div key={m.id} className={`rounded-xl transition-opacity ${m.hidden ? 'opacity-40' : ''}`}>
                    {isEditing ? (
                      <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                            style={{ backgroundColor: `${editColor}20` }}>
                            {editEmoji || m.name.charAt(0)}
                          </div>
                          <Input value={editName} onChange={e => setEditName(e.target.value)}
                            className="h-9 rounded-lg text-sm" autoFocus
                            onKeyDown={e => e.key === 'Enter' && saveEdit()} />
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {MEMBER_EMOJI_OPTIONS.map(e => (
                            <button key={e} onClick={() => setEditEmoji(e)}
                              className={`h-8 w-8 text-lg rounded-lg flex items-center justify-center ${editEmoji === e ? 'ring-2 ring-teal-500 bg-teal-50' : 'bg-white border border-gray-200'}`}>
                              {e}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {MEMBER_COLORS.map(c => (
                            <button key={c} onClick={() => setEditColor(c)}
                              className={`h-7 w-7 rounded-full ${editColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={saveEdit}
                            className="flex-1 h-9 rounded-xl bg-gray-900 text-white text-sm font-medium">
                            <Check className="h-4 w-4 mx-auto" />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="flex-1 h-9 rounded-xl border border-gray-200 text-sm text-gray-500">
                            <X className="h-4 w-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-2">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: `${color}20` }}>
                          {emoji || m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          {roleDef && <p className="text-[11px] text-muted-foreground">{t(roleDef.labelKey)}</p>}
                        </div>
                        <button onClick={() => toggleHidden(m)} className="p-1.5 text-gray-400">
                          {m.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button onClick={() => startEdit(m)} className="p-1.5 text-gray-400">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => onRemove(m.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={() => setAddStep('role')}
              className="flex items-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-200 p-3 text-sm text-gray-500">
              <Plus className="h-4 w-4" />{t('members.add')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
