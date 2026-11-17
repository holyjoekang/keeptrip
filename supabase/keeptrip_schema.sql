-- KeepTrip DB 스키마 (Supabase / Postgres). 여러 번 실행해도 안전(idempotent).
create table if not exists trips (
  id text primary key,
  title text not null,
  subtitle text,
  date_range text,
  duration_text text,
  party_text text,
  destination_type text,
  hero_image text,
  default_budget_krw integer,
  key_rules jsonb not null default '[]',
  best_moments jsonb,
  initial_voice_notes jsonb,
  source_url text,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists trip_days (
  trip_id text not null references trips(id) on delete cascade,
  day_number integer not null,
  date text, day_of_week text, city text, theme text,
  day_highlights jsonb not null default '[]',
  day_reflection text,
  primary key (trip_id, day_number)
);

create table if not exists trip_stops (
  id bigint generated always as identity primary key,
  trip_id text not null,
  day_number integer not null,
  position integer not null,
  stop_key text,               -- 기존 stop id (예: stop-cn-1)
  time text, title text not null, description text, category text,
  fee_tip text, smart_tip text, docent jsonb, is_recommended boolean,
  local_name text, address text, guide_id text,
  unique (trip_id, day_number, position),
  foreign key (trip_id, day_number) references trip_days(trip_id, day_number) on delete cascade
);

create table if not exists checklist_items (
  trip_id text not null references trips(id) on delete cascade,
  id text not null,
  position integer not null default 0,
  tier text not null, category text, title text not null, description text,
  estimated_saving_krw integer, action_tip text,
  primary key (trip_id, id)
);

create table if not exists spot_guides (
  id text primary key,
  name text not null, local_name text, address text, summary text,
  info jsonb not null default '[]', good jsonb not null default '[]', caution jsonb not null default '[]',
  sources jsonb not null default '[]', photos jsonb not null default '[]', photo_note text
);

create table if not exists packing_groups (
  id bigint generated always as identity primary key,
  trip_id text not null references trips(id) on delete cascade,
  position integer not null default 0,
  name text not null, icon text default '📝',
  is_custom boolean not null default false,
  unique (trip_id, name)
);

create table if not exists packing_items (
  id bigint generated always as identity primary key,
  group_id bigint not null references packing_groups(id) on delete cascade,
  position integer not null default 0,
  title text not null, note text,
  is_custom boolean not null default false,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (group_id, title)
);

-- 읽기: 누구나 / 쓰기: 짐 싸기만 앱에서(추가 · 체크 · 내가 추가한 것만 삭제)
alter table trips enable row level security;
alter table trip_days enable row level security;
alter table trip_stops enable row level security;
alter table checklist_items enable row level security;
alter table spot_guides enable row level security;
alter table packing_groups enable row level security;
alter table packing_items enable row level security;

do $$
declare t text;
begin
  foreach t in array array['trips','trip_days','trip_stops','checklist_items','spot_guides','packing_groups','packing_items'] loop
    execute format('drop policy if exists "read all" on %I', t);
    execute format('create policy "read all" on %I for select using (true)', t);
  end loop;
end $$;

drop policy if exists "add group" on packing_groups;
create policy "add group" on packing_groups for insert with check (is_custom);
drop policy if exists "delete own group" on packing_groups;
create policy "delete own group" on packing_groups for delete using (is_custom);
drop policy if exists "add item" on packing_items;
create policy "add item" on packing_items for insert with check (is_custom);
drop policy if exists "check item" on packing_items;
create policy "check item" on packing_items for update using (true) with check (true);
drop policy if exists "delete own item" on packing_items;
create policy "delete own item" on packing_items for delete using (is_custom);

revoke all on trips, trip_days, trip_stops, checklist_items, spot_guides, packing_groups, packing_items from anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, delete on packing_groups to anon, authenticated;
grant insert, update (checked), delete on packing_items to anon, authenticated;

-- 앱에서 새 일정 등록 (기존 일정 덮어쓰기 불가)
create or replace function add_trip(t jsonb) returns text
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from trips where id = t->>'id') then
    raise exception 'trip % already exists', t->>'id';
  end if;
  insert into trips (id, title, subtitle, date_range, duration_text, party_text, destination_type, hero_image,
    default_budget_krw, key_rules, best_moments, source_url, sort_order)
  values (t->>'id', t->>'title', t->>'subtitle', t->>'dateRange', t->>'durationText', t->>'partyText',
    t->>'destinationType', t->>'heroImage', (t->>'defaultBudgetKrw')::int, coalesce(t->'keyRules', '[]'),
    t->'bestMoments', t->>'sourceUrl', (select coalesce(min(sort_order), 0) - 1 from trips));
  insert into trip_days
    select t->>'id', (d->>'dayNumber')::int, d->>'date', d->>'dayOfWeek', d->>'city', d->>'theme',
      coalesce(d->'dayHighlights', '[]'), d->>'dayReflection'
    from jsonb_array_elements(coalesce(t->'days', '[]')) d;
  insert into trip_stops (trip_id, day_number, position, stop_key, time, title, description, category, fee_tip,
    smart_tip, docent, is_recommended, local_name, address, guide_id)
    select t->>'id', (d->>'dayNumber')::int, (s.ord - 1)::int, s.v->>'id', s.v->>'time', s.v->>'title',
      s.v->>'description', s.v->>'category', s.v->>'feeTip', s.v->>'smartTip', s.v->'docent',
      (s.v->>'isRecommended')::boolean, s.v->>'localName', s.v->>'address', s.v->>'guideId'
    from jsonb_array_elements(coalesce(t->'days', '[]')) d,
      jsonb_array_elements(coalesce(d->'stops', '[]')) with ordinality s(v, ord);
  insert into checklist_items (trip_id, id, position, tier, category, title, description, estimated_saving_krw, action_tip)
    select t->>'id', c.v->>'id', (c.ord - 1)::int, c.v->>'tier', c.v->>'category', c.v->>'title',
      c.v->>'description', (c.v->>'estimatedSavingKrw')::int, c.v->>'actionTip'
    from jsonb_array_elements(coalesce(t->'checklist', '[]')) with ordinality c(v, ord);
  return t->>'id';
end $$;
revoke all on function add_trip(jsonb) from public;
grant execute on function add_trip(jsonb) to anon, authenticated;
