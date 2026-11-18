"""KeepTrip 오프라인 앱(PWA) 구성: 매니페스트·아이콘·서비스워커 등록·오프라인 표시·짐 체크 오프라인 저장.
사용: python3 scripts/make_offline_app.py  (한 번 실행, 다시 실행해도 안전)
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
NAVY, ORANGE = '#1E2856', '#EFA03D'


def edit(path, old, new, marker=None):
    p = ROOT / path
    s = p.read_text()
    if (marker or new) in s:
        return
    assert old in s, f'{path}: 기준 문자열 없음 -> {old[:60]}'
    p.write_text(s.replace(old, new, 1))


# 1) 아이콘
icons = ROOT / 'public/icons'
icons.mkdir(parents=True, exist_ok=True)
font_path = next((f for f in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if Path(f).exists()), None)
for size, pad in [(192, 0), (512, 0), (512, 0.12)]:
    img = Image.new('RGB', (size, size), NAVY)
    d = ImageDraw.Draw(img)
    inner = size * (1 - 2 * pad)
    r = inner * 0.30
    cx = cy = size / 2
    d.ellipse([cx - r, cy - r * 1.25, cx + r, cy + r * 0.75], fill=ORANGE)  # 핀 머리
    d.polygon([(cx - r * 0.72, cy + r * 0.25), (cx + r * 0.72, cy + r * 0.25), (cx, cy + r * 1.55)], fill=ORANGE)
    font = ImageFont.truetype(font_path, int(r * 1.1)) if font_path else ImageFont.load_default()
    d.text((cx, cy - r * 0.25), 'K', fill=NAVY, font=font, anchor='mm')
    name = f'icon-{size}{"-maskable" if pad else ""}.png'
    img.save(icons / name)
Image.open(icons / 'icon-192.png').resize((180, 180)).save(icons / 'apple-touch-icon.png')

# 2) 매니페스트
(ROOT / 'public/manifest.webmanifest').write_text(json.dumps({
    'name': 'KeepTrip · 중국 여행 일정',
    'short_name': 'KeepTrip',
    'description': '인터넷 없이도 열리는 여행 일정·장소 안내·짐 싸기',
    'start_url': './#trip=trip-china-2026',
    'scope': './',
    'display': 'standalone',
    'background_color': '#F4F6F8',
    'theme_color': NAVY,
    'lang': 'ko',
    'icons': [
        {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png'},
        {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png'},
        {'src': 'icons/icon-512-maskable.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
    ],
}, ensure_ascii=False, indent=2) + '\n')

# 3) index.html 메타
edit('index.html', '    <link rel="preconnect" href="https://fonts.googleapis.com">',
     '    <link rel="manifest" href="./manifest.webmanifest" />\n'
     f'    <meta name="theme-color" content="{NAVY}" />\n'
     '    <meta name="apple-mobile-web-app-capable" content="yes" />\n'
     '    <meta name="mobile-web-app-capable" content="yes" />\n'
     '    <meta name="apple-mobile-web-app-title" content="KeepTrip" />\n'
     '    <meta name="apple-mobile-web-app-status-bar-style" content="default" />\n'
     '    <link rel="apple-touch-icon" href="./icons/apple-touch-icon.png" />\n'
     '    <link rel="preconnect" href="https://fonts.googleapis.com">', marker='rel="manifest"')

# 4) 오프라인 상태 표시 컴포넌트
(ROOT / 'src/components/OfflineStatus.tsx').write_text("""import React, { useEffect, useState } from 'react';

/** 오프라인일 때 상단 알림, 처음 오프라인 준비가 끝나면 잠깐 안내 */
export const OfflineStatus: React.FC = () => {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    const onReady = () => { setReady(true); setTimeout(() => setReady(false), 5000); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    window.addEventListener('keeptrip-offline-ready', onReady);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      window.removeEventListener('keeptrip-offline-ready', onReady);
    };
  }, []);

  if (!offline && !ready) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-lg text-xs font-semibold text-white whitespace-nowrap pointer-events-none"
         style={{ background: offline ? '#1E2856' : '#16a34a' }} role="status">
      {offline ? '오프라인 · 저장된 일정 보기' : '오프라인 준비 완료'}
    </div>
  );
};
""")

# 5) main.tsx: 서비스워커 등록 + 상태 표시
edit('src/main.tsx', "createRoot(document.getElementById('root')!).render(<App />);",
     """import { OfflineStatus } from './components/OfflineStatus';
import { flushPackingOutbox } from './lib/db';

createRoot(document.getElementById('root')!).render(<><OfflineStatus /><App /></>);

// 오프라인 앱: 빌드 결과(dist/sw.js)를 등록해 앱·사진·일정 데이터를 기기에 저장
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const first = !navigator.serviceWorker.controller;
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((reg) => {
      const done = () => first && window.dispatchEvent(new Event('keeptrip-offline-ready'));
      if (reg.active && !reg.installing) return;
      const w = reg.installing || reg.waiting;
      w?.addEventListener('statechange', () => w.state === 'activated' && done());
    }).catch((e) => console.warn('서비스워커 등록 실패', e));
  });
}
window.addEventListener('online', () => { flushPackingOutbox(); });
flushPackingOutbox();""", marker='serviceWorker')

# 6) db.ts: 짐 체크는 오프라인에서도 기기에 저장 → 연결되면 자동 전송
edit('src/lib/db.ts', """export const fetchPacking = async (tripId: string) => {
  const groups = await rest<PackingGroupRow[]>(`packing_groups?select=*&trip_id=eq.${encodeURIComponent(tripId)}&order=position,id`);
  const ids = groups.map((g) => g.id).join(',');
  const items = ids ? await rest<PackingItemRow[]>(`packing_items?select=*&group_id=in.(${ids})&order=position,id`) : [];
  return { groups, items };
};""", """const OUTBOX = 'keeptrip_packing_outbox';
const readOutbox = (): Record<string, boolean> => { try { return JSON.parse(localStorage.getItem(OUTBOX) || '{}'); } catch { return {}; } };
const writeOutbox = (o: Record<string, boolean>) => { try { localStorage.setItem(OUTBOX, JSON.stringify(o)); } catch { /* 저장 불가 */ } };
const patchChecked = (id: number, checked: boolean) =>
  rest<PackingItemRow[]>(`packing_items?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ checked }) });

/** 오프라인 동안 쌓인 체크를 서버로 전송 */
export const flushPackingOutbox = async () => {
  const o = readOutbox();
  for (const [id, checked] of Object.entries(o)) {
    try { await patchChecked(Number(id), checked); const cur = readOutbox(); if (cur[id] === checked) { delete cur[id]; writeOutbox(cur); } }
    catch { return; }
  }
};

export const fetchPacking = async (tripId: string) => {
  const groups = await rest<PackingGroupRow[]>(`packing_groups?select=*&trip_id=eq.${encodeURIComponent(tripId)}&order=position,id`);
  const ids = groups.map((g) => g.id).join(',');
  const raw = ids ? await rest<PackingItemRow[]>(`packing_items?select=*&group_id=in.(${ids})&order=position,id`) : [];
  const o = readOutbox();
  const items = raw.map((i) => (String(i.id) in o ? { ...i, checked: o[String(i.id)] } : i));
  return { groups, items };
};""", marker='OUTBOX')
edit('src/lib/db.ts', """export const setPackingChecked = (id: number, checked: boolean) =>
  rest<PackingItemRow[]>(`packing_items?id=eq.${id}`, { method: 'PATCH', body: JSON.stringify({ checked }) });""",
     """export const setPackingChecked = async (id: number, checked: boolean) => {
  try {
    const r = await patchChecked(id, checked);
    const o = readOutbox(); if (String(id) in o) { delete o[String(id)]; writeOutbox(o); }
    return r;
  } catch (e) {
    // 네트워크 없음(TypeError) → 기기에 저장해 두고 연결되면 전송
    if (e instanceof TypeError || !navigator.onLine) { writeOutbox({ ...readOutbox(), [String(id)]: checked }); return []; }
    throw e;
  }
};""", marker='writeOutbox({ ...readOutbox()')

# 7) 짐 싸기 안내 문구
edit('src/components/PackingChecklist.tsx', "{online === false ? '오프라인 (보기만 가능)' : '각 그룹 아래에서 항목을 추가할 수 있어요'}",
     "{online === false || !navigator.onLine ? '오프라인 · 체크는 기기에 저장, 연결되면 자동 반영' : '각 그룹 아래에서 항목을 추가할 수 있어요'}",
     marker='체크는 기기에 저장')
# 체크는 오프라인에서도 가능(기기 저장), 항목 추가·삭제는 연결됐을 때만
edit('src/components/PackingChecklist.tsx', "onClick={() => canEdit && toggle(it)}", "onClick={() => toggle(it)}")
edit('src/components/PackingChecklist.tsx', "const canEdit = online === true;", "const canEdit = online === true && navigator.onLine;", marker='&& navigator.onLine;')

# 8) 빌드에 서비스워커 생성 포함
pkg = json.loads((ROOT / 'package.json').read_text())
pkg['scripts']['build'] = 'vite build && python3 scripts/build_sw.py dist'
(ROOT / 'package.json').write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n')
edit('.github/workflows/pages.yml', "      - run: cp dist/index.html dist/404.html && touch dist/.nojekyll",
     "      # 오프라인 앱: dist 전체를 미리 저장하는 서비스워커 생성\n"
     "      - run: python3 scripts/build_sw.py dist\n"
     "      - run: cp dist/index.html dist/404.html && touch dist/.nojekyll", marker='build_sw.py')
print('done')
