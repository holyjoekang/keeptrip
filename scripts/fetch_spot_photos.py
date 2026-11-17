"""위키미디어 공용(Commons)에서 장소별 자유 이용 사진을 찾아 scripts/data/spot_photos.json에 저장."""
import json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path

R = Path(__file__).resolve().parent
UA = {"User-Agent": "KeepTripGuideBuilder/1.0 (travel itinerary app)"}
QUERIES = {
    "icn-t1": ["Incheon International Airport Terminal 1"],
    "ckg-t3": ["Chongqing Jiangbei International Airport Terminal 3"],
    "hotel-cq": ["Raffles City Chongqing", "Chaotianmen Chongqing"],
    "xiuniang": ["串串香", "chuan chuan xiang", "Sichuan skewer hot pot"],
    "hongyadong": ["Hongyadong Chongqing night", "Qiansimen Bridge"],
    "xiaomian": ["Chongqing xiaomian noodles", "Chongqing noodles"],
    "topia": ["Jiefangbei Chongqing", "Jiefangbei pedestrian street"],
    "liziba": ["Liziba", "Liziba station", "Chongqing Rail Transit Line 2 Liziba"],
    "eling2": ["Eling Park Chongqing", "Eling Chongqing"],
    "totomato": ["戴家巷", "Daijia Lane Chongqing", "Hongya Cave Chongqing", "Yuzhong Chongqing Jialing River"],
    "pipayuan": ["Chongqing hot pot", "Chongqing hotpot"],
    "yikeshu": ["一棵树观景台", "Nanshan Chongqing night", "Chongqing Yuzhong night skyline"],
    "shapingba": ["Shapingba railway station"],
    "crh": ["Chengdu East railway station", "CR400AF"],
    "hotel-cd": ["Chengdu Taikoo Li", "Daci Temple Chengdu", "Chunxi Road Chengdu"],
    "wansan": ["Ranmian Yibin noodles", "Yibin burning noodles", "Sichuan noodles"],
    "shuijingfang": ["Shuijingfang", "Shuijingfang distillery site", "baijiu"],
    "chenmapo": ["Mapo tofu", "Chen Mapo Tofu"],
    "jinli": ["Jinli Street Chengdu", "Jinli Chengdu night"],
    "jiezi": ["街子古镇", "Jiezi", "Chongzhou ancient town"],
    "jiezi-lunch": ["豆花饭", "Douhua tofu pudding", "Chinese chicken soup"],
    "woos": ["Sichuan cuisine", "辣子鸡", "Chongqing chicken chili", "Sichuan food"],
    "tfu": ["Chengdu Tianfu International Airport"],
}
API = "https://commons.wikimedia.org/w/api.php?"
BAD = re.compile(r"hyacinth|muscari|Wanzhou|Shenzhen|Toilet|Sukiya|FamilyMart|Tokyo|Model of|planeringshelg|Ankara", re.I)
OK_LIC = re.compile(r"^(CC BY|CC0|Public domain|PD)", re.I)

def search(q, n=12):
    params = {"action": "query", "generator": "search", "gsrsearch": f"filetype:bitmap {q}", "gsrnamespace": 6,
              "gsrlimit": n, "prop": "imageinfo", "iiprop": "url|extmetadata|size", "iiurlwidth": 960, "format": "json"}
    for attempt in range(4):
        try:
            req = urllib.request.Request(API + urllib.parse.urlencode(params), headers=UA)
            return json.load(urllib.request.urlopen(req, timeout=30)).get("query", {}).get("pages", {})
        except Exception as e:
            time.sleep(2 * (attempt + 1))
    return {}

def strip(h):
    return re.sub(r"<[^>]+>", "", h or "").strip()

out = {}
for key, qs in QUERIES.items():
    picked = []
    for q in qs:
        pages = sorted(search(q).values(), key=lambda p: p.get("index", 99))
        for p in pages:
            ii = (p.get("imageinfo") or [{}])[0]
            md = ii.get("extmetadata", {})
            lic = md.get("LicenseShortName", {}).get("value", "")
            if BAD.search(p["title"]) or not OK_LIC.match(lic) or (ii.get("width", 0) < 800 and ii.get("height", 0) < 800) or ii.get("width", 0) < ii.get("height", 1) * (0.6 if key in ("liziba","jiezi","totomato") else 0.9):
                continue
            if any(x["file"] == p["title"] for x in picked):
                continue
            picked.append({"file": p["title"], "src": ii["thumburl"].split("?")[0], "page": ii["descriptionurl"],
                           "author": strip(md.get("Artist", {}).get("value", ""))[:60], "license": lic,
                           "desc": strip(md.get("ImageDescription", {}).get("value", ""))[:120]})
        if len(picked) >= 6:
            break
        time.sleep(1)
    out[key] = picked[:6]
    print(key, len(out[key]), [x["file"][5:60] for x in out[key]], file=sys.stderr)
(R / "data/spot_photos.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
