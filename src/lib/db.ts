import config from '../data/supabaseConfig.json';
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
const OUTBOX = 'keeptrip_packing_outbox';
const readOutbox = (): Record<string, boolean> => { try { return JSON.parse(localStorage.getItem(OUTBOX) || '{}'); } catch { return {}; } };
const writeOutbox = (o: Record<string, boolean>) => { try { localStorage.setItem(OUTBOX, JSON.stringify(o)); } catch { /* 저장 불가 */ } };
const patchChecked = (id: number, checked: boolean) =>
  rest<PackingItemRow[]>(`packing_items?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ checked }) });

/** 오프라인 동안 쌓인 체크를 서버로 전송 */
export const flushPackingOutbox = async () => {
  const o = readOutbox();
  for (const [id, checked] of Object.entries(o)) {
    try { await patchChecked(Number(id), checked); const cur = readOutbox(); if (cur[id] === checked) { delete cur[id]; writeOutbox(cur); } }
    catch { return; }
  }
};

export const fetchPacking = async (tripId: string) => {
  const groups = await rest<PackingGroupRow[]>(`packing_groups?select=*&trip_id=eq.${encodeURIComponent(tripId)}&order=position,id`);
  const ids = groups.map((g) => g.id).join(',');
  const raw = ids ? await rest<PackingItemRow[]>(`packing_items?select=*&group_id=in.(${ids})&order=position,id`) : [];
  const o = readOutbox();
  const items = raw.map((i) => (String(i.id) in o ? { ...i, checked: o[String(i.id)] } : i));
  return { groups, items };
};
export const addPackingItem = (groupId: number, title: string) =>
  rest<PackingItemRow[]>('packing_items', { method: 'POST', body: JSON.stringify({ group_id: groupId, title, is_custom: true, position: 1000 }) }).then((r) => r[0]);
export const setPackingChecked = async (id: number, checked: boolean) => {
  try {
    const r = await patchChecked(id, checked);
    const o = readOutbox(); if (String(id) in o) { delete o[String(id)]; writeOutbox(o); }
    return r;
  } catch (e) {
    // 네트워크 없음(TypeError) → 기기에 저장해 두고 연결되면 전송
    if (e instanceof TypeError || !navigator.onLine) { writeOutbox({ ...readOutbox(), [String(id)]: checked }); return []; }
    throw e;
  }
};
export const deletePackingItem = (id: number) => rest(`packing_items?id=eq.${id}&is_custom=eq.true`, { method: 'DELETE' });
export const addPackingGroup = (tripId: string, name: string) =>
  rest<PackingGroupRow[]>('packing_groups', { method: 'POST', body: JSON.stringify({ trip_id: tripId, name, is_custom: true, position: 1000 }) }).then((r) => r[0]);
export const deletePackingGroup = (id: number) => rest(`packing_groups?id=eq.${id}&is_custom=eq.true`, { method: 'DELETE' });

// ---- 새 일정 저장 ----
export const saveNewTrip = (trip: TripData) => rest<string>('rpc/add_trip', { method: 'POST', body: JSON.stringify({ t: trip }) });
