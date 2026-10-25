import React, { useState } from 'react';
import { CreditCard, AlertTriangle, CheckCircle2, DollarSign, HelpCircle, ArrowUpRight, Sparkles, Coffee } from 'lucide-react';
import { TripData } from '../types/travel';
import { calculatePaymentOptimization } from '../utils/feeOptimizer';

interface FeeOptimizerCardProps {
  trip: TripData;
}

export const FeeOptimizerCard: React.FC<FeeOptimizerCardProps> = ({ trip }) => {
  const [budgetKrw, setBudgetKrw] = useState<number>(trip.defaultBudgetKrw || 1000000);
  const [singleTxKrw, setSingleTxKrw] = useState<number>(trip.destinationType === 'CN' ? 45000 : 25000);

  const optResult = calculatePaymentOptimization(trip.destinationType, budgetKrw, singleTxKrw);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">
                  현지 결제 & 환전 수수료 최적화 전략판
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-950">
                  {trip.destinationType === 'CN' ? '중국 맞춤형' : trip.destinationType === 'MY' ? '말레이시아 맞춤형' : '해외 공통'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                날짜마다 바뀌는 프로모션·최소수수료 정책을 반영한 실전 비용 시뮬레이터
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-white/10 px-3 py-2 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-300 block">최대 절약 가능 금액</span>
            <span className="text-lg font-black text-amber-300">
              약 {optResult.maxSavingsKrw.toLocaleString()}원 절약
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Dynamic Destination Rules Warning & Insight */}
        {trip.destinationType === 'CN' && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  중국 알리페이(Alipay) 200위안 룰 & 최소 수수료 주의사항
                </p>
                <p className="text-amber-800/90 mt-1 leading-relaxed">
                  • <strong>200위안(약 38,000원) 초과 결제</strong>: 알리페이 자체 3% 수수료가 자동으로 가산됩니다. (식당/훠궈 등에서 고액 결제 시 2명 이상이 나눠 결제하거나 트래블카드 등록 추천)<br />
                  • <strong>토스/비자 프로모션 변동</strong>: 시기에 따라 비자카드나 토스뱅크 우대 혜택이 바뀌며, 최근엔 소액 결제 시 1~3위안 최소 수수료가 붙는 가맹점도 생겼습니다. 하지만 500원 미만 차이는 카드 바꾸느라 애쓰지 마세요!
                </p>
              </div>
            </div>
          </div>
        )}

        {trip.destinationType === 'MY' && (
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  말레이시아 그랩(Grab) 3% 수수료 vs 지갑(GrabPay) 0% 충전 팁
                </p>
                <p className="text-amber-800/90 mt-1 leading-relaxed">
                  • <strong>그랩 앱에 국내 신용카드 직접 등록</strong>: 매 승차마다 3% 해외이용 수수료가 자동으로 부과됩니다.<br />
                  • <strong>수수료 0% 해결법</strong>: 그랩 메인의 <strong>GrabPay Wallet</strong>에 트래블로그/토스카드로 50~100링깃씩 충전해 쓰면 3% 수수료가 완전히 면제됩니다! (단, 단거리 1~2회 이용은 500원 차이이므로 기존 카드로 타셔도 무방합니다.)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sliders for Interactive Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="budget-slider" className="text-xs font-bold text-slate-700">
                현지 예상 총 결제 금액
              </label>
              <span className="text-sm font-extrabold text-indigo-600">
                {budgetKrw.toLocaleString()}원
              </span>
            </div>
            <input
              id="budget-slider"
              type="range"
              min="200000"
              max="3000000"
              step="50000"
              value={budgetKrw}
              onChange={(e) => setBudgetKrw(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>20만원</span>
              <span>150만원</span>
              <span>300만원</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="tx-slider" className="text-xs font-bold text-slate-700">
                건당 평균 결제 금액
                {trip.destinationType === 'CN' && (
                  <span className="text-[10px] text-amber-600 ml-1 font-normal">
                    (38,000원 기준 200위안 룰 적용)
                  </span>
                )}
              </label>
              <span className="text-sm font-extrabold text-indigo-600">
                {singleTxKrw.toLocaleString()}원
              </span>
            </div>
            <input
              id="tx-slider"
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={singleTxKrw}
              onChange={(e) => setSingleTxKrw(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>1만원 (커피/간식)</span>
              <span>4만원 (임계치)</span>
              <span>20만원 (만찬/쇼핑)</span>
            </div>
          </div>
        </div>

        {/* Real-world Comparison Grid */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            결제 수단별 총 수수료 및 최종 지출액 비교
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {optResult.comparison.map((item, idx) => {
              const isBest = item.totalFeeKrw === 0 || item.badge?.includes('최적') || item.badge?.includes('추천');
              return (
                <div
                  key={item.methodId}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isBest
                      ? 'border-emerald-300 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.methodName}
                      </span>
                    </div>
                    {item.badge && (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mb-2 ${
                          isBest
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 mt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] text-slate-500">예상 수수료:</span>
                      <span
                        className={`text-xs font-bold ${
                          item.totalFeeKrw === 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {item.totalFeeKrw === 0 ? '0원' : `+${item.totalFeeKrw.toLocaleString()}원`}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mt-0.5">
                      <span className="text-[11px] text-slate-500">최종 청구:</span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {item.finalCostKrw.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pareto Decision: Is it worth making a new card vs keeping existing? */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              {optResult.recommendationDecision === 'KEEP_EXISTING' ? (
                <Coffee className="w-5 h-5 text-amber-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {optResult.recommendationDecision === 'KEEP_EXISTING'
                    ? '실용주의 판정: 기존 카드 유지 권장 (새 카드 발급 불필요)'
                    : '실용주의 판정: 트래블카드 또는 현지 지갑 충전 적극 권장'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {optResult.recommendationSummary}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-end sm:self-center">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-slate-200 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              가이드 원칙 준수
            </span>
          </div>
        </div>

        {/* Action Tip */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
          <span className="font-extrabold text-indigo-700 shrink-0">핵심 실천 팁:</span>
          <span>{optResult.keyActionTip}</span>
        </div>
      </div>
    </div>
  );
};
