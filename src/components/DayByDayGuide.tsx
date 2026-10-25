import React, { useState } from 'react';
import { Calendar, Clock, MapPin, AlertCircle, Info, Sparkles, Utensils, Plane, Train, Hotel, Landmark } from 'lucide-react';
import { TripData, DayPlan, ItineraryStop } from '../types/travel';

interface DayByDayGuideProps {
  trip: TripData;
}

export const DayByDayGuide: React.FC<DayByDayGuideProps> = ({ trip }) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  const activeDay: DayPlan = trip.days.find((d) => d.dayNumber === selectedDayNumber) || trip.days[0];

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'flight':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'transit':
        return <Train className="w-4 h-4 text-emerald-600" />;
      case 'hotel':
        return <Hotel className="w-4 h-4 text-indigo-600" />;
      default:
        return <Landmark className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-slate-900">
              일자별 실전 이동·미식·현지 동선 최적 가이드
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-200 text-slate-800">
              총 {trip.days.length}일정
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            항공권과 호텔 이후, 현지에서 발생하는 이동·식사·결제 팁을 타임라인으로 정리했습니다.
          </p>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="p-4 sm:p-5 border-b border-slate-100 overflow-x-auto flex gap-2 no-scrollbar">
        {trip.days.map((day) => {
          const isSelected = day.dayNumber === selectedDayNumber;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayNumber(day.dayNumber)}
              className={`px-3.5 py-2 rounded-xl text-left shrink-0 transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide">
                  DAY {day.dayNumber}
                </span>
                <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  ({day.dayOfWeek})
                </span>
              </div>
              <p
                className={`text-xs truncate max-w-[140px] mt-0.5 font-medium ${
                  isSelected ? 'text-amber-300' : 'text-slate-600'
                }`}
              >
                {day.city}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Day View */}
      {activeDay && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* Day Theme Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-100 to-indigo-50/50 border border-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-indigo-700 tracking-wider uppercase">
                DAY {activeDay.dayNumber} · {activeDay.date} ({activeDay.dayOfWeek}) · {activeDay.city}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {activeDay.theme}
            </h4>

            {activeDay.dayHighlights && activeDay.dayHighlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200/60">
                {activeDay.dayHighlights.map((hl, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-white text-slate-700 border border-slate-200/80 shadow-2xs"
                  >
                    ✦ {hl}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activeDay.stops.map((stop, idx) => (
              <div key={idx} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                </div>

                <div className="bg-slate-50/70 hover:bg-slate-50 transition-colors p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {stop.time && (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          <Clock className="w-3 h-3" />
                          {stop.time}
                        </span>
                      )}
                      <h5 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                        {getCategoryIcon(stop.category)}
                        {stop.title}
                      </h5>
                    </div>
                  </div>

                  {stop.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1">
                      {stop.description}
                    </p>
                  )}

                  {/* Fee or Smart Tip Box */}
                  {(stop.feeTip || stop.smartTip) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-col gap-1 text-xs">
                      {stop.feeTip && (
                        <div className="flex items-start gap-1.5 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200/60 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>결제/수수료 팁:</strong> {stop.feeTip}</span>
                        </div>
                      )}
                      {stop.smartTip && (
                        <div className="flex items-start gap-1.5 text-indigo-900 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100 font-medium">
                          <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span><strong>현지 실전 팁:</strong> {stop.smartTip}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
