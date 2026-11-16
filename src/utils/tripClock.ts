import { TripData } from '../types/travel';

export type TripPhase = 'before' | 'during' | 'after' | 'unknown';

export interface TripClock {
  phase: TripPhase;
  dDay: number; // 출발까지 남은 날(출발 당일 0)
  dayIndex: number; // 진행 중이면 오늘 DAY 인덱스
  nextStopIndex: number; // 오늘 일정 중 지금/다음 순서 (-1: 해당 없음)
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** 'YYYY.MM.DD' 연도 + '11월 18일' 형식으로 각 DAY 날짜를 만든다. 형식이 다르면 null */
export const getDayDates = (trip: TripData): Date[] | null => {
  const y = trip.dateRange.match(/(20\d{2})/);
  if (!y || !trip.days.length) return null;
  let year = Number(y[1]);
  let prevMonth = 0;
  const out: Date[] = [];
  for (const d of trip.days) {
    const m = d.date.match(/(\d{1,2})월\s*(\d{1,2})일/);
    if (!m) return null;
    const month = Number(m[1]);
    if (month < prevMonth) year += 1; // 연말 → 연초
    prevMonth = month;
    out.push(new Date(year, month - 1, Number(m[2])));
  }
  return out;
};

const toMinutes = (t?: string) => {
  const m = t?.match(/(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

/** 오늘 일정에서 '지금/다음' 순서: 아직 시작 안 한 첫 일정, 다 지났으면 마지막 */
export const findNextStopIndex = (trip: TripData, dayIndex: number, now: Date) => {
  const stops = trip.days[dayIndex]?.stops || [];
  const cur = now.getHours() * 60 + now.getMinutes();
  let last = -1;
  for (let i = 0; i < stops.length; i++) {
    const t = toMinutes(stops[i].time);
    if (t === null) continue;
    last = i;
    if (t >= cur - 30) return i; // 시작 후 30분까지는 '지금'
  }
  return last;
};

export const getTripClock = (trip: TripData, now: Date = new Date()): TripClock => {
  const dates = getDayDates(trip);
  if (!dates) return { phase: 'unknown', dDay: 0, dayIndex: 0, nextStopIndex: -1 };
  const today = startOfDay(now).getTime();
  const first = dates[0].getTime();
  const last = dates[dates.length - 1].getTime();
  const dDay = Math.round((first - today) / 86400000);
  if (today < first) return { phase: 'before', dDay, dayIndex: 0, nextStopIndex: -1 };
  if (today > last) return { phase: 'after', dDay, dayIndex: dates.length - 1, nextStopIndex: -1 };
  const dayIndex = Math.max(0, dates.findIndex((d) => d.getTime() === today));
  return { phase: 'during', dDay, dayIndex, nextStopIndex: findNextStopIndex(trip, dayIndex, now) };
};
