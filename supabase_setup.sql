-- ============================================================
-- 在 Supabase 專案的 SQL Editor 貼上整段執行一次即可。
-- 它會：建立 workouts 資料表 + 開啟資料列權限（RLS），
-- 確保每個人只看得到、只能改自己的紀錄。
-- ============================================================

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  type text not null,
  duration int,
  distance numeric,
  note text,
  created_at timestamptz not null default now()
);

-- 開啟資料列層級安全性
alter table public.workouts enable row level security;

-- 只能讀自己的紀錄
create policy "select own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

-- 只能新增屬於自己的紀錄
create policy "insert own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

-- 只能修改自己的紀錄
create policy "update own workouts"
  on public.workouts for update
  using (auth.uid() = user_id);

-- 只能刪除自己的紀錄
create policy "delete own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);
