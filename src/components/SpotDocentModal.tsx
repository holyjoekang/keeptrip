import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Camera, Mic, MapPin, CheckCircle, Volume2, Sparkles } from 'lucide-react';
import { ItineraryStop } from '../types/travel';

interface SpotDocentModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: ItineraryStop | null;
  onGoToVoiceRecord: (spotTitle: string) => void;
}

export const SpotDocentModal: React.FC<SpotDocentModalProps> = ({
  isOpen,
  onClose,
  spot,
  onGoToVoiceRecord
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isOpen || !spot) return null;

  const doc = spot.docent;
  const placeTitle = spot.title;
  const placeSubtitle = doc?.spotName || spot.description || '';

  const handleTogglePlay = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setPlaybackProgress(0);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = doc
        ? `${spot.title}. ${doc.summary}. ${doc.historyAndStory}. 꼭 보셔야 할 세 가지는 다음과 같습니다. ${doc.mustSeePoints.join('. ')}`
        : `${spot.title}. ${spot.description || ''}`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.95;

      utterance.onend = () => {
        setIsPlaying(false);
        setPlaybackProgress(100);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);

      // Simulate progress bar animation
      const interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 98 || !window.speechSynthesis.speaking) {
            clearInterval(interval);
            return prev;
          }
          return prev + 2;
        });
      }, 500);
    }
  };

  const cleanTitle = placeTitle.replace(/\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim();
  const keyPoints = doc?.mustSeePoints || [];
  const tips = [
    spot.smartTip && { label: '현장 팁', text: spot.smartTip },
    spot.feeTip && { label: '비용 팁', text: spot.feeTip },
    doc?.photoSpotTip && { label: '사진 포인트', text: doc.photoSpotTip },
    doc?.foodOrTastingTip && { label: '맛 · 체험', text: doc.foodOrTastingTip }
  ].filter(Boolean) as { label: string; text: string }[];
  const canSpeak = !!(doc || spot.description);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl lg:max-w-2xl h-full sm:h-[90vh] sm:rounded-3xl bg-white flex flex-col overflow-hidden shadow-2xl relative">
        {/* 상단 내비게이션 (최소화) */}
        <div className="shrink-0 h-14 px-2 flex items-center gap-2 border-b border-slate-200 bg-white">
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#1E2856] hover:bg-slate-100"
            aria-label="뒤로"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold text-slate-400 leading-none">
              장소 안내{spot.time && spot.time !== '-' ? ` · ${spot.time}` : ''}
            </div>
            <div className="text-sm font-extrabold text-[#111827] truncate mt-0.5">{cleanTitle}</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">{cleanTitle}</h1>
            {placeSubtitle && placeSubtitle !== placeTitle && (
              <div className="text-sm font-semibold text-slate-500 mt-1">{placeSubtitle}</div>
            )}
            {doc?.recommendedDuration && (
              <div className="text-xs text-slate-500 mt-1.5">권장 체류 · {doc.recommendedDuration}</div>
            )}
          </div>

          {doc?.summary && <p className="text-sm text-slate-700 leading-relaxed">{doc.summary}</p>}
          {!doc && spot.description && placeSubtitle !== spot.description && (
            <p className="text-sm text-slate-700 leading-relaxed">{spot.description}</p>
          )}

          {canSpeak && (
            <div className="bg-[#1E2856] text-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="w-12 h-12 rounded-full bg-white text-[#1E2856] flex items-center justify-center shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-all"
                aria-label={isPlaying ? '음성 일시정지' : '음성 해설 재생'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current stroke-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current stroke-current ml-0.5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span>음성 해설 · 한국어</span>
                  <span className="text-[#EFA03D]">{isPlaying ? '해설 듣는 중' : '터치 재생'}</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#EFA03D] to-[#27AE60] transition-all duration-300"
                    style={{ width: isPlaying ? `${Math.max(15, playbackProgress)}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          )}

          {keyPoints.length > 0 && (
            <div>
              <h2 className="text-sm font-extrabold text-[#111827] mb-3">여기서 꼭 볼 것</h2>
              <div className="space-y-2.5">
                {keyPoints.map((point, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-[#1E2856] font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tips.length > 0 && (
            <div className="space-y-2">
              {tips.map((t, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#FFFDF5] border border-[#FDE68A] text-xs text-[#78350F] leading-relaxed">
                  <span className="font-bold text-[#92400E] mr-1.5">{t.label}</span>
                  {t.text}
                </div>
              ))}
            </div>
          )}

          {doc?.historyAndStory && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <div className="font-bold text-slate-900 mb-1">도슨트 스토리</div>
              {doc.historyAndStory}
            </div>
          )}

          {!doc && !spot.description && tips.length === 0 && (
            <p className="text-sm text-slate-500">이 일정에는 추가 안내가 없습니다.</p>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onGoToVoiceRecord(cleanTitle);
              onClose();
            }}
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
      </div>
    </div>
  );
};
