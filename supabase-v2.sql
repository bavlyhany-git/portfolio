-- شغّله مرة واحدة في Supabase > SQL Editor (جدول الرسائل)
create table messages (id bigint generated always as identity primary key, name text, email text, body text not null, created_at timestamptz default now());
alter table messages enable row level security;
create policy "anyone sends" on messages for insert to anon, authenticated with check (true);
create policy "admin reads" on messages for select to authenticated using (true);
create policy "admin deletes" on messages for delete to authenticated using (true);
