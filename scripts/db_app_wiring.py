"""앱이 Supabase(keepTrip) DB에서 일정 · 장소안내 · 짐싸기를 읽고 쓰도록 연결.
- 번들 폴백: src/data/dbSnapshot.json (python3 scripts/supabase_sync.py pull 로 갱신)
- 새 일정(앱의 '새 일정 등록')은 DB의 add_trip 함수로 저장
"""
import re
from pathlib import Path

R = Path(__file__).resolve().parent.parent
def sub(path, pairs):
    p = R / path; s = p.read_text(encoding="utf-8")
    for old, new in pairs:
        if new in s:
            continue
        assert s.count(old) == 1, (path, old[:70])
        s = s.replace(old, new)
    p.write_text(s, encoding="utf-8")

# 1) DB 클라이언트 + 조립
(R / "src/lib/db.ts").parent.mkdir(exist_ok=True)
(R / "src/lib/db.ts").write_text("""import config from '../data/supabaseConfig.json';
import type { TripData, DayPlan, ItineraryStop, ChecklistItem } from '../types/travel';
import type { SpotGuide } from '../utils/spotGuide';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
export interface DbSnapshot {
  trips: Row[]; days: Row[]; stops: Row[]; checklist: Row[]; guides: Row[]; packingGroups: Row[]; packingItems: Row[];
}
export interface PackingItemRow { id: number; group_id: number; position: number; title: string; note: string | null; is_custom: boolean; checked: boolean }
export interface PackingGroupRow { id: number; trip_id: string; position: number; name: string; icon: string | null; is_custom: boolean }

const URL_BASE = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || config.url;
const KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || config.anonKey;

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`DB ${res.status}: ${await res.text()}`);
  const t = await res.text();
  return (t ? JSON.parse(t) : null) as T;
}

const und = <T,>(v: T | null | undefined) => (v === null ? undefined : v);

export const fetchSnapshot = async (): Promise<DbSnapshot> => {
  const [trips, days, stops, checklist, guides, packingGroups, packingItems] = await Promise.all([
    rest<Row[]>('trips?select=*&order=sort_order'),
    rest<Row[]>('trip_days?select=*&order=trip_id,day_number'),
    rest<Row[]>('trip_stops?select=*&order=trip_id,day_number,position'),
    rest<Row[]>('checklist_items?select=*&order=trip_id,position'),
    rest<Row[]>('spot_guides?select=*'),
    rest<Row[]>('packing_groups?select=*&order=trip_id,position,id'),
    rest<Row[]>('packing_items?select=*&order=group_id,position,id'),
  ]);
  return { trips, days, stops, checklist, guides, packingGroups, packingItems };
};

const toStop = (s: Row): ItineraryStop => ({
  id: und(s.stop_key), time: und(s.time), title: s.title, description: und(s.description), category: und(s.category),
  feeTip: und(s.fee_tip), smartTip: und(s.smart_tip), docent: und(s.docent), isRecommended: und(s.is_recommended),
  localName: und(s.local_name), address: und(s.address), guideId: und(s.guide_id),
});

export const toTrips = (snap: DbSnapshot): TripData[] =>
  snap.trips.map((t) => {
    const days: DayPlan[] = snap.days
      .filter((d) => d.trip_id === t.id)
      .map((d) => ({
        dayNumber: d.day_number, date: d.date, dayOfWeek: d.day_of_week, city: d.city, theme: d.theme,
        dayHighlights: d.day_highlights || [], dayReflection: und(d.day_reflection),
        stops: snap.stops.filter((s) => s.trip_id === t.id && s.day_number === d.day_number).map(toStop),
      }));
    const checklist: ChecklistItem[] = snap.checklist
      .filter((c) => c.trip_id === t.id)
      .map((c) => ({
        id: c.id, tier: c.tier, category: c.category, title: c.title, description: c.description || '',
        estimatedSavingKrw: und(c.estimated_saving_krw), actionTip: und(c.action_tip), completed: false,
      }));
    return {
      id: t.id, title: t.title, subtitle: t.subtitle || '', dateRange: t.date_range || '', durationText: t.duration_text || '',
      partyText: t.party_text || '', destinationType: t.destination_type, heroImage: t.hero_image || '',
      defaultBudgetKrw: t.default_budget_krw || 0, days, checklist, keyRules: t.key_rules || [],
      bestMoments: und(t.best_moments), initialVoiceNotes: und(t.initial_voice_notes), sourceUrl: und(t.source_url),
    };
  });

export const toGuides = (snap: DbSnapshot): Record<string, SpotGuide> =>
  Object.fromEntries(snap.guides.map((g) => [g.id, {
    name: g.name, localName: g.local_name, address: g.address, summary: g.summary, info: g.info || [], good: g.good || [],
    caution: g.caution || [], sources: g.sources || [], photos: g.photos || [], photoNote: und(g.photo_note),
  }]));

// ---- 짐 싸기 ----
export const fetchPacking = async (tripId: string) => {
  const groups = await rest<PackingGroupRow[]>(`packing_groups?select=*&trip_id=eq.${encodeURIComponent(tripId)}&order=position,id`);
  const ids = groups.map((g) => g.id).join(',');
  const items = ids ? await rest<PackingItemRow[]>(`packing_items?select=*&group_id=in.(${ids})&order=position,id`) : [];
  return { groups, items };
};
export const addPackingItem = (groupId: number, title: string) =>
  rest<PackingItemRow[]>('packing_items', { method: 'POST', body: JSON.stringify({ group_id: groupId, title, is_custom: true, position: 1000 }) }).then((r) => r[0]);
export const setPackingChecked = (id: number, checked: boolean) =>
  rest<PackingItemRow[]>(`packing_items?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ checked }) });
export const deletePackingItem = (id: number) => rest(`packing_items?id=eq.${id}&is_custom=eq.true`, { method: 'DELETE' });
export const addPackingGroup = (tripId: string, name: string) =>
  rest<PackingGroupRow[]>('packing_groups', { method: 'POST', body: JSON.stringify({ trip_id: tripId, name, is_custom: true, position: 1000 }) }).then((r) => r[0]);
export const deletePackingGroup = (id: number) => rest(`packing_groups?id=eq.${id}&is_custom=eq.true`, { method: 'DELETE' });

// ---- 새 일정 저장 ----
export const saveNewTrip = (trip: TripData) => rest<string>('rpc/add_trip', { method: 'POST', body: JSON.stringify({ t: trip }) });
""", encoding="utf-8")

# 2) 번들 데이터: DB 스냅샷에서 조립
(R / "src/data/presetTrips.ts").write_text("""import { TripData } from '../types/travel';
import snapshot from './dbSnapshot.json';
import { DbSnapshot, toTrips } from '../lib/db';

// 일정 원본은 Supabase(keepTrip) DB. 이 번들은 DB 스냅샷(오프라인 · 첫 화면용)
// 갱신: python3 scripts/supabase_sync.py pull
export const PRESET_TRIPS: TripData[] = toTrips(snapshot as unknown as DbSnapshot);
""", encoding="utf-8")
(R / "src/data/proposalTrips.ts").unlink(missing_ok=True)

# 3) 장소 안내: 스냅샷 + DB 최신값으로 교체 가능
sub("src/utils/spotGuide.ts", [
    ("import guides from '../data/spotGuides.json';\n", "import snapshot from '../data/dbSnapshot.json';\nimport { DbSnapshot, toGuides } from '../lib/db';\n"),
    ("const G = guides as Record<string, SpotGuide>;", "let G: Record<string, SpotGuide> = toGuides(snapshot as unknown as DbSnapshot);\nexport const setSpotGuides = (g: Record<string, SpotGuide>) => { G = g; };"),
])
(R / "src/data/spotGuides.json").unlink(missing_ok=True)
(R / "src/data/packingLists.json").unlink(missing_ok=True)

# 4) App: 시작 시 DB에서 최신 일정 · 장소안내 불러오기, 새 일정은 DB 저장
sub("src/App.tsx", [
    ("import { getTripClock } from './utils/tripClock';",
     "import { getTripClock } from './utils/tripClock';\nimport { fetchSnapshot, toTrips, toGuides, saveNewTrip } from './lib/db';\nimport { setSpotGuides } from './utils/spotGuide';"),
    ("""  useEffect(() => {
    localStorage.setItem('my_travel_trips', JSON.stringify(trips));
  }, [trips]);""",
     """  useEffect(() => {
    localStorage.setItem('my_travel_trips', JSON.stringify(trips));
  }, [trips]);

  // DB(keepTrip)에서 최신 일정 · 장소 안내 불러오기 (실패하면 번들 스냅샷 유지)
  useEffect(() => {
    let alive = true;
    fetchSnapshot()
      .then((snap) => {
        if (!alive) return;
        setSpotGuides(toGuides(snap));
        const fresh = toTrips(snap);
        setTrips((prev) => [...fresh, ...prev.filter((p) => !fresh.some((f) => f.id === p.id) && !PRESET_TRIPS.some((pr) => pr.id === p.id))]);
        setChecklists((prev) => {
          const next = { ...prev };
          fresh.forEach((t) => {
            const done = new Set((prev[t.id] || []).filter((i) => i.completed).map((i) => i.id));
            next[t.id] = t.checklist.map((i) => ({ ...i, completed: done.has(i.id) }));
          });
          return next;
        });
      })
      .catch((e) => console.warn('DB 불러오기 실패, 저장된 데이터 사용', e));
    return () => { alive = false; };
  }, []);"""),
    ("""  const handleAddTrip = (newTrip: TripData) => {
    setTrips((prev) => [newTrip, ...prev]);""",
     """  const handleAddTrip = (newTrip: TripData) => {
    setTrips((prev) => [newTrip, ...prev]);
    saveNewTrip(newTrip).catch((e) => console.warn('새 일정 DB 저장 실패 (이 기기에는 저장됨)', e));"""),
])

# 5) 짐 싸기: DB 읽기/쓰기
(R / "src/components/PackingChecklist.tsx").write_text("""import React, { useEffect, useState } from 'react';
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
  const canEdit = online === true;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">
          짐 싸기 체크리스트 · {online === false ? '오프라인 (보기만 가능)' : '각 그룹 아래에서 항목을 추가할 수 있어요'}
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
                      onClick={() => canEdit && toggle(it)}
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
""", encoding="utf-8")
print("ok")
