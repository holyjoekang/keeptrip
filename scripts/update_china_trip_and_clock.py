"""충칭·청두 일정을 실제 예약(항공·숙소·기차)으로 갱신 + 접속 시각 기반 첫 화면 자동 선택."""
from pathlib import Path

R = Path(__file__).resolve().parent.parent
def sub(path, pairs):
    p = R / path; s = p.read_text(encoding="utf-8")
    for old, new in pairs:
        if new in s:
            continue
        assert s.count(old) == 1, (path, old[:60])
        s = s.replace(old, new)
    p.write_text(s, encoding="utf-8")

HOTEL_CQ = "오우첸 스카이라이즈 리버사이드 호텔 (래플스 시티 충칭)"
HOTEL_CD = "파크 인 바이 라디슨 청두 춘시루 타이쿠리"

# ---------- 1) 일정 데이터 ----------
sub("src/data/presetTrips.ts", [
    ("dayHighlights: ['인천 14:00 출발 → 충칭 CKG 착륙', '해방비(解放碑) 보행가 체크인',",
     "dayHighlights: ['CA440 인천 T1 14:00 → 충칭 장베이 T3 16:55', '래플스 시티 오우첸 호텔 체크인 (2박)',"),
    ("""            title: '인천 ICN 이륙',
            description: '충칭 직항 탑승 · 비행시간 약 3시간 50분',""",
     """            title: 'CA440 인천 T1 출발',
            description: '에어차이나 CA440 · 인천국제공항 T1 → 충칭 장베이 T3 · 3시간 55분',"""),
    ("""            time: '17:15',
            title: '충칭 장베이 공항(CKG) 착륙',""",
     """            time: '16:55',
            title: '충칭 장베이 국제공항 T3 도착',"""),
    ("""            time: '18:45',
            title: '해방비 중심가 호텔 체크인',
            description: '2박 머무를 숙소 도착 및 짐 풀기',""",
     f"""            time: '18:30',
            title: '{HOTEL_CQ} 체크인',
            description: '重庆欧辰高空江景酒店(解放碑来福士广场) · 시티뷰 복층 퀸룸 2실 + 복층 퀸룸(혼합 전망) 2실 · 11/18–11/20 2박',"""),
    ("{ time: '09:00', title: '호텔 체크아웃 후 충칭북역 이동', description: '열차 출발 35분 전 역 도착 필수', category: 'transit' },",
     "{ time: '09:20', title: '호텔 체크아웃 후 사핑바역(沙坪坝) 이동', description: '해방비 → 사핑바역 택시 약 30분 · 열차 출발 35분 전 역 도착 필수', category: 'transit' },"),
    ("{ time: '10:15', title: '고속철 G8622 충칭북 → 청두동', description: '시속 300km로 쓰촨 분지 주파', category: 'transit' },",
     "{ time: '10:30', title: '고속철 사핑바 → 청두동', description: '사핑바(沙坪坝) 10:30 출발 → 청두동(成都东) 11:32 도착 · 1시간 2분 · 실물 여권으로 탑승', category: 'transit' },"),
    ("{ time: '11:40', title: '청두동역 도착 & 호텔 체크인', description: '청두 시내 호텔 체크인', category: 'hotel' },",
     f"{{ time: '12:15', title: '{HOTEL_CD} 체크인', description: '成都春熙路太古里丽柏酒店 · 부티크 퀸룸 4실 · 11/20–11/22 2박 (이른 도착 시 짐 보관)', category: 'hotel' }},"),
    ("dayHighlights: ['충칭북역 → 청두동역 고속철 (1시간 20분)',",
     "dayHighlights: ['사핑바 10:30 → 청두동 11:32 고속철 (1시간 2분)',"),
    ("dayHighlights: ['청두 공항 이동', '청두 12:55 출발 → 인천 귀국',",
     "dayHighlights: ['청두 톈푸 공항 T1 이동', 'CA401 청두 08:30 → 인천 12:55',"),
    ("""          { time: '08:30', title: '호텔 체크아웃 및 공항 이동', category: 'transit' },
          { time: '12:55', title: '청두 이륙 → 인천 향발', category: 'flight' },
          { time: '17:30', title: '인천 ICN 착륙', category: 'transit' }""",
     """          { time: '05:40', title: '호텔 체크아웃 및 톈푸 공항 이동', description: '춘시루 → 청두 톈푸 국제공항(TFU) 차량 약 1시간 · 출발 2시간 전 도착', category: 'transit' },
          { time: '08:30', title: 'CA401 청두 톈푸 T1 출발', description: '에어차이나 CA401 · 청두 톈푸 국제공항 T1 → 인천국제공항 T1 · 3시간 25분', category: 'flight' },
          { time: '12:55', title: '인천국제공항 T1 도착', category: 'transit' }"""),
    ("theme: '아침 차 한 잔 후 서울로 귀환',", "theme: '이른 아침 톈푸 공항 출발 · 서울 귀환',"),
])

# ---------- 2) 접속 시각 → 일정 단계 계산 ----------
(R / "src/utils/tripClock.ts").write_text("""import { TripData } from '../types/travel';

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
  const y = trip.dateRange.match(/(20\\d{2})/);
  if (!y || !trip.days.length) return null;
  let year = Number(y[1]);
  let prevMonth = 0;
  const out: Date[] = [];
  for (const d of trip.days) {
    const m = d.date.match(/(\\d{1,2})월\\s*(\\d{1,2})일/);
    if (!m) return null;
    const month = Number(m[1]);
    if (month < prevMonth) year += 1; // 연말 → 연초
    prevMonth = month;
    out.push(new Date(year, month - 1, Number(m[2])));
  }
  return out;
};

const toMinutes = (t?: string) => {
  const m = t?.match(/(\\d{1,2}):(\\d{2})/);
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
""", encoding="utf-8")

# ---------- 3) 일정 진입 시 첫 화면 자동 선택 ----------
sub("src/App.tsx", [
    ("import { TripOverview } from './components/TripOverview';",
     "import { TripOverview } from './components/TripOverview';\nimport { getTripClock } from './utils/tripClock';"),
    ("""  const [activeTab, setActiveTab] = useState<KeepTripTab>('overview');
""",
     """  // 접속 시각 기준 첫 화면: 출발 전 → 준비, 여행 중 → 오늘(현재 DAY), 다녀온 뒤 → 스토리
  const startViewFor = (id: string): { tab: KeepTripTab; day: number } => {
    const t = trips.find((x) => x.id === id);
    const c = t ? getTripClock(t) : null;
    if (!c || c.phase === 'unknown') return { tab: 'overview', day: 0 };
    if (c.phase === 'before') return { tab: 'prep', day: 0 };
    if (c.phase === 'after') return { tab: 'story', day: 0 };
    return { tab: 'today', day: c.dayIndex };
  };
  const [activeTab, setActiveTab] = useState<KeepTripTab>(() => startViewFor(selectedTripId).tab);
"""),
    ("""      if (id) {
        setSelectedTripId(id);
        setView('trip');""",
     """      if (id) {
        const sv = startViewFor(id);
        setSelectedTripId(id);
        setActiveTab(sv.tab);
        setDayIndex(sv.day);
        setView('trip');"""),
    ("""    if (id !== selectedTripId) setDayIndex(0);
    setSelectedTripId(id);
    setActiveTab('overview');""",
     """    const sv = startViewFor(id);
    setDayIndex(sv.day);
    setSelectedTripId(id);
    setActiveTab(sv.tab);"""),
    ("const [dayIndex, setDayIndex] = useState<number>(0);",
     "const [dayIndex, setDayIndex] = useState<number>(() => startViewFor(selectedTripId).day);"),
])

# dayIndex 선언이 startViewFor 사용보다 아래 있으므로 위로 끌어올린다
p = R / "src/App.tsx"; s = p.read_text(encoding="utf-8")
decl = "  const [dayIndex, setDayIndex] = useState<number>(() => startViewFor(selectedTripId).day);\n"
anchor = "  const [activeTab, setActiveTab] = useState<KeepTripTab>(() => startViewFor(selectedTripId).tab);\n"
if s.index(decl) > s.index(anchor):
    s = s.replace(decl, "", 1).replace(anchor, anchor + decl, 1)
    p.write_text(s, encoding="utf-8")

# ---------- 4) 오늘 화면: '다음' 표시를 현재 시각 기준으로 ----------
sub("src/components/TodayScreen.tsx", [
    ("import { KeepTripLogo } from './KeepTripLogo';",
     "import { KeepTripLogo } from './KeepTripLogo';\nimport { getTripClock } from '../utils/tripClock';"),
    ("  const featuredStop = activeDay.stops.find((s) => s.docent) || activeDay.stops[2] || activeDay.stops[0];",
     """  const clock = getTripClock(trip);
  const isLiveDay = clock.phase === 'during' && clock.dayIndex === dayIndex && clock.nextStopIndex >= 0;
  const featuredStop = isLiveDay
    ? activeDay.stops[clock.nextStopIndex]
    : activeDay.stops.find((s) => s.docent) || activeDay.stops[2] || activeDay.stops[0];"""),
    ("""                            다음
                          </span>""",
     """                            {isLiveDay ? '지금·다음' : '다음'}
                          </span>"""),
])

# ---------- 5) 준비 화면: D-day 배너 ----------
sub("src/components/PrepScreen.tsx", [
    ("""  return (
    <div className="pb-28 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
""",
     """  const clock = getTripClock(trip);

  return (
    <div className="pb-28 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {clock.phase === 'before' && (
        <div className="rounded-2xl bg-[#1E2856] text-white px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold tracking-tight">D-{clock.dDay}</div>
            <div className="text-xs text-white/80 mt-0.5">
              {trip.dateRange} 출발 · {trip.days[0]?.stops[0]?.time ? `${trip.days[0].stops[0].time} ${trip.days[0].stops[0].title}` : trip.title}
            </div>
          </div>
          <div className="text-xs font-bold text-[#EFA03D] text-right">
            {clock.dDay <= 3 ? '출발 임박 · 필수 준비부터 확인하세요' : '여유 있게 준비하세요'}
          </div>
        </div>
      )}
"""),
])
p = R / "src/components/PrepScreen.tsx"; s = p.read_text(encoding="utf-8")
if "utils/tripClock" not in s:
    i = s.index("\n", s.index("import ")); s = s[:i+1] + "import { getTripClock } from '../utils/tripClock';\n" + s[i+1:]
    p.write_text(s, encoding="utf-8")
print("ok")

# ---------- 6) 남은 '충칭북역' 표기 → 사핑바역 ----------
for f in ("src/components/AiAdvisorModal.tsx", "src/data/presetTrips.ts"):
    p = R / f; s = p.read_text(encoding="utf-8")
    p.write_text(s.replace("충칭북역에서 청두동역", "사핑바역에서 청두동역").replace("충칭북역→청두동역", "사핑바역→청두동역"), encoding="utf-8")
print("ok2")
