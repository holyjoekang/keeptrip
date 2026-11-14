import React, { useState } from 'react';
import { Calendar, Users, Clock, MapPin, Plus, ArrowRight, ExternalLink } from 'lucide-react';
import { TripData, DestinationType } from '../types/travel';
import { KeepTripLogo } from './KeepTripLogo';
import { FontSizeControl } from './FontSizeControl';

export const DEST_META: Record<DestinationType, { flag: string; label: string; grad: string }> = {
  CN: { flag: '🇨🇳', label: '중국', grad: 'from-red-500 to-amber-500' },
  MY: { flag: '🇲🇾', label: '말레이시아', grad: 'from-amber-500 to-emerald-500' },
  JP: { flag: '🇯🇵', label: '일본', grad: 'from-rose-500 to-pink-400' },
  VN: { flag: '🇻🇳', label: '베트남', grad: 'from-red-600 to-yellow-500' },
  KR: { flag: '🇰🇷', label: '국내', grad: 'from-[#1E2856] to-sky-500' },
  GLOBAL: { flag: '🌏', label: '해외', grad: 'from-indigo-600 to-teal-500' }
};

const cities = (trip: TripData) =>
  Array.from(
    new Set(
      trip.days
        .flatMap((d) => (d.city || '').split(/→|·|,/))
        .map((c) => c.replace(/\(.*?\)/g, '').trim())
        .filter(Boolean)
    )
  );

/** 대표 이미지(실패 시 그라디언트 + 국기)로 그리는 일정 아이콘 */
const TripIcon: React.FC<{ trip: TripData; className?: string }> = ({ trip, className = '' }) => {
  const [broken, setBroken] = useState(false);
  const meta = DEST_META[trip.destinationType] || DEST_META.GLOBAL;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${meta.grad} ${className}`}>
      {trip.heroImage && !broken && (
        <img
          src={trip.heroImage}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {(broken || !trip.heroImage) && (
        <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-extrabold">
          {trip.title.slice(0, 1)}
        </span>
      )}
      <span className="absolute bottom-1 right-1 text-base leading-none drop-shadow">{meta.flag}</span>
    </div>
  );
};

interface TripHomeProps {
  trips: TripData[];
  lastTripId?: string;
  onEnterTrip: (id: string) => void;
  onOpenCustomModal: () => void;
}

export const TripHome: React.FC<TripHomeProps> = ({ trips, lastTripId, onEnterTrip, onOpenCustomModal }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 md:pt-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 mb-5 md:mb-7">
        <div>
          <KeepTripLogo size="md" className="md:hidden mb-3" />
          <h1 className="text-xl md:text-3xl font-extrabold text-[#1E2856]">나의 여행 일정</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            <span className="md:hidden">아이콘을 눌러 일정에 들어가세요 · {trips.length}개</span>
            <span className="hidden md:inline">
              등록된 {trips.length}개 일정 · 일정을 선택하면 첫 안내와 일정 개요부터 보여드립니다.
            </span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <FontSizeControl />
        <button
          onClick={onOpenCustomModal}
          className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E2856] text-white text-sm font-bold hover:bg-[#2b3874]"
        >
          <Plus className="w-4 h-4" /> 새 일정 등록
        </button>
        </div>
      </div>

      {/* Mobile: 아이콘 그리드 */}
      <div className="md:hidden grid grid-cols-3 gap-x-3 gap-y-5">
        {trips.map((trip) => (
          <button
            key={trip.id}
            onClick={() => onEnterTrip(trip.id)}
            className="flex flex-col items-center text-center active:scale-95 transition-transform"
          >
            <TripIcon
              trip={trip}
              className={`w-[72px] h-[72px] rounded-[22px] shadow-md ${
                trip.id === lastTripId ? 'ring-[3px] ring-[#EFA03D] ring-offset-2' : ''
              }`}
            />
            <span className="mt-2 text-[12px] font-bold text-slate-800 leading-tight line-clamp-2">{trip.title}</span>
            <span className="mt-0.5 text-[10.5px] text-slate-500">{trip.durationText}</span>
          </button>
        ))}
        <button onClick={onOpenCustomModal} className="flex flex-col items-center text-center">
          <span className="w-[72px] h-[72px] rounded-[22px] border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
            <Plus className="w-7 h-7" />
          </span>
          <span className="mt-2 text-[12px] font-bold text-slate-500">새 일정</span>
        </button>
      </div>

      {/* PC: 상세 카드 */}
      <div className="hidden md:grid grid-cols-2 xl:grid-cols-3 gap-5">
        {trips.map((trip) => {
          const meta = DEST_META[trip.destinationType] || DEST_META.GLOBAL;
          const route = cities(trip);
          return (
            <div
              key={trip.id}
              role="button"
              tabIndex={0}
              onClick={() => onEnterTrip(trip.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onEnterTrip(trip.id);
                }
              }}
              className={`group text-left bg-white rounded-2xl border overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                trip.id === lastTripId ? 'border-[#EFA03D] ring-2 ring-[#EFA03D]/30' : 'border-slate-200'
              }`}
            >
              <div className="relative">
                <TripIcon trip={trip} className="w-full h-36" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute left-3 bottom-3 right-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/90 text-[11px] font-bold text-slate-800">
                    {meta.flag} {meta.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-black/40 text-[11px] font-semibold text-white">
                    {trip.durationText} · {trip.days.length}일 일정표
                  </span>
                </div>
                {trip.sourceUrl && (
                  <a
                    href={trip.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="원본 일정표 보기"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/85 text-slate-600 hover:text-slate-900"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-extrabold text-slate-900 text-base leading-snug">{trip.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{trip.subtitle}</p>

                <div className="mt-3 grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {trip.dateRange}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> {trip.partyText}
                  </span>
                  {route.length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{route.join(' → ')}</span>
                    </span>
                  )}
                </div>

                {trip.keyRules?.length > 0 && (
                  <ul className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    {trip.keyRules.slice(0, 2).map((r, i) => (
                      <li key={i} className="text-[11.5px] text-slate-600 flex gap-1.5">
                        <span className="text-[#EFA03D] font-bold">•</span>
                        <span className="line-clamp-1">{r.title}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 첫 안내 · 일정 개요
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#1E2856] group-hover:gap-2 transition-all">
                    일정 들어가기 <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
