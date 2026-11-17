import React, { useState } from 'react';
import { ArrowLeft, Camera, Mic, Car, Copy, Check, ThumbsUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { ItineraryStop } from '../types/travel';
import { getSpotGuide, getTaxiAddress, photoUrl } from '../utils/spotGuide';

interface SpotDocentModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: ItineraryStop | null;
  onGoToVoiceRecord: (spotTitle: string) => void;
}

export const SpotDocentModal: React.FC<SpotDocentModalProps> = ({ isOpen, onClose, spot, onGoToVoiceRecord }) => {
  const [copied, setCopied] = useState(false);
  const [bigTaxi, setBigTaxi] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  if (!isOpen || !spot) return null;

  const doc = spot.docent;
  const guide = getSpotGuide(spot);
  const taxi = getTaxiAddress(spot);
  const cleanTitle = spot.title.replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim();
  const photos = guide?.photos || [];
  const keyPoints = doc?.mustSeePoints || [];
  const tips = [
    spot.smartTip && { label: '현장 팁', text: spot.smartTip },
    spot.feeTip && { label: '비용 팁', text: spot.feeTip },
    doc?.photoSpotTip && { label: '사진 포인트', text: doc.photoSpotTip },
    doc?.foodOrTastingTip && { label: '맛 · 체험', text: doc.foodOrTastingTip }
  ].filter(Boolean) as { label: string; text: string }[];

  const copy = () => {
    const text = [taxi.localName, taxi.address].filter(Boolean).join('\n');
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const close = () => { setPhotoIdx(0); setBigTaxi(false); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl lg:max-w-2xl h-full sm:h-[90vh] sm:rounded-3xl bg-white flex flex-col overflow-hidden shadow-2xl relative">
        <div className="shrink-0 h-14 px-2 flex items-center gap-2 border-b border-slate-200 bg-white">
          <button onClick={close} className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E2856] hover:bg-slate-100" aria-label="뒤로">
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-400 leading-none">
              장소 안내{spot.time && spot.time !== '-' ? ` · ${spot.time}` : ''}
            </div>
            <div className="text-sm font-extrabold text-[#111827] truncate mt-0.5">{cleanTitle}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {photos.length > 0 && (
            <div className="relative bg-slate-900">
              <div
                className="flex overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none' }}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setPhotoIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
                }}
              >
                {photos.map((p, i) => (
                  <img
                    key={p.src}
                    src={photoUrl(p.src)}
                    alt={`${guide?.name || cleanTitle} 사진 ${i + 1}`}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="w-full shrink-0 snap-center aspect-[4/3] object-cover"
                  />
                ))}
              </div>
              <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent text-[10px] text-white/85 flex items-end justify-between gap-2">
                <a href={photos[Math.min(photoIdx, photos.length - 1)].page} target="_blank" rel="noreferrer" className="truncate underline-offset-2 hover:underline">
                  {guide?.photoNote ? `${guide.photoNote} · ` : ''}사진: {photos[Math.min(photoIdx, photos.length - 1)].credit}
                </a>
                <span className="shrink-0 font-bold">{Math.min(photoIdx, photos.length - 1) + 1} / {photos.length}</span>
              </div>
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">{guide?.name || cleanTitle}</h1>
              {spot.description && <div className="text-sm text-slate-500 mt-1.5 leading-relaxed">{spot.description}</div>}
              {doc?.recommendedDuration && <div className="text-xs text-slate-500 mt-1.5">권장 체류 · {doc.recommendedDuration}</div>}
            </div>

            {(guide?.summary || doc?.summary) && (
              <p className="text-sm text-slate-800 leading-relaxed">{guide?.summary || doc?.summary}</p>
            )}

            {guide && guide.info.length > 0 && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {guide.info.map((it) => (
                  <div key={it.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <dt className="text-[11px] font-bold text-slate-500">{it.label}</dt>
                    <dd className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5 leading-snug">{it.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {guide && guide.good.length > 0 && (
              <section>
                <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-[#111827] mb-2">
                  <ThumbsUp className="w-4 h-4 text-[#27AE60]" /> 리뷰에서 자주 나온 이야기
                </h2>
                <ul className="space-y-2">
                  {guide.good.map((t, i) => (
                    <li key={i} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs sm:text-sm text-slate-800 leading-relaxed">{t}</li>
                  ))}
                </ul>
              </section>
            )}

            {guide && guide.caution.length > 0 && (
              <section>
                <h2 className="flex items-center gap-1.5 text-sm font-extrabold text-[#111827] mb-2">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" /> 알아둘 점
                </h2>
                <ul className="space-y-2">
                  {guide.caution.map((t, i) => (
                    <li key={i} className="p-3 rounded-xl bg-[#FFFDF5] border border-[#FDE68A] text-xs sm:text-sm text-[#78350F] leading-relaxed">{t}</li>
                  ))}
                </ul>
              </section>
            )}

            {keyPoints.length > 0 && (
              <section>
                <h2 className="text-sm font-extrabold text-[#111827] mb-2">여기서 꼭 볼 것</h2>
                <div className="space-y-2">
                  {keyPoints.map((point, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                      <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-[#1E2856] font-black text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                      <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tips.length > 0 && (
              <div className="space-y-2">
                {tips.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#FFFDF5] border border-[#FDE68A] text-xs text-[#78350F] leading-relaxed">
                    <span className="font-bold text-[#92400E] mr-1.5">{t.label}</span>{t.text}
                  </div>
                ))}
              </div>
            )}

            {doc?.historyAndStory && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-900 mb-1">이야기</div>
                {doc.historyAndStory}
              </div>
            )}

            {taxi.localName && (
              <section className="rounded-2xl bg-[#1E2856] text-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#EFA03D]">
                    <Car className="w-4 h-4" /> 택시 기사님께 보여주기
                  </span>
                  <button type="button" onClick={() => setBigTaxi(true)} className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25">
                    크게 보기
                  </button>
                </div>
                <div className="text-xl sm:text-2xl font-black leading-snug break-words">{taxi.localName}</div>
                {taxi.address && <div className="text-sm text-slate-200 break-words border-t border-white/10 pt-2">{taxi.address}</div>}
                <button type="button" onClick={copy} className="w-full py-2.5 rounded-xl bg-white text-[#1E2856] font-bold text-xs flex items-center justify-center gap-1.5">
                  {copied ? <Check className="w-4 h-4 text-[#27AE60]" /> : <Copy className="w-4 h-4" />}
                  {copied ? '복사됨 · 디디/가오더 지도에 붙여넣기' : '중국어 주소 복사'}
                </button>
              </section>
            )}

            {guide && guide.sources.length > 0 && (
              <section className="text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-600">출처 · 더 보기</div>
                {guide.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#1E2856] underline-offset-2 hover:underline">
                    <ExternalLink className="w-3 h-3 shrink-0" /> {s.label}
                  </a>
                ))}
              </section>
            )}

            {!guide && !doc && !spot.description && tips.length === 0 && (
              <p className="text-sm text-slate-500">이 일정에는 추가 안내가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => { onGoToVoiceRecord(cleanTitle); close(); }}
            className="py-3 px-4 rounded-xl bg-[#EFA03D] hover:bg-[#ea8c22] text-[#111827] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Mic className="w-4 h-4 stroke-[2.5]" />
            <span>느낌 남기기</span>
          </button>
          <label className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer">
            <Camera className="w-4 h-4" />
            <span>사진 추가</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" />
          </label>
        </div>

        {bigTaxi && taxi.localName && (
          <button
            type="button"
            onClick={() => setBigTaxi(false)}
            className="absolute inset-0 z-10 bg-[#1E2856] text-white flex flex-col items-center justify-center text-center p-6 gap-5"
            aria-label="닫기"
          >
            <div className="text-base font-bold text-[#EFA03D]">{/[가-힣]/.test(taxi.localName) ? '기사님, 이곳으로 가 주세요' : '师傅，您好！请带我去：'}</div>
            <div className="text-4xl sm:text-5xl font-black leading-tight break-words">{taxi.localName}</div>
            {taxi.address && <div className="text-xl font-semibold text-slate-200 break-words">{taxi.address}</div>}
            <div className="text-xs text-white/60 mt-4">화면을 누르면 닫혀요</div>
          </button>
        )}
      </div>
    </div>
  );
};
