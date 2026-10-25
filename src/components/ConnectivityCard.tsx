import React, { useState } from 'react';
import { Wifi, Smartphone, Check, X, ShieldAlert, Zap, HelpCircle } from 'lucide-react';
import { TripData } from '../types/travel';
import { analyzeConnectivity } from '../utils/dataConnectivity';

interface ConnectivityCardProps {
  trip: TripData;
}

export const ConnectivityCard: React.FC<ConnectivityCardProps> = ({ trip }) => {
  const [days, setDays] = useState<number>(trip.destinationType === 'CN' ? 5 : 8);
  const [partySize, setPartySize] = useState<number>(trip.destinationType === 'CN' ? 4 : 2);
  const [eSimSupported, setESimSupported] = useState<boolean>(true);

  const analysis = analyzeConnectivity(
    trip.destinationType,
    days,
    partySize,
    eSimSupported
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">
                  해외 데이터 통신 최적화 (eSIM vs 로밍 vs 도시락)
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-400 text-slate-950">
                  가성비 1순위
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                포켓와이파이 충전 번거로움과 비싼 로밍 비용을 없애는 최적 선택지
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-white/10 px-3 py-2 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-300 block">로밍 대비 절약액</span>
            <span className="text-lg font-black text-emerald-300">
              약 {analysis.totalSavingsVsRoaming.toLocaleString()}원 절약
            </span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* China-specific VPN / Great Firewall note */}
        {trip.destinationType === 'CN' && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-blue-900">
                  중국 여행 특급 노하우: 로밍형 eSIM 하나로 유료 VPN 비용까지 0원!
                </p>
                <p className="text-blue-800/90 mt-1 leading-relaxed">
                  중국 현지 유심이나 호텔 와이파이는 만리방화벽(Golden Shield) 때문에 카카오톡, 유튜브, 네이버 블로그, 구글 지도가 전면 먹통입니다. 하지만 한국/홍콩 통신사 망을 경유하는 <strong>로밍형 eSIM</strong>을 구매하면 별도 VPN 프로그램 없이도 평소처럼 카톡과 유튜브가 바로 작동합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label htmlFor="conn-days-slider" className="text-xs font-bold text-slate-700 block mb-1">
              여행 기간 (일수)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="conn-days-slider"
                type="range"
                min="3"
                max="15"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-indigo-700 min-w-[36px] text-right">
                {days}일
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="conn-party-slider" className="text-xs font-bold text-slate-700 block mb-1">
              여행 인원수
            </label>
            <div className="flex items-center gap-2">
              <input
                id="conn-party-slider"
                type="range"
                min="1"
                max="8"
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm font-bold text-indigo-700 min-w-[36px] text-right">
                {partySize}명
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1">
              eSIM 지원 스마트폰 보유
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setESimSupported(true)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  eSimSupported
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                예 (아이폰/갤럭시S23+)
              </button>
              <button
                type="button"
                onClick={() => setESimSupported(false)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  !eSimSupported
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                아니오 (구형 폰)
              </button>
            </div>
          </div>
        </div>

        {/* 3 Options Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.options.map((opt) => {
            const isBest = opt.type === 'eSIM';
            return (
              <div
                key={opt.type}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isBest
                    ? 'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-sm font-bold text-slate-900">{opt.title}</span>
                    {isBest && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">
                        강력 추천
                      </span>
                    )}
                  </div>

                  <div className="my-3 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-500">예상 총 비용:</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {opt.totalCostKrw.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-[11px] text-slate-400 mt-0.5">
                      <span>1인 1일 환산:</span>
                      <span>약 {opt.dailyCostKrw.toLocaleString()}원</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="font-bold text-slate-700">장점:</p>
                    {opt.pros.map((p, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  {opt.cons.length > 0 && (
                    <div className="mt-3 space-y-1.5 text-xs pt-2 border-t border-slate-100">
                      <p className="font-bold text-slate-500">단점/주의:</p>
                      {opt.cons.map((c, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-slate-500">
                          <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 text-[11px] font-semibold text-slate-500 border-t border-slate-100">
                  {opt.notes}
                </div>
              </div>
            );
          })}
        </div>

        {/* Device compatibility quick check */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-800">내 폰 eSIM 지원 여부 확인법: </span>
            <span>전화 키패드에서 <strong>*#06#</strong> 입력 후 화면에 <strong>EID</strong> 항목이 보이면 100% eSIM 지원 모델입니다.</span>
          </div>
          <span className="text-indigo-600 font-semibold shrink-0">
            아이폰 XS 이후 / 갤럭시 S23·S24·플립4 이후 전기종 지원
          </span>
        </div>
      </div>
    </div>
  );
};
