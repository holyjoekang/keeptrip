"""카카오톡으로 보낼 수 있는 '파일 하나짜리' 오프라인 앱 생성 (인터넷·설치 없이 열림).
JS·CSS·장소 사진·대표 사진을 모두 HTML 한 파일에 넣는다.
사용: python3 scripts/build_offline_file.py  → offline/KeepTrip_중국여행.html
"""
import base64, io, json, os, re, subprocess, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'offline'
BUILD = ROOT / 'build' / 'offline'
TRIP = 'trip-china-2026'


def edit(path, old, new, marker):
    p = ROOT / path
    s = p.read_text()
    if marker in s:
        return
    assert old in s, f'{path}: 기준 문자열 없음'
    p.write_text(s.replace(old, new, 1))


# 1) 소스: 사진은 파일 안에 넣은 데이터 우선, file:// 에서는 서비스워커 등록 안 함
edit('src/utils/spotGuide.ts', 'export const photoUrl = (src: string) => `${import.meta.env.BASE_URL}${src}`;',
     'export const photoUrl = (src: string) =>\n'
     '  ((window as unknown as { __KT_IMG__?: Record<string, string> }).__KT_IMG__?.[src]) || `${import.meta.env.BASE_URL}${src}`;',
     '__KT_IMG__')
edit('src/main.tsx', "if (import.meta.env.PROD && 'serviceWorker' in navigator) {",
     "if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {",
     "location.protocol.startsWith('http')")

# 2) 빌드 (상대 경로)
subprocess.run(['npx', 'vite', 'build', '--outDir', str(BUILD), '--emptyOutDir'], cwd=ROOT, check=True,
               env={**os.environ, 'VITE_BASE': './'})


def jpeg_data_uri(raw: bytes, max_side=900, q=70) -> str:
    im = Image.open(io.BytesIO(raw)).convert('RGB')
    im.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


# 3) 장소 사진 → data URI
snap = json.loads((ROOT / 'src/data/dbSnapshot.json').read_text())
imgs = {}
for g in snap['guides']:
    for ph in g.get('photos') or []:
        f = ROOT / 'public' / ph['src']
        if ph['src'] not in imgs and f.exists():
            imgs[ph['src']] = jpeg_data_uri(f.read_bytes())

# 4) JS·CSS 인라인, 중국 일정 대표 사진도 파일 안으로
html = (BUILD / 'index.html').read_text()
js_path = re.search(r'<script type="module" crossorigin src="\./(assets/[^"]+\.js)"></script>', html)
css_path = re.search(r'<link rel="stylesheet" crossorigin href="\./(assets/[^"]+\.css)">', html)
js = (BUILD / js_path.group(1)).read_text().replace('</script', '<\\/script')
css = (BUILD / css_path.group(1)).read_text()

hero = next(t['hero_image'] for t in snap['trips'] if t['id'] == TRIP)
try:
    req = urllib.request.Request(hero.replace('w=1600&q=80', 'w=1200&q=70'), headers={'User-Agent': 'Mozilla/5.0'})
    hero_uri = jpeg_data_uri(urllib.request.urlopen(req, timeout=30).read(), 1200, 68)
    js = js.replace(hero, hero_uri)
except Exception as e:  # 실패하면 온라인일 때만 보임
    print('대표 사진 받기 실패:', e)

boot = ('<script>window.__KT_IMG__=' + json.dumps(imgs) + ';'
        f"if(!location.hash)location.hash='#trip={TRIP}';</script>")
html = html.replace(js_path.group(0), '')
html = html.replace(css_path.group(0), f'<style>{css}</style>')
html = re.sub(r'\s*<link rel="(manifest|apple-touch-icon)"[^>]*>', '', html)
html = html.replace('</body>', f'{boot}\n<script type="module">{js}</script>\n</body>')
html = html.replace('<title>KeepTrip · Every trip, kept.</title>', '<title>KeepTrip · 중국 여행 (오프라인)</title>')

OUT_DIR.mkdir(exist_ok=True)
out = OUT_DIR / 'KeepTrip_중국여행.html'
out.write_text(html)
print(f'{out.relative_to(ROOT)}: {out.stat().st_size / 1e6:.1f} MB, 사진 {len(imgs)}장')
