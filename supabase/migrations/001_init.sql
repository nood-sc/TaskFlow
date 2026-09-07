-- ============================================================
-- TaskFlow 初始化迁移：projects + tasks 表、索引、RLS 策略
-- 应用方式（二选一）：
--   A. Supabase 控制台 → SQL Editor → 粘贴本文件全部内容 → Run
--   B. 本地安装 supabase CLI 后执行 supabase db push
-- ============================================================

-- 说明：用户表不用自建。Supabase Auth 自带 auth.users 表，
-- 注册时自动创建用户记录，这里通过外键引用它即可。

-- ------------------------------------------------------------
-- 1. 项目表：一个用户拥有多个项目（用户 1 ── N 项目）
-- ------------------------------------------------------------
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. 任务表：一个项目包含多个任务（项目 1 ── N 任务）
-- ------------------------------------------------------------
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  description text,
  status      text not null default 'todo'
              check (status in ('todo','doing','done','cancelled')),
  due_date    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. 索引：加速查询
--    - 按用户查他的项目
--    - 按项目查它的任务
--    - 按"项目 + 状态"筛选任务
-- ------------------------------------------------------------
create index idx_projects_user_id   on public.projects(user_id);
create index idx_tasks_project_id   on public.tasks(project_id);
create index idx_tasks_project_status on public.tasks(project_id, status);

-- ------------------------------------------------------------
-- 4. 行级安全（RLS）：用户只能访问自己的数据
--    这是数据隔离的最终防线，即使应用代码有漏洞，数据库也会拒绝
-- ------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.tasks    enable row level security;

-- 项目：只有 user_id = 当前登录用户 的行可读可写
create policy "own projects" on public.projects
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 任务：只有"任务所属项目是自己的"才可读可写
create policy "tasks in own projects" on public.tasks
  for all using (
    exists (select 1 from public.projects
            where id = project_id and user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects
            where id = project_id and user_id = auth.uid())
  );
