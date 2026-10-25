import React from 'react';
import { Clock, CheckSquare, MessageSquare, BookOpen, Mic, Sparkles, Plus, ChevronDown } from 'lucide-react';
import { KeepTripLogo } from './KeepTripLogo';
import { KeepTripTab } from './BottomNav';
import { TripData } from '../types/travel';

interface DesktopNavProps {
  activeTab: KeepTripTab;
  onTabChange: (tab: KeepTripTab) => void;
  onQuickRecord: () => void;
  onOpenAdvisor: () => void;
  onOpenCustomModal: () => void;
  onOpenMenu: () => void;
  currentTrip: TripData;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({
  activeTab,
  onTabChange,
  onQuickRecord,
  onOpenAdvisor,
  onOpenCustomModal,
  onOpenMenu,
  currentTrip
}) => {
  return (
    <header className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18 gap-2">
          {/* Left: Brand Logo & Current Trip Switcher */}
          <div className="flex items-center gap-2.5 lg:gap-4 shrink-0">
            <KeepTripLogo size="md" />

            <div className="h-5 lg:h-6 w-px bg-slate-200" />

            {/* Active Trip Button (opens menu/switcher) */}
            <button
              onClick={onOpenMenu}
              className="inline-flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold text-[#1E2856] bg-slate-100/80 hover:bg-slate-200/80 transition-colors border border-slate-200"
              aria-label="여행 일정 변경하기"
            >
              <span className="w-2 h-2 rounded-full bg-[#EFA03D] shrink-0" />
              <span className="truncate max-w-[100px] md:max-w-[130px] lg:max-w-[220px]">{currentTrip.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Center: 4 Experience Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 lg:p-1.5 rounded-2xl border border-slate-200/80 shrink-0">
            <button
              onClick={() => onTabChange('today')}
              className={`px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 lg:gap-2 transition-all whitespace-nowrap ${
                activeTab === 'today'
                  ? 'bg-[#1E2856] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 lg:w-4 lg:h-4 stroke-[2.5]" />
              <span className="md:inline lg:hidden">오늘</span>
              <span className="hidden lg:inline">오늘의 일정</span>
            </button>

            <button
              onClick={() => onTabChange('prep')}
              className={`px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 lg:gap-2 transition-all whitespace-nowrap ${
                activeTab === 'prep'
                  ? 'bg-[#1E2856] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 lg:w-4 lg:h-4 stroke-[2.5]" />
              <span className="md:inline lg:hidden">준비</span>
              <span className="hidden lg:inline">맞춤 준비</span>
            </button>

            <button
              onClick={() => onTabChange('record')}
              className={`px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 lg:gap-2 transition-all whitespace-nowrap ${
                activeTab === 'record'
                  ? 'bg-[#1E2856] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 lg:w-4 lg:h-4 stroke-[2.5]" />
              <span className="md:inline lg:hidden">기록</span>
              <span className="hidden lg:inline">보이스 기록</span>
            </button>

            <button
              onClick={() => onTabChange('story')}
              className={`px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 lg:gap-2 transition-all whitespace-nowrap ${
                activeTab === 'story'
                  ? 'bg-[#1E2856] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4 stroke-[2.5]" />
              <span className="md:inline lg:hidden">스토리</span>
              <span className="hidden lg:inline">스토리 & 앨범</span>
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0">
            <button
              onClick={onOpenAdvisor}
              className="inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] hover:bg-blue-100 rounded-xl border border-[#BFDBFE] transition-colors"
              aria-label="AI 최적화 질의"
            >
              <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#2563EB]" />
              <span className="hidden xl:inline">AI 최적화 질의</span>
              <span className="inline xl:hidden">AI</span>
            </button>

            <button
              onClick={onOpenCustomModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
              aria-label="새 여행 일정 등록"
            >
              <Plus className="w-4 h-4" />
              <span>새 일정</span>
            </button>

            {/* Dawn Amber Quick Record Button */}
            <button
              onClick={onQuickRecord}
              className="inline-flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1.5 lg:py-2 text-xs font-black text-[#111827] bg-[#EFA03D] hover:bg-[#ea8c22] rounded-xl shadow-xs transition-colors whitespace-nowrap"
              aria-label="보이스 메모 남기기"
            >
              <Mic className="w-3.5 h-3.5 lg:w-4 lg:h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">말로 남기기</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
