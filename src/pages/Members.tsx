import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Eye, EyeOff, Check, X } from 'lucide-react';
import { useMembers } from '@/hooks/useStore';
import { MEMBER_ROLES, MEMBER_COLORS, MEMBER_EMOJI_OPTIONS, type MemberRole } from '@/types';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Members() {
  const navigate = useNavigate();
  const { members, save, remove } = useMembers();
  const { t } = useTranslation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // add sheet
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [addStep, setAddStep] = useState<'role' | 'name'>('role');
  const [pendingRole, setPendingRole] = useState<MemberRole | 'custom' | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newColor, setNewColor] = useState(MEMBER_COLORS[0]);

  // emoji picker overlay
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);

  const registeredRoles = new Set(members.map(m => m.role).filter(Boolean));

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const m = members.find(m => m.id === id);
    if (!m) return;
    await save({ ...m, name: editName.trim() });
    setEditingId(null);
  };

  const toggleHidden = async (id: string) => {
    const m = members.find(m => m.id === id);
    if (!m) return;
    await save({ ...m, hidden: !m.hidden });
  };

  const changeEmoji = async (id: string, emoji: string) => {
    const m = members.find(m => m.id === id);
    if (!m) return;
    await save({ ...m, emoji });
    setEmojiPickerFor(null);
  };

  const openAddSheet = () => {
    setAddStep('role');
    setPendingRole(null);
    setNewName('');
    setNewEmoji('');
    setNewColor(MEMBER_COLORS[0]);
    setShowAddSheet(true);
  };

  const selectRole = (roleId: MemberRole | 'custom') => {
    if (roleId !== 'custom') {
      const def = MEMBER_ROLES.find(r => r.id === roleId)!;
      setNewName(t(def.labelKey));
      setNewEmoji(def.emoji);
    }
    setPendingRole(roleId);
    setAddStep('name');
  };

  const handleAddConfirm = async () => {
    if (!newName.trim()) return;
    if (pendingRole && pendingRole !== 'custom') {
      const def = MEMBER_ROLES.find(r => r.id === pendingRole)!;
      await save({
        id: crypto.randomUUID(),
        name: newName.trim(),
        color: def.color,
        role: pendingRole,
        emoji: newEmoji !== def.emoji ? newEmoji : undefined,
      });
    } else {
      await save({
        id: crypto.randomUUID(),
        name: newName.trim(),
        color: newColor,
        emoji: newEmoji || undefined,
      });
    }
    setShowAddSheet(false);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId) await remove(pendingDeleteId);
    setPendingDeleteId(null);
  };

  const getEmoji = (m: (typeof members)[0]) => {
    if (m.emoji) return m.emoji;
    if (m.role) return MEMBER_ROLES.find(r => r.id === m.role)?.emoji ?? '';
    return '';
  };

  const getColor = (m: (typeof members)[0]) => {
    if (m.role) return MEMBER_ROLES.find(r => r.id === m.role)?.color ?? m.color;
    return m.color;
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      {/* Delete dialog */}
      <AlertDialog open={!!pendingDeleteId} onOpenChange={open => { if (!open) setPendingDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.confirmDeleteMember')}</AlertDialogTitle>
            <AlertDialogDescription>{t('actions.confirmDeleteMemberDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Emoji picker overlay */}
      {emojiPickerFor && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEmojiPickerFor(null)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-10">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-500 mb-3">
              {t('members.chooseEmoji', { defaultValue: 'Choose icon' })}
            </p>
            <div className="flex flex-wrap gap-2">
              {MEMBER_EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => changeEmoji(emojiPickerFor, e)}
                  className="h-11 w-11 text-2xl rounded-xl flex items-center justify-center bg-gray-100 active:bg-gray-200">
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add sheet */}
      {showAddSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 overflow-y-auto max-h-[85vh]"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            {addStep === 'role' ? (
              <>
                <p className="font-bold text-gray-900 mb-4">{t('members.roleSection')}</p>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {MEMBER_ROLES.map(def => {
                    const taken = registeredRoles.has(def.id);
                    return (
                      <button key={def.id} onClick={() => !taken && selectRole(def.id)}
                        disabled={taken}
                        className={`flex flex-col items-center gap-1 rounded-2xl p-3 transition-all ${taken ? 'opacity-40' : 'active:scale-95 bg-gray-50'}`}>
                        <span className="text-2xl">{def.emoji}</span>
                        <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">
                          {t(def.labelKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => selectRole('custom')}
                  className="flex items-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-200 p-3 text-sm text-gray-500">
                  <Plus className="h-4 w-4" /> {t('members.customSection')}
                </button>
              </>
            ) : (
              <>
                {/* Name + emoji */}
                <div className="flex items-center gap-3 mb-4">
                  <button onClick={() => setNewEmoji('')}
                    className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: pendingRole && pendingRole !== 'custom' ? `${MEMBER_ROLES.find(r => r.id === pendingRole)?.color}20` : `${newColor}20` }}>
                    {newEmoji || '😊'}
                  </button>
                  <Input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder={t('members.name')} className="rounded-xl" autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAddConfirm()} />
                </div>

                {/* Emoji picker */}
                <p className="text-xs text-gray-400 mb-2">{t('members.chooseEmoji', { defaultValue: 'Choose icon' })}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {MEMBER_EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => setNewEmoji(e)}
                      className={`h-10 w-10 text-xl rounded-xl flex items-center justify-center transition-all ${newEmoji === e ? 'ring-2 ring-teal-500 bg-teal-50' : 'bg-gray-100'}`}>
                      {e}
                    </button>
                  ))}
                </div>

                {/* Color (custom only) */}
                {pendingRole === 'custom' && (
                  <>
                    <p className="text-xs text-gray-400 mb-2">{t('members.chooseColor', { defaultValue: 'Choose color' })}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {MEMBER_COLORS.map(c => (
                        <button key={c} onClick={() => setNewColor(c)}
                          className={`h-9 w-9 rounded-full transition-all ${newColor === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setAddStep('role')}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 shrink-0">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={handleAddConfirm} disabled={!newName.trim()}
                    className="flex-1 h-12 rounded-xl bg-gray-900 text-white font-semibold disabled:opacity-30">
                    {t('members.addBtn')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-3 pb-4 pt-safe">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-lg active:bg-secondary">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">{t('members.title')}</h1>
        </div>
        <button onClick={openAddSheet}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white mr-2">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Member list */}
      <div className="px-5 space-y-2">
        {members.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">
            {t('add.noMembers')}
          </p>
        )}
        {members.map(m => {
          const emoji = getEmoji(m);
          const color = getColor(m);
          const isEditing = editingId === m.id;
          const roleDef = m.role ? MEMBER_ROLES.find(r => r.id === m.role) : null;

          return (
            <div key={m.id}
              className={`flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-sm transition-opacity ${m.hidden ? 'opacity-40' : ''}`}>

              {/* Emoji icon — tap to change */}
              <button onClick={() => setEmojiPickerFor(m.id)}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: `${color}20` }}>
                {emoji || m.name.charAt(0).toUpperCase()}
              </button>

              {/* Name / inline edit */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <Input value={editName} onChange={e => setEditName(e.target.value)}
                      className="h-8 rounded-lg text-sm py-0" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(m.id); if (e.key === 'Escape') setEditingId(null); }} />
                    <button onClick={() => saveEdit(m.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white shrink-0">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border shrink-0">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(m.id, m.name)} className="text-left w-full">
                    <p className="font-medium text-sm truncate">{m.name}</p>
                    {roleDef && <p className="text-[11px] text-muted-foreground">{t(roleDef.labelKey)}</p>}
                  </button>
                )}
              </div>

              {/* Show/hide toggle */}
              <button onClick={() => toggleHidden(m.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground shrink-0">
                {m.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>

              {/* Delete */}
              <button onClick={() => setPendingDeleteId(m.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
