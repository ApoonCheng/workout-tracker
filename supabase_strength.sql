-- ============================================================
-- 重訓紀錄資料表（每一組分開記：動作 + 重量 + 次數）
-- 在 Supabase 專案的 SQL Editor 貼上整段執行一次即可。
-- 原本的 workouts 表保留給「有氧」使用，不需更動。
-- ============================================================

create table if not exists public.strength_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  group_id uuid not null,            -- 同一個動作的多組共用同一個 group_id
  date date not null,
  exercise text not null,            -- 動作名稱（臥推、深蹲…）
  weight numeric,                    -- 重量 kg（徒手可留空）
  reps int,                          -- 次數
  set_order int not null default 1,  -- 第幾組
  created_at timestamptz not null default now()
);

alter table public.strength_sets enable row level security;

create policy "select own sets" on public.strength_sets
  for select using (auth.uid() = user_id);
create policy "insert own sets" on public.strength_sets
  for insert with check (auth.uid() = user_id);
create policy "update own sets" on public.strength_sets
  for update using (auth.uid() = user_id);
create policy "delete own sets" on public.strength_sets
  for delete using (auth.uid() = user_id);

create index if not exists strength_sets_user_date
  on public.strength_sets (user_id, date);
create index if not exists strength_sets_exercise
  on public.strength_sets (user_id, exercise);
