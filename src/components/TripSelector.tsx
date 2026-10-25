import React from 'react';
import { Calendar, Users, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { TripData } from '../types/travel';

interface TripSelectorProps {
  trips: TripData[];
  selectedTripId: string;
  onSelectTrip: (id: string) => void;
  onOpenCustomModal: () => void;
}

export const TripSelector: React.FC<TripSelectorProps> = ({
  trips,
  selectedTripId,
  onSelectTrip,
  onOpenCustomModal
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>여행 일정 선택 및 전환</span>
            <span className="text-xs font-normal text-slate-500">
              (등록된 {trips.length}개 일정)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            목적지별 환전·결제 정책과 필수 테크 팁이 실시간으로 동기화됩니다.
          </p>
        </div>
        <button
          onClick={onOpenCustomModal}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>내 여행 URL / 텍스트 등록</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {trips.map((trip) => {
          const isSelected = trip.id === selectedTripId;
          return (
            <div
              key={trip.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectTrip(trip.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTrip(trip.id);
                }
              }}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${
                      trip.destinationType === 'CN'
                        ? 'bg-red-100 text-red-800'
                        : trip.destinationType === 'MY'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {trip.destinationType === 'CN'
                      ? '중국 (충칭·청두)'
                      : trip.destinationType === 'MY'
                      ? '말레이시아 (KL·페낭)'
                      : '해외 여행'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {trip.durationText}
                  </span>
                </div>
                {trip.sourceUrl && (
                  <a
                    href={trip.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 p-1"
                    title="원본 일정표 웹페이지 보기"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <h3 className="font-bold text-slate-900 mt-2 text-base leading-snug">
                {trip.title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{trip.subtitle}</p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-3 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {trip.dateRange}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {trip.partyText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
