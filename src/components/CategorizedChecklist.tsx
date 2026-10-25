import React, { useState } from 'react';
import { CheckSquare, Square, AlertOctagon, TrendingDown, Coffee, Copy, Check, Filter } from 'lucide-react';
import { ChecklistItem, TripData } from '../types/travel';

interface CategorizedChecklistProps {
  trip: TripData;
  checklist: ChecklistItem[];
  onToggleItem: (id: string) => void;
}

export const CategorizedChecklist: React.FC<CategorizedChecklistProps> = ({
  trip,
  checklist,
  onToggleItem
}) => {
  const [activeTier, setActiveTier] = useState<'ALL' | 'MUST' | 'SAVINGS' | 'IGNORE'>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercent = Math.round((completedCount / Math.max(1, checklist.length)) * 100);

  const filteredItems = checklist.filter((item) => {
    if (activeTier === 'ALL') return true;
    return item.tier === activeTier;
  });

  const mustCount = checklist.filter((i) => i.tier === 'MUST').length;
  const savingsCount = checklist.filter((i) => i.tier === 'SAVINGS').length;
  const ignoreCount = checklist.filter((i) => i.tier === 'IGNORE').length;

  const totalPotentialSavings = checklist
    .filter((i) => i.estimatedSavingKrw)
    .reduce((acc, curr) => acc + (curr.estimatedSavingKrw || 0), 0);

  const handleCopyChecklist = () => {
    const text = `[나만의 여행 가이드 - ${trip.title} 준비 체크리스트]
진행률: ${completedCount}/${checklist.length} (${progressPercent}%)

■ [필수] 안 챙기면 낭패보는 것들
${checklist
  .filter((i) => i.tier === 'MUST')
  .map((i) => `${i.completed ? '☑' : '☐'} ${i.title} - ${i.description}`)
  .join('\n')}

■ [절약] 아끼면 큰돈 되는 것들 (예상 절약: 약 ${totalPotentialSavings.toLocaleString()}원)
${checklist
  .filter((i) => i.tier === 'SAVINGS')
  .map((i) => `${i.completed ? '☑' : '☐'} ${i.title} (${i.estimatedSavingKrw?.toLocaleString()}원 절약) - ${i.description}`)
  .join('\n')}

■ [패스] 1~2천원 아끼려다 피곤해지는 것 (과감히 무시)
${checklist
  .filter((i) => i.tier === 'IGNORE')
  .map((i) => `${i.completed ? '☑' : '☐'} ${i.title} - ${i.description}`)
  .join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-slate-900">
              맞춤형 실속 체크리스트 & 의사결정 매트릭스
            </h3>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-700">
              3단계 실천 필터
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ‘반드시 챙길 것’과 ‘아끼면 돈 되는 것’, 그리고 ‘시간을 위해 무시할 것’을 명확히 구분했습니다.
          </p>
        </div>

        <button
          onClick={handleCopyChecklist}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors self-start sm:self-auto"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700">복사 완료!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span>체크리스트 복사</span>
            </>
          )}
        </button>
      </div>

      {/* Progress & Tier Filter Tabs */}
      <div className="px-5 sm:px-6 pt-4 pb-2 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
          <span>준비 완료율: <strong>{progressPercent}%</strong> ({completedCount}/{checklist.length} 완료)</span>
          <span className="text-emerald-700 font-bold">
            스마트 실천으로 약 {totalPotentialSavings.toLocaleString()}원 절약 예상
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pb-2">
          <button
            onClick={() => setActiveTier('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTier === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            전체 보기 ({checklist.length})
          </button>

          <button
            onClick={() => setActiveTier('MUST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
              activeTier === 'MUST'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>반드시 챙길 것 ({mustCount})</span>
          </button>

          <button
            onClick={() => setActiveTier('SAVINGS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
              activeTier === 'SAVINGS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>아끼면 큰돈 되는 것 ({savingsCount})</span>
          </button>

          <button
            onClick={() => setActiveTier('IGNORE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
              activeTier === 'IGNORE'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>무시해도 되는 것 ({ignoreCount})</span>
          </button>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="divide-y divide-slate-100">
        {filteredItems.map((item) => {
          let tierBadgeClass = '';
          let tierLabel = '';
          let tierIcon = null;

          if (item.tier === 'MUST') {
            tierBadgeClass = 'bg-rose-100 text-rose-800 border-rose-200';
            tierLabel = '필수 준비 (낭패 방지)';
            tierIcon = <AlertOctagon className="w-3 h-3 text-rose-600 inline mr-1" />;
          } else if (item.tier === 'SAVINGS') {
            tierBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
            tierLabel = '절약 추천 (가성비)';
            tierIcon = <TrendingDown className="w-3 h-3 text-amber-600 inline mr-1" />;
          } else {
            tierBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            tierLabel = '무시 가능 (피로도 절감)';
            tierIcon = <Coffee className="w-3 h-3 text-emerald-600 inline mr-1" />;
          }

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => onToggleItem(item.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleItem(item.id);
                }
              }}
              className={`p-4 sm:p-5 flex items-start gap-3.5 text-left transition-colors cursor-pointer ${
                item.completed ? 'bg-slate-50/70 opacity-75' : 'hover:bg-slate-50/40 bg-white'
              }`}
            >
              <div className="shrink-0 mt-0.5 text-indigo-600">
                {item.completed ? (
                  <CheckSquare className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Square className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${tierBadgeClass}`}
                  >
                    {tierIcon}
                    {tierLabel}
                  </span>
                  {item.estimatedSavingKrw && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{item.estimatedSavingKrw.toLocaleString()}원 아낌
                    </span>
                  )}
                </div>

                <h4
                  className={`text-sm font-bold leading-snug ${
                    item.completed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {item.title}
                </h4>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>

                {item.actionTip && (
                  <div className="mt-2 text-xs font-semibold text-indigo-900 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100/80 inline-block">
                    💡 실전 팁: {item.actionTip}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
