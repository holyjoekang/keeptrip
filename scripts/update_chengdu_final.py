"""청두 최종 일정(11/20–22) 반영: 일정(stop)·장소 안내(사진·자세한 안내·택시 카드)·DB·스냅샷.
사용: python3 scripts/update_chengdu_final.py   (DB 수정 후 supabase_sync.py pull 로 스냅샷 갱신)
"""
import json, subprocess, sys, time, urllib.request
from pathlib import Path

R = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(R / "scripts"))
from supabase_sync import sql, J  # noqa: E402

TRIP = "trip-china-2026"
UA = {"User-Agent": "KeepTripGuideBuilder/1.0 (travel itinerary app)"}
PH = json.loads((R / "scripts/data/spot_photos_chengdu_final.json").read_text(encoding="utf-8"))
HOTEL_LOCAL, HOTEL_ADDR = "成都春熙路太古里丽柏酒店", "四川省成都市锦江区总府路57号"
S = lambda label, url: {"label": label, "url": url}

# ---------------- 장소 안내 (새 장소) ----------------
GUIDES = {
    "chunxi": dict(
        name="춘시루 (春熙路) 쓰촨 가정식 점심", local="春熙路", address="四川省成都市锦江区春熙路",
        summary="청두 대표 번화가 보행 거리. 호텔(총부로 57호)에서 걸어서 갈 수 있어, 짐을 맡기고 바로 점심을 먹기 좋습니다.",
        info=[("이름 뜻", "春 봄 · 熙 밝고 번성함 · 路 거리 → ‘봄빛처럼 번성한 거리’"),
              ("메뉴 예", "回锅肉 회과육(두 번 볶은 돼지고기) · 鱼香肉丝 위샹러우쓰 · 麻婆豆腐 마파두부 · 家常菜 = 가정식"),
              ("시간", "12:30쯤 점심 → 14:00 택시로 수정방 박물관")],
        good=["호텔·타이구리와 도보권", "쓰촨 가정식 식당이 많아 4명이 나눠 먹기 좋음"],
        caution=["맵기 조절: 微辣(웨이라, 약간 맵게) / 不辣(부라, 안 맵게)", "주말·점심시간엔 대기 가능"],
        sources=[S("Wikipedia · Chunxi Road", "https://en.wikipedia.org/wiki/Chunxi_Road")],
        photos=[("chunxi", 0), ("chunxi", 3), ("chunxi", 2)]),
    "daci": dict(
        name="대자사 (大慈寺) · 타이구리 (太古里)", local="大慈寺 · 成都远洋太古里", address="四川省成都市锦江区中纱帽街8号",
        summary="오래된 불교 사찰 대자사를 둘러싸고 전통 양식 저층 건물로 지은 개방형 상업 지구가 타이구리입니다. 수정방 관람 후 산책이나 카페 휴식.",
        info=[("이름 뜻", "大慈寺 ‘큰 자비의 절’ · 太古 아득한 옛날 + 里 동네·골목 (상업구역 이름)"),
              ("시간", "16:00쯤 → 17:45 진장 강변으로 이동"),
              ("요금", "타이구리 산책 무료 · 대자사 내부는 별도 개방시간")],
        good=["사찰 담장과 현대 건물이 어우러진 골목 산책", "카페·디저트 가게 많음 · 호텔과 도보권"],
        caution=["주말 저녁 매우 붐빔"],
        sources=[S("Wikipedia · Daci Temple", "https://en.wikipedia.org/wiki/Daci_Temple"),
                 S("Wikipedia · Sino-Ocean Taikoo Li Chengdu", "https://en.wikipedia.org/wiki/Sino-Ocean_Taikoo_Li_Chengdu")],
        photos=[("daci", 1), ("daci", 2), ("daci", 6), ("daci", 7)], photoNote="대자사 · 타이구리 사진"),
    "jinjiang": dict(
        name="진장 (锦江) 강변 산책 · 허장팅 → 안순랑차오", local="合江亭", address="四川省成都市锦江区合江亭",
        summary="두 물줄기가 만나는 허장팅(合江亭)에서 지붕 덮인 다리 안순랑차오(安顺廊桥)까지 강변을 걷습니다. 어두워지면 허장팅 쪽에서 다리와 물에 비친 야경이 좋습니다.",
        info=[("이름 뜻", "锦江 ‘비단의 강’ · 合江亭 ‘강이 합쳐지는 곳의 정자’ · 安顺廊桥 ‘평안하고 순조로운, 지붕·복도 있는 다리’"),
              ("시간", "17:45~18:20 산책 · 18:30 다리 위 더 브리지 저녁"),
              ("택시", "허장팅(合江亭)으로 가자고 하면 됨")],
        good=["해 질 녘부터 다리 조명이 켜져 사진 명소", "강변 길이 평탄해 걷기 편함"],
        caution=["강바람이 차니 겉옷 챙기기", "야경 사진은 허장팅 쪽에서 다리를 바라보는 방향"],
        sources=[S("Wikipedia · Anshun Bridge", "https://en.wikipedia.org/wiki/Anshun_Bridge"),
                 S("Wikipedia · Jin River (Sichuan)", "https://en.wikipedia.org/wiki/Jin_River_(Sichuan)")],
        photos=[("jinjiang", 0), ("jinjiang", 5), ("jinjiang", 6), ("jinjiang", 7)]),
    "thebridge": dict(
        name="더 브리지 (THE BRIDGE 廊桥) 저녁", local="廊桥 THE BRIDGE（安顺廊桥）", address="四川省成都市锦江区滨江东路66号",
        summary="안순랑차오 다리 위의 식당. 강 전망 창가 4인석을 희망합니다. 메뉴와 자리는 아직 미확정입니다.",
        info=[("예약", "☎ 028-8444-6888 (한국 번호로 걸 때 +86 28 8444 6888)"),
              ("문의할 것", "강 전망 창가 4인석 · 외부 주류 반입과 개봉료 · 4인 세트 메뉴와 가격"),
              ("단품 후보", "夫妻肺片 쓰촨식 소고기 냉채 · 糯米脆皮鸭 찹쌀 바삭 오리 · 炎味·石锅竹笋壳鱼 돌솥 생선 · 银杏芦笋 은행 아스파라거스"),
              ("이름 뜻", "廊桥 지붕·복도 있는 다리 · 滨江东路 ‘강변 동쪽 길’"),
              ("직원에게 보여주기", "你好，请问今晚六点半有四人靠窗江景位吗？我们可以自带一瓶酒吗？开瓶费怎么算？有四人套餐吗？多少钱？")],
        good=["다리 위에서 진장 야경을 보며 식사"],
        caution=["자리·메뉴 미확정 → 미리 전화 확인", "전망석은 일찍 마감될 수 있음"],
        sources=[S("Wikipedia · Anshun Bridge", "https://en.wikipedia.org/wiki/Anshun_Bridge"),
                 S("Wikipedia · Fuqi feipian", "https://en.wikipedia.org/wiki/Fuqi_feipian")],
        photos=[("thebridge", 1), ("thebridge", 3), ("thebridge", 4), ("thebridge", 2)], photoNote="안순랑차오 야경 (식당은 다리 위)"),
    "wuhouci": dict(
        name="무후사 (成都武侯祠博物馆)", local="成都武侯祠博物馆", address="四川省成都市武侯区武侯祠大街231号",
        summary="삼국지 촉한의 승상 제갈량과 황제 유비를 함께 모신 사당. 유비의 능인 혜릉(惠陵)도 이곳에 있습니다. 지금 모습은 1672년에 다시 지은 것입니다.",
        info=[("이름 뜻", "武侯 제갈량을 가리키는 칭호 · 祠 사당 · 惠陵 유비의 능"),
              ("시간", "09:00 호텔 출발 → 09:30 도착 · 약 1시간 30분 관람 → 11:00 옆 진리"),
              ("예매", "whpww.cdwuhouci.cn 또는 위챗 공식계정 ‘成都武侯祠’ · 실물 여권 지참"),
              ("문의", "☎ 028-85535951")],
        good=["붉은 담장과 대나무 길(红墙竹影)이 사진 명소", "유비전·제갈량전·혜릉 순서로 보면 삼국지 흐름이 잡힘"],
        caution=["주말 오전 단체 관광객 많음 → 일찍 입장", "여권 원본 없으면 입장 불가할 수 있음"],
        sources=[S("무후사 예매 (공식)", "https://whpww.cdwuhouci.cn"),
                 S("Wikipedia · Wuhou Shrine", "https://en.wikipedia.org/wiki/Wuhou_Shrine")],
        photos=[("wuhouci", 6), ("wuhouci", 3), ("wuhouci", 1), ("wuhouci", 2)]),
    "jinli-lunch": dict(
        name="진리 인근 점심 · 단단면 · 룽차오서우", local="锦里古街", address="四川省成都市武侯区武侯祠大街231号",
        summary="무후사 옆 진리 주변에서 청두 대표 간식으로 가볍게 점심.",
        info=[("메뉴", "担担面 단단면(매콤한 고기 비빔국수) · 龙抄手 룽차오서우(청두식 완탕) · 钟水饺 중수이자오(단맛 고추기름 물만두)"),
              ("시간", "12:00쯤 → 13:30 인민공원 허밍차서(택시 10~20분)")],
        good=["여러 가지를 조금씩 시켜 나눠 먹기 좋음"],
        caution=["관광지 안 가게는 가격이 조금 높음"],
        sources=[S("Wikipedia · Dandan noodles", "https://en.wikipedia.org/wiki/Dandan_noodles"),
                 S("Wikipedia · Jinli", "https://en.wikipedia.org/wiki/Jinli")],
        photos=[("jinli-lunch", 1), ("jinli-lunch", 7), ("jinli-lunch", 5)], photoNote="단단면 참고 사진"),
    "heming": dict(
        name="인민공원 허밍차서 (鹤鸣茶社)", local="人民公园·鹤鸣茶社", address="四川省成都市青羊区人民公园（鹤鸣茶社）",
        summary="청두 사람들이 대나무 의자에 앉아 개완차(盖碗茶)를 마시며 쉬는 공원 안 오래된 찻집. 청두 일상을 가장 가까이 보는 곳.",
        info=[("이름 뜻", "人民公园 ‘시민의 공원’ · 鹤 학 + 鸣 울다 + 茶社 찻집 → ‘학이 우는 찻집’ · 东门 동문"),
              ("시간", "13:30~14:00 도착 · 진리에서 택시 약 10~20분"),
              ("이용", "일반 차는 현장 주문 · 주말 4인석은 대기 가능"),
              ("체험", "采耳 귀청소 서비스를 하는 사람이 돌아다님 (원할 때만)")],
        good=["개완차 뚜껑을 비스듬히 덮어 두면 직원이 뜨거운 물을 계속 채워 줌", "느긋하게 이야기 나누기 좋음"],
        caution=["주말 오후는 자리 경쟁 · 4명 함께 앉을 자리 먼저 확보"],
        sources=[S("Wikipedia · People's Park (Chengdu)", "https://en.wikipedia.org/wiki/People%27s_Park_(Chengdu)")],
        photos=[("heming", 0), ("heming", 1), ("heming", 3), ("heming", 6)]),
    "kuanzhai": dict(
        name="관자이샹쯔 (宽窄巷子)", local="宽窄巷子", address="四川省成都市青羊区宽窄巷子",
        summary="청나라 때 골목 셋(宽巷子·窄巷子·井巷子)을 복원한 거리. 회색 벽돌 집과 찻집·가게가 늘어서 있습니다. 인민공원에서 가깝습니다.",
        info=[("이름 뜻", "宽 넓다 · 窄 좁다 · 巷子 골목 → ‘넓고 좁은 골목’"),
              ("시간", "15:00 이후 여유 있으면 산책 → 18:00 송촨 저녁"),
              ("요금", "무료")],
        good=["옛 골목 분위기 사진 · 간식 거리"],
        caution=["주말 오후 매우 붐빔", "상업화됐다는 평도 있음"],
        sources=[],
        photos=[("kuanzhai", 0), ("kuanzhai", 2), ("kuanzhai", 3), ("kuanzhai", 7)]),
    "songchuan": dict(
        name="송촨 (宋·川菜 成都太古里店) 저녁", local="宋·川菜（成都太古里店）", address="四川省成都市锦江区中纱帽街8号成都太古里23栋",
        summary="타이구리 안의 쓰촨요리 식당. 호텔과 가까워 식사 후 걸어서 복귀하고 짐 정리. 자리는 아직 미확정입니다.",
        info=[("예약", "☎ 193-8192-4678 (+86 193 8192 4678) · 4인 예약 문의"),
              ("이름 뜻", "宋 가게 이름 글자 · 川菜 쓰촨요리 · 成都太古里店 청두 타이구리점 · 中纱帽街 거리 이름"),
              ("시간", "18:00 → 식사 후 호텔 복귀 · 짐 정리")],
        good=["호텔·타이구리와 도보권"],
        caution=["자리 미확정 → 미리 전화 확인", "맵기는 微辣(약간 맵게)로 요청"],
        sources=[S("Wikipedia · Sichuan cuisine", "https://en.wikipedia.org/wiki/Sichuan_cuisine")],
        photos=[("songchuan", 0), ("songchuan", 4), ("songchuan", 5)], photoNote="쓰촨요리 참고 사진"),
}

# ---------------- 일정 ----------------
def stop(time_, title, desc, cat, gid=None, local=None, addr=None, tip=None, rec=None, key=None):
    return {"time": time_, "title": title, "description": desc, "category": cat, "guide_id": gid,
            "local_name": local, "address": addr, "smart_tip": tip, "is_recommended": rec, "stop_key": key}

DAYS = {
    3: dict(theme="고속철 이동 · 수정방 · 타이구리 · 진장 야경",
            highlights=["사핑바 10:30 → 청두동 11:32 고속철", "수정방 박물관 해설 관람", "대자사 · 타이구리 산책", "진장 강변 야경 · 더 브리지 저녁"],
            stops=[
                None,  # 09:20 사핑바역 이동 (기존 유지)
                stop("10:30", "고속철 사핑바역 → 청두동역", "沙坪坝站 10:30 출발 → 成都东站 11:32 도착 · 1시간 2분 · 여권 원본 지참", "transit", "crh",
                     "成都东站", None, "이름 뜻: 沙坪坝 ‘모래가 있는 평평한 터’ · 站 역 · 成都东站 ‘청두 동쪽의 기차역’"),
                stop("12:15", "춘시루 호텔에 짐 맡기기", "파크 인 바이 라디슨 청두 춘시루 타이쿠리 · 체크인 전 짐 먼저 보관 · 11/20–11/22 2박", "hotel", "hotel-cd",
                     HOTEL_LOCAL, HOTEL_ADDR, "이름 뜻: 丽柏 리바이(Park Inn) · 总府路 호텔이 있는 도로 이름"),
                stop("12:30", "춘시루 쓰촨 가정식 점심", "호텔에서 걸어서 춘시루(春熙路)로 · 회과육 · 위샹러우쓰 · 마파두부 등", "food", "chunxi",
                     "春熙路", "四川省成都市锦江区春熙路", "이름 뜻: 春 봄 · 熙 밝고 번성함 · 路 거리"),
                stop("14:30", "수정방 박물관 (14:00 택시 출발)", "해설 4인 확인 ☎ 028-84436999 / 028-84430666 · 공식 예약 www.sjfmuseum.com/appointment · 600년 양조 유적 발효조 견학과 백주 시음", "sightseeing", "shuijingfang",
                     "水井坊博物馆", "四川省成都市锦江区水井街19-21号", "이름 뜻: 水井 우물 · 坊 작업장 → ‘우물가 양조장’ · 水井街 박물관이 있는 거리", True, "stop-cn-7"),
                stop("16:00", "대자사 · 타이구리 산책 또는 카페", "관람 후 대자사(大慈寺) 주변과 타이구리(成都太古里) 산책, 카페 휴식", "sightseeing", "daci",
                     "大慈寺 · 成都远洋太古里", "四川省成都市锦江区中纱帽街8号", "이름 뜻: 大慈寺 ‘큰 자비의 절’ · 太古里 太古 아득한 옛날 + 里 동네"),
                stop("17:45", "진장 강변 산책 · 허장팅 → 안순랑차오", "17:45~18:20 허장팅(合江亭)에서 안순랑차오(安顺廊桥)까지 · 어두워지면 허장팅 쪽에서 다리와 물에 비친 야경", "sightseeing", "jinjiang",
                     "合江亭", "四川省成都市锦江区合江亭", "이름 뜻: 锦江 ‘비단의 강’ · 合江亭 ‘강이 합쳐지는 곳의 정자’ · 安顺廊桥 ‘평안하고 순조로운 지붕 다리’", True),
                stop("18:30", "더 브리지 (THE BRIDGE 廊桥) 저녁 · 미확정", "안순랑차오 위 · 예약 ☎ 028-8444-6888 · 강 전망 창가 4인석 · 외부 주류 반입·개봉료 · 4인 세트·가격 문의 · 단품 후보: 夫妻肺片 · 糯米脆皮鸭 · 石锅竹笋壳鱼 · 银杏芦笋",
                     "food", "thebridge", "廊桥 THE BRIDGE（安顺廊桥）", "四川省成都市锦江区滨江东路66号",
                     "직원에게 보여주기: 你好，请问今晚六点半有四人靠窗江景位吗？我们可以自带一瓶酒吗？开瓶费怎么算？有四人套餐吗？多少钱？"),
                stop("20:30", "숙소 복귀 · 체크인", "파크 인 바이 라디슨 청두 춘시루 타이쿠리", "hotel", "hotel-cd", HOTEL_LOCAL, HOTEL_ADDR),
            ]),
    4: dict(theme="삼국지 무후사 · 진리 · 청두 찻집",
            highlights=["무후사 제갈량 사당 · 유비 혜릉", "진리 산책 · 단단면 점심", "인민공원 허밍차서 개완차", "관자이샹쯔 · 송촨 저녁"],
            stops=[
                stop("09:30", "무후사 (09:00 호텔 출발)", "제갈량 사당과 유비 혜릉 관람 · 예매 whpww.cdwuhouci.cn 또는 위챗 成都武侯祠 · 티켓 문의 ☎ 028-85535951 · 여권 원본 지참", "sightseeing", "wuhouci",
                     "成都武侯祠博物馆", "四川省成都市武侯区武侯祠大街231号", "이름 뜻: 武侯 제갈량을 가리키는 칭호 · 祠 사당 · 惠陵 유비의 능", True),
                stop("11:00", "진리(锦里) 산책", "무후사 바로 옆 삼국지 분위기 옛 거리", "sightseeing", "jinli",
                     "锦里古街", "四川省成都市武侯区武侯祠大街231号", "이름 뜻: 锦 비단 · 里 동네 → ‘비단 동네’"),
                stop("12:00", "진리 인근 점심 · 단단면 · 룽차오서우", "担担面(단단면) · 龙抄手(룽차오서우, 청두식 완탕) 등", "food", "jinli-lunch", "锦里古街", "四川省成都市武侯区武侯祠大街231号"),
                stop("13:30", "인민공원 허밍차서 (鹤鸣茶社)", "진리에서 택시 약 10~20분 · 13:30~14:00 도착 · 일반 차는 현장 이용 · 주말 4인석은 대기 가능", "food", "heming",
                     "人民公园·鹤鸣茶社", "四川省成都市青羊区人民公园（鹤鸣茶社）", "이름 뜻: 人民公园 ‘시민의 공원’ · 鹤鸣茶社 ‘학이 우는 찻집’ · 东门 동문", True),
                stop("15:00", "관자이샹쯔 산책 (여유 있으면)", "인민공원에서 가까운 청나라 골목 거리", "sightseeing", "kuanzhai",
                     "宽窄巷子", "四川省成都市青羊区宽窄巷子", "이름 뜻: 宽 넓다 · 窄 좁다 · 巷子 골목 → ‘넓고 좁은 골목’"),
                stop("18:00", "송촨 (宋·川菜 타이구리점) 저녁 · 미확정", "4인 예약 문의 ☎ 193-8192-4678 (+86 193 8192 4678) · 자리 미확정", "food", "songchuan",
                     "宋·川菜（成都太古里店）", "四川省成都市锦江区中纱帽街8号成都太古里23栋", "이름 뜻: 宋 가게 이름 글자 · 川菜 쓰촨요리 · 中纱帽街 거리 이름"),
                stop("20:00", "숙소 복귀 · 짐 정리", "프런트에서 내일 04:45 픽업 차량(4명 + 짐)과 시간 확인", "hotel", "hotel-cd", HOTEL_LOCAL, HOTEL_ADDR),
            ]),
    5: dict(theme="새벽 톈푸 공항 출발 · 서울 귀환",
            highlights=["04:45 호텔 차량 픽업", "CA401 청두 톈푸 T1 08:30 → 인천 12:55"],
            stops=[
                stop("04:45", "호텔 차량 픽업 → 톈푸 공항", "토요일에 프런트에서 4명과 짐을 실을 차량 · 픽업 시간 확인 · 춘시루 → 톈푸 국제공항 약 1시간", "transit", "tfu",
                     "成都天府国际机场 T1", "四川省成都市简阳市成都天府国际机场T1航站楼"),
                stop("08:30", "CA401 청두 톈푸 T1 출발", "중국국제항공 CA401 · 청두 톈푸 T1 → 인천 · 발권 기준 08:30 출발 · 출발 전 항공사 예약 화면에서 재확인", "transit", "tfu",
                     "成都天府国际机场 T1", None, "이름 뜻: 天府 쓰촨을 일컫는 ‘천부지국(天府之国)’ · 国际机场 국제공항"),
                stop("12:55", "인천국제공항 T1 도착 (한국 시각)", "仁川 인천: 仁 어질다 · 川 내·강", "transit", "icn-t1"),
            ]),
}
PHONE_RULE = {"tag": "전화", "title": "청두 유선전화 거는 법",
              "description": "중국 현지 번호로 걸 때는 표기 그대로(028-…), 한국 번호로 청두 유선전화에 걸 때는 028을 +86 28로 바꾸세요. 시간은 모두 청두 현지 기준입니다."}


def fetch(src, dest):
    if dest.exists() and dest.stat().st_size > 1000:
        return True
    for a in range(4):
        try:
            dest.write_bytes(urllib.request.urlopen(urllib.request.Request(src.replace("/960px-", "/500px-"), headers=UA), timeout=40).read())
            time.sleep(0.5); return True
        except Exception:
            time.sleep(2 * (a + 1))
    return False


def build_guides():
    pub = R / "public/spots"; out = {}
    for gid, g in GUIDES.items():
        photos = []
        for n, (k, i) in enumerate(g["photos"]):
            p = PH[k][i]
            name = f"{gid}-{n + 1}.jpg"
            if fetch(p["src"], pub / name):
                photos.append({"src": f"spots/{name}", "credit": f"{p['author'] or 'Wikimedia Commons'} · {p['license']}", "page": p["page"]})
        out[gid] = {"name": g["name"], "localName": g["local"], "address": g["address"], "summary": g["summary"],
                    "info": [{"label": a, "value": b} for a, b in g["info"]], "good": g["good"], "caution": g["caution"],
                    "sources": g["sources"], "photos": photos, **({"photoNote": g["photoNote"]} if g.get("photoNote") else {})}
        print(gid, "사진", len(photos))
    return out


def main():
    guides = build_guides()
    # 시드 파일 갱신 (push 해도 같은 결과가 되도록)
    seed_p = R / "scripts/data/spotGuides_seed.json"
    seed = json.loads(seed_p.read_text(encoding="utf-8")); seed.update(guides)
    seed_p.write_text(json.dumps(seed, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    # 기존 stop(09:20 사핑바역 이동, 수정방·진리 도슨트) 보존용
    old = sql(f"select day_number, position, stop_key, time, title, description, category, fee_tip, smart_tip, docent, is_recommended, local_name, address, guide_id from trip_stops where trip_id='{TRIP}' and day_number>=3 order by day_number, position")
    keep_first = next(s for s in old if s["day_number"] == 3 and s["position"] == 0)
    docent = {s["guide_id"]: s["docent"] for s in old if s.get("docent")}

    rows = []
    for dn, d in DAYS.items():
        for pos, s in enumerate(d["stops"]):
            s = dict(keep_first) if s is None else {**s, "fee_tip": None, "docent": docent.get(s["guide_id"])}
            rows.append({**s, "trip_id": TRIP, "day_number": dn, "position": pos})

    grows = [{"id": k, "name": g["name"], "local_name": g["localName"], "address": g["address"], "summary": g["summary"], "info": g["info"],
              "good": g["good"], "caution": g["caution"], "sources": g["sources"], "photos": g["photos"], "photo_note": g.get("photoNote")}
             for k, g in guides.items()]
    q = [
        "begin;",
        f"""insert into spot_guides (id, name, local_name, address, summary, info, good, caution, sources, photos, photo_note)
  select id, name, local_name, address, summary, info, good, caution, sources, photos, photo_note from jsonb_populate_recordset(null::spot_guides, {J(grows)})
  on conflict (id) do update set name=excluded.name, local_name=excluded.local_name, address=excluded.address, summary=excluded.summary,
  info=excluded.info, good=excluded.good, caution=excluded.caution, sources=excluded.sources, photos=excluded.photos, photo_note=excluded.photo_note;""",
        f"delete from trip_stops where trip_id='{TRIP}' and day_number>=3;",
        f"""insert into trip_stops (trip_id, day_number, position, stop_key, time, title, description, category, fee_tip, smart_tip, docent, is_recommended, local_name, address, guide_id)
  select trip_id, day_number, position, stop_key, time, title, description, category, fee_tip, smart_tip, docent, is_recommended, local_name, address, guide_id
  from jsonb_populate_recordset(null::trip_stops, {J(rows)});""",
    ]
    for dn, d in DAYS.items():
        q.append(f"update trip_days set theme={J(d['theme'])}#>>'{{}}', day_highlights={J(d['highlights'])} where trip_id='{TRIP}' and day_number={dn};")
    q.append(f"""update trips set key_rules = case when key_rules::text like '%청두 유선전화%' then key_rules else key_rules || {J([PHONE_RULE])} end,
  best_moments = jsonb_set(best_moments, '{{bestPlace}}', {J({"title": "수정방 600년 양조 발효조 & 허밍차서 찻집", "desc": "중국 제1방의 그윽한 백주 향기를 맡은 수정방 유적과, 인민공원 대나무 의자에서 개완차를 마신 허밍차서"})})
  where id='{TRIP}';""")
    q.append("commit;")
    sql("\n".join(q))
    print("DB 반영:", len(rows), "stops,", len(grows), "guides")

    # trips_export.json 도 같은 내용으로 (push 원본)
    exp_p = R / "scripts/data/trips_export.json"
    exp = json.loads(exp_p.read_text(encoding="utf-8"))
    t = next(x for x in exp if x["id"] == TRIP)
    for d in t["days"]:
        if d["dayNumber"] in DAYS:
            D = DAYS[d["dayNumber"]]
            d["theme"], d["dayHighlights"] = D["theme"], D["highlights"]
            d["stops"] = [{k2: v for k2, v in {
                "id": s["stop_key"], "time": s["time"], "title": s["title"], "description": s["description"], "category": s["category"],
                "smartTip": s["smart_tip"], "docent": s["docent"], "isRecommended": s["is_recommended"], "localName": s["local_name"],
                "address": s["address"], "guideId": s["guide_id"]}.items() if v is not None}
                for s in rows if s["day_number"] == d["dayNumber"]]
    if not any(r.get("title") == PHONE_RULE["title"] for r in t["keyRules"]):
        t["keyRules"].append(PHONE_RULE)
    t.setdefault("bestMoments", {})["bestPlace"] = {"title": "수정방 600년 양조 발효조 & 허밍차서 찻집", "desc": "중국 제1방의 그윽한 백주 향기를 맡은 수정방 유적과, 인민공원 대나무 의자에서 개완차를 마신 허밍차서"}
    exp_p.write_text(json.dumps(exp, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    subprocess.run([sys.executable, str(R / "scripts/supabase_sync.py"), "pull"], check=True)


if __name__ == "__main__":
    main()
