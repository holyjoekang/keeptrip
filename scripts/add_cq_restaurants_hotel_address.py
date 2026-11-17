"""충칭 맛집(시우냥 촨촨샹·토피아·토토마토·비파원 훠궈) 추가 + 호텔 주소 + 택시 카드가 데이터의 현지 주소 사용."""
from pathlib import Path

R = Path(__file__).resolve().parent.parent
def sub(path, pairs):
    p = R / path; s = p.read_text(encoding="utf-8")
    for old, new in pairs:
        if new in s:
            continue
        assert s.count(old) == 1, (path, old[:60])
        s = s.replace(old, new)
    p.write_text(s, encoding="utf-8")

# 1) 타입: 현지 이름/주소 필드
sub("src/types/travel.ts", [
    ("  isRecommended?: boolean;\n}\n\nexport interface DayPlan",
     "  isRecommended?: boolean;\n  localName?: string; // 택시 기사에게 보여줄 현지어 이름\n  address?: string; // 현지어 주소\n}\n\nexport interface DayPlan"),
])

# 2) 택시 카드: 데이터에 주소가 있으면 우선 사용
sub("src/components/TaxiAddressModal.tsx", [
    ("  const localName = isChina\n", "  const localName = spot.localName ?? (isChina\n"),
    ("        : spot.title)\n    : spot.title;\n", "        : spot.title)\n    : spot.title);\n"),
    ("  const addressDetails = isChina\n", "  const addressDetails = spot.address ?? (isChina\n"),
    ("        : `${spot.title}`);\n\n  const handleSpeakDriver", "        : `${spot.title}`));\n\n  const handleSpeakDriver"),
])

# 3) 일정 데이터
T = "src/data/presetTrips.ts"
sub(T, [
    # 충칭 호텔 주소
    ("""            description: '重庆欧辰高空江景酒店(解放碑来福士广场) · 시티뷰 복층 퀸룸 2실 + 복층 퀸룸(혼합 전망) 2실 · 11/18–11/20 2박',
            category: 'hotel'""",
     """            description: '重庆欧辰高空江景酒店(解放碑来福士广场) · 위중구 신화로 1호 광다콩구 차오톈먼센터 21층 · 시티뷰 복층 퀸룸 2실 + 복층 퀸룸(혼합 전망) 2실 · 11/18–11/20 2박',
            category: 'hotel',
            localName: '重庆欧辰高空江景酒店(解放碑来福士广场)',
            address: '重庆市渝中区新华路1号光大控股朝天门中心21楼'"""),
    # 청두 호텔 주소
    ("description: '成都春熙路太古里丽柏酒店 · 부티크 퀸룸 4실 · 11/20–11/22 2박 (이른 도착 시 짐 보관)', category: 'hotel' },",
     "description: '成都春熙路太古里丽柏酒店 · 진장구 쭝푸로 57호 (2025년 오픈) · 부티크 퀸룸 4실 · 11/20–11/22 2박 (이른 도착 시 짐 보관)', category: 'hotel', localName: '成都春熙路太古里丽柏酒店', address: '四川省成都市锦江区总府路57号' },"),
    # DAY1 저녁: 시우냥 촨촨샹
    ("""            title: '구궁격(九宫格) 마라 훠궈 만찬',
            description: '진한 우지(牛油) 베이스 마라 훠궈와 참기름 마늘장. 친구 4명의 첫 건배',
            category: 'food',""",
     """            title: '린장먼 시우냥 촨촨샹 (临江门秀嬢串串香 본점) 저녁',
            description: '충칭 대표 꼬치 훠궈(촨촨샹) 맛집 · 위중구 린장로 1호 3층 · 지하철 2호선 린장먼역 지하통로 B7 출구 도보 250m · 영업 11:00–23:30',
            category: 'food',
            localName: '临江门秀嬢串串香(重庆总店)',
            address: '重庆市渝中区临江路1号3层附2号商铺',"""),
    ("dayHighlights: ['CA440 인천 T1 14:00 → 충칭 장베이 T3 16:55', '래플스 시티 오우첸 호텔 체크인 (2박)', '정통 구궁격 마라 훠궈 저녁',",
     "dayHighlights: ['CA440 인천 T1 14:00 → 충칭 장베이 T3 16:55', '래플스 시티 오우첸 호텔 체크인 (2박)', '시우냥 촨촨샹(꼬치 훠궈) 저녁',"),
    # DAY2 오전 카페 토피아, 오후 토토마토, 저녁 비파원 훠궈
    ("""          { time: '09:00', title: '충칭 소면(重庆小面) 아침 식사', description: '골목길 플라스틱 의자에서 먹는 얼큰한 소면', category: 'food' },
""",
     """          { time: '09:00', title: '충칭 소면(重庆小面) 아침 식사', description: '골목길 플라스틱 의자에서 먹는 얼큰한 소면', category: 'food' },
          { time: '09:40', title: '토피아 (Topia 해방비점) 커피', description: '해방비 상권 인기 카페 · 위중구 다퉁로 73호 · 지하철 2호선 린장먼역 지하통로 B5 출구 도보 260m · 영업 09:00–20:00 · 린장먼역에서 2호선 타고 리지바로', category: 'food', localName: 'Topia(解放碑店)', address: '重庆市渝中区大同路73号' },
"""),
    ("""          { time: '13:00', title: '에링얼창 문창원 산책 & 티타임', description: '옛 지폐 인쇄 공장을 재생한 예술 공간', category: 'sightseeing' },
          { time: '18:00', title: '남산 훠궈 파크 or 장강 뷰 다이닝', description: '산 전체가 훠궈 식당인 비파원', category: 'food' },""",
     """          { time: '13:00', title: '에링얼창 문창원 산책 & 티타임', description: '옛 지폐 인쇄 공장을 재생한 예술 공간', category: 'sightseeing' },
          { time: '16:00', title: '토토마토 (TOTOMATO 다이자샹점) 카페', description: '홍야동 옆 절벽 산책로 다이자샹(戴家巷) 카페 · 다이자샹 25호 2단원 1-7호 (순환 액세서리 가게 옆) · 2호선 린장먼역 1번 출구 도보 530m · 영업 09:00–20:00', category: 'food', localName: 'TOTOMATO(戴家巷店)', address: '重庆市渝中区戴家巷25号2单元1-7号' },
          { time: '18:00', title: '비파원 식위선 훠궈 (枇杷园食为鲜火锅)', description: '남산 비파원 신선 훠궈 · 구글 평점 4.2 · 1인 ¥100–150 · 난안구 황줴두 136 (충칭유락원) · 식사 후 일과수 전망대로', category: 'food', isRecommended: true, localName: '枇杷园食为鲜火锅', address: '重庆市南岸区黄桷渡136号(重庆游乐园)' },"""),
    ("dayHighlights: ['리지바(李子坝) 아파트 관통 모노레일', '에링얼창(鹅岭二厂) 예술구', '남산 일과수(一棵树) 전망대', '강변 포장마차 꼬치구이(소고 샤오카오)'],",
     "dayHighlights: ['토피아·토토마토 카페', '리지바(李子坝) 아파트 관통 모노레일', '에링얼창(鹅岭二厂) 예술구', '남산 비파원 훠궈 & 일과수(一棵树) 전망대'],"),
])
print("ok")
