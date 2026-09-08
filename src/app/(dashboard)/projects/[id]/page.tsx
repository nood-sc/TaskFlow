import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteProjectButton from '@/components/projects/delete-project-button'

/**
 * 项目详情页（路由：/projects/[id]）
 *
 * 讲解要点：
 * 1. 动态路由 [id]：URL 里的任意值都会进这个页面，
 *    比如 /projects/abc-123 → id = "abc-123"
 * 2. Next.js 16 中 params 是 Promise，必须 await
 * 3. maybeSingle() 与 RLS 的组合拳：
 *    - 查不到 → 返回 null（不是报错）
 *    - 查别人的项目 → RLS 自动过滤 → 也是 null → notFound() 显示 404
 *    所以"项目不存在"和"这不是你的项目"对用户都显示 404，不泄露任何信息
 */
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !project) notFound()

  return (
    <div>
      <Link
        href="/projects"
        className="text-sm text-zinc-500 hover:text-zinc-700"
      >
        ← 返回项目列表
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-zinc-900">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-zinc-600">{project.description}</p>
          )}
          <p className="mt-3 text-xs text-zinc-400">
            创建于 {new Date(project.created_at).toLocaleString('zh-CN')}
            {project.updated_at !== project.created_at &&
              ` · 更新于 ${new Date(project.updated_at).toLocaleString('zh-CN')}`}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/projects/${project.id}/edit`}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            编辑
          </Link>
          <DeleteProjectButton projectId={project.id} />
        </div>
      </div>
    </div>
  )
}
