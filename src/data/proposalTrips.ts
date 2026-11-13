import { TripData, ItineraryStop, DayPlan, ChecklistItem } from '../types/travel';

/**
 * Keep121 맞춤 제안(keep121.co.kr/proposals.html)에 들어 있는 모든 일정.
 * 각 제안서의 시나리오 · 연간 계획 · 공식 일정을 KeepTrip 일정으로 옮긴 것이며,
 * 확정되지 않은 날짜 · 장소는 제목이나 설명에 '(안)' '(예시)' '(일정 조정 중)'으로 표시한다.
 */

type Cat = ItineraryStop['category'];
const s = (time: string, title: string, description: string, category: Cat = 'sightseeing', smartTip?: string): ItineraryStop =>
  ({ time, title, description, category, ...(smartTip ? { smartTip } : {}) });
const d = (dayNumber: number, date: string, dayOfWeek: string, city: string, theme: string, dayHighlights: string[], stops: ItineraryStop[], dayReflection?: string): DayPlan =>
  ({ dayNumber, date, dayOfWeek, city, theme, dayHighlights, stops, ...(dayReflection ? { dayReflection } : {}) });
type Item = [ChecklistItem['tier'], ChecklistItem['category'], string, string, string?];
const list = (prefix: string, items: Item[]): ChecklistItem[] =>
  items.map(([tier, category, title, description, actionTip], i) => ({
    id: `${prefix}-${i + 1}`, tier, category, title, description, completed: false, ...(actionTip ? { actionTip } : {})
  }));

const CM = (f: string, w = 1600) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(f)}?width=${w}`;
const K = 'https://keep121.co.kr/';

/** 단체 일정 공통 규칙 (Keep121 Guide 연동) */
const groupRules = (extra: TripData['keyRules'] = []): TripData['keyRules'] => [
  { title: '명찰 태그 하나로 점호', description: '버스 탑승 · 집결 · 숙소에서 인솔자가 1분 점호합니다. 참가자는 휴대폰 없이 명찰만 걸면 됩니다.', tag: 'Keep121 Guide' },
  { title: '확인된 사실만 가족에게', description: '출발 · 도착 · 귀가처럼 확인된 결과만 가족에게 알립니다. 실시간 위치는 공유하지 않습니다.', tag: 'Keep Home' },
  ...extra
];

export const PROPOSAL_TRIPS: TripData[] = [
  // ───────────── 1. WYD 서울 2027 ─────────────
  {
    id: 'trip-wyd-seoul-2027',
    title: 'WYD 서울 2027 순례',
    subtitle: '2027 서울 세계청년대회 · 공식 일정 6일',
    dateRange: '2027.8.3 (화) – 8.8 (일)',
    durationText: '6일',
    partyText: '해외 순례자 그룹 (예: 32명)',
    destinationType: 'KR',
    heroImage: 'https://wizware.dnstrip.net/n/cnla9ryzc1ev/b/wydseoul-public-resources/o/assets/images/main/donate-bg-9ca49aa24f372b0c5c0661fdc9679058.webp',
    defaultBudgetKrw: 600000,
    sourceUrl: `${K}wyd2027.html`,
    keyRules: groupRules([{ title: '집결 25분 전 알림', description: '현재 위치에서 다음 집결지까지 걸리는 시간을 계산해, 늦을 것 같으면 먼저 알려 줍니다.', tag: 'KeepTrip' }]),
    checklist: list('wyd', [
      ['MUST', 'entry', '순례자 등록 · 그룹 · 비상연락처 입력', '출국 전 등록 시스템에서 그룹 · 언어 · 비상연락처를 입력하고 위치 이용에 동의합니다.'],
      ['MUST', 'prep', '공항 · 등록처에서 명찰 태그 수령', 'Galaxy SmartTag3를 QR로 본인 · 그룹과 연결합니다 (대여 2~3천원 안, 스폰서 시 무상).'],
      ['MUST', 'data', '실시간 통역 앱 연결', '길 묻기 · 식당 · 봉사자 안내를 통역 앱으로 바로 대화합니다.'],
      ['SAVINGS', 'transit', '대중교통 카드 충전', '행사장 간 이동은 지하철이 가장 빠릅니다.'],
      ['IGNORE', 'payment', '큰 현금 환전', '카드 · 간편결제가 대부분 됩니다.']
    ]),
    days: [
      d(1, '8월 3일', '화', '서울', '집결 · 등록 · 개막미사', ['순례자 등록', '개막미사'], [s('10:00', '집결 및 등록', '그룹별 등록처 · 명찰 태그 확인', 'transit'), s('18:00', '개막미사', '대회 개최 교구 교구장 주교 주례')]),
      d(2, '8월 4일', '수', '서울', '주교와의 만남 · 젊은이 축제', ['교리교육', '젊은이 축제'], [s('09:00', '주교와의 만남', '언어권별 교리교육'), s('14:00', '젊은이 축제 · 가톨릭문화박람회', '개최지 곳곳의 행사')]),
      d(3, '8월 5일', '목', '서울', '교황 환영 행사', ['교리교육', '교황 환영'], [s('09:00', '주교와의 만남', '교리교육'), s('14:30', '그룹 집결', '집결 25분 전 알림 · 1분 점호', 'transit'), s('16:00', '교황 환영 행사', '공식 환영 행사')]),
      d(4, '8월 6일', '금', '서울', '십자가의 길', ['교리교육', '십자가의 길'], [s('09:00', '주교와의 만남', '교리교육'), s('16:00', '십자가의 길', '교황과 함께 묵상')]),
      d(5, '8월 7일', '토', '서울', '폐막미사 장소로 순례 · 밤샘 기도', ['도보 순례', '밤샘 기도'], [s('10:00', '폐막미사 장소로 순례', '대규모 도보 이동 · 그룹 점호', 'transit'), s('20:00', '밤샘 기도 · 성체 조배', '현장에서 함께 밤을 지냄')]),
      d(6, '8월 8일', '일', '서울', '폐막미사 · 봉사자와 교황 만남', ['폐막미사', '귀국 준비'], [s('09:00', '폐막미사', '다음 대회 장소 발표'), s('15:00', '봉사자와 교황 만남', '봉사자 대상'), s('18:00', '태그 반납 · 귀국 준비', '공항 · 등록처 반납', 'transit')])
    ]
  },

  // ───────────── 2~3. 제주 ─────────────
  {
    id: 'trip-jeju-cn-group',
    title: '제주 중국인 단체 2박 3일 (예시)',
    subtitle: '제주 이동안전 제안 · 시나리오 A · 상하이 32인 단체',
    dateRange: '2027 (예시)',
    durationText: '2박 3일',
    partyText: '중국인 단체 32명 · 가이드 1명',
    destinationType: 'KR',
    heroImage: 'https://ijto.or.kr/korean/gharhksfl/pgm_slider/img/main_visual01_3.jpg',
    defaultBudgetKrw: 500000,
    sourceUrl: `${K}jeju2027.html`,
    keyRules: groupRules([{ title: '중국어 일정 · 위챗 링크', description: '여행사가 명단을 등록하면 중국어 일정 링크를 위챗 단톡방에 공유합니다.', tag: 'KeepTrip 中文' }]),
    checklist: list('jcn', [
      ['MUST', 'prep', '명단 등록 · 위챗 일정 공유', '출발 전 여행사가 명단을 등록합니다.'],
      ['MUST', 'entry', '제주공항에서 태그 수령 · 동의', 'QR로 본인 연결과 위치 이용 동의.'],
      ['MUST', 'data', '실시간 통역 · 1330 연결', '시장 · 택시 · 병원에서 통역, 어려우면 1330 사람 통역.']
    ]),
    days: [
      d(1, '1일 차', '-', '제주', '도착 · 성산일출봉', ['공항 태그 수령', '성산일출봉'], [s('09:10', '제주공항 도착 · 태그 수령', '웰컴 데스크', 'flight'), s('11:00', '성산일출봉', '하산 집결 20분 전 중국어 알림'), s('12:30', '해산물 점심', '성산항 부근', 'food')]),
      d(2, '2일 차', '-', '제주', '동문시장 자유시간', ['시장 통역', '미복귀 경보'], [s('13:00', '동문시장 자유시간', '흥정 · 결제 문의를 실시간 통역으로', 'food'), s('15:30', '8번 출구 집결', '가이드 1분 점호 · 미확인자 마지막 위치 반경', 'transit')]),
      d(3, '3일 차', '-', '제주', '출국 · 반납', ['태그 반납', '안전 리포트'], [s('10:00', '공항 반납', '여행사에 안전 리포트, 위치 기록 파기', 'flight')])
    ]
  },
  {
    id: 'trip-jeju-school',
    title: '제주 수학여행 2박 3일 (예시)',
    subtitle: '제주 이동안전 제안 · 시나리오 B · 고2 6개 반 180명',
    dateRange: '2027 (예시)',
    durationText: '2박 3일',
    partyText: '학생 180명 · 담임 6명',
    destinationType: 'KR',
    heroImage: 'https://api.cdn.visitjeju.net/mainVisualBanner/imageFile/202611/06/2f2f0c81-5f67-4a87-82a8-bf13aac0f890.webp',
    defaultBudgetKrw: 300000,
    sourceUrl: `${K}jeju2027.html`,
    keyRules: groupRules([{ title: '숙소 22:00 야간 점호', description: '층별 확인 뒤 미확인 학생만 교사가 직접 확인합니다.', tag: '야간 점호' }]),
    checklist: list('jsc', [
      ['MUST', 'prep', '학부모 동의 (D-14)', '가정통신문 QR로 동의와 비상연락처 등록.'],
      ['MUST', 'prep', '반별 태그 키트 수령', '공항에서 반 · 버스 단위로 받아 명찰에 부착.'],
      ['SAVINGS', 'transit', '버스별 탑승 명단 미리 나누기', '버스 출발 전 자동 확인이 빨라집니다.']
    ]),
    days: [
      d(1, '1일 차', '-', '제주', '도착 · 버스 승하차 점호', ['반별 키트', '1분 점호'], [s('09:00', '제주공항 도착', '반 · 버스 단위 키트 수령', 'flight'), s('11:00', '버스 승하차', '출발 전 자동 확인 · 미탑승자만 표시', 'transit'), s('14:30', '성산일출봉 집결', '반별 점호'), s('22:00', '숙소 야간 점호', '층별 확인', 'hotel')]),
      d(2, '2일 차', '-', '제주', '체험 · 자유활동', ['구역 이탈 알림', '학부모 리포트'], [s('10:00', '오름 체험 · 자유활동', '정해진 구역을 벗어나면 담임에게 알림'), s('19:00', '학부모 안심 리포트', '일정별 확인 결과만 전달'), s('22:00', '숙소 야간 점호', '층별 확인', 'hotel')]),
      d(3, '3일 차', '-', '제주', '귀가 · 안전 보고서', ['반납', '안전관리 보고서'], [s('11:00', '공항 반납', '학교 제출용 안전관리 보고서 자동 생성', 'flight')])
    ]
  },

  // ───────────── 4~5. 일산동중학교 ─────────────
  {
    id: 'trip-ilsandong-annual-2027',
    title: '일산동중학교 2027 연간 체험학습 (안)',
    subtitle: '현장체험학습 · 진로체험 · 캠프 · 수학여행 연간 운영',
    dateRange: '2027.3 – 2027.12 (안)',
    durationText: '연간 7회',
    partyText: '전교생 564명 · 22학급',
    destinationType: 'KR',
    heroImage: CM('Korea-Busan-Doosong_Middle_School-02.jpg'),
    defaultBudgetKrw: 100000,
    sourceUrl: `${K}ilsandong.html`,
    keyRules: groupRules([{ title: '담임 · 보조인력은 같은 명단', description: '보조인력은 담당 학생만 봅니다. 활동이 끝나면 안전조치 이행 기록이 자동으로 남습니다.', tag: '안전조치 이행 기록' }]),
    checklist: list('ild', [
      ['MUST', 'prep', '반 명단 · 학부모 동의 등록 (3월)', '새학년 교통안전교육 때 사용법 안내.'],
      ['MUST', 'prep', '보조인력 배치 · 담당 학생 배정', '학급당 1명 기준.'],
      ['MUST', 'prep', '위탁업체 차량 안전점검표 업로드', '이행 기록에 함께 첨부됩니다.']
    ]),
    days: [
      d(1, '3월', '-', '일산 · 학교', '명단 · 동의 등록', ['1회 셋업'], [s('-', '반 명단 업로드 · 학부모 동의', '새학년 교통안전교육 때 안내', 'transit')]),
      d(2, '4월', '-', '학교', '리더십 캠프', ['학생 리더 연습'], [s('-', '학생 리더십 캠프', '학급 임원이 반 점호 보조를 연습')]),
      d(3, '5월 14일', '금', '체험처', '현장체험학습 (2학년)', ['버스 8대', '귀교 확인'], [s('08:30', '버스 탑승 점호', '버스 8대 · 반별 1분 점호', 'transit'), s('13:30', '체험관 집결', '담임 · 보조인력 조별 점호'), s('16:42', '귀교 확인', '학부모 알림 발송', 'transit')]),
      d(4, '7월', '-', '진로체험처', '학년별 진로체험', ['소그룹 배정'], [s('-', '진로체험', '체험처마다 담당 교사 · 보조인력에게 해당 학생만 배정')]),
      d(5, '10월', '-', '경주', '수학여행 (2학년, 별도 일정)', ['태그 · 야간 점호'], [s('-', '경주 2박 3일 수학여행', '‘일산동중 2학년 경주 수학여행’ 일정 참고', 'transit')]),
      d(6, '11월', '-', '학교', '별밤캠프', ['야간 점호'], [s('19:00', '별밤캠프', '어두운 운동장 · 강당 이동도 1분 점호')]),
      d(7, '12월', '-', '학교', '학년말 교육활동평가회', ['연간 보고서'], [s('-', '연간 안전 보고', '활동별 점호 · 보조인력 · 사고 기록')])
    ]
  },
  {
    id: 'trip-ilsandong-gyeongju',
    title: '일산동중 2학년 경주 수학여행 (예시)',
    subtitle: '숙박형 체험학습 · 태그와 숙소 야간 점호',
    dateRange: '2027.10 (예시)',
    durationText: '2박 3일',
    partyText: '2학년 약 200명 · 8개 반',
    destinationType: 'KR',
    heroImage: CM('Geungnakjeon,_Bulguksa_01.jpg'),
    defaultBudgetKrw: 200000,
    sourceUrl: `${K}ilsandong.html`,
    keyRules: groupRules(),
    checklist: list('igj', [
      ['MUST', 'prep', '학부모 동의 · 비상연락처', '숙박형은 동의서를 따로 받습니다.'],
      ['MUST', 'prep', '반별 태그 키트', '넓은 유적지 · 숙소용.']
    ]),
    days: [
      d(1, '1일 차', '-', '경주', '출발 · 불국사', ['버스 점호', '불국사'], [s('08:00', '학교 출발', '버스별 탑승 점호', 'transit'), s('13:00', '불국사', '반별 집결 점호'), s('22:00', '숙소 야간 점호', '층별 확인', 'hotel')]),
      d(2, '2일 차', '-', '경주', '역사 유적 체험', ['구역 이탈 알림'], [s('10:00', '역사 유적지 체험', '조별 자유 관람 · 구역 이탈 알림'), s('22:00', '숙소 야간 점호', '층별 확인', 'hotel')]),
      d(3, '3일 차', '-', '경주 → 일산', '귀교', ['귀교 확인'], [s('15:00', '귀교 · 태그 반납', '학부모 알림 · 이행 기록', 'transit')])
    ]
  },

  // ───────────── 6. 갈릴리여행사 ─────────────
  {
    id: 'trip-galilee-holyland',
    title: '이스라엘 · 요르단 성지순례 10일 (예시)',
    subtitle: '갈릴리여행사 ‘안심 순례’ 제안 · 교회 단체',
    dateRange: '2027 봄 (예시)',
    durationText: '9박 10일',
    partyText: '교회 단체 30명',
    destinationType: 'GLOBAL',
    heroImage: CM('141151_sea_of_galilee_PikiWiki_Israel.jpg', 960),
    defaultBudgetKrw: 800000,
    sourceUrl: `${K}galilee.html`,
    keyRules: groupRules([{ title: '국경 통과 뒤 사람 · 짐 재확인', description: '이스라엘 → 요르단 국경을 지나면 성도와 캐리어를 자동으로 다시 확인합니다.', tag: 'Keep121 Track' }]),
    checklist: list('gal', [
      ['MUST', 'entry', '여권 유효기간 6개월 이상', '이스라엘 · 요르단 입국 요건을 출발 전 여행사와 확인합니다.'],
      ['MUST', 'prep', '교회 설명회에서 동의 · 가족 연락처 등록', '교회 안심 리포트를 받을 가족 지정.'],
      ['MUST', 'prep', '성도 · 캐리어 태그 배부 (인천공항)', '사람 30 + 캐리어 30.']
    ]),
    days: [
      d(1, '1일 차', '-', '인천', '출발 · 태그 배부', ['공항 집결'], [s('-', '인천공항 집결', '성도 · 캐리어 태그 QR 배부', 'flight')]),
      d(2, '3일 차', '-', '갈릴리', '갈릴리 호수', ['배 승하선 점호'], [s('-', '갈릴리 호수 배', '승선 · 하선 때 1분 점호', 'transit'), s('-', '가버나움 · 팔복교회', '성지 해설')]),
      d(3, '5일 차', '-', '국경', '이스라엘 → 요르단', ['국경 재확인'], [s('-', '국경 통과', '사람 · 짐 자동 재확인', 'transit')]),
      d(4, '7일 차', '-', '예루살렘', '구시가지 · 비아 돌로로사', ['뒤처짐 알림'], [s('-', '비아 돌로로사', '좁은 골목 이동 중 뒤처진 성도 알림'), s('15:00', '다메섹 문 집결', '1분 점호', 'transit')]),
      d(5, '10일 차', '-', '귀국', '반납 · 순례 기록집', ['기록집'], [s('-', '태그 반납 · 순례 기록집', '말씀 · 사진 기록집을 교회에 전달', 'flight')])
    ]
  },

  // ───────────── 7. SaGA 일터선교 비전트립 ─────────────
  {
    id: 'trip-saga-visiontrip-2027',
    title: 'SaGA 유럽 종교개혁 비전트립 9일 (안)',
    subtitle: '일터선교&글로벌네트워크아카데미 · 체코 · 독일 · 네덜란드',
    dateRange: '2027.8 (안 · 2023 일정 기준)',
    durationText: '8박 9일',
    partyText: '25명 · 4개 조',
    destinationType: 'GLOBAL',
    heroImage: CM('Prague_07-2016_View_from_Petrinska_Tower_img2.jpg'),
    defaultBudgetKrw: 900000,
    sourceUrl: `${K}saga-visiontrip.html`,
    keyRules: groupRules([
      { title: '휴게소 유료 화장실 1유로', description: '고속도로 휴게소마다 1유로 동전이 필요합니다. 버스 출발 전 25/25 자동 확인.', tag: '재탑승' },
      { title: '작은 가방은 항상 가슴 앞쪽에', description: '유럽 관광지 소매치기 주의 — 지갑 · 휴대폰 · 여권.', tag: '소지품' }
    ]),
    checklist: list('svt', [
      ['MUST', 'prep', '짐 규정 확인', '부치는 짐 23kg 1개, 기내 8kg.'],
      ['MUST', 'prep', '멀티 어댑터 · 해설 수신기 이어폰 · 충전 코드', '수신기는 공항에서 배부, 귀국 때 반납.'],
      ['MUST', 'payment', '유로화 · 카드 준비', '달러는 유통되지 않습니다. 1유로 동전 여러 개.'],
      ['SAVINGS', 'data', '데이터 로밍 9일', '공항 · 식당 · 호텔 와이파이 가능.'],
      ['IGNORE', 'prep', '한국 반찬 챙기기', '현지식 · 한식이 함께 나옵니다.']
    ]),
    days: [
      d(1, '1일 차', '-', '프라하', '인천 T2 집결 → 프라하', ['3층 C카운터 집결', '태그 배부'], [s('08:30', '인천공항 T2 3층 집결', '사람 · 캐리어 태그와 해설 수신기 배부', 'flight'), s('17:00', '프라하 도착 · 도보 투어', '이사야 60:22')]),
      d(2, '2일 차', '-', '프라하 → 드레스덴', '얀 후스', ['프라하성 · 베들레헴교회 · 카를교'], [s('09:00', '프라하성 · 성 비트 성당', '집결 점호'), s('13:00', '카를교 · 구시가 광장 자유시간', '집결 15분 전 알림'), s('18:00', '드레스덴 이동', '버스 재탑승 확인', 'transit')], '요한복음 8:32'),
      d(3, '3일 차', '-', '비텐베르크 → 에르푸르트', '마르틴 루터 ①', ['95개조 성안교회', '아이슬레벤'], [s('10:00', '비텐베르크 성안교회 · 루터하우스', '하박국 2:4'), s('15:00', '아이슬레벤 · 루터 임종의 방', '이동 점호', 'transit')]),
      d(4, '4일 차', '-', '아이제나흐 → 프랑크푸르트', '마르틴 루터 ②', ['바르트부르크 성'], [s('11:00', '바르트부르크 성', '신약 독일어 번역 현장'), s('17:00', '프랑크푸르트 뢰머광장', '자유시간 뒤 집결')], '시편 118:17'),
      d(5, '5일 차', '-', '보름스 → 쾰른', '보름스 제국회의', ['루터 기념비', '하이델베르크', '쾰른 대성당'], [s('09:00', '보름스 루터 기념비', '로마서 1:17'), s('12:30', '하이델베르크 고성 · 성령교회', '점심 · 철학자의 길'), s('14:00', '휴게소', '1유로 동전 · 재탑승 확인', 'transit'), s('18:00', '쾰른 대성당', '숙박', 'hotel')]),
      d(6, '6일 차', '-', '암스테르담', '카이퍼의 나라로', ['잔세스칸스 풍차마을'], [s('14:00', '잔세스칸스', '풍차 · 목조 가옥'), s('18:00', '호텔 이동 · 짐 확인', '캐리어 25개 적재', 'hotel')], '마태복음 28:18'),
      d(7, '7일 차', '-', '암스테르담', '카이퍼를 만나는 날', ['국립미술관', '자유대학'], [s('10:00', '담 광장 · 운하', '자유시간 뒤 집결'), s('14:00', '국립미술관', '해설 수신기 수량 확인')], '로마서 1:28'),
      d(8, '8일 차', '-', '헤이그 → 출국', '평화궁 · 이준 열사', ['평화궁', '이준 열사 기념관'], [s('10:00', '헤이그 평화궁 · 이준 열사 기념관', ''), s('21:20', '암스테르담 출발', '태그 · 수신기 반납 확인', 'flight')]),
      d(9, '9일 차', '-', '인천', '귀국 · 순례 기록집', ['기록집'], [s('15:05', '인천 도착', '9일의 말씀 · 사진 순례 기록집', 'flight')], '이사야 60:22')
    ]
  },

  // ───────────── 8~16. SaGA 레거시아카데미 2027 ─────────────
  {
    id: 'trip-saga-walkathon-2027',
    title: '레거시 워커톤 1만보 걷기',
    subtitle: 'SaGA 레거시아카데미 · 서울대공원 · 2027 파일럿 ①',
    dateRange: '2027.4.12 (월)',
    durationText: '당일',
    partyText: '레거시 생도 (60세 이상) · 봉사자',
    destinationType: 'KR',
    heroImage: CM('130830경기도_과천시_서울대공원13.jpg'),
    defaultBudgetKrw: 50000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules([{ title: '후미 봉사자 거리 알림', description: '맨 뒤 봉사자와 가장 먼 분의 거리가 멀어지면 알림. 체크포인트 4곳 통과 확인.', tag: '후미 확인' }]),
    checklist: list('swk', [
      ['MUST', 'prep', '편한 운동화 · 모자 · 물', '1만보(약 7km) 걷기.'],
      ['MUST', 'prep', '종이 응급 카드', '복약 · 보호자 연락처는 종이로만 지닙니다.']
    ]),
    days: [d(1, '4월 12일', '월', '과천 · 서울대공원', '레거시 워커톤', ['체크포인트 4곳', '완주 · 레거시 식사'], [
      s('09:30', '서울대공원 출발', '명찰 확인 · 자녀에게 출발 알림', 'transit'),
      s('10:40', 'CP2 · 5,000보', '체크포인트 통과 확인'),
      s('11:20', 'CP3 · 7,500보', '후미 거리 확인 · 휴식 차량 연결'),
      s('12:00', 'CP4 · 1만보 완주', '호숫가 광장 · 자녀에게 완주 알림'),
      s('12:30', '레거시 식사', '오늘 받은 은혜 나누기', 'food')
    ], '시편 92:14')]
  },
  {
    id: 'trip-saga-nagasaki-2027',
    title: '나가사키 레거시 여행 (일정 안)',
    subtitle: 'SaGA 레거시아카데미 · 한국 초대 기독교 유적지 레거시',
    dateRange: '2027.4.18 (일) – 4.23 (금)',
    durationText: '5박 6일',
    partyText: '레거시 생도 약 40명 (가정)',
    destinationType: 'JP',
    heroImage: CM('Oura_Cathedral_20180623.jpg'),
    defaultBudgetKrw: 700000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules([{ title: '사람 + 캐리어 태그 · 일본어 통역', description: '공항 · 호텔 · 성당 이동마다 사람과 짐을 함께 확인하고, 식당 · 약국에서는 통역 앱을 씁니다.', tag: '해외 기본형' }]),
    checklist: list('sng', [
      ['MUST', 'entry', '여권 유효기간 확인', '출발 전 일본 입국 요건 재확인.'],
      ['MUST', 'payment', '트래블카드 · 엔화 소액', 'IC 교통카드 충전용 현금 조금.'],
      ['MUST', 'prep', '사람 · 캐리어 태그 수령', '인천공항 집결 때 QR로 배부.']
    ]),
    days: [
      d(1, '4월 18일', '일', '나가사키', '출국 · 도착', ['태그 배부'], [s('-', '인천공항 집결 · 출국', '사람 · 캐리어 태그 배부', 'flight'), s('-', '나가사키 도착 · 호텔', '캐리어 수량 확인', 'hotel')]),
      d(2, '4월 19일', '월', '나가사키', '오우라 성당 (예시)', ['오우라 성당'], [s('-', '오우라 성당 일대 (예시)', '세부 방문지는 레거시 운영팀 확정 후 반영')]),
      d(3, '4월 20일', '화', '나가사키', '레거시 순례 (일정 조정 중)', ['조별 미션'], [s('-', '레거시 순례 · 배움의 장', '확정 일정 반영 예정')]),
      d(4, '4월 21일', '수', '나가사키', '레거시 순례 (일정 조정 중)', [], [s('-', '레거시 순례', '확정 일정 반영 예정')]),
      d(5, '4월 22일', '목', '나가사키', '레거시 식사 · 나눔', [], [s('-', '레거시 순례 · 나눔', '확정 일정 반영 예정')]),
      d(6, '4월 23일', '금', '인천', '귀국 · 반납', ['기록집'], [s('-', '귀국 · 태그 반납', '레거시 기록집', 'flight')])
    ]
  },
  {
    id: 'trip-saga-ganghwa',
    title: '강화도 레거시 순례 여행',
    subtitle: 'SaGA 레거시아카데미 · 하루 코스 · 2027 파일럿 ② 후보',
    dateRange: '2027.5 (예정)',
    durationText: '당일',
    partyText: '레거시 생도 약 40명 (가정)',
    destinationType: 'KR',
    heroImage: CM('Ganghwa_Anglican_Cathedral_01_20170916.jpg'),
    defaultBudgetKrw: 50000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules([{ title: '레거시 식사는 4인 한 테이블', description: '식사하며 한 분씩 3분 안에 오늘 배운 것을 나눕니다. 큰 형님 · 큰 누님 레거시께서 기도로 섬깁니다.', tag: '배움의 장 3' }]),
    checklist: list('sgh', [
      ['MUST', 'prep', '교재 「강화도 레거시 순례 여행」', '배움의 장 1~3 · 장소별 기도.'],
      ['SAVINGS', 'prep', '화개전망대 스카이워크 · 계단', '높은 곳 · 계단 이동은 후미 확인.']
    ]),
    days: [d(1, '5월 (예정)', '-', '강화', '강화도 기독교 레거시', ['성공회 강화성당', '기독교역사기념관', '화개정원', '화개전망대'], [
      s('-', '성공회 강화 성당', '한국에 토착화된 교회 · 강화도를 위한 중보기도'),
      s('-', '강화 기독교 역사기념관', '1892년 감리교 · 성공회 선교의 시작'),
      s('-', '레거시 식사 · 인삼오리백숙', '4인 테이블 · 3분 나눔', 'food'),
      s('-', '화개정원', '5색 테마 정원 · 천국 정원의 소망'),
      s('-', '화개전망대 · 스카이워크', '북녘을 향한 복음통일 기도 · 후미 확인')
    ], '시편 92:14')]
  },
  {
    id: 'trip-saga-gongju',
    title: '공주 레거시 리더십 여행',
    subtitle: 'SaGA 레거시아카데미 · 하루 코스 · 레거시 미션',
    dateRange: '2027 (예정)',
    durationText: '당일',
    partyText: '레거시 생도 · 4개 조',
    destinationType: 'KR',
    heroImage: CM('Geumseoru_Gate_Pavilion_of_Gongsanseong_Fortress_(2).jpg'),
    defaultBudgetKrw: 50000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules([{ title: '레거시 활동 = 조별 미션', description: '교재의 질문 · 조별 사진 · 확인(✓)을 조장 휴대폰 하나로 채웁니다.', tag: '레거시 미션' }]),
    checklist: list('sgj', [
      ['MUST', 'prep', '교재 「레거시 리더십 여행 (공주)」', '배움의 장 1~3 · 레거시 활동표.'],
      ['SAVINGS', 'prep', '찬송 355장 「부름받아 나선 이 몸」', '이유선 장로 작곡 · 공주제일교회 출신.']
    ]),
    days: [d(1, '(예정)', '-', '공주', '4가지 레거시 리더십', ['공주제일교회', '영명학당', '선교사 묘', '늘봄정원'], [
      s('-', '공주제일교회 · 기독교 박물관', '미션: 누가 언제 개척했는가? · 신홍식 목사 동상'),
      s('-', '영명학교 · 우리암 선교사 동상', '미션: 조별 사진 찍기'),
      s('-', '걸음 리더십 · 513m', '약 9분 걷기 · 후미 확인', 'transit'),
      s('-', '선교사 묘역', '샤프 선교사 부부 · 우광복 묘 앞 사진'),
      s('-', '늘봄정원 · 레거시 식사 & 커피', '오늘 받은 은혜 2~3가지 나누기', 'food')
    ])]
  },
  {
    id: 'trip-saga-yangjae',
    title: '양재천 만보 걷기',
    subtitle: 'SaGA 레거시아카데미 · 하루 코스',
    dateRange: '2027 (예정)',
    durationText: '당일',
    partyText: '레거시 생도',
    destinationType: 'KR',
    heroImage: CM('2015년_5월_23일_경기도_과천시_양재천_DSC00749.jpg'),
    defaultBudgetKrw: 30000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules([{ title: '중간 집결 지점', description: '긴 하천 산책로는 앞뒤 간격이 벌어집니다. 중간 집결과 후미 거리 알림.', tag: '후미 확인' }]),
    checklist: list('syj', [['MUST', 'prep', '운동화 · 물 · 모자', '1만보 걷기.']]),
    days: [d(1, '(예정)', '-', '양재천', '만보 걷기', ['중간 집결', '레거시 식사'], [
      s('-', '출발 점호', '명찰 확인', 'transit'), s('-', '중간 집결', '후미 거리 확인'), s('-', '도착 · 레거시 식사', '나눔', 'food')
    ])]
  },
  {
    id: 'trip-saga-shinan',
    title: '신안 섬티아고 12사도 순례길 (일정 조정 중)',
    subtitle: 'SaGA 레거시아카데미 · 1박 2일',
    dateRange: '2027 (일정 조정 중)',
    durationText: '1박 2일',
    partyText: '레거시 생도 약 40명 (가정)',
    destinationType: 'KR',
    heroImage: 'https://www.saga121.com/wp-content/uploads/2026/09/image-19.png',
    defaultBudgetKrw: 100000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules([{ title: '바닷가 야간 성찬', description: '어두운 야외에서도 손전등 없이 인원 확인, 숙소 야간 점호.', tag: '야간 점호' }]),
    checklist: list('ssn', [
      ['MUST', 'prep', '「12사도 레거시」 묵상집', '사도별 레거시를 읽고 걸으며 묵상.'],
      ['MUST', 'prep', '여벌 옷 · 손전등 · 상비약', '1박 2일 · 바닷가 야간 행사.']
    ]),
    days: [
      d(1, '1일 차', '-', '신안', '출발 · 12사도 순례길 ①', ['버스 4시간', '순례길'], [s('07:00', '교회 출발', '버스 탑승 점호', 'transit'), s('11:00', '순례길 도착 · 점심', '점호', 'food'), s('14:00', '12사도 순례길 걷기', '후미 확인'), s('20:00', '베드로 기념교회 앞 야간 성찬', '어두운 바닷가 점호'), s('22:00', '숙소 야간 점호', '', 'hotel')]),
      d(2, '2일 차', '-', '신안 → 서울', '12사도 순례길 ② · 귀가', ['순례길', '귀가 알림'], [s('09:00', '12사도 순례길 걷기', '13km 중 나머지'), s('15:00', '귀가 버스 탑승', '자녀에게 ‘귀가 출발’ 알림', 'transit')])
    ]
  },
  {
    id: 'trip-saga-andong',
    title: '안동 레거시 여행 — 요코하마에서 안동으로',
    subtitle: 'SaGA 레거시아카데미 · 1박 2일',
    dateRange: '2027 (예정)',
    durationText: '1박 2일',
    partyText: '레거시 생도 약 40명 (가정)',
    destinationType: 'KR',
    heroImage: CM('Hahoe_Folk_Village_03.jpg'),
    defaultBudgetKrw: 100000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules([{ title: '여러 교회 이동', description: '교회 · 기념지 이동마다 버스 재탑승 확인.', tag: '재탑승' }]),
    checklist: list('sad', [['MUST', 'prep', '교재 「요코하마에서 안동으로 흘러간 레거시」', '이수정 · 배위량 · 이상동 · 김수만 장로.']]),
    days: [
      d(1, '1일 차', '-', '안동', '흘러온 레거시', ['안동 복음의 시작'], [s('-', '안동 도착', '버스 점호', 'transit'), s('-', '배움의 장 · 이상동 장로의 길', '포산동교회 등 (방문지 확정 예정)'), s('-', '숙소 야간 점호', '', 'hotel')]),
      d(2, '2일 차', '-', '안동 → 서울', '흘러간 레거시', ['김수만 장로 10+ 레거시'], [s('-', '배움의 장 · 김수만 장로, 외다리로 일궈낸 10개의 교회', '방문지 확정 예정'), s('-', '귀가', '자녀 알림', 'transit')])
    ]
  },
  {
    id: 'trip-saga-goseong',
    title: '고성 레거시 여행 — 초대 두 선교사 (일정 조정 중)',
    subtitle: 'SaGA 레거시아카데미 · 1박 2일',
    dateRange: '2027 (일정 조정 중)',
    durationText: '1박 2일',
    partyText: '레거시 생도',
    destinationType: 'KR',
    heroImage: CM('A_Road_between_Paddies_in_Ganghwa_Island.jpg'),
    defaultBudgetKrw: 100000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules(),
    checklist: list('sgs', [['MUST', 'prep', '일정 확정 후 교재 · 방문지 반영', '레거시 운영팀 확정 대기.']]),
    days: [
      d(1, '1일 차', '-', '고성', '초대 두 선교사 (확정 예정)', [], [s('-', '방문지 확정 예정', '1박 2일 운영 방식 동일', 'transit')]),
      d(2, '2일 차', '-', '고성 → 서울', '귀가', [], [s('-', '귀가', '자녀 알림', 'transit')])
    ]
  },
  {
    id: 'trip-saga-seminar-2027',
    title: '아름답게 나이들기 세미나',
    subtitle: 'SaGA 레거시아카데미 · 필그림하우스',
    dateRange: '2027.11.8 (월) – 11.10 (수)',
    durationText: '2박 3일',
    partyText: '레거시 생도',
    destinationType: 'KR',
    heroImage: 'https://www.saga121.com/wp-content/uploads/2026/09/image-17.png',
    defaultBudgetKrw: 100000,
    sourceUrl: `${K}saga2027.html`,
    keyRules: groupRules([{ title: '출석 · 프로그램 이동 확인', description: '강의실 · 숙소 이동과 출석을 명찰로 확인하고, 한 해 레거시 기록집을 정리합니다.', tag: '연간 기록집' }]),
    checklist: list('ssm', [['MUST', 'prep', '여벌 옷 · 상비약', '2박 3일 숙박.']]),
    days: [
      d(1, '11월 8일', '월', '필그림하우스', '입소', ['출석'], [s('-', '도착 · 출석 확인', '', 'transit'), s('-', '세미나', ''), s('-', '숙소 점호', '', 'hotel')]),
      d(2, '11월 9일', '화', '필그림하우스', '세미나', [], [s('-', '세미나 · 나눔', '')]),
      d(3, '11월 10일', '수', '필그림하우스 → 서울', '수료 · 귀가', ['연간 기록집'], [s('-', '수료 · 귀가', '2027 레거시 기록집 전달', 'transit')])
    ]
  }
];
