"""일정별 실제 데이터만 보이도록 하드코딩 데모 내용 제거 + 글자 크기(일반/크게/아주크게) 설정."""
import re, pathlib
R = pathlib.Path(__file__).resolve().parent.parent / 'src'

def edit(rel, pairs):
    p = R / rel; s = p.read_text()
    for old, new in pairs:
        if isinstance(old, re.Pattern):
            s, n = old.subn(new, s, count=1)
        else:
            n = s.count(old); s = s.replace(old, new, 1)
        assert n >= 1, (rel, str(old)[:80])
    p.write_text(s)

# ---------- TodayScreen: 날짜 선택을 App에서 제어, 데모 고정 문구 제거 ----------
edit('components/TodayScreen.tsx', [
    ("  onGoToVoiceRecord?: (spotTitle: string) => void;\n}",
     "  onGoToVoiceRecord?: (spotTitle: string) => void;\n  dayIndex: number;\n  onDayChange: (i: number) => void;\n}"),
    ("  onGoToVoiceRecord\n}) => {", "  onGoToVoiceRecord,\n  dayIndex: dayIndexProp,\n  onDayChange\n}) => {"),
    ("  const defaultDayIndex = trip.destinationType === 'CN' ? 2 : trip.destinationType === 'MY' ? 1 : 0;\n"
     "  const [dayIndex, setDayIndex] = useState<number>(Math.min(defaultDayIndex, trip.days.length - 1));",
     "  const dayIndex = Math.max(0, Math.min(dayIndexProp, trip.days.length - 1));\n  const setDayIndex = onDayChange;"),
    (re.compile(r"const \[completedStops, setCompletedStops\] = useState<Record<string, boolean>>\(\{.*?\}\);", re.S),
     "const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});"),
    (re.compile(r"\{trip\.destinationType === 'CN'\n\s*\? \(featuredStop\.title\.includes\('수정방'\).*?: featuredStop\.description\}", re.S),
     "{featuredStop.docent?.spotName && featuredStop.docent.spotName !== featuredStop.title ? featuredStop.docent.spotName : featuredStop.description}"),
    ("{trip.destinationType === 'CN' || trip.destinationType === 'MY' ? '호텔에서 택시 약 25분 · 도착하면 해설이 자동으로 열려요' : `${activeDay.theme} · 도착하면 해설이 자동으로 열려요`}",
     "{`${activeDay.theme} · 도착하면 해설이 자동으로 열려요`}"),
    (re.compile(r"\{trip\.destinationType === 'CN'\n\s*\? '수정방 투어·시음 예약 확인.*?\(trip\.checklist\.find\(\(c\) => c\.tier === 'MUST'\)\?\.title \|\| trip\.keyRules\[0\]\?\.title\)\}", re.S),
     "{(() => { const t = activeDay.stops.find((s) => s.smartTip || s.feeTip); return t ? `${t.title.replace(/\\(.*\\)/, '').trim()} · ${t.smartTip || t.feeTip}` : (trip.checklist.find((c) => c.tier === 'MUST')?.title || trip.keyRules[0]?.title); })()}"),
])

# ---------- VoiceRecordScreen: 다른 여행의 샘플 기록 제거 ----------
edit('components/VoiceRecordScreen.tsx', [
    ("activeSpotTitle = '수정방 박물관',", "activeSpotTitle = '',"),
    ("useState<boolean>(true);\n  const [recordSeconds, setRecordSeconds] = useState<number>(24);",
     "useState<boolean>(false);\n  const [recordSeconds, setRecordSeconds] = useState<number>(0);"),
    ("    '발효 구덩이가 600년 동안 계속 쓰였다는 게 놀랍다. 시음한 술은 생각보다 부드러웠고, 아내는 향이 좋다고…'\n", "    ''\n"),
    ("const [hasAttachedPhoto, setHasAttachedPhoto] = useState<boolean>(true);", "const [hasAttachedPhoto, setHasAttachedPhoto] = useState<boolean>(false);"),
    ("    trip.destinationType === 'CN' ? '체험 · 백주 시음' : '체험 · 무상킹 시식',\n"
     "    trip.partyText.includes('친구') ? '함께 · 친구들' : '함께 · 아내',\n",
     "    `함께 · ${trip.partyText}`,\n"),
    ("DAY 3 · {activeSpotTitle} · 실시간 현장 보이스", "{activeSpotTitle || trip.title} · 실시간 현장 보이스"),
    ("'📷 현장에서 촬영한 사진 4장과 자동으로 매칭되었습니다. 스토리 탭의 DAY 3 웹 매거진 섹션에 즉시 수록됩니다.'",
     "'📷 현장 사진과 함께 스토리 탭에 수록됩니다.'"),
    ("총 {voiceNotes.length + 2}건", "총 {voiceNotes.length}건"),
    (re.compile(r"\n\s*<div className=\"pt-2 flex items-start justify-between gap-3\">.*?(\n\s*\{/\* Any additional voice notes from state \*/\})", re.S), r"\1"),
])

# ---------- 준비/택시: 다른 여행 고정 문구 제거 ----------
edit('components/PrepScreen.tsx', [
    ("{trip.destinationType === 'CN' ? '충칭·청두 4박 5일 · 출발 D-24' : trip.destinationType === 'MY' ? '쿠알라룸푸르·페낭 7박 8일 · 출발 D-18' : `${trip.title} · ${trip.durationText}`}",
     "{`${trip.title} · ${trip.durationText}`}"),
])
edit('components/TaxiAddressModal.tsx', [
    ("    : (spot.title.includes('아순거')", "    : destinationType !== 'MY' ? (spot.docent?.spotName || spot.title)\n    : (spot.title.includes('아순거')"),
    ("    const text = isChina\n      ? `师傅，请带我去 ${localName}`\n      : `Tolong hantar saya ke ${localName}`;",
     "    const text = isChina\n      ? `师傅，请带我去 ${localName}`\n      : destinationType === 'MY' ? `Tolong hantar saya ke ${localName}`\n      : destinationType === 'KR' ? `기사님, ${localName}으로 가 주세요`\n      : `Please take me to ${localName}`;"),
    ("utterance.lang = isChina ? 'zh-CN' : 'en-US';",
     "utterance.lang = isChina ? 'zh-CN' : destinationType === 'KR' ? 'ko-KR' : 'en-US';"),
])

# ---------- App: 최신 일정 데이터 우선, 선택한 날짜 연동, 녹음 장소는 현재 일정에서 ----------
edit('App.tsx', [
    (re.compile(r"          return found\n\s*\? \{.*?\}\n\s*: preset;", re.S),
     "          // 미리 등록된 일정은 항상 최신 데이터 사용 (예전 저장본이 내용을 덮지 않도록)\n          return found ? { ...found, ...preset } : preset;"),
    (re.compile(r"(const \[checklists, setChecklists\] = useState<Record<string, ChecklistItem\[\]>>\(\(\) => \{\n\s*const saved = localStorage\.getItem\('my_travel_checklists'\);\n\s*if \(saved\) \{\n\s*try \{\n\s*)return JSON\.parse\(saved\);"),
     r"""\1const parsed: Record<string, ChecklistItem[]> = JSON.parse(saved);
        // 최신 체크리스트에 완료 여부만 이어 붙임
        PRESET_TRIPS.forEach((t) => {
          const done = new Set((parsed[t.id] || []).filter((i) => i.completed).map((i) => i.id));
          parsed[t.id] = t.checklist.map((i) => ({ ...i, completed: done.has(i.id) }));
        });
        return parsed;"""),
    ("useState<string>('수정방 박물관');", "useState<string>('');\n  const [dayIndex, setDayIndex] = useState<number>(0);"),
    ("    setSelectedTripId(id);\n    setActiveTab('overview');", "    if (id !== selectedTripId) setDayIndex(0);\n    setSelectedTripId(id);\n    setActiveTab('overview');"),
    ("    setCurrentRecordingSpotTitle(activeTrip.destinationType === 'CN' ? '수정방 박물관' : 'Durich 두리안 빙수');",
     "    const day = activeTrip.days[dayIndex] || activeTrip.days[0];\n    const stop = day?.stops.find((s) => s.docent) || day?.stops[0];\n    setCurrentRecordingSpotTitle(stop ? stop.title.replace(/\\(.*\\)/, '').trim() : activeTrip.title);"),
    ("            onStartToday={() => setActiveTab('today')}",
     "            onStartToday={() => setActiveTab('today')}\n            onOpenDay={(i) => {\n              setDayIndex(i);\n              setActiveTab('today');\n              window.scrollTo(0, 0);\n            }}"),
    ("            onGoToVoiceRecord={handleGoToVoiceRecordFromDocent}\n          />\n        )}\n\n        {/* Screen 2",
     "            onGoToVoiceRecord={handleGoToVoiceRecordFromDocent}\n            dayIndex={dayIndex}\n            onDayChange={setDayIndex}\n          />\n        )}\n\n        {/* Screen 2"),
    ("            voiceNotes={currentVoiceNotes}\n            onSaveVoiceNote",
     "            key={`${activeTrip.id}-${currentRecordingSpotTitle}`}\n            voiceNotes={currentVoiceNotes}\n            onSaveVoiceNote"),
])

# ---------- 개요: 날짜 카드 → 해당 날짜로 ----------
edit('components/TripOverview.tsx', [
    ("  onOpenPrep: () => void;\n}", "  onOpenPrep: () => void;\n  onOpenDay: (index: number) => void;\n}"),
    ("({ trip, onGoHome, onStartToday, onOpenPrep })", "({ trip, onGoHome, onStartToday, onOpenPrep, onOpenDay })"),
    ("{trip.days.map((d) => (\n              <li key={d.dayNumber}>\n                <button\n                  onClick={onStartToday}",
     "{trip.days.map((d, idx) => (\n              <li key={d.dayNumber}>\n                <button\n                  onClick={() => onOpenDay(idx)}"),
    ("          <button\n            onClick={onGoHome}\n            className=\"inline-flex",
     "          <div className=\"flex items-center justify-between gap-2\">\n          <button\n            onClick={onGoHome}\n            className=\"inline-flex"),
    ("            <ArrowLeft className=\"w-3.5 h-3.5\" /> 전체 일정\n          </button>",
     "            <ArrowLeft className=\"w-3.5 h-3.5\" /> 전체 일정\n          </button>\n          <FontSizeControl dark />\n          </div>"),
    ("import { DEST_META } from './TripHome';", "import { DEST_META } from './TripHome';\nimport { FontSizeControl } from './FontSizeControl';"),
])

# ---------- 글자 크기 ----------
(R / 'components/FontSizeControl.tsx').write_text('''import React, { useState } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';
const KEY = 'keeptrip_font_size';
const OPTIONS: { id: FontSize; label: string; px: number }[] = [
  { id: 'normal', label: '일반', px: 12 },
  { id: 'large', label: '크게', px: 14 },
  { id: 'xlarge', label: '아주크게', px: 16 }
];

export const readFontSize = (): FontSize => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'large' || v === 'xlarge') return v;
  } catch {}
  return 'normal';
};

/** <html data-font="..."> 로 화면 전체 배율을 바꾼다 (index.css) */
export const applyFontSize = (v: FontSize) => {
  document.documentElement.dataset.font = v;
};

/** 일반 · 크게 · 아주크게. 이 기기(브라우저)에 저장되어 계속 유지된다 */
export const FontSizeControl: React.FC<{ dark?: boolean; className?: string }> = ({ dark, className = '' }) => {
  const [size, setSize] = useState<FontSize>(readFontSize);
  const pick = (v: FontSize) => {
    setSize(v);
    applyFontSize(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  };
  return (
    <div
      role="radiogroup"
      aria-label="글자 크기"
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-xl ${
        dark ? 'bg-black/25 backdrop-blur' : 'bg-slate-100 border border-slate-200'
      } ${className}`}
    >
      <span className={`px-1.5 text-[11px] font-bold ${dark ? 'text-white/80' : 'text-slate-500'}`}>글자</span>
      {OPTIONS.map((o) => {
        const on = size === o.id;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={on}
            onClick={() => pick(o.id)}
            style={{ fontSize: o.px }}
            className={`px-2 py-1 rounded-lg font-bold leading-none whitespace-nowrap transition-colors ${
              on
                ? 'bg-[#1E2856] text-white'
                : dark
                ? 'text-white hover:bg-white/15'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};
''')

css = R / 'index.css'; s = css.read_text()
if 'data-font' not in s:
    s += '''
/* 글자 크기 설정 (FontSizeControl) — 화면 전체를 함께 키워 레이아웃이 깨지지 않게 */
html[data-font="large"] { zoom: 1.15; }
html[data-font="xlarge"] { zoom: 1.3; }
'''
    css.write_text(s)

edit('main.tsx', [
    ("import './index.css';", "import './index.css';\nimport { applyFontSize, readFontSize } from './components/FontSizeControl';\n\napplyFontSize(readFontSize());"),
])

edit('components/TripHome.tsx', [
    ("import { KeepTripLogo } from './KeepTripLogo';", "import { KeepTripLogo } from './KeepTripLogo';\nimport { FontSizeControl } from './FontSizeControl';"),
    ("        <button\n          onClick={onOpenCustomModal}\n          className=\"hidden md:inline-flex",
     "        <div className=\"flex flex-col md:flex-row items-end md:items-center gap-2\">\n        <FontSizeControl />\n        <button\n          onClick={onOpenCustomModal}\n          className=\"hidden md:inline-flex"),
    ("          <Plus className=\"w-4 h-4\" /> 새 일정 등록\n        </button>",
     "          <Plus className=\"w-4 h-4\" /> 새 일정 등록\n        </button>\n        </div>"),
])

edit('components/MenuDrawer.tsx', [
    ("import { KeepTripLogo } from './KeepTripLogo';", "import { KeepTripLogo } from './KeepTripLogo';\nimport { FontSizeControl } from './FontSizeControl';"),
    ("          {/* Quick AI & Add Buttons */}", "          <FontSizeControl className=\"w-full justify-between\" />\n\n          {/* Quick AI & Add Buttons */}"),
])
print('ok')

# 모바일에서 '아주크게'일 때 머리글이 넘치지 않도록 세로로 쌓기
p = R / 'components/TripHome.tsx'; s = p.read_text()
s = s.replace('<div className="flex items-end justify-between gap-3 mb-5 md:mb-7">',
              '<div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 mb-5 md:mb-7">')
s = s.replace('<div className="flex flex-col md:flex-row items-end md:items-center gap-2">',
              '<div className="flex flex-col md:flex-row items-start md:items-center gap-2">')
p.write_text(s)

# 줄바꿈 방지
for rel, a, b in [
    ('components/FontSizeControl.tsx', '`px-1.5 text-[11px] font-bold ', '`px-1.5 text-[11px] font-bold whitespace-nowrap '),
    ('components/TripOverview.tsx', 'className="inline-flex items-center gap-1 text-xs font-semibold bg-white/20', 'className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-xs font-semibold bg-white/20'),
]:
    p = R / rel; s = p.read_text()
    if b not in s: p.write_text(s.replace(a, b))
