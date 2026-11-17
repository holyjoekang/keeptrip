"""일정 장소별 상세 안내(사진·리뷰 요약·택시 주소) 데이터 생성.
- 사진: scripts/data/spot_photos.json(위키미디어 공용, fetch_spot_photos.py)에서 골라 public/spots/에 저장(중국 내 위키미디어 차단 대비)
- 결과: src/data/spotGuides.json, 중국 일정 각 stop에 guideId 부여
"""
import json, re, time, urllib.request
from pathlib import Path

R = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "KeepTripGuideBuilder/1.0 (travel itinerary app)"}
PHOTOS = json.loads((R / "scripts/data/spot_photos.json").read_text(encoding="utf-8"))

def S(label, url): return {"label": label, "url": url}

G = {}
G["icn-t1"] = dict(
    name="인천국제공항 제1여객터미널", local="인천국제공항 제1여객터미널", address="인천광역시 중구 공항로 272",
    summary="에어차이나(스타얼라이언스)는 T1에서 탑승합니다. 출국 2~3시간 전 도착을 권장합니다.",
    info=[("항공편", "CA440 14:00 → 충칭 16:55 / 귀국 CA401 12:55 도착"), ("수속", "에어차이나 카운터 · 온라인 체크인 가능"), ("교통", "공항철도(AREX) T1역 · 공항버스")],
    good=["T1은 규모가 크지만 출국장 동선 표지가 잘 되어 있음", "공항철도 직결이라 서울역에서 약 1시간"],
    caution=["보조배터리는 위탁 불가 · 기내 휴대만", "노트북은 보안검색 때 꺼내기", "중국 입국 시 무비자 15일 요건 재확인"],
    sources=[], photos=("icn-t1", [1, 5, 2]))
G["ckg-t3"] = dict(
    name="충칭 장베이 국제공항 T3", local="重庆江北国际机场T3航站楼", address="重庆市渝北区江北国际机场T3航站楼",
    summary="충칭의 관문 공항. 국제선은 T3에 도착하며 지하철 10호선 · 3호선과 연결됩니다.",
    info=[("시내까지", "해방비 · 차오톈먼까지 택시 약 40~50분 · 디디 60~80위안"), ("지하철", "10호선 → 환승해 시내 (짐 많으면 택시 추천)")],
    good=["T3는 신청사라 넓고 깔끔한 편", "택시 · 디디 승차장이 잘 정리되어 있음"],
    caution=["입국 심사 · 짐 찾기에 약 45분 예상", "택시는 공식 승차장에서만 · 호객 기사 피하기"],
    sources=[], photos=("ckg-t3", [0, 1, 2]))
G["hotel-cq"] = dict(
    name="오우첸 스카이라이즈 리버사이드 호텔 (래플스 시티 충칭)", local="重庆欧辰高空江景酒店(解放碑来福士广场)", address="重庆市渝中区新华路1号光大控股朝天门中心21楼",
    summary="두 강이 만나는 차오톈먼, 래플스 시티 단지 안 고층 호텔. 래플스 시티는 사프디 아키텍츠가 설계했고, 250m 높이에 300m 길이의 수평 스카이브리지 '더 크리스털'이 4개 타워를 잇습니다.",
    info=[("숙박", "11/18–11/20 2박 · 시티뷰 복층 퀸룸 2실 + 혼합 전망 2실"), ("크리스털 전망대", "고속 엘리베이터로 47층 · 유리 바닥 · 270° 두 강 전망 (요금 · 시간은 공식 사이트 확인)"), ("주변", "홍야동 도보 약 15분 · 해방비 도보권")],
    good=["래플스 시티 전망대 후기: '두 강 합류 파노라마가 압도적'(리뷰 평점 4.6)", "고층 리버뷰 · 차오톈먼 광장과 바로 연결"],
    caution=["단지가 커서 호텔 로비 층(21층) 찾기가 헷갈릴 수 있음 · 택시엔 중국어 주소 보여주기"],
    sources=[S("Dezeen · The Crystal", "https://www.dezeen.com/2020/06/25/safdie-architects-the-crystal-raffles-city-chongqing-architecture/amp/"), S("CapitaLand 전망대 개장", "https://www.capitaland.com/en/about-capitaland/newsroom/news-releases/international/2020/jun/CapitaLand-opens-250-metre-high-glass-bottom-Exploration-Deck-at-RCCQ.html")],
    photos=("hotel-cq", [0, 1, 5, 2]))
G["xiuniang"] = dict(
    name="린장먼 시우냥 촨촨샹 (본점)", local="临江门秀嬢串串香(重庆总店)", address="重庆市渝中区临江路1号3层附2号商铺",
    summary="꼬치를 끓는 마라 탕에 담가 먹는 충칭식 꼬치 훠궈 '촨촨샹'. 먹은 꼬치 막대 개수로 계산합니다.",
    info=[("영업", "11:00–23:30"), ("가는 법", "지하철 2호선 린장먼역 지하통로 B7 출구 도보 약 250m"), ("주문", "냉장고에서 꼬치를 골라 담고 탕 맵기 선택 → 막대 개수로 계산")],
    good=["꼬치 단위라 4명이 여러 가지를 조금씩 맛보기 좋음", "호텔 · 홍야동과 가까워 첫날 저녁 동선이 짧음"],
    caution=["맵기는 '웨이라(微辣 · 약간 매움)'로 · 기본도 한국 불닭 이상", "온라인 리뷰는 확인하지 못해 가게 기본 정보 위주로 정리했어요 · 저녁 피크엔 대기 가능"],
    sources=[], photos=("xiuniang", [0, 1]), photoNote="촨촨샹 참고 사진 (해당 가게 아님)")
G["hongyadong"] = dict(
    name="홍야동 (洪崖洞) & 천사문 대교", local="洪崖洞民俗风貌区", address="重庆市渝中区嘉陵江滨江路88号",
    summary="가릉강 절벽에 11층으로 쌓은 조각루(吊脚楼). 1층과 11층이 각각 다른 도로와 이어지는 충칭 입체 도시의 상징입니다.",
    info=[("점등", "대략 19:30–23:00 (시기별 변동)"), ("소요", "1시간 ~ 1시간 30분"), ("요금", "무료")],
    good=["리뷰 공통: '야경은 꼭 밤에' · 천사문 대교 위에서 내려다보는 각도가 최고 사진 스팟", "강 건너 장베이쭈이(江北嘴) 쪽에서 전체를 담는 뷰도 추천"],
    caution=["1층 지상은 항상 붐빔 · 다리 위나 강 건너에서 보기", "20시 이후, 평일 21:30 이후가 비교적 한산", "내부 상가는 일반 보행가와 비슷하다는 평 · 엘리베이터 줄 서지 않기"],
    sources=[S("China Highlights · 점등시간·포토스팟", "https://www.chinahighlights.com/chongqing/attraction/hongya-cave.htm"), S("Wanderlog · 천사문 대교", "https://wanderlog.com/place/details/5668147/qiansimen-bridge"), S("Trip.com 가이드", "https://ca.trip.com/travel-guide/attraction/chongqing/hongyadong-commercial-street-10558957?curr=NZD")],
    photos=("hongyadong", [0, 1, 3, 4]))
G["xiaomian"] = dict(
    name="충칭 소면 (重庆小面)", local="重庆小面", address="重庆市渝中区解放碑步行街 附近",
    summary="충칭 사람들의 아침. 고추기름 · 화자오 양념에 비벼 먹는 국수로, 낮은 플라스틱 의자에 앉아 먹는 '길거리 소면'이 정석입니다.",
    info=[("가격", "기본 8~12위안"), ("양", "얼량(二两) 보통 · 싼량(三两) 곱빼기"), ("주문 예", "一碗干馏豌杂, 微辣 (완두 고기고명 비빔, 약간 맵게)")],
    good=["해방비 칭녠로의 화스 완자몐(花市豌杂面)이 완두·고기 고명으로 평이 좋음", "'간류(干溜)'는 국물 없는 비빔 · '티황(提黄)'은 꼬들한 면"],
    caution=["기본이 맵다 · 못 먹으면 '부라(不辣)' 명시", "해방비 본점은 오전에 줄이 길 수 있음"],
    sources=[S("Wander in China · 소면 가이드", "https://wanderinchina.com/en/chinese-food/chongqings-spicy-noodles/"), S("iChongqing · Xiaomian", "https://www.ichongqing.info/2024/05/16/xiaomian-chongqing-spicy-noodles/amp")],
    photos=("xiaomian", [0, 1, 2]))
G["topia"] = dict(
    name="토피아 (Topia 해방비점)", local="Topia(解放碑店)", address="重庆市渝中区大同路73号",
    summary="해방비 상권에 있는 인기 카페. 소면 아침 뒤 커피 한 잔하고 린장먼역에서 2호선으로 리지바로 이동하는 동선입니다.",
    info=[("영업", "09:00–20:00"), ("가는 법", "2호선 린장먼역 지하통로 B5 출구 도보 약 260m")],
    good=["해방비 · 린장먼역과 가까워 오전 동선에 끼우기 좋음"],
    caution=["온라인 리뷰는 확인하지 못해 가게 기본 정보 위주로 정리했어요"],
    sources=[], photos=("topia", [0, 1, 3]), photoNote="해방비 일대 사진")
G["liziba"] = dict(
    name="리지바역 (李子坝) 모노레일 관람대", local="李子坝轻轨穿楼观景平台", address="重庆市渝中区李子坝正街39号",
    summary="2호선 모노레일이 19층 주거 건물 6~8층을 관통하는 '건물 뚫는 기차'. 길 건너 관람 광장에서 진입 장면을 찍습니다.",
    info=[("소요", "20~30분"), ("요금", "관람대 무료 · 지하철 요금 2~9위안"), ("가는 법", "2호선 리지바역 하차 → 관람대 표지 따라 길 건너편")],
    good=["리뷰 공통: '짧고 저렴하게 충칭다움을 보는 곳'", "2~3분 간격으로 열차가 와서 여러 번 촬영 가능", "직접 탑승해 가릉강 뷰를 보는 것도 추천"],
    caution=["평일 이른 아침이 가장 한산", "베이빈로(北滨路) 쪽은 멀지만 전체 구도가 나옴"],
    sources=[S("China Xian Tour · 리지바", "https://www.chinaxiantour.com/chongqing-travel-guide/liziba-station.html"), S("Trip.com · 리지바", "https://sg.trip.com/guide/attraction/liziba-station.html")],
    photos=("liziba", [1, 2, 0, 3]))
G["eling2"] = dict(
    name="에링얼창 문창원 (鹅岭二厂)", local="鹅岭二厂文创公园", address="重庆市渝中区鹅岭正街1号",
    summary="1940년대 지폐 인쇄 공장을 개조한 문화창작 단지. 영화 '나의 소녀시대'류 청춘영화(从你的全世界路过) 촬영지로 유명합니다.",
    info=[("소요", "2~3시간"), ("요금", "무료 (일부 전시 유료)"), ("가는 법", "리지바에서 택시 약 10분")],
    good=["31동 옥상: 위중 반도 최고점에서 두 강 합류부를 180°로 보는 포토 스팟", "카페 · 소품숍이 많아 오후 티타임에 적합", "옥상 정원 찻집에서 시내 전망"],
    caution=["해 질 녘 · 야간이 가장 예쁘지만 우리 일정은 낮 방문 · 오후 햇살 각도 활용"],
    sources=[S("China Educational Tours · Eling No.2 Factory", "https://www.chinaeducationaltours.com/guide/chongqing-eling-second-factory.htm"), S("iChongqing", "https://www.ichongqing.info/?p=81982")],
    photos=("eling2", [0, 3, 2]), photoNote="에링 공원 일대 전망")
G["totomato"] = dict(
    name="토토마토 (TOTOMATO 다이자샹점) & 다이자샹 절벽 산책로", local="TOTOMATO(戴家巷店)", address="重庆市渝中区戴家巷25号2单元1-7号",
    summary="홍야동 옆 절벽 산책로 다이자샹(戴家巷)의 카페. 산책로는 약 750m · 고저차 60m의 Z자 길로 옛 골목과 가릉강변로를 잇습니다(2021년 개통).",
    info=[("카페 영업", "09:00–20:00"), ("위치", "다이자샹 25호 2단원 1-7호 · 순환 액세서리 가게 옆"), ("가는 법", "2호선 린장먼역 1번 출구 도보 약 530m"), ("산책로", "24시간 개방 · 무료")],
    good=["산책로에서 장베이쭈이 · 천사문 대교 방향 강 전망이 좋다는 평", "조각루 · 성벽 유적 · 절벽 황거수 등 옛 충칭 분위기"],
    caution=["카페 자체 온라인 리뷰는 확인하지 못했어요", "계단 · 경사가 많아 편한 신발 필수"],
    sources=[S("Chongqing 정부 · 산책로 소개", "https://english.cq.gov.cn/specials/explore/MountainCityTrails/202608/t20260812_15922239.html"), S("다이자샹 절벽길 여행기", "https://overseatraveller.blogspot.com/2024/09/china-travel-chongqing_1.html")],
    photos=("totomato", [0, 5, 1, 3]), photoNote="다이자샹 골목 사진")
G["pipayuan"] = dict(
    name="비파원 식위선 훠궈 (枇杷园食为鲜火锅)", local="枇杷园食为鲜火锅", address="重庆市南岸区黄桷渡136号(重庆游乐园)",
    summary="남산 자락의 신선 훠궈집. 식사 후 남산 일과수 전망대 야경으로 이어지는 동선입니다.",
    info=[("평점", "구글 4.2 (65개 리뷰)"), ("가격", "1인 ¥100–150"), ("가는 법", "해방비에서 택시 약 25~30분")],
    good=["구글 평점 4.2 · 1인 ¥100–150로 남산 훠궈치고 합리적인 가격대"],
    caution=["리뷰 본문은 확인하지 못해 평점 · 가격 위주로 정리했어요", "200위안 넘으면 알리페이 분할 결제(AA)로 수수료 절약"],
    sources=[], photos=("pipayuan", [0, 1, 3]), photoNote="충칭 훠궈 참고 사진 (해당 가게 아님)")
G["yikeshu"] = dict(
    name="남산 일과수 전망대 (一棵树观景台)", local="南山一棵树观景台", address="重庆市南岸区南山 一棵树观景台",
    summary="남산 위에서 위중 반도와 두 강 합류부 불빛을 내려다보는 충칭 대표 야경 포인트. '2024 아시아 야경 명소 100' 선정.",
    info=[("개방", "09:00–22:30 (22:30 입장 마감)"), ("평점", "트립닷컴 4.3 (1,691개 리뷰)"), ("요금", "소액 유료 (출처마다 상이 · 현장 확인)")],
    good=["리뷰 공통: 위중 반도 · 두 강의 불빛 바다를 한눈에", "엘리베이터로 최상층 전망대까지 이동 가능"],
    caution=["전망대가 넓지 않음 · 좋은 자리는 일찍", "산 위라 밤엔 쌀쌀 · 겉옷 챙기기"],
    sources=[S("Ctrip · 一棵树观景台", "https://gs.ctrip.com/html5/you/sight/chongqing158/45792.html"), S("大河票务 · 개방시간", "https://www.dahepiao.com/lvyounews1/20221226341382.html")],
    photos=("yikeshu", [0]), extraPhotos=[("eling2", 3), ("hongyadong", 0)], photoNote="충칭 야경 사진")
G["shapingba"] = dict(
    name="사핑바역 (沙坪坝站)", local="沙坪坝站", address="重庆市沙坪坝区沙坪坝站",
    summary="충칭 서부 고속철 역. 역 위에 대형 쇼핑몰(룽후 광녠)이 올라간 복합 역사입니다.",
    info=[("열차", "10:30 출발 → 청두동 11:32 (1시간 2분)"), ("도착", "출발 35분 전 · 실물 여권으로 개찰"), ("이동", "해방비에서 택시 약 30분")],
    good=["쇼핑몰 일체형이라 대기 중 식음료 이용이 편함"],
    caution=["보안검색 · 여권 확인 줄을 고려해 여유 있게", "택시 하차 지점은 '高铁站 进站口(고속철 진입구)'라고 말하기"],
    sources=[], photos=("shapingba", [0, 1, 2]))
G["crh"] = dict(
    name="충칭 → 청두 고속철 & 청두동역", local="成都东站", address="四川省成都市成华区成都东站",
    summary="시속 300km급 고속철로 쓰촨 분지를 1시간 만에 가로지릅니다. 청두동역은 청두 최대 철도역입니다.",
    info=[("도착", "청두동 11:32"), ("시내까지", "춘시루 호텔까지 택시 약 25분 · 지하철 2호선 춘시루역")],
    good=["종이표 없이 여권으로 개찰 · 좌석 번호는 예약 확인 화면에"],
    caution=["도착 후 택시 승강장 줄이 길면 지하철 2호선 이용"],
    sources=[], photos=("crh", [0, 2, 1]))
G["hotel-cd"] = dict(
    name="파크 인 바이 라디슨 청두 춘시루 타이쿠리", local="成都春熙路太古里丽柏酒店", address="四川省成都市锦江区总府路57号",
    summary="2025년 오픈. 춘시루 보행가와 타이쿠리(太古里)가 도보권입니다. 타이쿠리는 1,600년 역사의 다츠쓰(大慈寺) 옆 저층 개방형 쇼핑 지구입니다.",
    info=[("숙박", "11/20–11/22 2박 · 부티크 퀸룸 4실"), ("주변", "지하철 2·3호선 춘시루역 · IFS '벽 타는 판다' 조형물"), ("상점", "대체로 10:00–22:00")],
    good=["타이쿠리는 무료 산책 · 다츠쓰 주변 '슬로우 존'에 레스토랑 · 문화 브랜드", "춘시루는 넓고 평탄한 보행가라 걷기 편함", "근처에서 훠궈 소스(재료) 기념품 구입 가능"],
    caution=["다츠쓰 내부는 별도 개방시간", "주말 저녁은 매우 붐빔"],
    sources=[S("China Highlights · 청두 쇼핑", "https://www.chinahighlights.com/chengdu/article-shopping-street.htm"), S("Nomado · 춘시루", "https://www.nomadotravel.app/en/attractions/chunxi-road")],
    photos=("hotel-cd", [0, 1, 2, 3]), photoNote="타이쿠리 사진")
G["wansan"] = dict(
    name="만산면관 (万三面馆 칭룽정제점)", local="万三面馆(青龙正街)", address="成都市锦江区青龙正街131号附1号",
    summary="미쉐린 빕 구르망 면집. 이빈(宜宾)식 '란몐(燃面)'과 라러우(腊肉)가 간판 메뉴입니다.",
    info=[("등급", "미쉐린 빕 구르망 · ¥"), ("메뉴", "란몐: 땅콩 · 쪽파 · 야차이(芽菜)를 기름에 비벼 먹는 비빔면"), ("이동", "호텔에서 택시 약 10분")],
    good=["미쉐린 평: 이빈식 정통 맛 · 면과 훈제 고기 조합"],
    caution=["광둥식 소시지 외 구이 · 훈제류는 18시부터 제공 (점심엔 면 위주)", "영업시간은 방문 전 다중뎬핑에서 확인"],
    sources=[S("Michelin Guide", "https://guide.michelin.com/en/chengdu-municipality/chengdu/restaurant/wan-san-mian-guan-jinjiang")],
    photos=("wansan", [0, 1, 3]), photoNote="란몐 참고 사진 (해당 가게 아님)")
G["shuijingfang"] = dict(
    name="수정방 박물관 (水井坊博物馆)", local="水井坊博物馆", address="四川省成都市锦江区水井街 水井坊博物馆",
    summary="원나라 말기부터 600년 넘게 쓰인 백주 양조장 유적. 지금도 발효 구덩이(窖池)에서 술을 빚습니다.",
    info=[("개관", "09:00–17:30 (공식 채널 확인)"), ("요금", "약 ¥50부터 (시음 포함 여부 확인)"), ("소요", "1시간 30분 ~ 2시간 30분")],
    good=["리뷰: 시음 · 페어링 체험이 인상적", "양조 공정 · 고대 발효조를 실제로 볼 수 있음"],
    caution=["시음 · 숍 둘러볼 시간 여유 있게", "예약 방식은 위챗 공식 계정 등에서 사전 확인"],
    sources=[S("Offpeaktrip · 수정방 박물관", "https://offpeaktrip.com/en/guide/chengdu/shuijingfang-museum"), S("Chinatripedia", "https://chinatripedia.com/?p=5986")],
    photos=("shuijingfang", [2, 0, 1, 3]))
G["chenmapo"] = dict(
    name="진마파두부 (陈麻婆豆腐 칭화로점)", local="陈麻婆豆腐(青华路店)", address="成都市青羊区青华路10号附10-12号",
    summary="마파두부를 처음 만든 '천 할머니(陈麻婆)'의 100년 넘은 노포. 미쉐린 빕 구르망입니다.",
    info=[("등급", "미쉐린 빕 구르망 · ¥ (가성비)"), ("예약", "미쉐린 사이트 예약 불가 · 워크인"), ("이동", "식사 후 금리까지 택시 약 15분")],
    good=["미쉐린: '마라 마파두부의 진짜 원조로 알려진 곳'", "가격 부담이 적은 ¥ 등급"],
    caution=["점심 · 이른 저녁이 대기가 짧음", "원조 · 본점 여부는 매장마다 주장이 다름"],
    sources=[S("Michelin Guide", "https://guide.michelin.com/en/chengdu-municipality/chengdu/restaurant/chen-mapo-tofu-qinghua-road")],
    photos=("chenmapo", [0, 2, 1]), photoNote="마파두부 참고 사진")
G["jinli"] = dict(
    name="금리 고거리 (锦里)", local="锦里古街", address="四川省成都市武侯区武侯祠大街231号",
    summary="무후사(武侯祠) 옆 삼국지 촉나라 분위기의 옛 거리. 밤이면 홍등이 켜집니다.",
    info=[("추천 시간", "19시 전후 · 홍등은 켜지고 인파는 덜함"), ("상점", "간식 노점은 22시 전후 마감 · 바는 늦게까지"), ("요금", "무료")],
    good=["홍등 야경이 아름답다는 평 · 황룽츠(黄龙池) 돌다리 앞이 사진 명소", "용초수(龙抄手 · 완탕) 등 간식 거리"],
    caution=["공휴일 · 주말 밤은 매우 붐빔 · 22시 이후 한산", "상업화된 거리라는 평도 있음"],
    sources=[S("China Highlights · 금리", "https://www.chinahighlights.com/chengdu/attraction/jinli-old-street.htm"), S("Wander in China · 금리", "https://www.wanderinchina.com/en/destinations/chengdu/jinli-ancient-street/")],
    photos=("jinli", [2, 0, 1, 3]))
G["jiezi"] = dict(
    name="제쯔구전 (街子古镇)", local="街子古镇", address="四川省成都市崇州市街子古镇",
    summary="칭청산 뒤편 웨이장 강(味江)을 낀 천년 물마을. 대나무 의자 찻집에서 쉬어 가는 곳입니다.",
    info=[("이동", "시내에서 차로 약 1시간~1시간 30분"), ("평점", "트립닷컴 4.4 (78개 리뷰)"), ("특산", "탕마빙(汤麻饼) · 충저우 비파차(枇杷茶)")],
    good=["관광객이 적고 조용하다는 평", "강가 찻집에서 보온병 뜨거운 물 무제한"],
    caution=["평일 오전이 가장 한산", "찻집 개별 리뷰는 확인하지 못했어요"],
    sources=[S("China Highlights · 청두 고진", "https://www.chinahighlights.com/chengdu/article-best-ancient-town.htm"), S("Trip.com · 제쯔구전", "https://nz.trip.com/travel-guide/chongzhou/jiezi-ancient-town-90182/")],
    photos=("jiezi", [3, 1, 2, 0]))
G["jiezi-lunch"] = dict(G["jiezi"], name="제쯔구전 시골 점심",
    summary="고진 안 식당에서 촌두부 · 토종닭 · 산나물로 소박한 점심. 디저트로 탕마빙을 곁들입니다.",
    good=["고진 특산 탕마빙 · 산나물 요리"], caution=["식당별 리뷰는 확인하지 못했어요 · 메뉴판 가격 먼저 확인"],
    photos=("jiezi", [1, 2]))
G["woos"] = dict(
    name="오씨회 (吴氏荟 The Woo's)", local="吴氏荟", address="成都市锦江区宏济中路39号附17号",
    summary="큰 나무에 가려진 고택에서 오(吴)씨 가족이 운영하는 사천요리집. 미쉐린 빕 구르망입니다.",
    info=[("등급", "미쉐린 빕 구르망 · ¥¥"), ("전화", "+86 28 6527 2678"), ("결제", "해외 신용카드 불가 · 알리페이 · 현금")],
    good=["미쉐린 추천: 마른 고추 더미에 튀긴 자연산 황조기", "흐르는 소를 넣은 찹쌀 경단 디저트"],
    caution=["건물이 큰 나무에 가려 찾기 어려움 · 택시엔 중국어 주소", "4인 이상이면 전화 예약 권장"],
    sources=[S("Michelin Guide", "https://guide.michelin.com/en/chengdu-municipality/chengdu/restaurant/the-woo-s")],
    photos=("woos", [0, 1, 4]), photoNote="사천요리 참고 사진 (해당 가게 아님)")
G["tfu"] = dict(
    name="청두 톈푸 국제공항 T1", local="成都天府国际机场T1航站楼", address="四川省成都市简阳市成都天府国际机场T1航站楼",
    summary="2021년 개항한 청두 신공항. 시내에서 약 50~60km 떨어져 있어 이른 아침 출발은 여유 있게 움직여야 합니다.",
    info=[("항공편", "CA401 08:30 출발 → 인천 12:55"), ("시내에서", "택시 약 1시간 · 지하철 18호선 40분대(첫차 06:00 전후)"), ("도착 목표", "출발 2시간 전 06:30")],
    good=["신공항이라 넓고 쾌적 · T1 에어차이나 라운지에 사천 음식 뷔페"],
    caution=["터미널 배정은 출처마다 다름 · 전자티켓에서 T1 재확인", "05:40 출발이면 지하철 첫차 전 · 택시/디디 예약"],
    sources=[S("Wander in China · 청두 공항", "https://wanderinchina.com/destinations/chengdu/transport/airport/"), S("Trip.com · 청두 공항", "https://uk.trip.com/guide/china/chengdu-airport.html")],
    photos=("tfu", [0, 1, 3]))

# 일정 제목 → guideId
RULES = [
    ("CA440", "icn-t1"), ("인천국제공항 T1 도착", "icn-t1"), ("장베이", "ckg-t3"), ("오우첸", "hotel-cq"),
    ("시우냥", "xiuniang"), ("홍야동", "hongyadong"), ("소면", "xiaomian"), ("토피아", "topia"), ("리지바", "liziba"),
    ("에링", "eling2"), ("토토마토", "totomato"), ("비파원", "pipayuan"), ("일과수", "yikeshu"), ("사핑바역", "shapingba"),
    ("고속철 사핑바", "crh"), ("파크 인", "hotel-cd"), ("만산면관", "wansan"), ("수정방 박물관", "shuijingfang"),
    ("진마파두부", "chenmapo"), ("금리", "jinli"), ("제쯔구전(街子古镇)으로", "jiezi"), ("제쯔구전 강변", "jiezi"),
    ("촌두부", "jiezi-lunch"), ("오씨회", "woos"), ("톈푸 공항 이동", "tfu"), ("CA401", "tfu"),
]

# ---- 사진 내려받기 ----
pub = R / "public/spots"; pub.mkdir(parents=True, exist_ok=True)
def fetch(src, dest):
    if dest.exists() and dest.stat().st_size > 1000:
        return True
    for a in range(4):
        try:
            data = urllib.request.urlopen(urllib.request.Request(src.replace("/960px-", "/500px-"), headers=UA), timeout=40).read()
            dest.write_bytes(data); time.sleep(0.5); return True
        except Exception:
            time.sleep(2 * (a + 1))
    return False

out = {}
for gid, g in G.items():
    key, idxs = g["photos"]
    picks = [PHOTOS[key][i] for i in idxs if i < len(PHOTOS[key])]
    picks += [PHOTOS[k][i] for k, i in g.get("extraPhotos", []) if i < len(PHOTOS[k])]
    photos = []
    for n, p in enumerate(picks):
        ext = ".png" if p["src"].lower().endswith(".png") else ".jpg"
        name = f"{gid}-{n + 1}{ext}"
        if fetch(p["src"], pub / name):
            photos.append({"src": f"spots/{name}", "credit": f"{p['author'] or 'Wikimedia Commons'} · {p['license']}", "page": p["page"]})
    out[gid] = {
        "name": g["name"], "localName": g["local"], "address": g["address"], "summary": g["summary"],
        "info": [{"label": a, "value": b} for a, b in g["info"]],
        "good": g["good"], "caution": g["caution"], "sources": g["sources"],
        "photos": photos, **({"photoNote": g["photoNote"]} if g.get("photoNote") else {}),
    }
    print(gid, len(photos))

(R / "src/data/spotGuides.json").write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

# ---- 일정 stop에 guideId 부여 (중국 일정만) ----
p = R / "src/data/presetTrips.ts"; s = p.read_text(encoding="utf-8")
a = s.index("id: 'trip-china-2026'"); b = s.index("id: 'trip-", a + 10)
seg = s[a:b]
def add_gid(m):
    title = m.group(2)
    for k, gid in RULES:
        if k in title:
            return f"{m.group(0)}, guideId: '{gid}'"
    raise SystemExit(f"guideId 없음: {title}")
seg = re.sub(r"(time: '[^']*',\s*title: '((?:[^'\\]|\\.)*)')(?!, guideId)", add_gid, seg)
s = s[:a] + seg + s[b:]
p.write_text(s, encoding="utf-8")
print("ok")
