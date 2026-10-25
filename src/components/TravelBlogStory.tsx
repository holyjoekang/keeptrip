import React, { useState } from 'react';
import { Share2, Download, Copy, Check, Heart, Star, Sparkles, MapPin, Award, MessageCircle, ExternalLink, Camera } from 'lucide-react';
import { TripData, VoiceJournalEntry } from '../types/travel';

interface TravelBlogStoryProps {
  trip: TripData;
  voiceNotes: VoiceJournalEntry[];
}

export const TravelBlogStory: React.FC<TravelBlogStoryProps> = ({ trip, voiceNotes }) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedKakao, setCopiedKakao] = useState<boolean>(false);

  const bestMoments = trip.bestMoments || {
    bestFood: { title: '현지 대표 미식', desc: '여행지에서 맛본 잊지 못할 최고의 풍미' },
    bestPlace: { title: '가장 아름다운 명소', desc: '발걸음을 멈추게 했던 풍경과 감동' },
    goldenInsight: { title: '여행에서 남긴 배움', desc: '새로운 곳과 사람을 찾아다니는 삶의 여유' }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyKakaoText = () => {
    const text = `[${trip.title} · 나의 여행 생생 기록 & 추천]
✈️ 일정: ${trip.dateRange} (${trip.durationText})
👥 동행: ${trip.partyText}

🏆 우리가 뽑은 여행 베스트:
1. 가장 좋았던 음식: ${bestMoments.bestFood.title}
   - "${bestMoments.bestFood.desc}"
2. 가장 기억에 남는 곳: ${bestMoments.bestPlace.title}
   - "${bestMoments.bestPlace.desc}"
3. 여행의 배움: ${bestMoments.goldenInsight.title}
   - "${bestMoments.goldenInsight.desc}"

🎙️ 현장에서 남긴 실시간 음성 기록 (${voiceNotes.length}건):
${voiceNotes.slice(0, 3).map((n) => `• [${n.spotTitle}] "${n.transcript}"`).join('\n')}

👉 전체 일정 & 상세 포토로그 웹페이지:
${window.location.href}`;

    navigator.clipboard.writeText(text);
    setCopiedKakao(true);
    setTimeout(() => setCopiedKakao(false), 2000);
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trip.title} - 나만의 여행 포토로그</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    body { font-family: 'Pretendard', sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 0; line-height: 1.6; }
    .hero { background: linear-gradient(rgba(15,23,42,0.7), rgba(15,23,42,0.9)), url('${trip.heroImage}') center/cover; color: #fff; padding: 60px 20px; text-align: center; }
    .wrap { max-width: 900px; margin: 40px auto; padding: 0 20px; }
    .card { background: #fff; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { margin: 0 0 10px; font-size: 2.2rem; }
    h2 { font-size: 1.4rem; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    .best-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
    .best-item { background: #fffbeb; border: 1px solid #fef3c7; padding: 18px; border-radius: 12px; }
    .stop-row { padding: 12px 0; border-bottom: 1px solid #f1f5f9; display: flex; gap: 16px; }
    .time { font-weight: bold; color: #4f46e5; min-width: 60px; }
    footer { text-align: center; color: #64748b; padding: 40px; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${trip.title}</h1>
    <p>${trip.subtitle} · ${trip.dateRange} (${trip.partyText})</p>
  </div>
  <div class="wrap">
    <div class="card">
      <h2>🏆 우리가 고른 베스트</h2>
      <div class="best-grid">
        <div class="best-item">
          <strong>🍽️ 최고의 음식</strong>
          <p>${bestMoments.bestFood.title}</p>
          <small>${bestMoments.bestFood.desc}</small>
        </div>
        <div class="best-item">
          <strong>📍 최고의 명소</strong>
          <p>${bestMoments.bestPlace.title}</p>
          <small>${bestMoments.bestPlace.desc}</small>
        </div>
        <div class="best-item">
          <strong>💡 여행의 통찰</strong>
          <p>${bestMoments.goldenInsight.title}</p>
          <small>${bestMoments.goldenInsight.desc}</small>
        </div>
      </div>
    </div>
    <div class="card">
      <h2>🎙️ 현장에서 남긴 실시간 음성 기록</h2>
      ${voiceNotes.map(n => `<div class="stop-row"><div><strong>${n.spotTitle}</strong> (${n.timestamp})<p>"${n.transcript}"</p></div></div>`).join('')}
    </div>
  </div>
  <footer>© 나만의 여행 가이드 · 작성일: ${new Date().toLocaleDateString('ko-KR')}</footer>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${trip.id}-travel-blog.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-black text-xl text-slate-900">
              나만의 여행 블로그 & 스토리북
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900">
              원클릭 자동 퍼블리싱
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            구글 닥스 정리나 깃허브 코딩 없이, 현장 음성 기록과 일정이 한 편의 웹 매거진으로 완성됩니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyKakaoText}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] transition-colors shadow-2xs"
            aria-label="카카오톡 공유 문구 복사"
          >
            <MessageCircle className="w-4 h-4 fill-[#191919]" />
            <span>{copiedKakao ? '카톡 문구 복사됨!' : '카카오톡 공유'}</span>
          </button>

          <button
            onClick={handleDownloadStandaloneHtml}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs"
            aria-label="웹사이트 HTML 단독 파일 다운로드"
          >
            <Download className="w-4 h-4" />
            <span>단독 HTML 내보내기</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="블로그 링크 복사"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>링크 복사</span>
          </button>
        </div>
      </div>

      {/* Magazine Blog Layout Container */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Magazine Cover */}
        <div className="relative min-h-[320px] sm:min-h-[400px] flex items-end p-6 sm:p-10 text-white">
          <div className="absolute inset-0">
            <img
              src={trip.heroImage}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-black/30" />
          </div>

          <div className="relative max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                TRAVEL CHRONICLE
              </span>
              <span className="text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full border border-white/20">
                {trip.partyText}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {trip.title}
            </h1>
            <p className="text-xs sm:text-base text-slate-200 leading-relaxed max-w-2xl">
              {trip.subtitle}
            </p>

            <div className="pt-2 text-xs text-slate-300 font-medium">
              📅 {trip.dateRange} · 총 {trip.durationText}의 기록
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-10 max-w-5xl mx-auto">
          {/* Section: 우리가 고른 베스트 (Best of the Trip) */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {trip.destinationType === 'CN' ? '네 친구가 고른 베스트' : '둘이 고른 베스트'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Best Food */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-amber-700 tracking-wider uppercase block mb-1">
                    🍽️ 가장 좋았던 음식
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                    {bestMoments.bestFood.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {bestMoments.bestFood.desc}
                  </p>
                </div>
              </div>

              {/* Best Place */}
              <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-indigo-700 tracking-wider uppercase block mb-1">
                    📍 가장 기억에 남는 장소
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                    {bestMoments.bestPlace.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {bestMoments.bestPlace.desc}
                  </p>
                </div>
              </div>

              {/* Insight */}
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-emerald-700 tracking-wider uppercase block mb-1">
                    💡 여행에서 남긴 배움
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                    {bestMoments.goldenInsight.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {bestMoments.goldenInsight.desc}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Live Voice Logs Timeline */}
          <section className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  현장에서 녹음된 생생한 보이스 로그
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                총 {voiceNotes.length}개의 현장 생중계
              </span>
            </div>

            <div className="space-y-3.5">
              {voiceNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">
                        📍 {note.spotTitle}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                        {note.category === 'food'
                          ? '미식 평'
                          : note.category === 'culture'
                          ? '문화 명소'
                          : '현장 감상'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{note.timestamp}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal italic">
                    "{note.transcript}"
                  </p>

                  {note.rating && (
                    <div className="mt-2.5 flex items-center gap-1 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{note.rating}.0 / 5.0</span>
                      {note.isRecommended && (
                        <span className="ml-2 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          👍 지인 강력 추천 코스
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section: Day-by-Day Journey Summary */}
          <section className="pt-4 border-t border-slate-200">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mb-4">
              일자별 여정 요약
            </h2>

            <div className="space-y-4">
              {trip.days.map((day) => (
                <div key={day.dayNumber} className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">
                      DAY {day.dayNumber} · {day.date} ({day.dayOfWeek})
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{day.city}</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                    {day.theme}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {day.dayHighlights.map((hl, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        ✦ {hl}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
