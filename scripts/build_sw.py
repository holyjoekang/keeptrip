"""빌드 후 실행: dist 전체 파일을 미리 저장(precache)하는 서비스워커 dist/sw.js 생성.
사용: python3 scripts/build_sw.py dist
"""
import hashlib, json, os, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
dist = Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / 'dist')
SKIP = {'sw.js', '404.html', '.nojekyll'}

files, h = [], hashlib.sha256()
for p in sorted(dist.rglob('*')):
    if p.is_file() and p.name not in SKIP:
        rel = p.relative_to(dist).as_posix()
        files.append(rel)
        h.update(rel.encode()); h.update(p.read_bytes())

# 중국 일정은 출발 전에 외부 이미지·폰트까지 받아 둔다 (현지에서 구글·unsplash 차단 대비)
snap = json.loads((ROOT / 'src/data/dbSnapshot.json').read_text())
external = [t['hero_image'] for t in snap['trips'] if t['id'] == 'trip-china-2026' and t.get('hero_image')]
html = (dist / 'index.html').read_text()
import re
external += re.findall(r'href="(https://[^"]+\.css[^"]*)"', html) + re.findall(r'href="(https://fonts\.googleapis\.com/css2[^"]+)"', html)
external = sorted(set(u.replace('&amp;', '&') for u in external))

tpl = (ROOT / 'scripts/sw_template.js').read_text()
out = (tpl.replace('__VERSION__', h.hexdigest()[:12])
          .replace('__PRECACHE__', json.dumps(files, ensure_ascii=False))
          .replace('__EXTERNAL__', json.dumps(external, ensure_ascii=False)))
(dist / 'sw.js').write_text(out)
print(f'sw.js: {len(files)} files, {len(external)} external, version {h.hexdigest()[:12]}')
