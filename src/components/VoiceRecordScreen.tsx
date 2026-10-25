import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Camera, X, Check, Sparkles, Tag, Clock, Volume2, Play, Pause, Bookmark, RefreshCw } from 'lucide-react';
import { TripData, VoiceJournalEntry } from '../types/travel';

interface VoiceRecordScreenProps {
  trip: TripData;
  activeSpotTitle?: string;
  voiceNotes: VoiceJournalEntry[];
  onSaveVoiceNote: (note: VoiceJournalEntry) => void;
  onClose?: () => void;
}

export const VoiceRecordScreen: React.FC<VoiceRecordScreenProps> = ({
  trip,
  activeSpotTitle = '수정방 박물관',
  voiceNotes,
  onSaveVoiceNote,
  onClose
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [recordSeconds, setRecordSeconds] = useState<number>(24);
  const [transcript, setTranscript] = useState<string>(
    '발효 구덩이가 600년 동안 계속 쓰였다는 게 놀랍다. 시음한 술은 생각보다 부드러웠고, 아내는 향이 좋다고…'
  );
  const [hasAttachedPhoto, setHasAttachedPhoto] = useState<boolean>(true);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);

  const [selectedTags, setSelectedTags] = useState<string[]>([
    `장소 · ${activeSpotTitle}`,
    trip.destinationType === 'CN' ? '체험 · 백주 시음' : '체험 · 무상킹 시식',
    trip.partyText.includes('친구') ? '함께 · 친구들' : '함께 · 아내',
    '추천 · 좋았음'
  ]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
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
        if (current) setTranscript(current);
      };

      recognition.onerror = () => setIsRecording(false);
      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch (e) {
        // already active
      }
    }
  }, []);

  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
      setIsRecording(true);
    }
  };

  const handleSaveAndFinish = () => {
    if (!transcript.trim()) return;

    const newNote: VoiceJournalEntry = {
      id: `vn-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      spotTitle: activeSpotTitle,
      category: 'culture',
      transcript: transcript.trim(),
      rating: 5,
      isRecommended: true
    };

    onSaveVoiceNote(newNote);
    if (onClose) onClose();
  };

  const handlePlayVoicePreview = (id: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (playingNoteId === id) {
      window.speechSynthesis.cancel();
      setPlayingNoteId(null);
    } else {
      window.speechSynthesis.cancel();
      setPlayingNoteId(id);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = 1.0;
      utter.onend = () => setPlayingNoteId(null);
      utter.onerror = () => setPlayingNoteId(null);
      window.speechSynthesis.speak(utter);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="pb-44 md:pb-16 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            DAY 3 · {activeSpotTitle} · 실시간 현장 보이스
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-[#111827] tracking-tight mt-0.5">
            말로 남기기
          </h1>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Recording Console & AI Tags (7 cols on md/lg) */}
        <div className="md:col-span-7 space-y-5">
          {/* Active Voice Console Card */}
          <section
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
            role="region"
            aria-label="실시간 음성 기록 및 변환 카드"
          >
            {/* Status indicator and animated Dawn waveform */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-400'
                  }`}
                />
                <span className="text-sm font-black text-slate-800">
                  {isRecording ? `🔴 듣는 중 · ${formatSeconds(recordSeconds)}` : '녹음 일시정지됨'}
                </span>
              </div>

              {/* Dawn color animated sound wave */}
              <div className="flex items-center gap-1 h-5">
                <span className={`w-1 bg-[#EFA03D] rounded-full transition-all ${isRecording ? 'h-3 animate-pulse' : 'h-1.5'}`} />
                <span className={`w-1 bg-[#EFA03D] rounded-full transition-all ${isRecording ? 'h-6 animate-pulse' : 'h-2'}`} />
                <span className={`w-1 bg-[#EFA03D] rounded-full transition-all ${isRecording ? 'h-2.5 animate-pulse' : 'h-1'}`} />
                <span className={`w-1 bg-[#EFA03D] rounded-full transition-all ${isRecording ? 'h-5 animate-pulse' : 'h-2'}`} />
                <span className={`w-1 bg-[#EFA03D] rounded-full transition-all ${isRecording ? 'h-3.5 animate-pulse' : 'h-1.5'}`} />
              </div>
            </div>

            {/* Editable Transcript Area */}
            <div>
              <label htmlFor="voice-transcript" className="block text-xs font-bold text-slate-400 mb-1.5">
                실시간 텍스트 변환 (직접 수정 가능)
              </label>
              <textarea
                id="voice-transcript"
                rows={4}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="장소에서 느낀 점, 맛, 분위기를 편하게 말씀하세요..."
                className="w-full text-base font-medium text-slate-900 border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-[#1E2856] resize-none leading-relaxed bg-slate-50/50"
              />
            </div>

            {/* Desktop & Tablet In-card Action Controls */}
            <div className="hidden md:flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    isRecording
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                      : 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {isRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRecording ? '일시정지' : '이어서 녹음'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasAttachedPhoto(!hasAttachedPhoto)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    hasAttachedPhoto
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{hasAttachedPhoto ? '사진 4장 첨부됨' : '사진 첨부하기'}</span>
                </button>
              </div>

              {/* Primary Save Button in Dawn amber */}
              <button
                type="button"
                onClick={handleSaveAndFinish}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EFA03D] hover:bg-[#ea8c22] text-[#111827] font-black text-sm shadow-xs transition-colors"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>기록 완료 & 저장</span>
              </button>
            </div>
          </section>

          {/* AI Summarized Card (AI가 정리한 기록) matching Page 5 */}
          <section
            className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-3xl p-6 shadow-2xs space-y-3"
            role="region"
            aria-label="AI 자동 정리 태그 및 요약 카드"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-[#1E40AF]">
                <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                <span>AI가 정리한 스마트 메타데이터</span>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-white/80 px-2 py-0.5 rounded-md border border-blue-200">
                자동 분류됨
              </span>
            </div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedTags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-800 border border-[#DBEAFE] shadow-2xs"
                >
                  {t}
                </span>
              ))}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {hasAttachedPhoto
                ? '📷 현장에서 촬영한 사진 4장과 자동으로 매칭되었습니다. 스토리 탭의 DAY 3 웹 매거진 섹션에 즉시 수록됩니다.'
                : '현장 음성 기록을 텍스트와 함께 스토리 탭에 저장합니다.'}
            </p>
          </section>
        </div>

        {/* Right Column: Today's Timeline & Workflow Tips (5 cols on md/lg) */}
        <div className="md:col-span-5 space-y-5">
          {/* Section: 오늘 남긴 기록 matching Page 5 */}
          <section
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
            role="region"
            aria-label="오늘 남긴 기록 타임라인"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#111827]">
                오늘 남긴 기록
              </h2>
              <span className="text-xs font-bold text-[#EFA03D] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                총 {voiceNotes.length + 2}건 기록 중
              </span>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="pt-2 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#1E2856]">13:10</span>
                    <span className="font-extrabold text-slate-900">마파두부 진마파 식당</span>
                  </div>
                  <p className="font-medium text-slate-600 italic">
                    "마파두부 — 이번 여행 최고의 맛. 얼얼한 화자오 향이 일품."
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlayVoicePreview('sample-1', '마파두부, 이번 여행 최고의 맛. 얼얼한 화자오 향이 일품.')}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#1E2856] hover:bg-slate-100 shrink-0"
                  aria-label="음성 듣기"
                >
                  {playingNoteId === 'sample-1' ? <Pause className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#1E2856]">10:05</span>
                    <span className="font-extrabold text-slate-900">충칭-청두 고속철</span>
                  </div>
                  <p className="font-medium text-slate-600 italic">
                    "고속철 창밖 풍경, 생각보다 깨끗하고 시속 300km로 매끄럽게 달린다."
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePlayVoicePreview('sample-2', '고속철 창밖 풍경, 생각보다 깨끗하고 시속 300km로 매끄럽게 달린다.')}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#1E2856] hover:bg-slate-100 shrink-0"
                  aria-label="음성 듣기"
                >
                  {playingNoteId === 'sample-2' ? <Pause className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Any additional voice notes from state */}
              {voiceNotes.map((note) => (
                <div key={note.id} className="pt-3 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#1E2856]">{note.timestamp}</span>
                      <span className="font-extrabold text-slate-900">{note.spotTitle}</span>
                    </div>
                    <p className="font-medium text-slate-600 line-clamp-2 italic">
                      "{note.transcript}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlayVoicePreview(note.id, note.transcript)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#1E2856] hover:bg-slate-100 shrink-0"
                    aria-label="음성 듣기"
                  >
                    {playingNoteId === note.id ? <Pause className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Value Guide Card (Solving User's core pain point) */}
          <section
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-3"
            role="note"
          >
            <div className="flex items-center gap-2 text-xs font-black text-[#1E2856]">
              <Bookmark className="w-4 h-4 text-[#EFA03D]" />
              <span>KeepTrip 음성 기록의 마법</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              구글 닥스에 붙여넣고, AI로 다듬고, 코딩해서 깃허브에 올리던 복잡한 과정을 단 한 번의 보이스 터치로 끝냅니다.
              <br /><br />
              여행이 끝나면 <strong>스토리 탭</strong>에서 자동으로 깔끔한 웹 매거진과 카카오톡 맞춤 카드가 완성되어 가족 및 지인과 바로 나눌 수 있습니다.
            </p>
          </section>
        </div>
      </div>

      {/* Mobile-only Bottom Floating Controls Bar matching Page 5 */}
      <div className="md:hidden fixed bottom-20 left-0 right-0 z-30">
        <div className="max-w-[480px] mx-auto px-6 flex items-center justify-between">
          {/* Cancel */}
          <button
            type="button"
            onClick={onClose || (() => setTranscript(''))}
            className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-md text-slate-600 flex items-center justify-center hover:bg-slate-50"
            aria-label="취소"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Big Record Toggle Button in Dawn color with Black Icon */}
          <button
            type="button"
            onClick={isRecording ? handleSaveAndFinish : handleToggleRecord}
            className="w-16 h-16 rounded-full bg-[#EFA03D] hover:bg-[#ea8c22] shadow-lg flex items-center justify-center text-[#111827] transition-all hover:scale-105 active:scale-95 border-2 border-white"
            aria-label={isRecording ? '녹음 완료 및 저장' : '다시 녹음하기'}
          >
            {isRecording ? (
              <Square className="w-6 h-6 fill-[#111827] stroke-[#111827]" />
            ) : (
              <Mic className="w-6 h-6 stroke-[2.5]" />
            )}
          </button>

          {/* Camera attach */}
          <button
            type="button"
            onClick={() => setHasAttachedPhoto(!hasAttachedPhoto)}
            className={`w-12 h-12 rounded-full border shadow-md flex items-center justify-center transition-colors ${
              hasAttachedPhoto
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            aria-label="사진 첨부"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
