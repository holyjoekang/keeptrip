"""청두 맛집(미쉐린 가이드 등재) 추가: 만산면관 점심, 진마파두부 주소, 오씨회(The Woo's) 마지막 만찬."""
from pathlib import Path

R = Path(__file__).resolve().parent.parent
p = R / "src/data/presetTrips.ts"; s = p.read_text(encoding="utf-8")
pairs = [
    # DAY3 점심: 만산면관
    ("""          {
            id: 'stop-cn-7',
            time: '14:30',""",
     """          { time: '13:00', title: '만산면관 (万三面馆 칭룽정제점) 점심', description: '미쉐린 빕 구르망 · 이빈식 란몐(燃面, 비빔면)과 라러우 · 진장구 칭룽정제 131호 부1호 · 호텔에서 택시 약 10분 · 광둥식 소시지 외 구이류는 18시부터', category: 'food', localName: '万三面馆(青龙正街)', address: '成都市锦江区青龙正街131号附1号' },
          {
            id: 'stop-cn-7',
            time: '14:30',"""),
    # DAY3 저녁: 진마파두부 주소
    ("{ time: '18:00', title: '진마파두부 본점 만찬', description: '마파두부의 원조집에서 얼얼한 화쟈오의 진수 만끽', category: 'food', isRecommended: true },",
     "{ time: '18:00', title: '진마파두부 (陈麻婆豆腐 칭화로 플래그십) 만찬', description: '마파두부의 원조집에서 얼얼한 화쟈오의 진수 만끽 · 미쉐린 가이드 등재 · 칭양구 칭화로 10호 부10-12호 · 식사 후 금리까지 택시 약 15분', category: 'food', isRecommended: true, localName: '陈麻婆豆腐(青华路店)', address: '成都市青羊区青华路10号附10-12号' },"),
    # DAY4 저녁: 오씨회
    ("{ time: '18:30', title: '사천 명품 요리 & 수정방 클래식 만찬', description: '4박 5일 여행을 마무리하는 품격 있는 만찬', category: 'food', isRecommended: true },",
     "{ time: '18:30', title: '오씨회 (吴氏荟 The Woo\\'s) 사천요리 & 수정방 마지막 만찬', description: '미쉐린 빕 구르망 · 큰 나무에 가려진 고택의 가족 경영 사천요리 · 추천: 마른 고추 더미에 튀긴 자연산 황조기, 흐르는 소 찹쌀 경단 · 진장구 훙지중로 39호 부17호 · 해외 신용카드 불가(알리페이·현금) · ☎ +86 28 6527 2678', category: 'food', isRecommended: true, localName: '吴氏荟', address: '成都市锦江区宏济中路39号附17号' },"),
]
for old, new in pairs:
    if new in s:
        continue
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)
p.write_text(s, encoding="utf-8")
print("ok")
