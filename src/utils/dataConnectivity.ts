export interface ConnectivityOption {
  type: 'eSIM' | 'USIM' | 'DOSIRAK' | 'ROAMING';
  title: string;
  dailyCostKrw: number;
  totalCostKrw: number;
  convenienceRating: number; // 1 to 5
  pros: string[];
  cons: string[];
  recommended: boolean;
  notes: string;
}

export interface ConnectivityAnalysis {
  tripDays: number;
  travelerCount: number;
  destination: string;
  eSimSupportedPhone: boolean;
  options: ConnectivityOption[];
  bestOption: ConnectivityOption;
  totalSavingsVsRoaming: number;
  totalSavingsVsDosirak: number;
  vpnAdviceForChina?: string;
  summary: string;
}

import { DestinationType } from '../types/travel';

export function analyzeConnectivity(
  destinationCode: DestinationType,
  tripDays: number = 5,
  travelerCount: number = 1,
  eSimSupportedPhone: boolean = true
): ConnectivityAnalysis {
  const days = Math.max(1, tripDays);
  const travelers = Math.max(1, travelerCount);

  // eSIM pricing: ~2,500 KRW/day for 2-3GB high-speed daily
  const esimDaily = 2500;
  const esimTotal = esimDaily * days * travelers;

  // USIM (Physical SIM): ~3,000 KRW/day
  const usimDaily = 3000;
  const usimTotal = usimDaily * days * travelers;

  // Wi-Fi Dosirak (Egg device): ~4,500 KRW/day device rental (shared among travelers) + pickup/return hassle
  const dosirakDaily = 4500;
  const dosirakTotal = dosirakDaily * days;

  // Carrier Roaming: ~9,900 KRW/day per person
  const roamingDaily = 9900;
  const roamingTotal = roamingDaily * days * travelers;

  const isChina = destinationCode === 'CN';
  const vpnNote = isChina
    ? '★ 중요 (중국 여행 특화): 한국 또는 홍콩 통신사 망을 경유하는 로밍형 eSIM을 구매하면, 중국 현지에서도 별도 VPN 없이 카카오톡, 유튜브, 구글 지도, 네이버를 자유롭게 사용할 수 있습니다. 현지 중국 유심이나 호텔 와이파이는 만리방화벽(Golden Shield)으로 차단됩니다.'
    : undefined;

  const options: ConnectivityOption[] = [
    {
      type: 'eSIM',
      title: '스마트폰 내장 eSIM (데이터 무제한/일일 2~3GB)',
      dailyCostKrw: esimDaily,
      totalCostKrw: esimTotal,
      convenienceRating: 5,
      pros: [
        '유심 칩 교체 없이 QR코드 스캔 즉시 활성화',
        '한국 번호 문자·인증번호 수신 그대로 유지 (금융앱 인증 필수)',
        isChina ? '홍콩 망 경유로 중국 만리방화벽 자동 우회 (카톡/유튜브 즉시 가능)' : '초고속 5G/4G 로컬 망',
        '무거운 에그 기기 충전/휴대 불필요'
      ],
      cons: ['아이폰 XS 이후 / 갤럭시 S23 이후 등 eSIM 지원 단말기 필요'],
      recommended: eSimSupportedPhone,
      notes: eSimSupportedPhone ? '압도적 가성비 & 편의성 추천 1순위' : '단말기 지원 여부 사전 확인 필요'
    },
    {
      type: 'DOSIRAK',
      title: '포켓 와이파이 (도시락 / 에그)',
      dailyCostKrw: dosirakDaily,
      totalCostKrw: dosirakTotal,
      convenienceRating: 2,
      pros: ['기기 1대로 일행 여러 명이 동시 연결 가능'],
      cons: [
        '일행과 떨어지면 데이터 단절',
        '공항 수령 및 반납 대기 번거로움',
        '매일 밤 보조배터리와 함께 별도 충전 필수 및 무거운 소지품 부담',
        isChina ? '중국 내 카카오톡/인스타그램 차단 우회 안 됨 (별도 유료 VPN 필요)' : ''
      ].filter(Boolean),
      recommended: !eSimSupportedPhone && travelers >= 3,
      notes: 'eSIM 미지원 구형 폰 3인 이상 동행 시 제한적 고려'
    },
    {
      type: 'ROAMING',
      title: '국내 통신사 원터치 로밍 (SKT/KT/LGU+)',
      dailyCostKrw: roamingDaily,
      totalCostKrw: roamingTotal,
      convenienceRating: 4,
      pros: ['설정 없이 전원 켜면 자동 연결', '통화 연결 편리'],
      cons: ['비싼 요금 (하루 약 1만원, 5일 기준 5만원 육박)', '일행별로 가입 시 비용 급증'],
      recommended: false,
      notes: '설정이 귀찮고 예산에 구애받지 않을 때만 사용'
    }
  ];

  const best = options[0];
  const totalSavingsVsRoaming = roamingTotal - esimTotal;
  const totalSavingsVsDosirak = dosirakTotal - esimTotal;

  return {
    tripDays: days,
    travelerCount: travelers,
    destination: destinationCode,
    eSimSupportedPhone,
    options,
    bestOption: best,
    totalSavingsVsRoaming,
    totalSavingsVsDosirak,
    vpnAdviceForChina: vpnNote,
    summary: `${days}일 여행 기준, eSIM 이용 시 통신사 로밍 대비 약 ${totalSavingsVsRoaming.toLocaleString()}원을 절약할 수 있습니다. 특히 ${
      isChina ? '중국에서는 로밍형 eSIM이 VPN 없이 카톡/구글이 되어 필수적입니다.' : '휴대폰 번호 유지 및 편리성 면에서 가장 우수합니다.'
    }`
  };
}
