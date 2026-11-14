-- شغّله في Supabase > SQL Editor
create table site_data (id int primary key, data jsonb not null, updated_at timestamptz default now());
create table events (id bigint generated always as identity primary key, type text not null check (type in ('visit','click')), label text default '', created_at timestamptz default now());
alter table site_data enable row level security;
alter table events enable row level security;
create policy "public read" on site_data for select using (true);
create policy "admin insert" on site_data for insert to authenticated with check (true);
create policy "admin update" on site_data for update to authenticated using (true) with check (true);
create policy "anyone logs" on events for insert to anon, authenticated with check (true);
create policy "admin reads events" on events for select to authenticated using (true);
