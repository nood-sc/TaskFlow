import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

/**
 * 项目列表页（路由：/projects）
 *
 * 讲解要点：
 * 1. 这是 Server Component（没有 'use client'）—— 读取数据在服务器上直接完成，
 *    不需要额外的 API 或 Action（"读"免费，"写"才需要 Action）
 * 2. supabase.from('projects').select('*') —— 查当前用户的所有项目。
 *    注意：我们没有写 where user_id = ? ，因为 RLS 会自动过滤！
 *    数据库层已经保证：只能查到自己的项目
 * 3. 三种状态都要设计：加载中（RSC 天然无 loading）、有数据、空数据
 */
export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
        加载项目失败：{error.message}
      </p>
    )
  }

  return (
    <div>
      {/* 标题行 + 新建按钮 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">我的项目</h1>
        <Link
          href="/projects/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          + 新建项目
        </Link>
      </div>

      {projects.length === 0 ? (
        // 空状态：还没有项目时的引导
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <p className="text-zinc-900">还没有项目</p>
          <p className="mt-1 text-sm text-zinc-600">
            点击右上角"新建项目"，创建你的第一个项目吧
          </p>
        </div>
      ) : (
        // 项目列表
        <ul className="space-y-3">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-2xl border border-zinc-200 bg-white px-5 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-medium text-zinc-900">{project.name}</h2>
                  {project.description && (
                    <p className="mt-1 text-sm text-zinc-600 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-zinc-400">
                  {new Date(project.created_at).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
