'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TASK_STATUSES } from '@/lib/tasks'

export type TaskState = {
  error?: string
}

/**
 * ============ 任务的四个操作：新建 / 编辑 / 切换状态 / 删除 ============
 *
 * 任务表里没有 user_id —— 任务的归属通过 project_id 间接确定：
 * "我的项目里的任务才是我的任务"，这一规则由 RLS 策略
 * "tasks in own projects"（查 project 是否属于自己）保证。
 * 所以这里的代码不需要手动校验归属，RLS 在数据库层拦截。
 */

/** 新建任务 */
export async function createTask(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const projectId = String(formData.get('projectId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const dueDate = String(formData.get('dueDate') ?? '').trim()

  if (!projectId) return { error: '缺少项目 ID' }
  if (!title) return { error: '任务标题不能为空' }
  if (title.length > 200) return { error: '任务标题不能超过 200 个字' }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '未登录，请先登录' }

  // project_id 指向别人的项目时，RLS 会拒绝这次插入
  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    title,
    description: description || null,
    due_date: dueDate || null,
  })

  if (error) return { error: error.message }

  // 创建成功后回到项目详情页（任务列表就在那里）
  redirect(`/projects/${projectId}`)
}

/** 编辑任务（标题 / 描述 / 截止时间） */
export async function updateTask(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const id = String(formData.get('id') ?? '')
  const projectId = String(formData.get('projectId') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const dueDate = String(formData.get('dueDate') ?? '').trim()

  if (!id || !projectId) return { error: '缺少任务或项目 ID' }
  if (!title) return { error: '任务标题不能为空' }

  const supabase = await createClient()

  // 只按 id 更新，RLS 会保证这个任务属于当前用户的项目
  const { error } = await supabase
    .from('tasks')
    .update({
      title,
      description: description || null,
      due_date: dueDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { error: error.message }

  redirect(`/projects/${projectId}`)
}

/** 切换任务状态（todo / doing / done / cancelled） */
export async function updateTaskStatus(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const projectId = String(formData.get('projectId') ?? '')
  const status = String(formData.get('status') ?? '')

  // 状态必须是四种之一，防止注入任意值
  if (!id || !projectId || !TASK_STATUSES.includes(status as never)) return

  const supabase = await createClient()

  await supabase
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  redirect(`/projects/${projectId}`)
}

/** 删除任务 */
export async function deleteTask(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const projectId = String(formData.get('projectId') ?? '')

  if (!id || !projectId) return

  const supabase = await createClient()

  await supabase.from('tasks').delete().eq('id', id)

  redirect(`/projects/${projectId}`)
}
