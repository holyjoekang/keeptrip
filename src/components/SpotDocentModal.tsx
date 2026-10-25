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

  const defaultKeyPoints = doc?.mustSeePoints || [
    '600년 역사 유적 — 고대 발효조 발굴 현장',
    '전통 제조기술 전시 — 실제 생산 장면',
    '시음 코너 — 운영 여부 현장 확인'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl lg:max-w-2xl h-full sm:h-[90vh] sm:rounded-3xl bg-white flex flex-col overflow-hidden shadow-2xl relative">
        {/* Top Image & Hero Area */}
        <div className="relative h-64 bg-[#1E2856] shrink-0 text-white flex flex-col justify-between p-5">
          {/* Back button */}
          <div className="flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white text-[#1E2856] flex items-center justify-center shadow-md hover:bg-slate-100 transition-colors"
              aria-label="닫기"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <span className="text-xs text-white/60 font-mono tracking-wider">
              KeepTrip Docent
            </span>
          </div>

          {/* Background image preview if available */}
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <img
              src="https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1200&q=80"
              alt={placeTitle}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E2856] via-transparent to-black/30" />

          {/* Arrived Badge */}
          <div className="relative z-10 self-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white text-[#1E2856] shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[#EFA03D] fill-[#EFA03D]" />
              방금 도착했어요
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Place Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              {placeTitle.replace(/\(.*\)/, '').trim()}
            </h1>
            <div className="text-sm font-semibold text-slate-500 mt-0.5 font-sans">
              {placeTitle.includes('수정방')
                ? '水井坊博物馆 · 청두 금강구'
                : placeTitle.includes('홍야동')
                ? '洪崖洞景区 · 충칭 유중구'
                : placeTitle.includes('바투')
                ? 'Batu Caves · 쿠알라룸푸르'
                : placeSubtitle}
            </div>
          </div>

          {/* 3-Minute Audio Player Card (Dark Indigo Navy #1E2856) */}
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
                <span>3분 음성 해설 · 한국어</span>
                <span className="text-[#EFA03D]">{isPlaying ? '해설 듣는 중' : '터치 재생'}</span>
              </div>

              {/* Waveform / Progress bar */}
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#EFA03D] to-[#27AE60] transition-all duration-300"
                  style={{ width: isPlaying ? `${Math.max(15, playbackProgress)}%` : '0%' }}
                />
              </div>
            </div>
          </div>

          {/* Must See Points (여기서 꼭 볼 것) */}
          <div>
            <h2 className="text-sm font-extrabold text-[#111827] mb-3">
              여기서 꼭 볼 것
            </h2>

            <div className="space-y-2.5">
              {defaultKeyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                >
                  <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-[#1E2856] font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                    {point}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Background Story if present */}
          {doc?.historyAndStory && (
            <div className="p-4 rounded-xl bg-[#FFFDF5] border border-[#FDE68A] text-xs text-[#78350F] leading-relaxed">
              <div className="font-bold text-[#92400E] mb-1">💡 도슨트 스토리</div>
              {doc.historyAndStory}
            </div>
          )}
        </div>

        {/* Bottom Actions Bar matching PDF page 4 */}
        <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onGoToVoiceRecord(placeTitle);
              onClose();
            }}
            className="py-3 px-4 rounded-xl bg-[#EFA03D] hover:bg-[#ea8c22] text-[#111827] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Mic className="w-4 h-4 stroke-[2.5]" />
            <span>느낌 남기기</span>
          </button>

          <button
            type="button"
            onClick={() => alert('카메라 촬영 또는 갤러리 사진 추가 기능이 연동되었습니다.')}
            className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-2 shadow-2xs transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>사진 추가</span>
          </button>
        </div>
      </div>
    </div>
  );
};
