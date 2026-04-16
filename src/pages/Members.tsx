import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { useMembers } from '@/hooks/useStore';
import { MEMBER_COLORS } from '@/types';
import type { FamilyMember } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Members() {
  const navigate = useNavigate();
  const { members, save, remove } = useMembers();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(MEMBER_COLORS[0]);

  const handleAdd = async () => {
    if (!name.trim()) return;
    const member: FamilyMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
    };
    await save(member);
    setName('');
    setAdding(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 safe-top">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Family Members</h1>
      </div>

      <div className="px-5 space-y-3">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: m.color }}>
              {m.name[0]}
            </div>
            <p className="flex-1 font-medium">{m.name}</p>
            <button onClick={() => remove(m.id)} className="p-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {adding ? (
          <div className="rounded-xl bg-card p-4 shadow-sm space-y-3">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name"
              className="rounded-xl"
              autoFocus
            />
            <div className="flex gap-2">
              {MEMBER_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} size="sm" className="rounded-xl" disabled={!name.trim()}>Add</Button>
              <Button onClick={() => setAdding(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border p-4 w-full text-muted-foreground text-sm"
          >
            <Plus className="h-4 w-4" /> Add member
          </button>
        )}
      </div>
    </div>
  );
}
