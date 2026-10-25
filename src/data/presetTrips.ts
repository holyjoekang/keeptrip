import { TripData } from '../types/travel';

export const PRESET_TRIPS: TripData[] = [
  {
    id: 'trip-china-2026',
    title: '중국 서부 미식·백주·문화 탐방',
    subtitle: '충칭 2박 · 청두 2박 (SNU EMBA 4인 여정)',
    dateRange: '2026.11.18 (수) – 11.22 (일)',
    durationText: '4박 5일',
    partyText: '친구 4명 동행 (EMBA)',
    destinationType: 'CN',
    heroImage: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1600&q=80',
    defaultBudgetKrw: 1200000,
    sourceUrl: 'https://holyjoekang.github.io/my-travel-map/itinerary/t-2026-11-18.html',
    bestMoments: {
      bestFood: {
        title: '구궁격 우지 마라 훠궈 & 진마파두부',
        desc: '얼얼한 화쟈오의 불맛과 기름진 우지 육수, 훠궈 기름장에 마늘 듬뿍 넣어 먹는 본토의 강렬한 맛'
      },
      bestPlace: {
        title: '수정방 600년 양조 발효조 & 제쯔구전 찻집',
        desc: '중국 제1방의 그윽한 백주 향기를 직접 맡은 수정방 유적과, 물소리 들으며 자스민차를 마신 제쯔구전'
      },
      goldenInsight: {
        title: '2박+2박으로 이동을 줄이고 대화의 깊이를 늘리다',
        desc: '마오타이진을 과감히 생략하고 장거리 육로 이동을 없앤 덕분에, 네 친구가 편안하게 백주를 마시며 깊은 이야기를 나눈 최고의 4박 5일.'
      }
    },
    initialVoiceNotes: [
      {
        id: 'vn-cn-1',
        timestamp: '11/18 20:15',
        spotTitle: '충칭 해방비 구궁격 훠궈',
        category: 'food',
        transcript: '와, 한국에서 먹던 훠궈랑은 차원이 다르네요! 우지(소기름) 베이스라 국물이 정말 묵직하고 참기름 마늘장에 찍어 먹으니 매운맛이 싹 감돕니다. 넷이서 200위안 넘어서 2개 알리페이로 분할결제 하니까 수수료 3%도 안 붙고 딱 좋습니다!',
        rating: 5,
        isRecommended: true
      },
      {
        id: 'vn-cn-2',
        timestamp: '11/19 21:30',
        spotTitle: '홍야동 & 천사문 대교',
        category: 'culture',
        transcript: '천사문 대교 보도교 중간까지 걸어 나와서 바라보는 홍야동 11층 누각 야경이 환상적입니다. 바람도 시원하고 8D 입체 도시라는 말이 왜 나왔는지 실감 나네요. 사진은 무조건 다리 위에서 찍으세요.',
        rating: 5,
        isRecommended: true
      },
      {
        id: 'vn-cn-3',
        timestamp: '11/20 15:40',
        spotTitle: '청두 수정방 박물관',
        category: 'culture',
        transcript: '수정방 지하 발효조가 600년 동안 균이 살아 숨 쉬고 있다니 감동입니다. 도슨트 설명 듣고 나서 갓 내린 52도 오리지널 원액 한 모금 넘기는데 목넘김이 너무 부드럽고 잔향이 길게 남습니다.',
        rating: 5,
        isRecommended: true
      }
    ],
    keyRules: [
      {
        title: '알리페이 200위안 룰 (3% 수수료)',
        description: '200위안(약 38,000원) 이하 결제는 알리페이 수수료 무료. 200위안 초과 시 3%가 부과되므로, 훠궈/식당 등 고액 결제 시 카운터에 "分开付(분할결제)"를 요청하거나 수수료 0% 트래블카드를 쓰세요.',
        tag: '결제 최적화'
      },
      {
        title: '로밍형 eSIM 필수 (만리방화벽 우회)',
        description: '중국 현지 와이파이나 현지 유심은 카카오톡, 구글, 유튜브가 차단됩니다. 홍콩/마카오 망을 경유하는 로밍형 eSIM을 사용하면 별도 VPN 없이 한국처럼 모든 앱이 100% 작동합니다.',
        tag: '통신 필수'
      },
      {
        title: '구글 지도 불능 → 고덕지도(高德地图) 필수',
        description: '중국에서는 구글 지도의 위치 오차가 심하고 대중교통 경로가 안 나옵니다. 한국에서 미리 고덕지도(Amap)를 다운로드해 두고, 호텔과 관광지 한자 명칭을 즐겨찾기해 두세요.',
        tag: '지도/교통'
      },
      {
        title: '고속철 탑승 시 실물 여권 스캔',
        description: '충칭북역→청두동역 고속철은 별도 종이표 없이 여권 인식 게이트로 바로 통과합니다. 단, 보안 검색과 짐 검사가 공항 수준이므로 열차 출발 최소 35분 전에 역에 도착해야 합니다.',
        tag: '고속철 이동'
      }
    ],
    checklist: [
      {
        id: 'cn-1',
        tier: 'MUST',
        category: 'entry',
        title: '한중 비자 면제 정책 및 여권 유효기간 6개월 확인',
        description: '현재 시행 중인 15일 무비자 입국 정책 요건을 재확인하고, 4명 일행 전원 여권 유효기간이 6개월 이상 남았는지 점검하세요.',
        completed: false,
        actionTip: '만료일이 2027년 5월 이후여야 안전합니다.'
      },
      {
        id: 'cn-2',
        tier: 'MUST',
        category: 'payment',
        title: '알리페이(Alipay) 앱 설치 및 여권 실명인증 (사전 3일 전)',
        description: '중국은 현금을 거의 받지 않는 100% 모바일 QR 사회입니다. 알리페이에 여권 사진을 업로드해 실명인증을 완료하고 카드를 2개 이상 등록해두세요.',
        completed: false,
        actionTip: '트래블로그/토스카드 1순위, 비상용 비자/마스터 신용카드 2순위 등록'
      },
      {
        id: 'cn-3',
        tier: 'MUST',
        category: 'data',
        title: '홍콩 경유 로밍형 eSIM 구매 (5일권, 일 2~3GB)',
        description: '중국 만리방화벽을 우회해 카카오톡과 네이버, 구글 지도를 쓸 수 있는 유일한 가성비 수단입니다.',
        estimatedSavingKrw: 37000,
        completed: false,
        actionTip: '통신사 로밍(4.9만원) 대비 1.2만원으로 3.7만원 즉시 절약'
      },
      {
        id: 'cn-4',
        tier: 'MUST',
        category: 'transit',
        title: '고덕지도(高德地图, Amap) 앱 설치 및 주요 목적지 즐겨찾기',
        description: '충칭 해방비, 홍야동, 청두 수정방 박물관, 제쯔구전 한자 명칭을 미리 저장해두면 택시 기사에게 보여주거나 길 찾기 편리합니다.',
        completed: false
      },
      {
        id: 'cn-5',
        tier: 'SAVINGS',
        category: 'payment',
        title: '식당 결제 시 200위안 초과 분할 결제 (AA제) 활용',
        description: '훠궈나 백주 식당에서 600위안이 나왔을 때 한 번에 긁으면 18위안(약 3,500원) 수수료 발생. 4명이 150위안씩 나눠 결제하면 수수료 0원!',
        estimatedSavingKrw: 15000,
        completed: false,
        actionTip: '카운터에 "可以分开扫吗? (나눠서 결제할 수 있나요?)" 문의'
      },
      {
        id: 'cn-6',
        tier: 'SAVINGS',
        category: 'transit',
        title: '디디추싱(Didi) 알리페이 내 미니프로그램으로 호출',
        description: '별도 디디 앱을 설치하지 않고 알리페이 상단 검색창에 Didi를 치면 바로 호출 가능. 목적지를 미리 입력해 언어 장벽 없이 자동 결제됩니다.',
        estimatedSavingKrw: 8000,
        completed: false
      },
      {
        id: 'cn-7',
        tier: 'IGNORE',
        category: 'payment',
        title: '5~10위안 음료수 살 때 소액 수수료 걱정하지 않기',
        description: '편의점이나 길거리 간식 살 때 가맹점 정책으로 0.5~1위안(100~200원) 소액 수수료가 붙더라도, 카드 바꾸느라 스트레스 받지 말고 편하게 긁으세요.',
        completed: false,
        actionTip: '커피 한 모금 값입니다. 시간과 에너지가 훨씬 비쌉니다!'
      },
      {
        id: 'cn-8',
        tier: 'IGNORE',
        category: 'payment',
        title: '두꺼운 현금 뭉치 환전하기 (비상금 200위안만 지참)',
        description: '중국 상인들은 거스름돈이 없어 현금을 기피합니다. 4인 기준 비상용으로 200~300위안(약 4~6만원)만 환전해 주머니에 넣고 나머지는 100% 모바일로 해결하세요.',
        completed: false
      }
    ],
    days: [
      {
        dayNumber: 1,
        date: '11월 18일',
        dayOfWeek: '수',
        city: '충칭 (Chongqing)',
        theme: '충칭 도착 · 불맛의 시작과 홍야동 야경',
        dayHighlights: ['인천 14:00 출발 → 충칭 CKG 착륙', '해방비(解放碑) 보행가 체크인', '정통 구궁격 마라 훠궈 저녁', '홍야동(洪崖洞) 센과 치히로 입체 야경'],
        stops: [
          {
            id: 'stop-cn-1',
            time: '14:00',
            title: '인천 ICN 이륙',
            description: '충칭 직항 탑승 · 비행시간 약 3시간 50분',
            category: 'flight'
          },
          {
            id: 'stop-cn-2',
            time: '17:15',
            title: '충칭 장베이 공항(CKG) 착륙',
            description: '입국 수속 및 짐 찾기 (약 45분)',
            category: 'transit',
            smartTip: '공항에서 시내까지 알리페이 디디(Didi)로 이동 시 약 60~80위안'
          },
          {
            id: 'stop-cn-3',
            time: '18:45',
            title: '해방비 중심가 호텔 체크인',
            description: '2박 머무를 숙소 도착 및 짐 풀기',
            category: 'hotel'
          },
          {
            id: 'stop-cn-4',
            time: '19:30',
            title: '구궁격(九宫格) 마라 훠궈 만찬',
            description: '진한 우지(牛油) 베이스 마라 훠궈와 참기름 마늘장. 친구 4명의 첫 건배',
            category: 'food',
            isRecommended: true,
            feeTip: '200위안 초과 시 일행과 2개 알리페이로 분할결제 추천',
            docent: {
              spotName: '충칭 정통 구궁격 훠궈',
              summary: '소기름(牛油)을 아낌없이 넣고 9개 격자로 나눈 충칭의 소울 푸드',
              historyAndStory: '충칭 훠궈는 19세기 양쯔강 부두 노동자들이 저렴한 소 내장을 매콤한 화쟈오와 고추 국물에 익혀 먹던 데서 유래했습니다. 가운데 칸은 불이 가장 세서 고기를 살짝 데치고, 가장자리는 완자와 채소를 천천히 끓입니다.',
              mustSeePoints: [
                '참기름 캔 1통을 통째로 붓고 다진 마늘과 굴소스를 넣는 기름장 조합이 위벽을 보호합니다.',
                '매운맛(辣度)은 기본이 한국 불닭 이상이므로 반드시 "웨이라(微辣, 약간 매움)"로 주문하세요.',
                '소 천엽(毛肚)과 오리 창자(鸭肠)는 "7상8하(七上八下: 국물에 7번 넣었다 8번 빼기, 약 10초)" 법칙으로 데쳐야 가장 아삭합니다.'
              ],
              foodOrTastingTip: '백주나 빙탕설리(배 음료)를 곁들이면 마라의 얼얼함이 중화됩니다.',
              recommendedDuration: '1시간 30분'
            }
          },
          {
            id: 'stop-cn-5',
            time: '21:00',
            title: '홍야동(洪崖洞) 야경 및 천사문 대교',
            description: '절벽에 지어진 11층 목조 조각 누각 조명 감상. 천사문대교(千厮门大桥) 보도교에서 사진 촬영',
            category: 'sightseeing',
            isRecommended: true,
            docent: {
              spotName: '홍야동 (洪崖洞)',
              summary: '가릉강 절벽을 따라 지어진 11층 조각루 전통 건축이자 현대판 센과 치히로',
              historyAndStory: '명·청 시대 군사 요새였던 성벽 절벽 위에 사천 지방 특유의 조각루(吊脚楼, 절벽 기둥 가옥) 양식을 재현한 곳입니다. 1층과 11층이 모두 서로 다른 층의 지상 도로와 연결되는 충칭 특유의 3차원 입체 도시 지형을 가장 잘 보여줍니다.',
              mustSeePoints: [
                '조명 점등 시간: 매일 19:30 ~ 23:00 (시기에 따라 20시 점등되기도 함).',
                '절대 내부 상가 엘리베이터를 타려고 줄 서지 마세요 (대기 1시간 소요).',
                '최고의 사진 스팟: 천사문 대교(千厮门大桥) 보도교 위로 올라가 대각선 아래로 홍야동 전경을 담는 뷰!'
              ],
              photoSpotTip: '다리 중간 전망 포인트에서 인물과 황금빛 목조 누각을 함께 프레이밍하세요.',
              recommendedDuration: '1시간 ~ 1시간 30분'
            }
          }
        ]
      },
      {
        dayNumber: 2,
        date: '11월 19일',
        dayOfWeek: '목',
        city: '충칭 (Chongqing)',
        theme: '입체 8D 마도(魔都) 도시 탐험 & 충칭 야경 파노라마',
        dayHighlights: ['리지바(李子坝) 아파트 관통 모노레일', '에링얼창(鹅岭二厂) 예술구', '남산 일과수(一棵树) 전망대', '강변 포장마차 꼬치구이(소고 샤오카오)'],
        stops: [
          { time: '09:00', title: '충칭 소면(重庆小面) 아침 식사', description: '골목길 플라스틱 의자에서 먹는 얼큰한 소면', category: 'food' },
          {
            id: 'stop-cn-6',
            time: '10:30',
            title: '리지바역(李子坝) 모노레일 체험',
            description: '아파트 6~8층을 관통하는 세계 유일의 모노레일',
            category: 'sightseeing',
            docent: {
              spotName: '리지바역 모노레일',
              summary: '아파트 건물 속으로 기차가 빨려 들어가는 충칭의 대표 입체 랜드마크',
              historyAndStory: '가파른 산비탈 도시인 충칭에서 주거 단지와 전철 노선 부지가 겹치자, 철거하는 대신 건물과 역사를 일체형으로 설계해 2004년에 개통했습니다. 특수 방진·방음 설계로 주민들이 소음을 거의 느끼지 않습니다.',
              mustSeePoints: [
                '아래 관람 광장(1층)에서 진입하는 열차 사진 찍기',
                '직접 8층 승강장으로 올라가 열차 맨 앞칸에 탑승해 가릉강 뷰 감상하기'
              ],
              recommendedDuration: '40분'
            }
          },
          { time: '13:00', title: '에링얼창 문창원 산책 & 티타임', description: '옛 지폐 인쇄 공장을 재생한 예술 공간', category: 'sightseeing' },
          { time: '18:00', title: '남산 훠궈 파크 or 장강 뷰 다이닝', description: '산 전체가 훠궈 식당인 비파원', category: 'food' },
          { time: '20:30', title: '남산 일과수 전망대 야경', description: '양쯔강과 가릉강 불빛 바다 조망', category: 'sightseeing' }
        ]
      },
      {
        dayNumber: 3,
        date: '11월 20일',
        dayOfWeek: '금',
        city: '충칭 → 청두 (Chengdu)',
        theme: '고속철 이동 · 수정방(水井坊) 백주 문화와 청두의 여유',
        dayHighlights: ['충칭북역 → 청두동역 고속철 (1시간 20분)', '수정방 박물관 방문 및 백주 테이스팅', '금리(锦里) 고거리 삼국지 문화 산책', '사천식 마파두부 만찬'],
        stops: [
          { time: '09:00', title: '호텔 체크아웃 후 충칭북역 이동', description: '열차 출발 35분 전 역 도착 필수', category: 'transit' },
          { time: '10:15', title: '고속철 G8622 충칭북 → 청두동', description: '시속 300km로 쓰촨 분지 주파', category: 'transit' },
          { time: '11:40', title: '청두동역 도착 & 호텔 체크인', description: '청두 시내 호텔 체크인', category: 'hotel' },
          {
            id: 'stop-cn-7',
            time: '14:30',
            title: '수정방 박물관',
            description: '600년 양조 역사를 자랑하는 중국 제1방 유적지에서 발효조 견학 및 오리지널 원액 백주 시음',
            category: 'sightseeing',
            isRecommended: true,
            docent: {
              spotName: '수정방 박물관 (水井坊博物馆)',
              summary: '원나라 말기부터 600년 이상 백주 발효 미생물이 살아 숨 쉬는 "살아있는 중국 제1의 양조장"',
              historyAndStory: '1998년 고대 양조장 유적 발굴 당시, 지하 흙 발효조(窖池)에서 600년간 대를 이어 번식해온 활성 미생물군이 발견되었습니다. 중국 국가 최고 중요 문화재이자 유네스코 세계문화유산 잠정 목록에 등재된 농향형(浓香型) 백주의 성지입니다.',
              mustSeePoints: [
                '실제 600년 동안 술을 빚고 있는 고대 발효조에서 피어오르는 곡물 발효 향기 맡기',
                '증류기 천차(天车)와 전통 목조 누각 양조 공정 도슨트 설명',
                '테이스팅 룸에서 제공되는 미희석 오리지널 원액 백주 시음 (잔을 45도 기울여 색을 보고, 천천히 향을 들이마신 후 혀끝으로 넘기기)'
              ],
              foodOrTastingTip: '시음 전 물을 한 모금 마셔 입안을 헹구고, 첫 잔은 아주 작은 한 모금으로 혀에 적시듯 맛보세요.',
              recommendedDuration: '1시간 30분'
            }
          },
          { time: '18:00', title: '진마파두부 본점 만찬', description: '마파두부의 원조집에서 얼얼한 화쟈오의 진수 만끽', category: 'food', isRecommended: true },
          { time: '20:00', title: '금리(锦里) 홍등 거리 야경', description: '삼국지 촉나라 감성이 살아있는 홍등 길 산책', category: 'sightseeing' }
        ]
      },
      {
        dayNumber: 4,
        date: '11월 21일',
        dayOfWeek: '토',
        city: '청두 (Chengdu)',
        theme: '시골 물동네 제쯔구전(街子古镇) 반나절 쉼 & 백주 뒤풀이',
        dayHighlights: ['청청산 자락의 천년 수향마을 제쯔구전 반나절', '강변 야외 찻집에서 개완차(盖碗茶)와 담소', '다시 청두 시내로 복귀', '마지막 밤 사천 요리와 좋은 백주로 회포'],
        stops: [
          { time: '09:30', title: '제쯔구전(街子古镇)으로 출발', description: '청두 시내에서 1시간 10분 거리의 조용하고 고즈넉한 물마을로 이동', category: 'transit' },
          {
            id: 'stop-cn-8',
            time: '11:00',
            title: '제쯔구전 강변 찻집 & 옛거리 산책',
            description: '관광버스가 붐비지 않는 현지인들의 휴식처. 졸졸 흐르는 시냇가 옆 대나무 의자에 앉아 자스민차 한 잔',
            category: 'sightseeing',
            isRecommended: true,
            docent: {
              spotName: '제쯔구전 (街子古镇)',
              summary: '청청산 뒤편 웨이장 강(味江)을 끼고 형성된 천년 역사의 서촨 물마을',
              historyAndStory: '오대십국 시절부터 천년 넘게 시장이 섰던 유서 깊은 고진입니다. 마오타이진 같은 멀고 험한 이동 대신, 청두 근교에서 사천 서민들의 가장 평화롭고 느긋한 삶의 여유(慢生活)를 만끽할 수 있는 숨은 보석입니다.',
              mustSeePoints: [
                '자계탑(字库塔): 종이에 적힌 글자를 함부로 버리지 않고 태워 하늘로 올리던 청대 청벽돌 탑',
                '강변 대나무 의자 야외 찻집: 1인 15~20위안이면 보온병에 뜨거운 물을 무제한 채워줍니다.',
                '특산 탕마빙(汤麻饼): 갓 구워낸 바삭하고 달콤고소한 전통 깨과자'
              ],
              foodOrTastingTip: '강가 찻집에서 탕마빙 한 봉지를 곁들여 자스민 개완차를 드셔보세요.',
              recommendedDuration: '3시간 ~ 4시간'
            }
          },
          { time: '13:00', title: '시골 촌두부 요리와 토종닭 점심', description: '구전 특산물인 탕마빙과 산나물, 맑은 두부 전골 식사', category: 'food' },
          { time: '18:30', title: '사천 명품 요리 & 수정방 클래식 만찬', description: '4박 5일 여행을 마무리하는 품격 있는 만찬', category: 'food', isRecommended: true }
        ]
      },
      {
        dayNumber: 5,
        date: '11월 22일',
        dayOfWeek: '일',
        city: '청두 → 서울',
        theme: '아침 차 한 잔 후 서울로 귀환',
        dayHighlights: ['청두 공항 이동', '청두 12:55 출발 → 인천 귀국', '일상으로의 복귀와 추억 정리'],
        stops: [
          { time: '08:30', title: '호텔 체크아웃 및 공항 이동', category: 'transit' },
          { time: '12:55', title: '청두 이륙 → 인천 향발', category: 'flight' },
          { time: '17:30', title: '인천 ICN 착륙', category: 'transit' }
        ]
      }
    ]
  },
  {
    id: 'trip-malaysia-2026',
    title: '말레이시아 쿠알라룸푸르 & 페낭 힐링',
    subtitle: 'KL 3박 · 페낭 3박 · KL 1박 (부부 2인 7박 8일)',
    dateRange: '2026.10.06 (화) – 10.13 (화)',
    durationText: '7박 8일',
    partyText: '부부 2인 여정',
    destinationType: 'MY',
    heroImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1600&q=80',
    defaultBudgetKrw: 1500000,
    sourceUrl: 'https://holyjoekang.github.io/my-travel-map/itinerary/t-2026-10-06.html',
    bestMoments: {
      bestFood: {
        title: '두리안 빙수 & 바쿠테 (나는 두리안 빙수, 아내는 바쿠테)',
        desc: '차이나타운 두리치에서 먹은 진한 무상킹 생두리안 빙수와, 몽키아라에서 맛본 깊은 국물의 한약 바쿠테'
      },
      bestPlace: {
        title: '페트로나스 트윈타워, 페낭 호텔 36층 수영장, 드론 쇼 광장',
        desc: '하늘을 찌를 듯 솟아오른 은빛 트윈타워 야경과, 페낭 바다가 한눈에 내려다보이던 인피니티 풀'
      },
      goldenInsight: {
        title: '별점은 참고일 뿐, 일정에 한 끼쯤은 비워 두자',
        desc: '구글 3.9였던 벽화루(Pik Wah)도 충분히 맛있었고, 매일 같은 하루보다 새로운 곳과 사람을 찾아다니는 은퇴 노마드의 삶이 필요하다는 배움.'
      }
    },
    initialVoiceNotes: [
      {
        id: 'vn-my-1',
        timestamp: '10/07 15:40',
        spotTitle: '차이나타운 Durich 榴瑞 두리안 빙수',
        category: 'food',
        transcript: '두리안 냄새 때문에 망설였던 분들도 이건 무조건 드셔야 합니다! 무상킹 품종 생과육이 산더미처럼 올라가 있는데 입안에서 사르르 녹고 커스터드 크림처럼 달콤합니다. 그랩으로 이동할 때 톨비 포함 지갑 충전으로 결제하니 편하네요.',
        rating: 5,
        isRecommended: true
      },
      {
        id: 'vn-my-2',
        timestamp: '10/08 09:30',
        spotTitle: '바투 동굴 272개 계단',
        category: 'culture',
        transcript: '아침 8시 반에 도착하니 햇살도 덜 뜨겁고 272개 무지개 계단 올라갈 만했습니다. 원숭이들이 비닐봉지나 음료수를 낚아채니 가방 꼭 닫고 올라가세요. 계단 위 거대한 석회암 동굴 안쪽의 빛 내림이 장엄합니다.',
        rating: 5,
        isRecommended: true
      },
      {
        id: 'vn-my-3',
        timestamp: '10/11 08:30',
        spotTitle: '페낭 아순거 복건면 (Ah Soon Kor)',
        category: 'food',
        transcript: '페낭에서의 마지막 아침 식사로 호커센터에서 복건면과 새우 볶음면 먹었습니다. 새우 머리를 푹 고아내서 국물이 아주 진하고 칼칼합니다. 여기는 카드나 QR 안 되고 오직 현금만 받으니 20링깃 잔돈 꼭 챙겨오세요!',
        rating: 5,
        isRecommended: true
      }
    ],
    keyRules: [
      {
        title: '그랩(Grab) 결제 시 3% 수수료 회피법',
        description: '그랩에 일반 한국 신용카드를 연동하면 매 승차마다 3% 해외이용/DCC 수수료가 붙습니다. 그랩 앱 내 [GrabPay Wallet]에 트래블카드나 토스카드로 충전해 결제하면 수수료 0%입니다.',
        tag: '결제 최적화'
      },
      {
        title: '페낭 호커센터/야시장 현금 필수',
        description: '쿠알라룸푸르 몰이나 프랜차이즈는 카드/그랩페이가 100% 가능하지만, 페낭의 아순거 복건면, 로컬 호커센터, 두리안 노점은 오직 현금(MYR)만 받습니다. 약 600~800링깃(18~24만원)은 현금 지참 필수.',
        tag: '환전 필수'
      },
      {
        title: '말레이시아 디지털 입국카드(MDAC) 작성',
        description: '출발일 기준 3일 전부터 온라인으로 무료 등록 가능합니다. 입국 심사 시 여권과 항공권만 내면 자동 등록되어 빠르게 통과합니다.',
        tag: '입국 필수'
      },
      {
        title: '영국식 3핀 G타입 콘센트 플러그',
        description: '말레이시아는 240V 영국식 사각 3핀을 씁니다. 현대적 호텔은 멀티 콘센트가 구비되어 있으나 비상용 멀티어댑터 1개를 챙기세요.',
        tag: '준비물'
      }
    ],
    checklist: [
      {
        id: 'my-1',
        tier: 'MUST',
        category: 'entry',
        title: '출발 3일 전 말레이시아 디지털 입국카드(MDAC) 온라인 등록',
        description: '말레이시아 이민청 공식 사이트에서 여권 정보와 항공편명 입력 후 PDF 저장 또는 캡처.',
        completed: false
      },
      {
        id: 'my-2',
        tier: 'MUST',
        category: 'payment',
        title: '그랩(Grab) 앱 설치 & 카드 등록 및 GrabPay 지갑 활성화',
        description: '현지 도착 후 택시 잡기의 핵심입니다. 카드 등록 시 해외원화결제 차단 확인.',
        completed: false
      },
      {
        id: 'my-3',
        tier: 'SAVINGS',
        category: 'payment',
        title: '그랩페이 지갑(GrabPay Wallet) 50~100링깃 충전해 결제',
        description: '일반 카드로 직결제하면 3% 수수료가 계속 붙습니다. 지갑 충전 방식으로 7박 8일간 약 15,000~20,000원 아끼세요.',
        estimatedSavingKrw: 18000,
        completed: false
      },
      {
        id: 'my-4',
        tier: 'MUST',
        category: 'payment',
        title: '페낭 호커센터용 현금(MYR) 600~800링깃 지참',
        description: '페낭 조지타운 맛집의 70%는 카드 결제기가 없습니다. 현금 없으면 밥을 못 먹을 수 있습니다.',
        completed: false
      },
      {
        id: 'my-5',
        tier: 'SAVINGS',
        category: 'data',
        title: '동남아 통합 eSIM 구매 (8일권, 일 2GB)',
        description: '현지 통신사 망을 사용하는 eSIM으로 끊김 없는 지도와 그랩 호출. 통신사 로밍 대비 5.5만원 절약.',
        estimatedSavingKrw: 55000,
        completed: false
      },
      {
        id: 'my-6',
        tier: 'IGNORE',
        category: 'transit',
        title: '1~2링깃(300~600원) 그랩 요금 아끼려고 무더위에 걷지 않기',
        description: '낮 기온 32도에 습도가 높습니다. 1km 남짓 거리라도 5~7링깃(약 1,800원)이면 그랩이 오니 체력을 아끼는 것이 최선입니다.',
        completed: false
      },
      {
        id: 'my-7',
        tier: 'IGNORE',
        category: 'prep',
        title: '현지 팁 챙겨주려고 잔돈 바꾸느라 전전긍긍하기',
        description: '말레이시아는 기본적으로 팁 문화가 없으며 식당 영수증에 봉사료 10%와 세금 6%가 자동 포함되어 있습니다.',
        completed: false
      }
    ],
    days: [
      {
        dayNumber: 1,
        date: '10월 6일',
        dayOfWeek: '화',
        city: '쿠알라룸푸르',
        theme: 'KL 도착 · 몽키아라 체크인과 첫 만남',
        dayHighlights: ['인천 출발 → KLIA 착륙', '하얏트 하우스 몽키아라 체크인', '선웨이 163 몰 마담콴스 저녁'],
        stops: [
          { time: '16:00', title: '쿠알라룸푸르 공항(KLIA) 착륙', category: 'transit' },
          { time: '17:30', title: '그랩으로 몽키아라 숙소 이동', category: 'transit', feeTip: '그랩 지갑 결제 시 3% 절약' },
          { time: '19:00', title: '하얏트 하우스 몽키아라 체크인', category: 'hotel' },
          { time: '20:00', title: 'Madam Kwan\'s 저녁 식사', category: 'food' }
        ]
      },
      {
        dayNumber: 2,
        date: '10월 7일',
        dayOfWeek: '수',
        city: '쿠알라룸푸르',
        theme: '메르데카에서 부킷빈탕까지 도심 산책',
        dayHighlights: ['메르데카 118 초고층 빌딩 뷰', '차이나타운 콰이차이홍 골목 벽화', '두리치(Durich) 생두리안 빙수'],
        stops: [
          { time: '10:00', title: '메르데카 광장 산책', category: 'sightseeing' },
          { time: '13:00', title: '차이나타운 콰이차이홍 & 벽화 투어', category: 'sightseeing' },
          {
            id: 'stop-my-1',
            time: '15:00',
            title: 'Durich (榴瑞) 생두리안 빙수',
            category: 'food',
            isRecommended: true,
            docent: {
              spotName: '두리치 (Durich, 榴瑞)',
              summary: '말레이시아 프리미엄 무상킹(Musang King) 생두리안을 통째로 얹은 수제 빙수 전문점',
              historyAndStory: '과일의 왕 두리안 중에서도 파항(Pahang) 고산지대에서 자연 낙과한 최고 등급 무상킹(D197)만을 엄선해 만듭니다. 일반 냉동 두리안과 달리 잡내가 없고 생크림처럼 진한 맛을 자랑합니다.',
              mustSeePoints: [
                '시그니처 무상킹 두리안 빙수 주문하기',
                '빙수 위 두리안 과육을 한 숟가락 먼저 떠먹고, 아래 우유 눈꽃 얼음과 섞어 드세요.'
              ],
              recommendedDuration: '45분'
            }
          }
        ]
      },
      {
        dayNumber: 3,
        date: '10월 8일',
        dayOfWeek: '목',
        city: '쿠알라룸푸르',
        theme: '바투 동굴의 웅장함과 페트로나스 트윈타워 야경',
        dayHighlights: ['바투 동굴 272개 무지개 계단', '국립 모스크 & 이슬람 예술 박물관', 'KLCC 분수쇼 & 트윈타워 야경'],
        stops: [
          {
            id: 'stop-my-2',
            time: '08:30',
            title: '바투 동굴(Batu Caves) 아침 방문',
            category: 'sightseeing',
            isRecommended: true,
            docent: {
              spotName: '바투 동굴 (Batu Caves)',
              summary: '4억 년 된 거대한 석회암 동굴이자 말레이시아 힌두교 최대의 성지',
              historyAndStory: '1890년대 인도 무역상 탐부사미 필라이가 무루간(Murugan) 신을 모시며 성지화되었습니다. 동굴 입구에는 42.7미터 높이의 황금빛 무루간 신상이 웅장하게 서 있으며, 매년 힌두 타이푸삼 축제 때 수십만 인파가 모입니다.',
              mustSeePoints: [
                '272개 무지개 계단: 인간이 지을 수 있는 272가지의 죄악을 씻어내며 오르는 참회의 계단',
                '빛 내림 천장: 동굴 안쪽 가장 깊은 사당 천장에 뚫린 거대한 천연 창에서 쏟아지는 신비로운 햇살',
                '원숭이 주의: 손에 든 음식이나 비닐봉지를 노리므로 가방 안에 숨기세요.'
              ],
              photoSpotTip: '계단 맨 아래 무루간 황금 동상과 알록달록 무지개 계단을 한 화면에 세로로 담으세요.',
              recommendedDuration: '1시간 30분'
            }
          },
          { time: '14:00', title: '이슬람 예술 박물관 & 국립 모스크', category: 'sightseeing' },
          { time: '19:30', title: '페트로나스 트윈 타워 야경', category: 'sightseeing', isRecommended: true }
        ]
      },
      {
        dayNumber: 4,
        date: '10월 9일',
        dayOfWeek: '금',
        city: 'KL → 페낭 (Penang)',
        theme: '수방 공항에서 페낭으로 · 조지타운의 유산',
        dayHighlights: ['OD1165 비행기 타고 페낭 도착', '이스턴 앤 오리엔탈 호텔 & 츄 제티', '뇨냐(Nyonya) 전통 요리 저녁'],
        stops: [
          { time: '10:00', title: 'SZB 수방 공항 이동 및 체크인', category: 'transit' },
          { time: '12:30', title: '페낭 도착 및 조지타운 호텔 체크인', category: 'hotel' },
          { time: '15:00', title: '츄 제티(Chew Jetty) 목조 수상 가옥', category: 'sightseeing' },
          { time: '18:30', title: '뇨냐 전통 가정식 만찬', category: 'food', isRecommended: true }
        ]
      },
      {
        dayNumber: 5,
        date: '10월 10일',
        dayOfWeek: '토',
        city: '페낭 (Penang)',
        theme: '극락사(Kek Lok Si)의 압도적 전경과 야시장',
        dayHighlights: ['동남아 최대 불교 사찰 극락사', '리틀 인디아 향신료 거리', '광장 드론 쇼 & 거니 드라이브 야시장'],
        stops: [
          {
            id: 'stop-my-3',
            time: '09:30',
            title: '극락사(Kek Lok Si) 방문',
            category: 'sightseeing',
            isRecommended: true,
            docent: {
              spotName: '극락사 (Kek Lok Si Temple)',
              summary: '동남아시아에서 가장 크고 웅장한 불교 사찰 복합체',
              historyAndStory: '1891년 착공하여 수십 년에 걸쳐 산자락 전체에 지어졌습니다. 사찰 정상에는 30미터 높이의 거대한 청동 관음보살상이 서 있고, 사찰 중심에는 7층 만불탑(Pagoda of Ten Thousand Buddhas)이 우뚝 솟아 있습니다.',
              mustSeePoints: [
                '7층 만불탑: 기단부는 팔각형 중국식, 중간층은 태국식, 꼭대기 첨탑은 미얀마식으로 3개국 불교 건축 양식이 하나로 결합된 유일무이한 탑',
                '경사형 케이블카(인클라인 리프트) 타고 정상 관음보살상 오르기',
                '소원 리본 나무에 건강과 가족의 평안을 비는 리본 걸기'
              ],
              photoSpotTip: '만불탑 5층 테라스에서 조지타운 시내와 바다를 한눈에 내려다보는 파노라마 뷰',
              recommendedDuration: '2시간'
            }
          },
          { time: '14:00', title: '리틀 인디아 산책', category: 'sightseeing' },
          { time: '19:00', title: '광장 드론 쇼 관람 및 야시장 먹거리', category: 'food', feeTip: '야시장은 100% 현금만 사용 가능' }
        ]
      },
      {
        dayNumber: 6,
        date: '10월 11일',
        dayOfWeek: '일',
        city: '페낭 → KL',
        theme: '아순거 복건면의 맛과 KL로의 귀환',
        dayHighlights: ['아순거 복건면(Ah Soon Kor Hokkien Mee)', '페낭 공항 → KL 복귀', '몽키아라 청학골 친구 부부 만찬'],
        stops: [
          {
            id: 'stop-my-4',
            time: '08:00',
            title: '아순거 복건면(Ah Soon Kor Hokkien Mee)',
            category: 'food',
            isRecommended: true,
            docent: {
              spotName: '아순거 복건면 (亚舜哥福建面)',
              summary: '페낭 현지인들이 아침 해장으로 줄 서서 먹는 깊은 새우 육수의 명물 국수',
              historyAndStory: '2차 대전 당시 가난한 어부들이 일본군에 좋은 생선을 수탈당하고 남은 새우 대가리와 껍질을 돼지 뼈와 함께 푹 고아내어 국수를 말아먹던 데서 시작된 페낭 고유의 역사 음식입니다.',
              mustSeePoints: [
                '시그니처 복건면(국물 국수)과 복건 볶음면(차 콰이 테오) 함께 주문하기',
                '매운 삼발 소스를 국물에 다 풀지 말고, 숟가락에 살짝 덜어 면과 함께 드시면 감칠맛이 폭발합니다.',
                '오직 현금(Cash only) 결제만 가능'
              ],
              foodOrTastingTip: '반드시 삶은 달걀과 바삭한 돼지 껍데기 튀김(유짜) 토핑을 추가하세요.',
              recommendedDuration: '40분'
            }
          },
          { time: '10:26', title: 'OD1165 PEN → SZB 비행기 이륙', category: 'transit' },
          { time: '18:30', title: '현지 거주 친구 부부와 저녁 모임', category: 'food' }
        ]
      },
      {
        dayNumber: 7,
        date: '10월 12일',
        dayOfWeek: '월',
        city: '쿠알라룸푸르',
        theme: '차이나타운의 마지막 산책과 공항으로',
        dayHighlights: ['차이나타운 줄리아 볼치코바 벽화', '벽화루(Pik Wah) 점심', 'Huat n Co 난양 아이스커피', 'KUL 23:30 출발'],
        stops: [
          { time: '11:00', title: '체크아웃 후 차이나타운 재방문', category: 'sightseeing' },
          { time: '13:40', title: 'Pik Wah Bar & Cafe 벽화루', description: '구글 3.9였지만 싸고 만족스러웠던 로컬 중식', category: 'food', isRecommended: true },
          { time: '15:30', title: 'Durich 두리안 빙수 앙코르', category: 'food' },
          { time: '20:00', title: 'KLIA 공항 도착 및 출국 수속', category: 'transit' }
        ]
      },
      {
        dayNumber: 8,
        date: '10월 13일',
        dayOfWeek: '화',
        city: '서울',
        theme: '서울 도착 · 평온한 일상으로의 복귀',
        dayHighlights: ['인천 공항 07:00 도착', '공항버스로 귀가', '반려견 토리와 한강·성내천 산책'],
        stops: [
          { time: '07:00', title: '인천 ICN 착륙', category: 'transit' },
          { time: '18:00', title: '한강·성내천 산책', category: 'sightseeing' }
        ]
      }
    ]
  }
];
