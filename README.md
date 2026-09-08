# TaskFlow 个人任务管理系统

一个基于 **Next.js + Supabase** 的个人任务管理应用：注册登录后，你可以创建项目，在每个项目下管理任务（增删改查、状态切换、筛选、搜索）。所有数据只属于你自己。

## ✨ 功能

- **用户认证**：注册 / 登录 / 退出（Supabase Auth + Email）
- **项目管理**：创建、查看、修改、删除项目
- **任务管理**：创建、查看、修改、删除任务；四种状态切换
- **任务状态**：`todo`（待办）/ `doing`（进行中）/ `done`（已完成）/ `cancelled`（已取消）
- **按状态筛选 + 按标题搜索**（筛选条件存在 URL 里，可刷新、可分享）
- **级联删除**：删除项目时，项目下所有任务自动删除
- **数据隔离**：每个用户只能看到和操作自己的数据（RLS 行级安全）

## 🛠 技术栈

| 层 | 技术 |
|---|---|
| 前端框架 | Next.js 16（App Router）+ React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 后端服务 | Supabase（PostgreSQL + Auth + RLS） |

## 📁 目录结构

```
src/
├── app/
│   ├── (auth)/                 # 登录/注册页（路由组）
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # 受保护页面（路由组）
│   │   ├── layout.tsx          # 登录检查 + 顶部导航
│   │   └── projects/
│   │       ├── page.tsx        # 项目列表
│   │       ├── new/page.tsx    # 新建项目
│   │       └── [id]/           # 项目详情 + 任务管理
│   │           ├── page.tsx
│   │           └── edit/page.tsx
│   ├── actions/                # Server Actions（所有"写"操作）
│   │   ├── auth.ts             # 注册/登录/退出
│   │   ├── projects.ts         # 项目增删改
│   │   └── tasks.ts            # 任务增删改/状态切换
│   └── page.tsx                # 首页（按登录状态跳转）
├── components/
│   ├── projects/               # 项目相关组件
│   └── tasks/                  # 任务相关组件
└── lib/
    ├── supabase/
    │   ├── client.ts           # 浏览器端 Supabase 客户端
    │   └── server.ts           # 服务端 Supabase 客户端
    └── tasks.ts                # 任务状态常量（前后端共用）
supabase/
└── migrations/001_init.sql     # 建表 + 外键 + RLS 策略
```

## 🚀 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（复制模板并填入你的 Supabase 项目值）
#    复制 .env.example 为 .env.local
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的publishable key

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

> 首次使用前，需要在 Supabase 的 **SQL Editor** 运行 `supabase/migrations/001_init.sql` 创建数据表。

## 🗄 数据库设计

**用户 `auth.users`**（Supabase 内置）
- 1 — N **projects**（项目）
- 1 — N **tasks**（任务）

**projects 表**：`id`(uuid 主键) / `user_id`(外键→auth.users) / `name` / `description` / 时间戳

**tasks 表**：`id`(uuid 主键) / `project_id`(外键→projects，`ON DELETE CASCADE`) / `title` / `description` / `status`(CHECK 四种状态，默认 `todo`) / `due_date` / 时间戳

**外键约束**：删项目 → 级联删任务（数据库层面保证）

## 🔐 三层权限设计

| 层 | 作用 |
|---|---|
| ① proxy 守卫 | 未登录访问受保护页面 → 跳登录页 |
| ② Server Action | 写操作从服务端取当前用户，不信任前端传来的归属 |
| ③ RLS 行级安全 | 数据库兜底：查询/写入自动过滤为"自己的数据" |

RLS 策略（见迁移文件）：
- `projects`：`user_id = auth.uid()`
- `tasks`：任务所属项目属于当前用户（通过 `project_id` 关联查询）

## ☁️ 部署到 Vercel

1. 把代码推到 GitHub（本仓库已关联）
2. 在 [vercel.com](https://vercel.com) 用 GitHub 账号登录 → **Add New Project** → 导入本仓库
3. 在环境变量设置里填入 `.env.local` 中的两个变量
4. Deploy 完成，即可获得线上地址

## 📌 说明

- 这是学习项目，代码由 AI 辅助编写，架构讲解贯穿开发全过程
- 数据库密码请妥善保存在本地密码管理器，不要明文外发
