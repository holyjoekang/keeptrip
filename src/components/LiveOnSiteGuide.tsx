import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, MapPin, Sparkles, Star, ThumbsUp, CheckCircle, Clock, BookOpen, Camera, Play, Pause, AlertCircle } from 'lucide-react';
import { TripData, ItineraryStop, VoiceJournalEntry } from '../types/travel';

interface LiveOnSiteGuideProps {
  trip: TripData;
  voiceNotes: VoiceJournalEntry[];
  onAddVoiceNote: (note: VoiceJournalEntry) => void;
}

export const LiveOnSiteGuide: React.FC<LiveOnSiteGuideProps> = ({
  trip,
  voiceNotes,
  onAddVoiceNote
}) => {
  // Collect all stops with docent or notable spots
  const allStops: ItineraryStop[] = [];
  trip.days.forEach((day) => {
    day.stops.forEach((stop) => {
      allStops.push(stop);
    });
  });

  const docentStops = allStops.filter((s) => s.docent);
  const [selectedSpotId, setSelectedSpotId] = useState<string>(
    () => docentStops[0]?.id || allStops[0]?.id || 'spot-default'
  );

  useEffect(() => {
    const stopsWithDocent = allStops.filter((s) => s.docent);
    if (stopsWithDocent.length > 0 && stopsWithDocent[0].id) {
      setSelectedSpotId(stopsWithDocent[0].id);
    }
  }, [trip.id]);

  const activeSpot = allStops.find((s) => s.id === selectedSpotId) || docentStops[0] || allStops[0];

  // Voice recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [recognitionSupported, setRecognitionSupported] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<'food' | 'culture' | 'insight' | 'tip'>('food');
  const [rating, setRating] = useState<number>(5);
  const [isRecommended, setIsRecommended] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Audio Docent TTS state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    // Check SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ko-KR';

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscriptText(current);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setRecognitionSupported(false);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback for browsers without speech API
        setIsRecording(!isRecording);
      }
    }
  };

  const handleSaveVoiceNote = () => {
    if (!transcriptText.trim()) return;

    const newNote: VoiceJournalEntry = {
      id: `vn-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      spotTitle: activeSpot.title,
      category: selectedCategory,
      transcript: transcriptText.trim(),
      rating,
      isRecommended
    };

    onAddVoiceNote(newNote);
    setTranscriptText('');
    setIsRecording(false);
  };

  const handleToggleDocentSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const doc = activeSpot.docent;
      const textToSpeak = doc
        ? `${doc.spotName}에 오신 것을 환영합니다. ${doc.summary}. ${doc.historyAndStory}. 꼭 보셔야 할 핵심 포인트는 다음과 같습니다. ${doc.mustSeePoints.join('. ')}`
        : `${activeSpot.title}. ${activeSpot.description || ''}`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-xs border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">현장 실시간 동행 & 음성 도슨트</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-400 text-slate-950">
                  LIVE 모드
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                현장 도착 시 박물관·맛집 숨은 스토리 자동 안내 & 키보드 없이 목소리로 남기는 생생한 기록
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Spot Selection & Live Docent Reader (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  현재 도착 장소 선택 (GPS 연동)
                </span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">
                  현장 스마트 도슨트 가이드
                </h4>
              </div>

              {activeSpot.docent && (
                <button
                  onClick={handleToggleDocentSpeech}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isSpeaking
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  aria-label="도슨트 음성 해설 듣기"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? '음성 중지' : '도슨트 음성 듣기'}</span>
                </button>
              )}
            </div>

            {/* Quick Spot Chips */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto flex gap-2 no-scrollbar">
              {docentStops.map((stop) => {
                const isSelected = stop.id === selectedSpotId;
                return (
                  <button
                    key={stop.id || stop.title}
                    onClick={() => {
                      if (window.speechSynthesis) window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                      if (stop.id) setSelectedSpotId(stop.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    📍 {stop.title}
                  </button>
                );
              })}
            </div>

            {/* Docent Card Content */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>{activeSpot.docent?.spotName || activeSpot.title}</span>
                  {activeSpot.isRecommended && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-extrabold bg-amber-100 text-amber-900">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      강력 추천 장소
                    </span>
                  )}
                </h3>
                {activeSpot.docent && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    권장 소요시간: {activeSpot.docent.recommendedDuration}
                  </span>
                )}
              </div>

              {activeSpot.docent ? (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm font-semibold leading-relaxed">
                    🌟 <strong>한 줄 요약:</strong> {activeSpot.docent.summary}
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>역사 배경 및 숨은 이야기</span>
                    </h5>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      {activeSpot.docent.historyAndStory}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>현장에서 놓치면 안 되는 필수 관람 포인트</span>
                    </h5>
                    <ul className="space-y-1.5">
                      {activeSpot.docent.mustSeePoints.map((pt, i) => (
                        <li key={i} className="text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-snug">{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {activeSpot.docent.photoSpotTip && (
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-950 text-xs flex items-start gap-2">
                      <Camera className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>인생 사진 앵글:</strong> {activeSpot.docent.photoSpotTip}
                      </div>
                    </div>
                  )}

                  {activeSpot.docent.foodOrTastingTip && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>맛있게 즐기는 법:</strong> {activeSpot.docent.foodOrTastingTip}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {activeSpot.description || '현장 방문 일정입니다.'}
                  {activeSpot.smartTip && (
                    <p className="mt-2 text-indigo-900 font-semibold">
                      💡 실전 팁: {activeSpot.smartTip}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Voice Recorder & Quick Notes (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                키보드 타이핑 없이 음성으로 남기기
              </span>
              <h4 className="text-base font-black text-slate-900 mt-0.5">
                현장 실시간 보이스 다이어리
              </h4>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Mic Record Button */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                    isRecording
                      ? 'bg-rose-600 text-white scale-110 ring-4 ring-rose-300 animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                  aria-label={isRecording ? '음성 녹음 중지' : '음성 녹음 시작'}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
                <p className="mt-3 text-xs font-bold text-slate-800">
                  {isRecording ? '음성을 듣고 있습니다... 말씀하세요' : '버튼을 누르고 말씀하세요'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  (음식 맛, 감동 포인트, 지인 추천 팁 등)
                </p>
              </div>

              {/* Dictated text area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  기록 내용 (음성 변환 및 직접 수정 가능)
                </label>
                <textarea
                  rows={3}
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  placeholder="예: 여기 국물이 정말 깊고 맛있네요! 친구들하고 오면 200위안 넘으니 나눠서 결제하세요."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              {/* Category & Rating */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-bold text-slate-600 mb-1">카테고리</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none"
                  >
                    <option value="food">🍽️ 맛·음식 평가</option>
                    <option value="culture">🏛️ 박물관·명소 감상</option>
                    <option value="insight">💡 여행 소회·배움</option>
                    <option value="tip">⚠️ 주의·실전 팁</option>
                  </select>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-600 mb-1">나의 평점</span>
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= rating ? 'fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSaveVoiceNote}
                disabled={!transcriptText.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                보이스 기록 저장하기 (블로그 자동 반영)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recorded Voice Notes Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span>현장에서 쌓인 실시간 보이스 기록</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                총 {voiceNotes.length}개
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              저장된 모든 음성 메모는 '나만의 여행 블로그'에 실시간으로 자동 정리됩니다.
            </p>
          </div>
        </div>

        {voiceNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            아직 저장된 보이스 메모가 없습니다. 위 마이크 버튼을 눌러 첫 번째 기록을 남겨보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {voiceNotes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-extrabold text-slate-900 truncate">
                      📍 {note.spotTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">{note.timestamp}</span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                    "{note.transcript}"
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white text-slate-600 font-semibold border border-slate-200">
                    {note.category === 'food'
                      ? '🍽️ 미식'
                      : note.category === 'culture'
                      ? '🏛️ 문화'
                      : note.category === 'insight'
                      ? '💡 통찰'
                      : '⚠️ 팁'}
                  </span>

                  {note.rating && (
                    <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{note.rating}.0</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
