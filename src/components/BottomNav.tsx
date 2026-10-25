import React from 'react';
import { Clock, CheckSquare, MessageSquare, BookOpen, Mic } from 'lucide-react';

export type KeepTripTab = 'today' | 'prep' | 'record' | 'story';

interface BottomNavProps {
  activeTab: KeepTripTab;
  onTabChange: (tab: KeepTripTab) => void;
  onQuickRecord: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onQuickRecord
}) => {
  return (
    <>
      {/* Floating Action Button (Dawn color - "지금 할 한 가지: 말로 기록하기") */}
      {activeTab !== 'record' && (
        <button
          onClick={onQuickRecord}
          className="md:hidden fixed bottom-20 right-5 z-30 w-14 h-14 rounded-full bg-[#EFA03D] hover:bg-[#ea8c22] text-[#111827] shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2 border-white"
          aria-label="말로 기록하기 (보이스 녹음)"
        >
          <Mic className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-sm">
        <div className="max-w-[480px] mx-auto flex items-center justify-around h-16 px-2">
          {/* 오늘 */}
          <button
            onClick={() => onTabChange('today')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'today' ? 'text-[#1E2856]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Clock className={`w-5 h-5 ${activeTab === 'today' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-[11px] mt-1 ${activeTab === 'today' ? 'font-bold' : 'font-medium'}`}>
              오늘
            </span>
          </button>

          {/* 준비 */}
          <button
            onClick={() => onTabChange('prep')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'prep' ? 'text-[#1E2856]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <CheckSquare className={`w-5 h-5 ${activeTab === 'prep' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-[11px] mt-1 ${activeTab === 'prep' ? 'font-bold' : 'font-medium'}`}>
              준비
            </span>
          </button>

          {/* 기록 */}
          <button
            onClick={() => onTabChange('record')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'record' ? 'text-[#1E2856]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MessageSquare className={`w-5 h-5 ${activeTab === 'record' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-[11px] mt-1 ${activeTab === 'record' ? 'font-bold' : 'font-medium'}`}>
              기록
            </span>
          </button>

          {/* 스토리 */}
          <button
            onClick={() => onTabChange('story')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'story' ? 'text-[#1E2856]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'story' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className={`text-[11px] mt-1 ${activeTab === 'story' ? 'font-bold' : 'font-medium'}`}>
              스토리
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
