"""짐 싸기: 그룹마다 '+ 항목 추가' 입력 · 내가 추가한 항목 삭제 · 새 그룹 추가 (기기에 저장)."""
from pathlib import Path

R = Path(__file__).resolve().parent.parent
(R / "src/components/PackingChecklist.tsx").write_text("""import React, { useEffect, useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import packingLists from '../data/packingLists.json';

interface PackingItem { title: string; note?: string }
interface PackingGroup { group: string; icon: string; items: PackingItem[] }
type Custom = { items: Record<string, string[]>; groups: string[] };

const LISTS = packingLists as Record<string, PackingGroup[]>;

export const hasPackingList = (_tripId: string) => true;

const doneKey = (t: string) => `keeptrip-packing-${t}`;
const customKey = (t: string) => `keeptrip-packing-custom-${t}`;
const read = <T,>(k: string, fb: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 저장 불가 시 무시 */ } };
const EMPTY: Custom = { items: {}, groups: [] };

const AddRow: React.FC<{ placeholder: string; onAdd: (text: string) => void }> = ({ placeholder, onAdd }) => {
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
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-[#1E2856] outline-none"
      />
      <button type="submit" className="shrink-0 w-9 h-9 rounded-lg bg-[#1E2856] text-white flex items-center justify-center" aria-label="추가">
        <Plus className="w-4 h-4" />
      </button>
    </form>
  );
};

export const PackingChecklist: React.FC<{ tripId: string }> = ({ tripId }) => {
  const [done, setDone] = useState<Set<string>>(() => new Set(read<string[]>(doneKey(tripId), [])));
  const [custom, setCustom] = useState<Custom>(() => read<Custom>(customKey(tripId), EMPTY));

  useEffect(() => {
    setDone(new Set(read<string[]>(doneKey(tripId), [])));
    setCustom(read<Custom>(customKey(tripId), EMPTY));
  }, [tripId]);

  const base = LISTS[tripId] || [];
  const groups: PackingGroup[] = [
    ...base,
    ...custom.groups.filter((g) => !base.some((b) => b.group === g)).map((g) => ({ group: g, icon: '📝', items: [] })),
  ];

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      write(doneKey(tripId), [...next]);
      return next;
    });
  };
  const saveCustom = (c: Custom) => { setCustom(c); write(customKey(tripId), c); };
  const addItem = (group: string, text: string) => {
    const list = custom.items[group] || [];
    if (list.includes(text)) return;
    saveCustom({ ...custom, items: { ...custom.items, [group]: [...list, text] } });
  };
  const removeItem = (group: string, text: string) => {
    saveCustom({ ...custom, items: { ...custom.items, [group]: (custom.items[group] || []).filter((t) => t !== text) } });
  };
  const addGroup = (name: string) => {
    if (groups.some((g) => g.group === name)) return;
    saveCustom({ ...custom, groups: [...custom.groups, name] });
  };
  const removeGroup = (name: string) => {
    const items = { ...custom.items };
    delete items[name];
    saveCustom({ groups: custom.groups.filter((g) => g !== name), items });
  };

  // 항목 id: 기본 항목은 '그룹순번-항목순번', 추가 항목은 'c:그룹:내용'
  const rows = groups.map((g, gi) => ({
    g,
    isCustomGroup: gi >= base.length,
    items: [
      ...g.items.map((it, i) => ({ id: `${gi}-${i}`, title: it.title, note: it.note, mine: false })),
      ...(custom.items[g.group] || []).map((t) => ({ id: `c:${g.group}:${t}`, title: t, note: undefined as string | undefined, mine: true })),
    ],
  }));
  const total = rows.reduce((n, r) => n + r.items.length, 0);
  const checked = rows.reduce((n, r) => n + r.items.filter((it) => done.has(it.id)).length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">짐 싸기 체크리스트 · 각 그룹 아래에서 항목을 추가할 수 있어요</span>
        <span className="font-black text-[#1E2856] shrink-0 ml-2">{checked} / {total} 챙김</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map(({ g, items, isCustomGroup }) => {
          const gDone = items.filter((it) => done.has(it.id)).length;
          return (
            <section key={g.group} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <h3 className="flex items-center justify-between text-sm font-extrabold text-[#111827] mb-2">
                <span>{g.icon} {g.group}</span>
                <span className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${items.length && gDone === items.length ? 'text-[#27AE60]' : 'text-slate-400'}`}>
                    {gDone}/{items.length}
                  </span>
                  {isCustomGroup && (
                    <button type="button" onClick={() => removeGroup(g.group)} className="text-slate-400 hover:text-rose-600" aria-label={`${g.group} 그룹 삭제`}>
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </span>
              </h3>
              <ul className="space-y-1">
                {items.map((it) => {
                  const on = done.has(it.id);
                  return (
                    <li key={it.id} className="flex items-start gap-1">
                      <button
                        type="button"
                        onClick={() => toggle(it.id)}
                        className="flex-1 min-w-0 flex items-start gap-2.5 text-left py-1.5 px-1 rounded-lg hover:bg-slate-50"
                      >
                        <span className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 ${on ? 'bg-[#27AE60] text-white' : 'border-2 border-slate-300 bg-white'}`}>
                          {on && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold leading-snug ${on ? 'line-through text-slate-400' : 'text-[#111827]'}`}>{it.title}</span>
                          {it.note && <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">{it.note}</span>}
                        </span>
                      </button>
                      {it.mine && (
                        <button type="button" onClick={() => removeItem(g.group, it.title)} className="shrink-0 p-2 text-slate-300 hover:text-rose-600" aria-label={`${it.title} 삭제`}>
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <AddRow placeholder="+ 항목 추가 (예: 우비)" onAdd={(t) => addItem(g.group, t)} />
            </section>
          );
        })}
        <section className="rounded-2xl border border-dashed border-slate-300 p-4">
          <h3 className="text-sm font-extrabold text-slate-600">📝 새 그룹 만들기</h3>
          <AddRow placeholder="그룹 이름 (예: 선물 · 아이 짐)" onAdd={addGroup} />
        </section>
      </div>
    </div>
  );
};
""", encoding="utf-8")
print("ok")
