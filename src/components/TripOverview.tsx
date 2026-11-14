import React from 'react';
import { ArrowLeft, Calendar, Users, Clock, MapPin, Info, ChevronRight, CheckSquare, Sparkles } from 'lucide-react';
import { TripData } from '../types/travel';
import { DEST_META } from './TripHome';
import { FontSizeControl } from './FontSizeControl';

interface TripOverviewProps {
  trip: TripData;
  onGoHome: () => void;
  onStartToday: () => void;
  onOpenPrep: () => void;
  onOpenDay: (index: number) => void;
}

/** 일정에 들어가면 가장 먼저 보이는 화면: 첫 안내 + 일정 개요 */
export const TripOverview: React.FC<TripOverviewProps> = ({ trip, onGoHome, onStartToday, onOpenPrep, onOpenDay }) => {
  const meta = DEST_META[trip.destinationType] || DEST_META.GLOBAL;
  const mustCount = trip.checklist.filter((c) => c.tier === 'MUST').length;

  return (
    <div className="pb-28 md:pb-12 w-full max-w-7xl mx-auto">
      {/* Hero */}
      <div className={`relative bg-gradient-to-br ${meta.grad} md:mx-6 lg:mx-8 md:mt-6 md:rounded-3xl overflow-hidden`}>
        {trip.heroImage && (
          <img
            src={trip.heroImage}
            alt=""
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
        <div className="relative px-5 md:px-8 pt-4 pb-6 md:py-10 text-white">
          <div className="flex items-center justify-between gap-2">
          <button
            onClick={onGoHome}
            className="shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-xs font-semibold bg-white/20 hover:bg-white/30 backdrop-blur px-2.5 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 전체 일정
          </button>
          <FontSizeControl dark />
          </div>
          <div className="mt-10 md:mt-16 text-xs font-bold opacity-90">
            {meta.flag} {meta.label} · {trip.durationText}
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mt-1">{trip.title}</h1>
          <p className="text-sm md:text-base opacity-90 mt-1.5">{trip.subtitle}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs md:text-sm opacity-90">
            <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {trip.dateRange}</span>
            <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {trip.partyText}</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 mt-5 md:mt-8 grid md:grid-cols-5 gap-5 md:gap-6">
        {/* 첫 안내 */}
        <section className="md:col-span-2 space-y-3">
          <h2 className="text-base md:text-lg font-extrabold text-[#1E2856] flex items-center gap-2">
            <Info className="w-5 h-5 text-[#EFA03D]" /> 첫 안내
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
            <b>{trip.title}</b> 일정에 오신 것을 환영합니다. {trip.dateRange}, {trip.durationText} 동안{' '}
            {trip.days.length}일의 일정표가 준비되어 있습니다. 출발 전 꼭 알아둘 핵심 안내부터 확인하세요.
          </div>
          {trip.keyRules.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 shrink-0 rounded-full bg-[#1E2856] text-white text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="font-bold text-slate-900 text-sm">{r.title}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{r.description}</p>
              {r.tag && (
                <span className="inline-block mt-2 text-[10.5px] font-bold text-[#B86E12] bg-[#FDF3E4] px-2 py-0.5 rounded">
                  {r.tag}
                </span>
              )}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onStartToday}
              className="py-3 rounded-xl bg-[#1E2856] text-white text-sm font-bold inline-flex items-center justify-center gap-1.5"
            >
              <Clock className="w-4 h-4" /> 오늘 일정 시작
            </button>
            <button
              onClick={onOpenPrep}
              className="py-3 rounded-xl bg-white border border-slate-200 text-[#1E2856] text-sm font-bold inline-flex items-center justify-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" /> 준비 {mustCount > 0 ? `· 필수 ${mustCount}` : ''}
            </button>
          </div>
        </section>

        {/* 일정 개요 */}
        <section className="md:col-span-3 space-y-3">
          <h2 className="text-base md:text-lg font-extrabold text-[#1E2856] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#EFA03D]" /> 일정 개요
          </h2>
          <ol className="relative space-y-3">
            {trip.days.map((d, idx) => (
              <li key={d.dayNumber}>
                <button
                  onClick={() => onOpenDay(idx)}
                  className="w-full text-left bg-white rounded-2xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-12 text-center">
                      <div className="text-[10px] font-bold text-slate-400">DAY</div>
                      <div className="text-xl font-extrabold text-[#1E2856] leading-none">{d.dayNumber}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        {d.date} {d.dayOfWeek && `(${d.dayOfWeek})`} · {d.city}
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{d.theme}</div>
                      <div className="text-xs text-slate-600 mt-1.5 line-clamp-2 md:line-clamp-none">
                        {d.stops.map((s) => s.title).join(' · ')}
                      </div>
                      {d.dayHighlights?.length > 0 && (
                        <div className="hidden md:flex flex-wrap gap-1.5 mt-2">
                          {d.dayHighlights.slice(0, 3).map((h, i) => (
                            <span key={i} className="text-[10.5px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#EFA03D]" /> {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-[11px] text-slate-400">
                      {d.stops.length}곳 <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
};
