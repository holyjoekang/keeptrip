import React from 'react';
import { X, Plus, Sparkles, MapPin, ExternalLink, Calendar, Users, ChevronRight } from 'lucide-react';
import { TripData } from '../types/travel';
import { KeepTripLogo } from './KeepTripLogo';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripData[];
  selectedTripId: string;
  onSelectTrip: (id: string) => void;
  onOpenCustomModal: () => void;
  onOpenAdvisor: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  trips,
  selectedTripId,
  onSelectTrip,
  onOpenCustomModal,
  onOpenAdvisor
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <KeepTripLogo size="md" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="닫기"
            >
              <X className="w-6 h-6 stroke-[2]" />
            </button>
          </div>

          {/* Quick AI & Add Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAdvisor();
              }}
              className="p-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-left hover:bg-blue-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#2563EB] mb-1" />
              <div className="text-xs font-bold text-[#1E3A8A]">AI 실시간 질의</div>
              <div className="text-[10px] text-slate-500 mt-0.5">최신 수수료·규정</div>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCustomModal();
              }}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#1E2856] mb-1" />
              <div className="text-xs font-bold text-[#1E2856]">새 일정 등록</div>
              <div className="text-[10px] text-slate-500 mt-0.5">URL / 텍스트</div>
            </button>
          </div>

          {/* Trips List */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              내 여행 목록 ({trips.length})
            </div>

            <div className="space-y-2.5">
              {trips.map((t) => {
                const isSelected = t.id === selectedTripId;
                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectTrip(t.id);
                      onClose();
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1E2856] bg-[#1E2856]/5 ring-2 ring-[#1E2856]/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-[#1E2856]">
                        {t.durationText}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#27AE60]">
                          선택됨
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-[#111827] mt-1.5 leading-snug">
                      {t.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{t.dateRange}</span>
                      <span>·</span>
                      <span>{t.partyText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Brand Tagline */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <div className="text-xs font-black text-[#1E2856] tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            Every trip, kept.
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            다녀온 길까지, 간직하다.
          </div>
        </div>
      </div>
    </div>
  );
};
