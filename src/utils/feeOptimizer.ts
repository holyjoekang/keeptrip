export interface PaymentMethodOption {
  id: string;
  name: string;
  provider: string;
  feePercentage: number;
  fixedFee: number;
  description: string;
  pros: string[];
  cons: string[];
  recommendedCondition?: string;
  warningNote?: string;
}

export interface OptimizationResult {
  estimatedSpendKrw: number;
  destination: string;
  comparison: {
    methodId: string;
    methodName: string;
    totalFeeKrw: number;
    finalCostKrw: number;
    badge?: string;
  }[];
  bestMethod: string;
  maxSavingsKrw: number;
  recommendationDecision: 'KEEP_EXISTING' | 'USE_TRAVEL_CARD' | 'USE_LOCAL_WALLET';
  recommendationSummary: string;
  keyActionTip: string;
}

/**
 * Calculates payment fees for a given destination and spending amount
 */
export function calculatePaymentOptimization(
  destinationCode: 'CN' | 'MY' | 'JP' | 'VN' | 'GLOBAL',
  budgetKrw: number,
  averageSingleTxKrw: number = 30000
): OptimizationResult {
  const numTransactions = Math.max(1, Math.round(budgetKrw / averageSingleTxKrw));
  
  if (destinationCode === 'CN') {
    // China: Alipay with standard card (3% over 200 RMB ~ 38,000 KRW), Toss/Travel Wallet, Cash
    // If single tx > 38,000 KRW (200 RMB), Alipay charges 3% on standard foreign cards
    const isOver200Rmb = averageSingleTxKrw > 38000;
    const alipayStandardFeeRate = isOver200Rmb ? 0.03 : 0.0;
    const directCardForeignFee = 0.0125; // 1% brand + 0.25% issuer
    const standardCardTotalFeeRate = alipayStandardFeeRate + directCardForeignFee;

    const standardCardFee = Math.round(budgetKrw * standardCardTotalFeeRate);
    const tossAlipayFee = Math.round(budgetKrw * 0.005); // near 0 or tiny spread
    const travelCardFee = 0; // 0% fee on TravelWallet/TravelLog/SOL
    const cashExchangeFee = Math.round(budgetKrw * 0.035); // Cash exchange spread ~3.5%

    const comparison = [
      {
        methodId: 'travel_alipay',
        methodName: '트래블로그/트래블월렛 + 알리페이',
        totalFeeKrw: travelCardFee,
        finalCostKrw: budgetKrw + travelCardFee,
        badge: '수수료 0원 최적'
      },
      {
        methodId: 'toss_alipay',
        methodName: '토스뱅크 체크카드 + 알리페이/GLN',
        totalFeeKrw: tossAlipayFee,
        finalCostKrw: budgetKrw + tossAlipayFee,
        badge: '간편 최적'
      },
      {
        methodId: 'standard_credit_alipay',
        methodName: '기존 신용카드 + 알리페이 (비자/마스터)',
        totalFeeKrw: standardCardFee,
        finalCostKrw: budgetKrw + standardCardFee,
        badge: isOver200Rmb ? '200위안 초과시 3% 부과' : '소액 결제시 무난'
      },
      {
        methodId: 'cash_cny',
        methodName: '현지 현금(CNY) 환전 지참',
        totalFeeKrw: cashExchangeFee,
        finalCostKrw: budgetKrw + cashExchangeFee,
        badge: '현금 거절 매장 다수 주의'
      }
    ];

    const maxSavings = standardCardFee - travelCardFee;
    let decision: 'KEEP_EXISTING' | 'USE_TRAVEL_CARD' | 'USE_LOCAL_WALLET' = 'USE_TRAVEL_CARD';
    let summary = '';

    if (maxSavings < 4000) {
      decision = 'KEEP_EXISTING';
      summary = `예상 절약액이 약 ${maxSavings.toLocaleString()}원으로 커피 한 잔 수준입니다. 새 카드를 발급받기보다 기존 비자/마스터카드를 알리페이에 바로 등록해 쓰셔도 충분합니다.`;
    } else {
      decision = 'USE_TRAVEL_CARD';
      summary = `알리페이에 트래블카드(또는 토스뱅크 우대연동)를 연결하면 약 ${maxSavings.toLocaleString()}원의 수수료를 아낄 수 있습니다. 200위안(약 3.8만원) 초과 결제 시 3% 수수료 면제 효과가 큽니다.`;
    }

    return {
      estimatedSpendKrw: budgetKrw,
      destination: '중국 (충칭/청두 등)',
      comparison,
      bestMethod: '트래블로그 / 트래블월렛 또는 토스뱅크 연동 알리페이',
      maxSavingsKrw: maxSavings,
      recommendationDecision: decision,
      recommendationSummary: summary,
      keyActionTip: '알리페이에 여권 실명인증을 사전 완료하고, 비상용으로 2개 이상의 카드를 등록해 두세요. 200위안 초과 금액은 가능하면 분할 결제를 요청하거나 트래블카드를 쓰세요.'
    };
  }

  if (destinationCode === 'MY') {
    // Malaysia: Grab direct card (3% DCC/processing fee) vs GrabPay Wallet top-up (0%)
    const grabDirectFee = Math.round(budgetKrw * 0.03); // 3%
    const grabWalletFee = 0; // 0%
    const standardCardFee = Math.round(budgetKrw * 0.015); // general retail
    const cashExchangeFee = Math.round(budgetKrw * 0.025);

    const comparison = [
      {
        methodId: 'grab_wallet_travel',
        methodName: '그랩(Grab) 월렛 충전 + 트래블/토스카드',
        totalFeeKrw: grabWalletFee,
        finalCostKrw: budgetKrw + grabWalletFee,
        badge: '수수료 0% 추천'
      },
      {
        methodId: 'travel_card_direct',
        methodName: '트래블로그/트래블월렛 직접 결제',
        totalFeeKrw: 0,
        finalCostKrw: budgetKrw,
        badge: '오프라인 매장 최적'
      },
      {
        methodId: 'grab_direct_card',
        methodName: '그랩(Grab)에 국내 신용카드 직접 결제',
        totalFeeKrw: grabDirectFee,
        finalCostKrw: budgetKrw + grabDirectFee,
        badge: '3% 수수료 자동 발생'
      },
      {
        methodId: 'cash_myr',
        methodName: '국내/현지 사설 환전소 현금(MYR)',
        totalFeeKrw: cashExchangeFee,
        finalCostKrw: budgetKrw + cashExchangeFee,
        badge: '야시장·호커센터 필수'
      }
    ];

    const maxSavings = grabDirectFee - grabWalletFee;
    let decision: 'KEEP_EXISTING' | 'USE_TRAVEL_CARD' | 'USE_LOCAL_WALLET' = 'USE_LOCAL_WALLET';
    let summary = '';

    if (maxSavings < 4000) {
      decision = 'KEEP_EXISTING';
      summary = `그랩 이동이 많지 않다면 예상 수수료 차이가 ${maxSavings.toLocaleString()}원 내외입니다. 번거롭게 월렛 충전하지 않고 기존 카드로 찍으셔도 괜찮습니다.`;
    } else {
      decision = 'USE_LOCAL_WALLET';
      summary = `그랩을 자주 타신다면 앱 내 [GrabPay Wallet]에 잔액을 충전해서 결제하세요. 건당 3%씩 붙는 카드 결제 수수료(약 ${maxSavings.toLocaleString()}원)를 전액 아낄 수 있습니다.`;
    }

    return {
      estimatedSpendKrw: budgetKrw,
      destination: '말레이시아 (KL/페낭 등)',
      comparison,
      bestMethod: '그랩 지갑(GrabPay Wallet) 충전 결제 + 트래블카드',
      maxSavingsKrw: maxSavings,
      recommendationDecision: decision,
      recommendationSummary: summary,
      keyActionTip: '그랩 등록 시 국내 일반 카드는 3% 수수료가 붙습니다. 트래블카드나 토스카드로 그랩 지갑에 50~100링깃씩 충전해 사용하고, 페낭 호커센터/야시장은 현금만 받으므로 10~20만원 정도는 현금 환전하세요.'
    };
  }

  // Generic / Default
  const standardFee = Math.round(budgetKrw * 0.015);
  const travelFee = 0;
  const cashFee = Math.round(budgetKrw * 0.03);
  return {
    estimatedSpendKrw: budgetKrw,
    destination: '일반 해외 여행지',
    comparison: [
      { methodId: 'travel_card', methodName: '트래블카드 (트래블로그/월렛)', totalFeeKrw: travelFee, finalCostKrw: budgetKrw, badge: '수수료 0원 최적' },
      { methodId: 'standard_credit', methodName: '기존 신용카드', totalFeeKrw: standardFee, finalCostKrw: budgetKrw + standardFee, badge: '해외이용 1.25~1.5%' },
      { methodId: 'cash_local', methodName: '현금 환전', totalFeeKrw: cashFee, finalCostKrw: budgetKrw + cashFee, badge: '환전 수수료 발생' }
    ],
    bestMethod: '트래블카드 (수수료 0%)',
    maxSavingsKrw: standardFee,
    recommendationDecision: budgetKrw > 400000 ? 'USE_TRAVEL_CARD' : 'KEEP_EXISTING',
    recommendationSummary: budgetKrw > 400000
      ? `예상 절약액이 약 ${standardFee.toLocaleString()}원입니다. 트래블카드 사용을 추천합니다.`
      : `총 지출액이 적어 수수료 차이가 ${standardFee.toLocaleString()}원 수준입니다. 기존 주력 카드를 그대로 쓰셔도 무방합니다.`,
    keyActionTip: '해외 결제 시 반드시 "현지 통화 결제(KRW 원화 결제 차단 - DCC 방지)"를 신청해 두세요.'
  };
}
