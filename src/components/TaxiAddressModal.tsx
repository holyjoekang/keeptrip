import React from 'react';
import { X, Volume2, Car, Copy, Check } from 'lucide-react';
import { ItineraryStop, DestinationType } from '../types/travel';

interface TaxiAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: ItineraryStop | null;
  destinationType: DestinationType;
}

export const TaxiAddressModal: React.FC<TaxiAddressModalProps> = ({
  isOpen,
  onClose,
  spot,
  destinationType
}) => {
  const [copied, setCopied] = React.useState<boolean>(false);

  if (!isOpen || !spot) return null;

  const isChina = destinationType === 'CN';

  const localName = isChina
    ? (spot.title.includes('수정방')
        ? '水井坊博物馆'
        : spot.title.includes('홍야동')
        ? '洪崖洞景区'
        : spot.title.includes('리지바')
        ? '李子坝轻轨站'
        : spot.title.includes('제쯔구전')
        ? '街子古镇'
        : spot.title)
    : spot.title;

  const addressDetails = isChina
    ? (spot.title.includes('수정방')
        ? '四川省成都市锦江区水井街19号'
        : spot.title.includes('홍야동')
        ? '重庆市渝中区嘉陵江滨江路88号'
        : spot.title.includes('리지바')
        ? '重庆市渝中区李子坝正街39号'
        : spot.title.includes('제쯔구전')
        ? '四川省成都市崇州市街子古镇味江景区'
        : `${spot.title}`)
    : (spot.title.includes('아순거')
        ? 'Ah Soon Kor Hokkien Mee, 168, Jalan Macalister, George Town, Penang'
        : spot.title.includes('극락사')
        ? 'Kek Lok Si Temple, Tingkat Lembah Maju 1, 11500 Air Itam, Penang'
        : spot.title.includes('바투')
        ? 'Batu Caves, Gombak, 68100 Batu Caves, Selangor'
        : spot.title.includes('두리치')
        ? 'Durich Durian, Jalan Petaling, Chinatown, Kuala Lumpur'
        : `${spot.title}`);

  const handleSpeakDriver = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const text = isChina
      ? `师傅，请带我去 ${localName}`
      : `Tolong hantar saya ke ${localName}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isChina ? 'zh-CN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(addressDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Car className="w-4 h-4 text-[#EFA03D]" />
            <span>기사님께 보여드리는 화면</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Text Card for Driver */}
        <div className="p-5 rounded-2xl bg-[#1E2856] text-white text-center space-y-3 shadow-md">
          <div className="text-xs font-bold text-[#EFA03D] uppercase tracking-wider">
            {isChina ? '师傅，您好！请带我去：' : 'Driver, please take me to:'}
          </div>

          <div className="text-2xl sm:text-3xl font-black text-white leading-tight font-sans">
            {localName}
          </div>

          <div className="text-xs text-slate-300 font-mono pt-2 border-t border-white/10 break-words">
            {addressDetails}
          </div>
        </div>

        {/* Helper Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleSpeakDriver}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-[#1E2856]" />
            <span>기사님께 음성 들려주기</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#27AE60]" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? '주소 복사됨' : '주소 복사'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
