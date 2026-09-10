-- ============================================================
-- TaskFlow 迁移 002：tasks 表增加 priority（任务优先级）
-- 应用方式：Supabase 控制台 → SQL Editor → 粘贴本文件全部内容 → Run
-- ============================================================

-- 给"任务登记表"加一栏"优先级"：
--   - text 类型：存 'low' / 'medium' / 'high'（数据库存英文，界面显示中文）
--   - not null：不能为空
--   - default 'medium'：没填默认"中"；已有旧任务自动补成"中"
--   - check：只准填 low / medium / high 三种值，乱填的数据库直接拒绝
alter table public.tasks
  add column priority text not null default 'medium'
  check (priority in ('low','medium','high'));

-- 顺手加一个索引：以后按"项目 + 优先级"筛选任务更快
-- （和 001 里的 idx_tasks_project_status 一个思路）
create index idx_tasks_project_priority on public.tasks(project_id, priority);
