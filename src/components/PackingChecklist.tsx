import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import packingLists from '../data/packingLists.json';

interface PackingItem { title: string; note?: string }
interface PackingGroup { group: string; icon: string; items: PackingItem[] }

const LISTS = packingLists as Record<string, PackingGroup[]>;

export const hasPackingList = (tripId: string) => !!LISTS[tripId]?.length;

const keyOf = (tripId: string) => `keeptrip-packing-${tripId}`;
const load = (tripId: string): string[] => {
  try { return JSON.parse(localStorage.getItem(keyOf(tripId)) || '[]'); } catch { return []; }
};

export const PackingChecklist: React.FC<{ tripId: string }> = ({ tripId }) => {
  const groups = LISTS[tripId] || [];
  const [done, setDone] = useState<Set<string>>(() => new Set(load(tripId)));

  useEffect(() => { setDone(new Set(load(tripId))); }, [tripId]);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(keyOf(tripId), JSON.stringify([...next])); } catch { /* 저장 불가 시 무시 */ }
      return next;
    });
  };

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const checked = groups.reduce((n, g, gi) => n + g.items.filter((_, i) => done.has(`${gi}-${i}`)).length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">짐 싸기 체크리스트</span>
        <span className="font-black text-[#1E2856]">{checked} / {total} 챙김</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g, gi) => {
          const gDone = g.items.filter((_, i) => done.has(`${gi}-${i}`)).length;
          return (
            <section key={g.group} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <h3 className="flex items-center justify-between text-sm font-extrabold text-[#111827] mb-2">
                <span>{g.icon} {g.group}</span>
                <span className={`text-[11px] font-bold ${gDone === g.items.length ? 'text-[#27AE60]' : 'text-slate-400'}`}>
                  {gDone}/{g.items.length}
                </span>
              </h3>
              <ul className="space-y-1">
                {g.items.map((it, i) => {
                  const id = `${gi}-${i}`;
                  const on = done.has(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="w-full flex items-start gap-2.5 text-left py-1.5 px-1 rounded-lg hover:bg-slate-50"
                      >
                        <span className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 ${on ? 'bg-[#27AE60] text-white' : 'border-2 border-slate-300 bg-white'}`}>
                          {on && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold leading-snug ${on ? 'line-through text-slate-400' : 'text-[#111827]'}`}>{it.title}</span>
                          {it.note && <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">{it.note}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};
