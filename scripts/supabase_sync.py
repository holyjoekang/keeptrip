"""KeepTrip ↔ Supabase 동기화 (Supabase 관리 API 사용, 토큰은 네트워크 프록시가 주입).

  python3 scripts/supabase_sync.py setup   # keepTrip 프로젝트 찾기/생성 + 스키마 + 앱 접속 설정 파일
  python3 scripts/supabase_sync.py push    # 번들 데이터(일정·장소안내·준비물) → DB (짐싸기 체크/추가 항목은 보존)
  python3 scripts/supabase_sync.py pull    # DB → src/data/dbSnapshot.json (오프라인 대비 스냅샷)

새 일정 추가: Supabase 대시보드(Table editor)에서 trips → trip_days → trip_stops 순으로 행 추가하면 앱에 바로 반영.
"""
import json, os, secrets, sys, time, urllib.request, urllib.error
from pathlib import Path

R = Path(__file__).resolve().parent.parent
API = "https://api.supabase.com/v1"
NAME = "keepTrip"
CFG = R / "src/data/supabaseConfig.json"

def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=None if body is None else json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "Authorization": "Bearer proxy-injected",
                                          "User-Agent": "keeptrip-sync"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            t = r.read().decode()
            return json.loads(t) if t else None
    except urllib.error.HTTPError as e:
        raise SystemExit(f"{method} {path} → {e.code}: {e.read().decode()[:500]}")

def project():
    for p in call("GET", "/projects"):
        if p["name"].lower() == NAME.lower():
            return p
    return None

def ref():
    if CFG.exists():
        return json.loads(CFG.read_text())["ref"]
    p = project()
    if not p:
        raise SystemExit("keepTrip 프로젝트가 없습니다. 먼저 setup 실행")
    return p["id"]

def sql(q):
    return call("POST", f"/projects/{ref()}/database/query", {"query": q})

def J(obj):
    s = json.dumps(obj, ensure_ascii=False)
    assert "$kt$" not in s
    return f"$kt${s}$kt$::jsonb"

def setup():
    p = project()
    if not p:
        orgs = call("GET", "/organizations")
        org = orgs[0]["id"]
        print("프로젝트 생성:", NAME, "org", orgs[0]["name"])
        p = call("POST", "/projects", {"name": NAME, "organization_id": org, "region": "ap-northeast-2",
                                       "db_pass": secrets.token_urlsafe(24)})
    pid = p["id"]
    for _ in range(60):
        st = call("GET", f"/projects/{pid}")["status"]
        if st == "ACTIVE_HEALTHY":
            break
        print("대기:", st); time.sleep(10)
    keys = call("GET", f"/projects/{pid}/api-keys")
    anon = next(k["api_key"] for k in keys if k["name"] == "anon")
    CFG.write_text(json.dumps({"ref": pid, "url": f"https://{pid}.supabase.co", "anonKey": anon}, indent=1) + "\n")
    sql((R / "supabase/keeptrip_schema.sql").read_text(encoding="utf-8"))
    print("ok:", pid)

def push():
    trips = json.loads((R / "scripts/data/trips_export.json").read_text(encoding="utf-8"))
    guides = json.loads((R / "src/data/spotGuides.json").read_text(encoding="utf-8"))
    packing = json.loads((R / "src/data/packingLists.json").read_text(encoding="utf-8"))
    trows, drows, srows, crows = [], [], [], []
    for i, t in enumerate(trips):
        trows.append({"id": t["id"], "title": t["title"], "subtitle": t.get("subtitle"), "date_range": t.get("dateRange"),
                      "duration_text": t.get("durationText"), "party_text": t.get("partyText"),
                      "destination_type": t.get("destinationType"), "hero_image": t.get("heroImage"),
                      "default_budget_krw": t.get("defaultBudgetKrw"), "key_rules": t.get("keyRules", []),
                      "best_moments": t.get("bestMoments"), "initial_voice_notes": t.get("initialVoiceNotes"),
                      "source_url": t.get("sourceUrl"), "sort_order": i})
        for d in t["days"]:
            drows.append({"trip_id": t["id"], "day_number": d["dayNumber"], "date": d.get("date"), "day_of_week": d.get("dayOfWeek"),
                          "city": d.get("city"), "theme": d.get("theme"), "day_highlights": d.get("dayHighlights", []),
                          "day_reflection": d.get("dayReflection")})
            for j, s in enumerate(d["stops"]):
                srows.append({"trip_id": t["id"], "day_number": d["dayNumber"], "position": j, "stop_key": s.get("id"),
                              "time": s.get("time"), "title": s["title"], "description": s.get("description"),
                              "category": s.get("category"), "fee_tip": s.get("feeTip"), "smart_tip": s.get("smartTip"),
                              "docent": s.get("docent"), "is_recommended": s.get("isRecommended"),
                              "local_name": s.get("localName"), "address": s.get("address"), "guide_id": s.get("guideId")})
        for j, c in enumerate(t.get("checklist", [])):
            crows.append({"trip_id": t["id"], "id": c["id"], "position": j, "tier": c["tier"], "category": c.get("category"),
                          "title": c["title"], "description": c.get("description"),
                          "estimated_saving_krw": c.get("estimatedSavingKrw"), "action_tip": c.get("actionTip")})
    grows = [{"id": k, "name": g["name"], "local_name": g.get("localName"), "address": g.get("address"), "summary": g.get("summary"),
              "info": g.get("info", []), "good": g.get("good", []), "caution": g.get("caution", []), "sources": g.get("sources", []),
              "photos": g.get("photos", []), "photo_note": g.get("photoNote")} for k, g in guides.items()]
    ids = J([t["id"] for t in trips])
    q = f"""
begin;
insert into trips (id, title, subtitle, date_range, duration_text, party_text, destination_type, hero_image,
  default_budget_krw, key_rules, best_moments, initial_voice_notes, source_url, sort_order)
  select id, title, subtitle, date_range, duration_text, party_text, destination_type, hero_image,
  default_budget_krw, coalesce(key_rules, '[]'), best_moments, initial_voice_notes, source_url, sort_order
  from jsonb_populate_recordset(null::trips, {J(trows)})
  on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, date_range=excluded.date_range,
  duration_text=excluded.duration_text, party_text=excluded.party_text, destination_type=excluded.destination_type,
  hero_image=excluded.hero_image, default_budget_krw=excluded.default_budget_krw, key_rules=excluded.key_rules,
  best_moments=excluded.best_moments, initial_voice_notes=excluded.initial_voice_notes, source_url=excluded.source_url,
  sort_order=excluded.sort_order, updated_at=now();
delete from trip_days where trip_id = any(array(select jsonb_array_elements_text({ids})));
"""
    q += f"""
insert into trip_days select trip_id, day_number, date, day_of_week, city, theme, coalesce(day_highlights, '[]'), day_reflection
  from jsonb_populate_recordset(null::trip_days, {J(drows)});
insert into trip_stops (trip_id, day_number, position, stop_key, time, title, description, category, fee_tip, smart_tip,
  docent, is_recommended, local_name, address, guide_id)
  select trip_id, day_number, position, stop_key, time, title, description, category, fee_tip, smart_tip,
  docent, is_recommended, local_name, address, guide_id
  from jsonb_populate_recordset(null::trip_stops, {J(srows)});
delete from checklist_items where trip_id = any(array(select jsonb_array_elements_text({ids})));
insert into checklist_items select * from jsonb_populate_recordset(null::checklist_items, {J(crows)});
insert into spot_guides select * from jsonb_populate_recordset(null::spot_guides, {J(grows)})
  on conflict (id) do update set name=excluded.name, local_name=excluded.local_name, address=excluded.address,
  summary=excluded.summary, info=excluded.info, good=excluded.good, caution=excluded.caution, sources=excluded.sources,
  photos=excluded.photos, photo_note=excluded.photo_note;
"""
    for tid, groups in packing.items():
        for gi, g in enumerate(groups):
            q += f"""
insert into packing_groups (trip_id, position, name, icon) values ({lit(tid)}, {gi}, {lit(g['group'])}, {lit(g['icon'])})
  on conflict (trip_id, name) do update set position=excluded.position, icon=excluded.icon;
insert into packing_items (group_id, position, title, note)
  select (select id from packing_groups where trip_id={lit(tid)} and name={lit(g['group'])}), x.position, x.title, x.note
  from jsonb_to_recordset({J([{'position': i, 'title': it['title'], 'note': it.get('note')} for i, it in enumerate(g['items'])])})
  as x(position int, title text, note text)
  on conflict (group_id, title) do update set position=excluded.position, note=excluded.note;"""
    q += "\ncommit;"
    sql(q)
    cnt = sql("select (select count(*) from trips) t, (select count(*) from trip_stops) s, (select count(*) from spot_guides) g, (select count(*) from packing_items) p")
    print("push ok:", cnt)

def lit(s):
    return "'" + str(s).replace("'", "''") + "'"

def pull():
    rows = sql("""
select json_build_object(
 'trips', (select coalesce(json_agg(t order by sort_order), '[]') from trips t),
 'days', (select coalesce(json_agg(d order by trip_id, day_number), '[]') from trip_days d),
 'stops', (select coalesce(json_agg(s order by trip_id, day_number, position), '[]') from trip_stops s),
 'checklist', (select coalesce(json_agg(c order by trip_id, position), '[]') from checklist_items c),
 'guides', (select coalesce(json_agg(g), '[]') from spot_guides g),
 'packingGroups', (select coalesce(json_agg(p order by trip_id, position), '[]') from packing_groups p),
 'packingItems', (select coalesce(json_agg(i order by group_id, position, id), '[]') from packing_items i)
) as snap""")
    snap = rows[0]["snap"]
    (R / "src/data/dbSnapshot.json").write_text(json.dumps(snap, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print("pull ok:", {k: len(v) for k, v in snap.items()})

if __name__ == "__main__":
    {"setup": setup, "push": push, "pull": pull}[sys.argv[1] if len(sys.argv) > 1 else "push"]()
