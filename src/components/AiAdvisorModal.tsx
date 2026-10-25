import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2, Lightbulb, MessageSquare, ShieldAlert } from 'lucide-react';
import { TripData } from '../types/travel';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: TripData;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({ isOpen, onClose, trip }) => {
  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<Array<{ sender: 'user' | 'ai'; text: string; source?: string }>>([
    {
      sender: 'ai',
      text: `안녕하세요! 「나만의 여행 가이드」 실시간 최적화 어드바이저입니다.\n현재 선택된 여행지는 [${trip.title}]입니다. 알리페이/토스뱅크 연동 수수료 변동, 그랩 지갑 충전, eSIM vs 로밍 가성비, 현지 고속철/공항 이동 등 궁금하신 점을 편하게 물어보세요!`
    }
  ]);

  if (!isOpen) return null;

  const quickQuestions = trip.destinationType === 'CN'
    ? [
        '알리페이에 토스뱅크/트래블로그 연결 시 200위안 수수료 정책이 어떻게 돼?',
        '중국에서 로밍형 eSIM을 쓰면 진짜 VPN 없이 카톡이랑 구글이 돼?',
        '충칭북역에서 청두동역 고속철 탈 때 종이표 필요한가요?',
        '중국 훠궈집에서 600위안 나왔을 때 3% 수수료 안 내는 법'
      ]
    : [
        '그랩에 한국 카드 직접 쓰면 수수료 3% 붙는 거 사실인가요?',
        '그랩페이 지갑(GrabPay)에 트래블카드/토스로 충전하는 방법 알려줘',
        '페낭 조지타운 맛집 갈 때 현금 얼마나 환전해야 해?',
        '말레이시아 디지털 입국카드(MDAC) 언제 어떻게 작성해?'
      ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim() || isLoading) return;

    const userMsg = q;
    setQuestion('');
    setConversation((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          destination: trip.title,
          context: `여행지: ${trip.title}, 기간: ${trip.dateRange}, 인원: ${trip.partyText}, 예산: ${trip.defaultBudgetKrw}원`
        })
      });

      const data = await res.json();
      if (data.answer) {
        setConversation((prev) => [...prev, { sender: 'ai', text: data.answer, source: data.source }]);
      } else {
        setConversation((prev) => [
          ...prev,
          { sender: 'ai', text: '답변을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '네트워크 연결 상태를 확인해 주세요. 오프라인 지식 기반으로 핵심 팁을 우선 확인하실 수 있습니다.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">AI 여행 최적화 어드바이저</h3>
              <p className="text-xs text-indigo-200">
                실시간 환전 수수료·프로모션 변동·현지 테크 팁 상담
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Questions Chips */}
        <div className="p-3 bg-indigo-50/70 border-b border-indigo-100 flex flex-wrap gap-1.5">
          <div className="w-full flex items-center gap-1 text-[11px] font-bold text-indigo-900 mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>자주 묻는 질문 바로 누르기:</span>
          </div>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              disabled={isLoading}
              className="text-left text-xs bg-white hover:bg-indigo-100 text-indigo-900 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                  AI
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/80 shadow-2xs'
                }`}
              >
                {msg.text}
                {msg.source && (
                  <div className="mt-2 pt-1 border-t border-slate-200 text-[10px] text-slate-400 text-right">
                    출처: {msg.source === 'gemini-live' ? '실시간 Gemini AI' : '자체 실시간 지식 베이스'}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>최신 환전 정책 및 최적화 노하우를 분석하고 있습니다...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="예: 알리페이에 비자카드 등록 시 수수료나 최소 금액이 있어?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !question.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>전송</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
