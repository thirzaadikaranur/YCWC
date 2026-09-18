-- ReverseTutor — RLS hardening: kepemilikan topic_id pada tabel anak
--
-- Latar belakang: policy awal hanya memeriksa `auth.uid() = user_id`. Itu sudah
-- mencegah user LAIN membaca data kita, tetapi masih memungkinkan user B
-- menempelkan baris sessions/understanding_map/score_history ke `topic_id`
-- milik user A lewat REST API langsung (Route Handler kita menolaknya lewat
-- fetchTopic, tapi RLS seharusnya tetap aman meski diakses langsung).
--
-- Migrasi ini menambahkan syarat bahwa `topic_id` harus milik user yang login.
-- Idempotent: aman dijalankan berulang.

drop policy if exists "Users manage own sessions" on public.sessions;
create policy "Users manage own sessions" on public.sessions
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.topics t
      where t.id = topic_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own understanding_map" on public.understanding_map;
create policy "Users manage own understanding_map" on public.understanding_map
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.topics t
      where t.id = topic_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own score_history" on public.score_history;
create policy "Users manage own score_history" on public.score_history
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.topics t
      where t.id = topic_id and t.user_id = auth.uid()
    )
  );
