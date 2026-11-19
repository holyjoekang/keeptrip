"""청두 최종 일정(11/20–22) 새 장소 사진: 위키미디어 공용에서 찾아 public/spots/에 저장 (중국 내 차단 대비).
사용: python3 scripts/fetch_chengdu_final_photos.py → scripts/data/spot_photos_chengdu_final.json"""
import io, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

R = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "KeepTripGuideBuilder/1.0 (travel itinerary app)"}
QUERIES = {
    "chunxi": ["Chunxi Road Chengdu", "Chunxi Road"],
    "daci": ["Daci Temple Chengdu", "Daci Temple", "Taikoo Li Chengdu"],
    "jinjiang": ["Hejiang Pavilion Chengdu", "Anshun Bridge Chengdu", "Jin River Chengdu night"],
    "thebridge": ["Anshun Bridge Chengdu", "Anshun Bridge", "Fuqi feipian"],
    "wuhouci": ["Wuhou Shrine Chengdu", "Wuhou Temple Chengdu", "Wuhouci"],
    "jinli-lunch": ["Dandan noodles", "Dan dan mian", "Chaoshou wonton"],
    "heming": ["People's Park Chengdu teahouse", "People's Park Chengdu", "Heming teahouse"],
    "kuanzhai": ["Kuanzhai Alley Chengdu", "Kuanzhai Xiangzi"],
    "songchuan": ["Sichuan cuisine dish", "Mapo doufu", "Kung Pao chicken"],
}
API = "https://commons.wikimedia.org/w/api.php?"
OK_LIC = re.compile(r"^(CC BY|CC0|Public domain|PD)", re.I)
strip = lambda h: re.sub(r"<[^>]+>", "", h or "").strip()

def search(q):
    p = {"action": "query", "generator": "search", "gsrsearch": f"filetype:bitmap {q}", "gsrnamespace": 6, "gsrlimit": 15,
         "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 960, "format": "json"}
    for a in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(API + urllib.parse.urlencode(p), headers=UA), timeout=30)).get("query", {}).get("pages", {})
        except Exception:
            time.sleep(2 * (a + 1))
    return {}

out = {}
for key, qs in QUERIES.items():
    picked = []
    for q in qs:
        for pg in sorted(search(q).values(), key=lambda x: x.get("index", 99)):
            ii = (pg.get("imageinfo") or [{}])[0]; md = ii.get("extmetadata", {})
            lic = md.get("LicenseShortName", {}).get("value", "")
            if not OK_LIC.match(lic) or max(ii.get("width", 0), ii.get("height", 0)) < 800 or ii.get("width", 0) < ii.get("height", 1) * 0.9:
                continue
            if any(x["file"] == pg["title"] for x in picked):
                continue
            picked.append({"file": pg["title"], "src": ii["thumburl"], "page": ii["descriptionurl"],
                           "author": strip(md.get("Artist", {}).get("value", ""))[:60], "license": lic})
        if len(picked) >= 8:
            break
        time.sleep(1)
    out[key] = picked[:8]
    print(key, len(out[key]), [x["file"][5:70] for x in out[key]], file=sys.stderr)
(R / "scripts/data/spot_photos_chengdu_final.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
