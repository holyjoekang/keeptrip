import React, { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import snapshot from '../data/dbSnapshot.json';
import {
  DbSnapshot, PackingGroupRow, PackingItemRow, fetchPacking, addPackingItem, setPackingChecked,
  deletePackingItem, addPackingGroup, deletePackingGroup,
} from '../lib/db';

const SNAP = snapshot as unknown as DbSnapshot;
const fromSnapshot = (tripId: string) => {
  const groups = (SNAP.packingGroups as PackingGroupRow[]).filter((g) => g.trip_id === tripId);
  const ids = new Set(groups.map((g) => g.id));
  return { groups, items: (SNAP.packingItems as PackingItemRow[]).filter((i) => ids.has(i.group_id)) };
};

export const hasPackingList = (_tripId: string) => true;

const AddRow: React.FC<{ placeholder: string; onAdd: (text: string) => void; disabled?: boolean }> = ({ placeholder, onAdd, disabled }) => {
  const [text, setText] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText('');
  };
  return (
    <form onSubmit={submit} className="flex items-center gap-2 mt-2">
      <input
        value={text}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1E2856] outline-none disabled:bg-slate-50"
      />
      <button type="submit" disabled={disabled} className="shrink-0 w-9 h-9 rounded-lg bg-[#1E2856] text-white flex items-center justify-center disabled:opacity-40" aria-label="추가">
        <Plus className="w-4 h-4" />
      </button>
    </form>
  );
};

export const PackingChecklist: React.FC<{ tripId: string }> = ({ tripId }) => {
  const [groups, setGroups] = useState<PackingGroupRow[]>(() => fromSnapshot(tripId).groups);
  const [items, setItems] = useState<PackingItemRow[]>(() => fromSnapshot(tripId).items);
  const [online, setOnline] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const snap = fromSnapshot(tripId);
    setGroups(snap.groups);
    setItems(snap.items);
    fetchPacking(tripId)
      .then((r) => { if (alive) { setGroups(r.groups); setItems(r.items); setOnline(true); } })
      .catch(() => alive && setOnline(false));
    return () => { alive = false; };
  }, [tripId]);

  const fail = (e: unknown) => { console.warn(e); setError('저장하지 못했어요. 인터넷 연결을 확인해 주세요.'); };

  const toggle = (it: PackingItemRow) => {
    setItems((p) => p.map((x) => (x.id === it.id ? { ...x, checked: !x.checked } : x)));
    setPackingChecked(it.id, !it.checked).catch((e) => {
      setItems((p) => p.map((x) => (x.id === it.id ? { ...x, checked: it.checked } : x)));
      fail(e);
    });
  };
  const addItem = (g: PackingGroupRow, title: string) => {
    if (items.some((i) => i.group_id === g.id && i.title === title)) return;
    addPackingItem(g.id, title).then((row) => { setItems((p) => [...p, row]); setError(''); }).catch(fail);
  };
  const removeItem = (it: PackingItemRow) => {
    setItems((p) => p.filter((x) => x.id !== it.id));
    deletePackingItem(it.id).catch((e) => { setItems((p) => [...p, it]); fail(e); });
  };
  const addGroup = (name: string) => {
    if (groups.some((g) => g.name === name)) return;
    addPackingGroup(tripId, name).then((row) => { setGroups((p) => [...p, row]); setError(''); }).catch(fail);
  };
  const removeGroup = (g: PackingGroupRow) => {
    setGroups((p) => p.filter((x) => x.id !== g.id));
    deletePackingGroup(g.id).catch((e) => { setGroups((p) => [...p, g]); fail(e); });
  };

  const total = items.length;
  const checked = items.filter((i) => i.checked).length;
  const canEdit = online === true && navigator.onLine;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">
          짐 싸기 체크리스트 · {online === false || !navigator.onLine ? '오프라인 · 체크는 기기에 저장, 연결되면 자동 반영' : '각 그룹 아래에서 항목을 추가할 수 있어요'}
        </span>
        <span className="font-black text-[#1E2856] shrink-0 ml-2">{checked} / {total} 챙김</span>
      </div>
      {error && <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g) => {
          const gi = items.filter((i) => i.group_id === g.id);
          const gDone = gi.filter((i) => i.checked).length;
          return (
            <section key={g.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <h3 className="flex items-center justify-between text-sm font-extrabold text-[#111827] mb-2">
                <span>{g.icon || '📝'} {g.name}</span>
                <span className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${gi.length && gDone === gi.length ? 'text-[#27AE60]' : 'text-slate-400'}`}>
                    {gDone}/{gi.length}
                  </span>
                  {g.is_custom && canEdit && (
                    <button type="button" onClick={() => removeGroup(g)} className="text-slate-400 hover:text-rose-600" aria-label={`${g.name} 그룹 삭제`}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              </h3>
              <ul className="space-y-1">
                {gi.map((it) => (
                  <li key={it.id} className="flex items-start gap-1">
                    <button
                      type="button"
                      onClick={() => toggle(it)}
                      className="flex-1 min-w-0 flex items-start gap-2.5 text-left py-1.5 px-1 rounded-lg hover:bg-slate-50"
                    >
                      <span className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 ${it.checked ? 'bg-[#27AE60] text-white' : 'border-2 border-slate-300 bg-white'}`}>
                        {it.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                      <span className="min-w-0">
                        <span className={`block text-sm font-semibold leading-snug ${it.checked ? 'line-through text-slate-400' : 'text-[#111827]'}`}>{it.title}</span>
                        {it.note && <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">{it.note}</span>}
                      </span>
                    </button>
                    {it.is_custom && canEdit && (
                      <button type="button" onClick={() => removeItem(it)} className="shrink-0 p-2 text-slate-300 hover:text-rose-600" aria-label={`${it.title} 삭제`}>
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <AddRow placeholder="+ 항목 추가 (예: 우비)" onAdd={(t) => addItem(g, t)} disabled={!canEdit} />
            </section>
          );
        })}
        <section className="rounded-2xl border border-dashed border-slate-300 p-4">
          <h3 className="text-sm font-extrabold text-slate-600">📝 새 그룹 만들기</h3>
          <AddRow placeholder="그룹 이름 (예: 선물 · 아이 짐)" onAdd={addGroup} disabled={!canEdit} />
        </section>
      </div>
    </div>
  );
};
