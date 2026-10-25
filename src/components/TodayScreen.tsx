import React, { useState } from 'react';
import { Menu, Navigation, Car, AlertCircle, CheckCircle, Volume2, Sparkles, MapPin, Star, BookOpen, Camera, Play, Pause } from 'lucide-react';
import { TripData, ItineraryStop } from '../types/travel';
import { KeepTripLogo } from './KeepTripLogo';

interface TodayScreenProps {
  trip: TripData;
  onOpenDocent: (stop: ItineraryStop) => void;
  onOpenTaxiAddress: (stop: ItineraryStop) => void;
  onOpenMenu: () => void;
  onOpenAdvisor: () => void;
  onGoToVoiceRecord?: (spotTitle: string) => void;
}

export const TodayScreen: React.FC<TodayScreenProps> = ({
  trip,
  onOpenDocent,
  onOpenTaxiAddress,
  onOpenMenu,
  onOpenAdvisor,
  onGoToVoiceRecord
}) => {
  const defaultDayIndex = trip.destinationType === 'CN' ? 2 : 1;
  const [dayIndex, setDayIndex] = useState<number>(defaultDayIndex);
  const activeDay = trip.days[dayIndex] || trip.days[0];

  const featuredStop = activeDay.stops.find((s) => s.docent) || activeDay.stops[2] || activeDay.stops[0];

  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({
    [`${activeDay.dayNumber}-0`]: true,
    [`${activeDay.dayNumber}-1`]: true
  });

  // Inline audio player state for desktop docent preview
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const toggleStop = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedStops((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = activeDay.stops.filter((_, idx) => completedStops[`${activeDay.dayNumber}-${idx}`]).length;

  const handleToggleDocentAudio = () => {
    if (!window.speechSynthesis) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const doc = featuredStop.docent;
      const text = doc
        ? `${featuredStop.title}. ${doc.summary}. ${doc.historyAndStory}. 꼭 보셔야 할 것은 ${doc.mustSeePoints.join('. ')}`
        : `${featuredStop.title}. ${featuredStop.description || ''}`;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="pb-28 max-w-7xl mx-auto w-full">
      {/* Mobile-only Header */}
      <header className="md:hidden px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100 bg-white">
        <div>
          <div className="text-xs font-semibold text-slate-500">
            DAY {activeDay.dayNumber} · {activeDay.date} ({activeDay.dayOfWeek}) · {activeDay.city}
          </div>
          <KeepTripLogo size="md" className="mt-0.5" />
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAdvisor}
            className="p-2 text-indigo-900 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="AI 가이드 질문하기"
          >
            <Sparkles className="w-5 h-5 text-[#EFA03D]" />
          </button>
          <button
            onClick={onOpenMenu}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu className="w-6 h-6 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* Main Responsive Grid Layout (1 col on mobile, 12 cols on tablet/desktop) */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8">
          {/* Left Column (Hero Card & Alerts): 5 cols on lg, 6 cols on md */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            {/* Desktop Day Heading */}
            <div className="hidden md:flex items-center justify-between pb-1">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  KeepTrip Live Compass
                </span>
                <h1 className="text-xl font-black text-[#111827]">
                  DAY {activeDay.dayNumber} · {activeDay.city}
                </h1>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                {activeDay.date} ({activeDay.dayOfWeek})
              </span>
            </div>

            {/* Next Itinerary Hero Card (Deep Navy Indigo #1E2856) */}
            <section
              onClick={() => onOpenDocent(featuredStop)}
              className="bg-[#1E2856] text-white rounded-3xl p-6 lg:p-7 shadow-md cursor-pointer hover:bg-[#192348] transition-all relative overflow-hidden group"
              role="region"
              aria-label="다음 일정 상세 안내 카드"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    다음 일정 · {featuredStop.time || '14:30'}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-slate-200">
                    터치하여 해설 보기
                  </span>
                </div>

                <div className="mt-3">
                  <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {featuredStop.title.replace(/\(.*\)/, '').trim()}
                  </h2>
                  <div className="text-base font-semibold text-slate-300 mt-0.5 tracking-wide font-sans">
                    {trip.destinationType === 'CN'
                      ? (featuredStop.title.includes('수정방')
                          ? '水井坊博物馆'
                          : featuredStop.title.includes('홍야동')
                          ? '洪崖洞景区'
                          : featuredStop.title.includes('리지바')
                          ? '李子坝轻轨站'
                          : '水井坊博物馆')
                      : 'Ah Soon Kor Hokkien Mee'}
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  호텔에서 택시 약 25분 · 도착하면 해설이 자동으로 열려요
                </p>

                {/* 2 Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5 mt-5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDocent(featuredStop);
                    }}
                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-[#1E2856] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>길찾기</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenTaxiAddress(featuredStop);
                    }}
                    className="w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Car className="w-3.5 h-3.5 text-[#EFA03D]" />
                    <span>택시 주소 보여주기</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Must Check Today Alert Card */}
            <section
              className="bg-[#FFFDF5] border border-[#FDE68A] rounded-2xl p-4 lg:p-5 text-[#92400E] shadow-2xs"
              role="note"
              aria-label="오늘 꼭 챙겨야 할 사항"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-xs text-[#92400E]">오늘 꼭 챙기기</h3>
                  <p className="text-xs text-[#78350F] mt-1 leading-relaxed">
                    {trip.destinationType === 'CN'
                      ? '수정방 투어·시음 예약 확인 · 여권 지참 (박물관 입장 시 필요할 수 있음)'
                      : '페낭 호커센터용 현금 잔돈(20링깃) 지참 · 3핀 플러그 어댑터 챙기기'}
                  </p>
                </div>
              </div>
            </section>

            {/* Day Selector Pills */}
            <div className="pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                다른 날짜 동선 보기
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {trip.days.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setDayIndex(i)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      i === dayIndex
                        ? 'bg-[#1E2856] text-white border-[#1E2856] shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    DAY {d.dayNumber} ({d.dayOfWeek})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Timeline & Live Docent on Tablet/Desktop): 7 cols on lg, 6 cols on md */}
          <div className="md:col-span-6 lg:col-span-7 space-y-5">
            {/* Today's Route Section */}
            <section className="bg-white rounded-3xl border border-slate-200 p-5 lg:p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base lg:text-lg text-[#111827]">
                  오늘의 동선
                </h3>
                <span className="text-xs font-bold text-[#27AE60] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {completedCount} / {activeDay.stops.length} 완료
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {activeDay.stops.map((stop, idx) => {
                  const stopKey = `${activeDay.dayNumber}-${idx}`;
                  const isDone = completedStops[stopKey];
                  const isNext = stop === featuredStop;

                  return (
                    <div
                      key={idx}
                      onClick={() => onOpenDocent(stop)}
                      className="py-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 rounded-xl px-2.5 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-bold text-slate-500 w-12 shrink-0">
                          {stop.time || `0${9 + idx * 2}:00`}
                        </span>

                        <span
                          className={`text-sm font-semibold truncate ${
                            isDone ? 'line-through text-slate-400' : 'text-[#111827]'
                          }`}
                        >
                          {stop.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isNext && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#1E2856] text-white">
                            다음
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => toggleStop(stopKey, e)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-[#27AE60] text-white'
                              : 'border-2 border-slate-300 hover:border-slate-400 text-transparent'
                          }`}
                          aria-label={`${stop.title} 완료 여부 체크`}
                        >
                          <CheckCircle className="w-4 h-4 fill-current stroke-white" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Desktop Embedded Docent Preview Card */}
            {featuredStop.docent && (
              <section className="hidden md:block bg-white rounded-3xl border border-slate-200 p-5 lg:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EFA03D]" />
                    <h4 className="font-extrabold text-sm text-[#111827]">
                      현장 도슨트 해설 미리보기 ({featuredStop.title})
                    </h4>
                  </div>

                  <button
                    onClick={handleToggleDocentAudio}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isPlayingAudio
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-[#1E2856] text-white hover:bg-[#192348]'
                    }`}
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingAudio ? '음성 일시정지' : '도슨트 듣기'}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  {featuredStop.docent.summary}
                </p>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    핵심 관람 포인트:
                  </div>
                  <ul className="space-y-1.5">
                    {featuredStop.docent.mustSeePoints.map((pt, i) => (
                      <li key={i} className="text-xs text-slate-800 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#1E2856]/10 text-[#1E2856] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
