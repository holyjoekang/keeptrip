import React from 'react';
import { Compass, Sparkles, PlusCircle, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';
import { TripData } from '../types/travel';

interface HeaderProps {
  currentTrip: TripData;
  onOpenCustomModal: () => void;
  onOpenAdvisor: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTrip, onOpenCustomModal, onOpenAdvisor }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Philosophy */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  나만의 여행 가이드
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  실속 최적화 가이드
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                아낄 건 확실하게 아끼고, 1~2천원 차이의 피로도는 과감히 무시하는 맞춤형 안내서
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenAdvisor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
              aria-label="최신 결제 및 정책 질문하기"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI 최적화 질의</span>
            </button>

            <button
              onClick={onOpenCustomModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
              aria-label="일정 URL 또는 계획 입력"
            >
              <PlusCircle className="w-4 h-4" />
              <span>새 일정 추가</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
