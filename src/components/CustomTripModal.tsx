import React, { useState } from 'react';
import { X, Plus, Sparkles, Link as LinkIcon, FileText, Check } from 'lucide-react';
import { TripData, DestinationType } from '../types/travel';

interface CustomTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTrip: (newTrip: TripData) => void;
}

export const CustomTripModal: React.FC<CustomTripModalProps> = ({
  isOpen,
  onClose,
  onAddTrip
}) => {
  const [title, setTitle] = useState<string>('');
  const [destination, setDestination] = useState<DestinationType>('CN');
  const [dateRange, setDateRange] = useState<string>('2026.11.18 - 11.22');
  const [durationText, setDurationText] = useState<string>('4박 5일');
  const [urlInput, setUrlInput] = useState<string>('');
  const [rawPlan, setRawPlan] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const id = `custom-trip-${Date.now()}`;
    const generatedTrip: TripData = {
      id,
      title: title.trim(),
      subtitle: `${durationText} 맞춤형 최적화 여정`,
      dateRange: dateRange || '일정 미정',
      durationText: durationText || '4박 5일',
      partyText: '개인 및 동행 여정',
      destinationType: destination,
      heroImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80',
      defaultBudgetKrw: 1000000,
      sourceUrl: urlInput.trim() || undefined,
      keyRules: [
        {
          title: destination === 'CN' ? '알리페이 200위안 룰 (3% 수수료)' : destination === 'MY' ? '그랩 지갑 0% 충전 팁' : '해외 원화결제(DCC) 차단',
          description: destination === 'CN'
            ? '200위안 이하 결제는 알리페이 수수료 무료. 200위안 초과 시 3%가 부과되므로 분할 결제나 트래블카드를 활용하세요.'
            : destination === 'MY'
            ? '그랩에 일반 카드 직결제 시 3% 수수료 발생. GrabPay 지갑에 충전해 쓰면 0%로 절약됩니다.'
            : '해외 결제 시 현지 통화로 결제해야 3~8%의 불필요한 DCC 이중 환전 수수료를 막을 수 있습니다.',
          tag: '결제 최적화'
        },
        {
          title: 'eSIM 우선 검토 (로밍 대비 70% 절약)',
          description: '스마트폰이 지원할 경우 1일 2~3천원의 eSIM이 통신사 로밍(1일 1만원)보다 훨씬 저렴하고 편리합니다.',
          tag: '통신 가성비'
        }
      ],
      checklist: [
        {
          id: `${id}-1`,
          tier: 'MUST',
          category: 'entry',
          title: '여권 유효기간 6개월 이상 & 입국 비자 요건 확인',
          description: '출국 전 필수 서류 및 여권 상태를 미리 점검하세요.',
          completed: false
        },
        {
          id: `${id}-2`,
          tier: 'MUST',
          category: 'payment',
          title: destination === 'CN' ? '알리페이 여권 실명인증 및 카드 2개 등록' : destination === 'MY' ? '그랩 앱 설치 및 트래블카드 등록' : '트래블카드(트래블로그/월렛) 환전 충전',
          description: '현지 도착 후 결제가 막히지 않도록 출발 전 등록을 완료하세요.',
          completed: false
        },
        {
          id: `${id}-3`,
          tier: 'SAVINGS',
          category: 'data',
          title: '여행자용 데이터 eSIM 구매',
          description: '통신사 로밍 대비 인당 약 3~5만원을 절약할 수 있습니다.',
          estimatedSavingKrw: 35000,
          completed: false
        },
        {
          id: `${id}-4`,
          tier: 'IGNORE',
          category: 'payment',
          title: '1~2천원 소액 결제 수수료 아끼려고 카드 바꾸느라 애쓰지 않기',
          description: '커피 한 잔 미만의 미미한 차이는 기존 주력 카드로 편하게 결제하고 여행의 여유를 즐기세요.',
          completed: false
        }
      ],
      days: [
        {
          dayNumber: 1,
          date: '출발일',
          dayOfWeek: '1일차',
          city: title,
          theme: '출국 및 현지 도착 · 체크인과 첫 만남',
          dayHighlights: ['공항 도착 및 현지 이동', '숙소 체크인', '현지 첫 식사'],
          stops: [
            { time: '10:00', title: '공항 출발 및 출국 수속', category: 'flight' },
            { time: '15:00', title: '현지 도착 및 숙소 이동', category: 'transit', smartTip: '현지 교통 앱(Didi/Grab/우버) 미리 등록 필수' },
            { time: '18:00', title: '호텔 체크인 및 저녁 식사', category: 'hotel' }
          ]
        },
        {
          dayNumber: 2,
          date: '2일차',
          dayOfWeek: '2일차',
          city: title,
          theme: '본격적인 도시 탐방과 미식',
          dayHighlights: ['주요 명소 방문', '현지 특색 요리', '야경 감상'],
          stops: [
            { time: '10:00', title: '주요 랜드마크 방문', category: 'sightseeing' },
            { time: '12:30', title: '현지 인기 맛집 점심', category: 'food' },
            { time: '19:00', title: '야경 및 산책', category: 'sightseeing' }
          ]
        }
      ]
    };

    onAddTrip(generatedTrip);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">새 여행 일정 등록 및 최적화</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              여행 제목 / 도시 *
            </label>
            <input
              type="text"
              required
              placeholder="예: 중국 충칭·청두 탐방, 일본 도쿄 3박 4일, 베트남 다낭"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                목적지 유형
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as DestinationType)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="CN">중국 (알리페이 200위안 룰/eSIM)</option>
                <option value="MY">말레이시아 (그랩 3% 절약/MDAC)</option>
                <option value="JP">일본 (트래블카드/스이카)</option>
                <option value="GLOBAL">기타 해외 여행지</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                여행 기간
              </label>
              <input
                type="text"
                placeholder="예: 4박 5일"
                value={durationText}
                onChange={(e) => setDurationText(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              기존 일정표 URL (선택)
            </label>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="url"
                placeholder="https://holyjoekang.github.io/my-travel-map/... 등"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              세부 일정 메모 또는 생각했던 내용들 (선택)
            </label>
            <textarea
              rows={3}
              placeholder="방문하고 싶은 맛집이나 백주 시음, 호텔 위치, 친구들과 나눈 이야기 등을 자유롭게 적어주세요."
              value={rawPlan}
              onChange={(e) => setRawPlan(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              맞춤 최적화 가이드 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
