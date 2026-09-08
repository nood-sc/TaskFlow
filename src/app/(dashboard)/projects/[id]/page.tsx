import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DeleteProjectButton from '@/components/projects/delete-project-button'
import TaskForm from '@/components/tasks/task-form'
import TaskItem from '@/components/tasks/task-item'
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/lib/tasks'

/**
 * 项目详情页 + 任务列表（路由：/projects/[id]）
 *
 * 今天的新知识点 —— searchParams（URL 查询参数）：
 * 筛选状态和搜索词都存在 URL 里：/projects/xxx?status=doing&q=看书
 *  - 好处 1：刷新页面、分享链接，筛选状态不丢（"状态在 URL，不在内存"）
 *  - 好处 2：筛选/搜索用原生 GET 表单提交，浏览器自动拼 URL，不用写 JS
 *  - 好处 3：这是服务端筛选——数据在服务器过滤完再发给浏览器，不泄露无关数据
 */
export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string; q?: string; edit?: string }>
}) {
  const { id } = await params
  const { status, q, edit } = await searchParams

  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !project) notFound()

  // ---- 编辑模式：?edit=任务ID 时，查出这条任务传给表单预填 ----
  let editTask = null
  if (edit) {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', edit)
      .eq('project_id', id) // 双重条件：必须是这个项目下的任务
      .maybeSingle()
    if (data) editTask = data
  }

  // ---- 任务查询：RLS 过滤归属 + 可选状态筛选 + 可选标题搜索 ----
  let query = supabase.from('tasks').select('*').eq('project_id', id)

  // 只接受白名单里的状态值，其他一律忽略（防注入非法值）
  const activeStatus =
    status && (TASK_STATUSES as readonly string[]).includes(status) ? status : null
  if (activeStatus) query = query.eq('status', activeStatus)

  const keyword = q?.trim()
  if (keyword) query = query.ilike('title', `%${keyword}%`)

  const { data: tasks } = await query.order('created_at', { ascending: false })

  // ---- 筛选标签的链接：保留搜索词，切换状态 ----
  const filterLink = (value: string | null) => {
    const params = new URLSearchParams()
    if (value) params.set('status', value)
    if (keyword) params.set('q', keyword)
    const qs = params.toString()
    return `/projects/${id}${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <Link href="/projects" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← 返回项目列表
      </Link>

      {/* 项目信息 */}
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-zinc-900">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-zinc-600">{project.description}</p>
          )}
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

      {/* 任务区 */}
      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900">任务</h2>
          {/* 编辑模式：传 task 让表单预填；否则是新建模式 */}
          <TaskForm projectId={project.id} task={editTask} />
        </div>

        {/* 状态筛选标签 */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Link
            href={filterLink(null)}
            className={`rounded-full px-3 py-1 text-sm ${
              !activeStatus
                ? 'bg-zinc-900 text-white'
                : 'bg-white text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            全部
          </Link>
          {TASK_STATUSES.map((statusValue) => (
            <Link
              key={statusValue}
              href={filterLink(statusValue)}
              className={`rounded-full px-3 py-1 text-sm ${
                activeStatus === statusValue
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {TASK_STATUS_LABELS[statusValue]}
            </Link>
          ))}
        </div>

        {/* 标题搜索框：原生 GET 表单，提交后 URL 变成 ?q=... */}
        <form
          method="GET"
          action={`/projects/${project.id}`}
          className="mb-5 flex gap-2"
        >
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <input
            name="q"
            type="text"
            defaultValue={keyword ?? ''}
            placeholder="搜索任务标题…"
            className="flex-1 rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            搜索
          </button>
        </form>

        {/* 任务列表 / 空状态 */}
        {!tasks || tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <p className="text-zinc-900">
              {activeStatus || keyword ? '没有符合条件的任务' : '还没有任务'}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {activeStatus || keyword
                ? '换个筛选条件或搜索词试试'
                : '点击"新建任务"添加第一个任务吧'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} projectId={project.id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
