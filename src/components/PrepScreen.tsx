import React, { useState } from 'react';
import { Check, CheckCircle2, ChevronDown, ChevronUp, DollarSign, Wifi, Info, MinusCircle, AlertTriangle, ShieldCheck, TrendingDown, Coffee } from 'lucide-react';
import { TripData, ChecklistItem } from '../types/travel';
import { calculatePaymentOptimization } from '../utils/feeOptimizer';
import { analyzeConnectivity } from '../utils/dataConnectivity';

interface PrepScreenProps {
  trip: TripData;
  checklist: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onOpenAdvisor: () => void;
}

export const PrepScreen: React.FC<PrepScreenProps> = ({
  trip,
  checklist,
  onToggleItem,
  onOpenAdvisor
}) => {
  const [activeTab, setActiveTab] = useState<'MUST' | 'SAVINGS' | 'IGNORE'>('MUST');
  const [showFeeSimulator, setShowFeeSimulator] = useState<boolean>(true);
  const [budgetKrw, setBudgetKrw] = useState<number>(trip.defaultBudgetKrw || 1000000);

  const feeOpt = calculatePaymentOptimization(trip.destinationType, budgetKrw);
  const connOpt = analyzeConnectivity(trip.destinationType, trip.days.length, 2, true);

  const totalCalculatedSavings = feeOpt.maxSavingsKrw + connOpt.totalSavingsVsRoaming;

  const completedCount = checklist.filter((c) => c.completed).length;
  const progressPercent = Math.max(25, Math.min(100, Math.round((completedCount / Math.max(1, checklist.length)) * 100)));

  const filteredItems = checklist.filter((c) => c.tier === activeTab);

  return (
    <div className="pb-28 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {trip.destinationType === 'CN' ? '충칭·청두 4박 5일 · 출발 D-24' : '쿠알라룸푸르·페낭 7박 8일 · 출발 D-18'}
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#111827] tracking-tight mt-0.5">
            나에게 맞춘 준비 & 수수료 최적화
          </h1>
        </div>

        <button
          onClick={onOpenAdvisor}
          className="self-start sm:self-auto text-xs font-bold text-[#1E3A8A] bg-[#EFF6FF] px-3.5 py-2 rounded-xl border border-[#BFDBFE] hover:bg-blue-100 transition-colors"
        >
          실시간 환전/수수료 AI 질문 →
        </button>
      </div>

      {/* Top Responsive 2-Column Grid (Progress Gauge + Fee Calculator) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Progress Gauge Card (5 cols on md/lg) */}
        <section
          className="md:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs flex items-center gap-5"
          role="region"
          aria-label="예상 절약액 요약 카드"
        >
          {/* SVG Circular Progress Ring */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="27"
                stroke="#E2E8F0"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="27"
                stroke="#27AE60"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 27}
                strokeDashoffset={(2 * Math.PI * 27) * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-base font-black text-[#27AE60]">
              {progressPercent}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-500">
              아낄 수 있는 돈 약 <span className="text-[#27AE60] font-black text-sm">{totalCalculatedSavings.toLocaleString()}원</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 leading-relaxed">
              내 카드·폰·일정 기준으로 계산했어요
            </div>
            <div className="mt-2 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg inline-block">
              {completedCount} / {checklist.length} 항목 준비 완료
            </div>
          </div>
        </section>

        {/* Right: Live Fee & Telecom Budget Slider (7 cols on md/lg) */}
        <section
          className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3"
          role="region"
          aria-label="상세 수수료 계산기"
        >
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700">현지 총 결제 예상 예산 시뮬레이션:</span>
            <span className="font-black text-[#1E2856] text-sm">{budgetKrw.toLocaleString()}원</span>
          </div>
          <input
            type="range"
            min="300000"
            max="3000000"
            step="50000"
            value={budgetKrw}
            onChange={(e) => setBudgetKrw(Number(e.target.value))}
            className="w-full accent-[#1E2856] cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">결제/환전 최적화 절약</span>
              <span className="font-extrabold text-[#27AE60] text-sm">+{feeOpt.maxSavingsKrw.toLocaleString()}원</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block text-[11px]">eSIM 로밍 대비 절약</span>
              <span className="font-extrabold text-[#27AE60] text-sm">+{connOpt.totalSavingsVsRoaming.toLocaleString()}원</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
            💡 <strong>핵심 추천:</strong> {feeOpt.recommendationSummary}
          </p>
        </section>
      </div>

      {/* 3 Segment Tabs matching PDF Page 3 */}
      <div className="flex gap-2 max-w-md">
        <button
          onClick={() => setActiveTab('MUST')}
          className={`flex-1 py-2.5 rounded-full text-xs font-extrabold transition-all ${
            activeTab === 'MUST'
              ? 'bg-[#1E2856] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          꼭 챙길 것
        </button>

        <button
          onClick={() => setActiveTab('SAVINGS')}
          className={`flex-1 py-2.5 rounded-full text-xs font-extrabold transition-all ${
            activeTab === 'SAVINGS'
              ? 'bg-[#1E2856] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          돈 아끼는 것
        </button>

        <button
          onClick={() => setActiveTab('IGNORE')}
          className={`flex-1 py-2.5 rounded-full text-xs font-extrabold transition-all ${
            activeTab === 'IGNORE'
              ? 'bg-[#1E2856] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          신경 끄기
        </button>
      </div>

      {/* Checklist Grid (1 col on mobile, 2 cols on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isDone = item.completed;

          if (item.tier === 'IGNORE') {
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-dashed border-slate-300 bg-white text-slate-600 text-xs flex items-start gap-3"
              >
                <MinusCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 text-sm block">{item.title}</span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isDone
                  ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                    isDone
                      ? 'bg-[#27AE60] text-white'
                      : 'border-2 border-slate-300 hover:border-slate-400 bg-white'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm font-bold leading-snug ${
                      isDone ? 'line-through text-slate-400' : 'text-[#111827]'
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Special tags matching PDF page 3 */}
              <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100 pl-8">
                {item.title.includes('알리페이') && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#92400E]">
                    D-3 재확인 예약됨
                  </span>
                )}

                {item.title.includes('eSIM') && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E0E7FF] text-[#3730A3]">
                    내 폰 지원 확인됨
                  </span>
                )}

                {item.title.includes('수정방') && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    일정표 DAY 3에서 자동으로 찾았어요
                  </span>
                )}

                {item.estimatedSavingKrw && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800">
                    +{item.estimatedSavingKrw.toLocaleString()}원 아낌
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global Ignore Guideline Card matching bottom of Page 3 */}
      {activeTab !== 'IGNORE' && (
        <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-white text-xs flex items-center gap-2.5 text-slate-600">
          <MinusCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="leading-snug">
            <strong>새 카드 발급은 건너뛰세요</strong> — 아끼는 돈보다 시간이 더 들어요
          </span>
        </div>
      )}
    </div>
  );
};
