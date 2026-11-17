"""준비 화면에 '짐 싸기' 탭 추가: 여행별 준비물 체크리스트(JSON 데이터) · 체크 상태는 기기에 저장."""
import json
from pathlib import Path

R = Path(__file__).resolve().parent.parent

def g(group, icon, items):
    return {"group": group, "icon": icon, "items": [{"title": t, **({"note": n} if n else {})} for t, n in items]}

CN = [
    g("서류 · 결제", "📄", [
        ("여권 (유효기간 6개월 이상)", "무비자 15일 · 고속철도 실물 여권으로 탑승"),
        ("여권 사본 · 증명사진 1장", "분실 대비, 여권과 따로 보관"),
        ("항공 e티켓 (CA440 / CA401)", "휴대폰 캡처 + 출력 1부"),
        ("호텔 바우처 (오우첸 충칭 · 파크 인 청두)", "중국어 주소 포함 화면 캡처"),
        ("고속철 예약 확인 (사핑바 → 청두동 11/20 10:30)", None),
        ("트래블카드 + 비자/마스터 신용카드 2장", "알리페이 연결 카드와 비상용 분리"),
        ("비상 현금 200~300위안 + 원화 약간", "오씨회(The Woo's) 등 해외카드 불가 식당 대비"),
        ("여행자보험 가입 확인", None),
    ]),
    g("PC · 업무", "💻", [
        ("노트북", "보안검색 때 가방에서 따로 꺼내기"),
        ("노트북 충전기 (USB-C PD 65W 이상)", None),
        ("마우스 · 노트북 파우치", None),
        ("USB-C 허브 (HDMI · USB-A)", None),
        ("업무 파일 오프라인 저장", "호텔 와이파이에선 구글 · 카카오 · 업무툴 차단"),
        ("휴대폰 핫스팟으로 노트북 연결 테스트", "로밍형 eSIM은 차단 우회 · 데이터 넉넉한 요금제"),
        ("VPN 앱 설치 · 로그인 (출국 전)", "중국 현지에선 설치 · 가입이 어려움"),
    ]),
    g("전자기기", "🔌", [
        ("휴대폰 · 충전기 · 케이블", None),
        ("보조배터리 (100Wh 이하 · 3C 인증 표시)", "위탁수하물 금지 · 기내 휴대만"),
        ("멀티 충전기 (휴대폰 + 노트북 동시)", None),
        ("멀티 어댑터 / 멀티탭", "중국 220V · A/C/I 타입 혼용"),
        ("이어폰", None),
        ("eSIM QR 설치 · 개통 확인", None),
    ]),
    g("의류 (11월 충칭 · 청두 10~16℃, 흐리고 습함)", "🧥", [
        ("경량 패딩 또는 바람막이", None),
        ("니트 · 맨투맨 2벌", None),
        ("티셔츠 3벌", None),
        ("바지 2벌", None),
        ("속옷 · 양말 5세트", None),
        ("잠옷", None),
        ("편한 운동화", "충칭은 계단 · 언덕이 많음"),
        ("접이식 우산", None),
    ]),
    g("세면 · 위생", "🧴", [
        ("칫솔 · 치약", None),
        ("화장품 · 선크림 · 면도기", "액체는 100ml 이하 지퍼백"),
        ("휴대용 티슈 · 물티슈", "현지 화장실에 휴지가 없는 곳이 많음"),
        ("손소독제 · 마스크", None),
    ]),
    g("상비약", "💊", [
        ("위장약 · 소화제", "마라 · 훠궈 대비"),
        ("지사제", None),
        ("진통제 · 감기약", None),
        ("개인 처방약 · 밴드", None),
    ]),
    g("기타", "🎒", [
        ("접이식 보조가방 · 지퍼백", "쇼핑 · 귀국 짐"),
        ("텀블러 / 물병", None),
        ("백주 포장재 (뽁뽁이)", "술은 위탁수하물로만"),
        ("펜 1자루", None),
    ]),
]

out = R / "src/data/packingLists.json"
out.write_text(json.dumps({"trip-china-2026": CN}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

(R / "src/components/PackingChecklist.tsx").write_text("""import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import packingLists from '../data/packingLists.json';

interface PackingItem { title: string; note?: string }
interface PackingGroup { group: string; icon: string; items: PackingItem[] }

const LISTS = packingLists as Record<string, PackingGroup[]>;

export const hasPackingList = (tripId: string) => !!LISTS[tripId]?.length;

const keyOf = (tripId: string) => `keeptrip-packing-${tripId}`;
const load = (tripId: string): string[] => {
  try { return JSON.parse(localStorage.getItem(keyOf(tripId)) || '[]'); } catch { return []; }
};

export const PackingChecklist: React.FC<{ tripId: string }> = ({ tripId }) => {
  const groups = LISTS[tripId] || [];
  const [done, setDone] = useState<Set<string>>(() => new Set(load(tripId)));

  useEffect(() => { setDone(new Set(load(tripId))); }, [tripId]);

  const toggle = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(keyOf(tripId), JSON.stringify([...next])); } catch { /* 저장 불가 시 무시 */ }
      return next;
    });
  };

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const checked = groups.reduce((n, g, gi) => n + g.items.filter((_, i) => done.has(`${gi}-${i}`)).length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-700">짐 싸기 체크리스트</span>
        <span className="font-black text-[#1E2856]">{checked} / {total} 챙김</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g, gi) => {
          const gDone = g.items.filter((_, i) => done.has(`${gi}-${i}`)).length;
          return (
            <section key={g.group} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <h3 className="flex items-center justify-between text-sm font-extrabold text-[#111827] mb-2">
                <span>{g.icon} {g.group}</span>
                <span className={`text-[11px] font-bold ${gDone === g.items.length ? 'text-[#27AE60]' : 'text-slate-400'}`}>
                  {gDone}/{g.items.length}
                </span>
              </h3>
              <ul className="space-y-1">
                {g.items.map((it, i) => {
                  const id = `${gi}-${i}`;
                  const on = done.has(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="w-full flex items-start gap-2.5 text-left py-1.5 px-1 rounded-lg hover:bg-slate-50"
                      >
                        <span className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center shrink-0 ${on ? 'bg-[#27AE60] text-white' : 'border-2 border-slate-300 bg-white'}`}>
                          {on && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-sm font-semibold leading-snug ${on ? 'line-through text-slate-400' : 'text-[#111827]'}`}>{it.title}</span>
                          {it.note && <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">{it.note}</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};
""", encoding="utf-8")

def sub(path, pairs):
    p = R / path; s = p.read_text(encoding="utf-8")
    for old, new in pairs:
        if new in s:
            continue
        assert s.count(old) == 1, (path, old[:60])
        s = s.replace(old, new)
    p.write_text(s, encoding="utf-8")

TAB = """className={`flex-1 py-2.5 rounded-full text-xs font-extrabold transition-all ${
            activeTab === '%s'
              ? 'bg-[#1E2856] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}"""

sub("src/components/PrepScreen.tsx", [
    ("import { analyzeConnectivity } from '../utils/dataConnectivity';\n",
     "import { analyzeConnectivity } from '../utils/dataConnectivity';\nimport { PackingChecklist, hasPackingList } from './PackingChecklist';\n"),
    ("useState<'MUST' | 'SAVINGS' | 'IGNORE'>('MUST');", "useState<'MUST' | 'SAVINGS' | 'IGNORE' | 'PACK'>('MUST');"),
    ("<div className=\"flex gap-2 max-w-md\">", "<div className=\"flex gap-2 max-w-xl\">"),
    ("""          신경 끄기
        </button>
""", """          신경 끄기
        </button>

        {hasPackingList(trip.id) && (
          <button
            onClick={() => setActiveTab('PACK')}
            """ + TAB % 'PACK' + """
          >
            짐 싸기
          </button>
        )}
"""),
    ("""      {/* Checklist Grid (1 col on mobile, 2 cols on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">""",
     """      {activeTab === 'PACK' && <PackingChecklist tripId={trip.id} />}

      {/* Checklist Grid (1 col on mobile, 2 cols on tablet/desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">"""),
    ("{activeTab !== 'IGNORE' && (", "{activeTab !== 'IGNORE' && activeTab !== 'PACK' && ("),
])
print("ok")
