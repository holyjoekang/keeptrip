"""중국 일정: 매일(귀국일 제외) 마지막에 숙소 복귀 일정 추가 (택시 카드용 현지 주소 포함)."""
from pathlib import Path

R = Path(__file__).resolve().parent.parent
p = R / "src/data/presetTrips.ts"; s = p.read_text(encoding="utf-8")

CQ = ("오우첸 스카이라이즈 리버사이드 호텔", "重庆欧辰高空江景酒店(解放碑来福士广场)", "重庆市渝中区新华路1号光大控股朝天门中心21楼")
CD = ("파크 인 바이 라디슨 청두 춘시루 타이쿠리", "成都春熙路太古里丽柏酒店", "四川省成都市锦江区总府路57号")

def stop(time, h, desc):
    return (f"{{ time: '{time}', title: '숙소 복귀 · {h[0]}', description: '{desc}', "
            f"category: 'hotel', localName: '{h[1]}', address: '{h[2]}' }}")

# (마지막 일정 앵커, 들여쓰기, 추가 일정)
items = [
    ("              recommendedDuration: '1시간 ~ 1시간 30분'\n            }\n          }\n",
     "          ", stop('22:30', CQ, '홍야동 → 호텔 도보 약 15분 (차오톈먼 래플스 시티)')),
    ("          { time: '20:30', title: '남산 일과수 전망대 야경', description: '양쯔강과 가릉강 불빛 바다 조망', category: 'sightseeing' }\n",
     "          ", stop('22:00', CQ, '남산 → 해방비 택시(디디) 약 30분')),
    ("          { time: '20:00', title: '금리(锦里) 홍등 거리 야경', description: '삼국지 촉나라 감성이 살아있는 홍등 길 산책', category: 'sightseeing' }\n",
     "          ", stop('21:30', CD, '금리 → 춘시루 택시(디디) 약 20분')),
    ("          { time: '18:30', title: '사천 명품 요리 & 수정방 클래식 만찬', description: '4박 5일 여행을 마무리하는 품격 있는 만찬', category: 'food', isRecommended: true }\n",
     "          ", stop('21:00', CD, '내일 05:40 체크아웃 · 짐 정리 후 일찍 취침')),
]
for anchor, ind, new in items:
    if new in s:
        continue
    assert s.count(anchor) == 1, anchor[:60]
    # 앵커 마지막 줄 끝에 쉼표를 붙이고 새 일정 추가
    s = s.replace(anchor, anchor[:-1] + ",\n" + ind + new + "\n")
p.write_text(s, encoding="utf-8")
print("ok")
