import React, { useState } from 'react';
import { Share2, Download, Copy, Check, Star, MessageCircle, ExternalLink, Edit3, Award, FileText, Volume2, Sparkles, MapPin, Heart } from 'lucide-react';
import { TripData, VoiceJournalEntry } from '../types/travel';

interface StoryScreenProps {
  trip: TripData;
  voiceNotes: VoiceJournalEntry[];
}

export const StoryScreen: React.FC<StoryScreenProps> = ({ trip, voiceNotes }) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedKakao, setCopiedKakao] = useState<boolean>(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Recommendations matching Page 6 of PDF
  const recommendations = trip.destinationType === 'CN'
    ? [
        {
          name: '수정방 박물관',
          quote: '600년 발효 구덩이, 시음이 부드러웠다',
          badge: '강추',
          category: '문화/체험'
        },
        {
          name: '제쯔구전 강변 찻집',
          quote: '관광지 개수보다 이 두 시간',
          badge: '강추',
          category: '휴식/풍경'
        }
      ]
    : [
        {
          name: 'Durich 두리안 빙수',
          quote: '무상킹 생두리안이 입안에서 살살 녹는다',
          badge: '강추',
          category: '디저트/미식'
        },
        {
          name: '아순거 복건면',
          quote: '새우 육수와 삼발 소스의 환상적인 조화',
          badge: '강추',
          category: '현지식/노포'
        }
      ];

  const daysCount = trip.days.length;
  let totalPlacesCount = 0;
  trip.days.forEach((d) => (totalPlacesCount += d.stops.length));
  const totalVoiceCount = voiceNotes.length;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const kakaoMessageText = `[KeepTrip · ${trip.title} 여행 기록]
Every trip, kept. 다녀온 길까지, 간직하다.

📅 일정: ${trip.dateRange} (${trip.durationText})
👥 동행: ${trip.partyText}

🏆 내가 추천하는 곳:
${recommendations.map((r) => `• ${r.name} ("${r.quote}")`).join('\n')}

🎙️ 현장 보이스 기록 ${totalVoiceCount}건과 함께 완성된 생생한 여행기:
${window.location.href}`;

  const handleCopyKakao = () => {
    navigator.clipboard.writeText(kakaoMessageText);
    setCopiedKakao(true);
    setTimeout(() => setCopiedKakao(false), 2000);
  };

  const handlePlayVoice = (id: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (playingVoiceId === id) {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
    } else {
      window.speechSynthesis.cancel();
      setPlayingVoiceId(id);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'ko-KR';
      utter.rate = 1.0;
      utter.onend = () => setPlayingVoiceId(null);
      utter.onerror = () => setPlayingVoiceId(null);
      window.speechSynthesis.speak(utter);
    }
  };

  const handleDownloadBlogHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${trip.title} - KeepTrip 여행 스토리</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    body { font-family: 'Pretendard', sans-serif; background: #F4F6F8; color: #111827; margin: 0; padding: 0; }
    .hero { background: #1E2856; color: #fff; padding: 60px 24px; text-align: center; }
    .wrap { max-width: 680px; margin: -30px auto 40px; padding: 0 16px; }
    .card { background: #fff; border-radius: 24px; padding: 28px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    h1 { font-size: 2.2rem; margin: 8px 0; font-weight: 900; }
    .stats { display: flex; justify-content: space-around; text-align: center; border-bottom: 1px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 20px; }
    .stat-val { font-size: 28px; font-weight: 900; color: #1E2856; }
    .stat-lbl { font-size: 12px; color: #64748B; font-weight: 700; margin-top: 4px; }
    .rec-item { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
    .badge { background: #EFA03D; color: #111827; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; }
    .voice-item { border-left: 3px solid #EFA03D; padding-left: 14px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="hero">
    <div style="font-size: 13px; letter-spacing: 2px; color: #EFA03D; font-weight: 800;">KEEPTRIP MAGAZINE</div>
    <h1>${trip.title}</h1>
    <p>${trip.subtitle} · ${trip.dateRange} · ${trip.partyText}</p>
  </div>
  <div class="wrap">
    <div class="card">
      <div class="stats">
        <div><div class="stat-val">${daysCount}</div><div class="stat-lbl">일정</div></div>
        <div><div class="stat-val">${totalPlacesCount}</div><div class="stat-lbl">다녀간 곳</div></div>
        <div><div class="stat-val">${totalVoiceCount}</div><div class="stat-lbl">보이스 기록</div></div>
      </div>

      <h3 style="font-size: 17px; font-weight: 900; margin: 0 0 16px;">🏆 내가 추천하는 곳</h3>
      ${recommendations.map(r => `<div class="rec-item"><div><strong style="font-size: 15px;">${r.name}</strong><div style="font-size: 13px; color: #64748B; margin-top: 4px;">"${r.quote}"</div></div><span class="badge">${r.badge}</span></div>`).join('')}

      <h3 style="font-size: 17px; font-weight: 900; margin: 28px 0 16px;">🎙️ 생생한 현장 보이스 기록</h3>
      ${voiceNotes.map(v => `<div class="voice-item"><div style="font-size: 12px; color: #64748B; font-weight: 700;">${v.timestamp} · ${v.spotTitle}</div><div style="font-size: 14px; color: #1E2856; margin-top: 4px;">"${v.transcript}"</div></div>`).join('')}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${trip.id}-keeptrip-story.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-32 md:pb-16 w-full">
      {/* Top Hero Banner matching Page 6 */}
      <section
        className="relative bg-[#1E2856] text-white p-6 sm:p-10 lg:p-14 min-h-[260px] lg:min-h-[320px] flex flex-col justify-end overflow-hidden"
        role="region"
        aria-label="여행 스토리 표지"
      >
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-end">
          <div className="flex items-center justify-between pb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#EFA03D] text-[#111827]">
              <span>KEEPTRIP STORY · VOL. 01</span>
            </div>
            <div className="text-[11px] font-bold text-white/70 bg-black/30 backdrop-blur px-3 py-1 rounded-full border border-white/10">
              [대표 사진 자동 큐레이션]
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <div className="text-xs sm:text-sm font-bold text-slate-300">
              {trip.dateRange} ({trip.durationText}) · {trip.destinationType === 'CN' ? '충칭 · 청두' : '쿠알라룸푸르 · 페낭'} · {trip.partyText}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {trip.destinationType === 'CN' ? '네 친구의 백주 여행' : '부부의 말레이시아 힐링 여행'}
              <br />
              <span className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#EFA03D]">
                {trip.destinationType === 'CN' ? '불맛과 수정방 사이' : '차이나타운과 페낭 바다 사이'}
              </span>
            </h1>
          </div>
        </div>

        {/* Background photo & overlay */}
        <div className="absolute inset-0 opacity-25 mix-blend-overlay">
          <img
            src={trip.heroImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E2856] via-[#1E2856]/80 to-transparent" />
      </section>

      {/* Main Responsive Grid Layout */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Stats, Recommendations & Voice Timeline (7 cols on md, 8 cols on lg) */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            {/* 3 Stat Boxes matching Page 6 */}
            <section
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs grid grid-cols-3 divide-x divide-slate-100 text-center"
              role="region"
              aria-label="여행 통계 요약"
            >
              <div className="py-2">
                <span className="text-3xl lg:text-4xl font-black text-[#1E2856] block">{daysCount}</span>
                <span className="text-xs text-slate-400 font-extrabold mt-1 block uppercase">일정 (DAYS)</span>
              </div>

              <div className="py-2">
                <span className="text-3xl lg:text-4xl font-black text-[#1E2856] block">{totalPlacesCount}</span>
                <span className="text-xs text-slate-400 font-extrabold mt-1 block uppercase">다녀간 곳</span>
              </div>

              <div className="py-2">
                <span className="text-3xl lg:text-4xl font-black text-[#1E2856] block">{totalVoiceCount}</span>
                <span className="text-xs text-slate-400 font-extrabold mt-1 block uppercase">보이스 기록</span>
              </div>
            </section>

            {/* Section: 내가 추천하는 곳 matching Page 6 */}
            <section
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
              role="region"
              aria-label="내가 추천하는 곳 목록"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#EFA03D]" />
                  <h2 className="font-black text-lg text-[#111827]">내가 추천하는 곳 (KeepTrip Pick)</h2>
                </div>
                <button
                  type="button"
                  onClick={() => alert('추천 장소와 코멘트를 간편하게 편집할 수 있습니다.')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  편집
                </button>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-between gap-4 transition-all hover:bg-slate-100/60"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base text-[#111827]">{rec.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {rec.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{rec.quote}"</p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-black bg-[#EFA03D] text-[#111827] shadow-2xs shrink-0">
                      {rec.badge}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section: 현장 보이스 매거진 피드 */}
            <section
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
              role="region"
              aria-label="현장 보이스 피드"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-[#1E2856]" />
                  <h2 className="font-black text-lg text-[#111827]">현장에서 남긴 생생한 목소리</h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  총 {voiceNotes.length}개
                </span>
              </div>

              <div className="space-y-3 divide-y divide-slate-100">
                {voiceNotes.map((note) => (
                  <div key={note.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#1E2856]">{note.timestamp}</span>
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {note.spotTitle}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayVoice(note.id, note.transcript)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{playingVoiceId === note.id ? '음성 정지' : '음성 듣기'}</span>
                      </button>
                    </div>
                    <blockquote className="text-sm text-slate-800 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200/60 leading-relaxed font-medium">
                      "{note.transcript}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </section>

            {/* Completed Notice Card matching Page 6 */}
            <section
              className="p-5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-bold text-[#1E40AF] flex items-center gap-3"
              role="note"
              aria-label="초안 완성 안내"
            >
              <FileText className="w-5 h-5 text-[#3B82F6] shrink-0" />
              <span>일정 + 보이스 기록 + 현장 사진으로 당신만의 독립 웹 매거진 초안을 완성했어요.</span>
            </section>
          </div>

          {/* Right Column: Sticky Sharing & Export Center (5 cols on md, 4 cols on lg) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-5 md:sticky md:top-24">
            <section
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4"
              role="region"
              aria-label="공유 및 내보내기"
            >
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Keep & Share
                </span>
                <h3 className="text-base font-black text-[#111827] mt-0.5">
                  가족과 친구에게 공유하기
                </h3>
              </div>

              {/* Big KakaoTalk Action Button matching Page 6 */}
              <button
                type="button"
                onClick={handleCopyKakao}
                className="w-full py-4 px-4 rounded-2xl bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-5 h-5 fill-[#191919]" />
                <span>{copiedKakao ? '카카오톡 문구 복사 완료!' : '카카오톡으로 가족에게 보내기'}</span>
              </button>

              {/* 2 Secondary Action Buttons matching Page 6 */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#27AE60]" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedLink ? '복사됨' : '웹 링크 복사'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBlogHtml}
                  className="py-3 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>블로그 HTML 저장</span>
                </button>
              </div>

              {/* KakaoTalk Card Preview */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  카카오톡 메시지 미리보기
                </span>
                <div className="p-3.5 bg-[#F9FAFB] rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed space-y-1 font-mono">
                  <div className="font-bold text-slate-900">[KeepTrip · {trip.title}]</div>
                  <div>📅 {trip.dateRange}</div>
                  <div>👥 {trip.partyText}</div>
                  <div>🏆 추천: {recommendations[0]?.name}</div>
                  <div className="text-blue-600 truncate">{window.location.href}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
