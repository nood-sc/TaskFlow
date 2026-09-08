'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** 项目表单的状态：目前只需要错误提示 */
export type ProjectState = {
  error?: string
}

/**
 * 创建项目（Server Action）
 *
 * 关键设计点：
 * 1. user_id 由服务器从登录会话里取（auth.getUser()），
 *    绝不信任前端传上来的值 —— 防止用户伪造"别人"的项目
 * 2. 插入时 RLS 会再检查一次：user_id 必须等于当前登录人，双保险
 * 3. 成功后跳回项目列表，列表页会看到新项目
 */
export async function createProject(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  // 基础校验（与数据库 CHECK 约束一致）
  if (!name) return { error: '项目名称不能为空' }
  if (name.length > 100) return { error: '项目名称不能超过 100 个字' }

  const supabase = await createClient()

  // 从会话取当前登录用户
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '未登录，请先登录' }

  // 插入数据库（RLS 会在数据库层再次校验归属）
  const { error } = await supabase.from('projects').insert({
    name,
    description: description || null,
    user_id: user.id,
  })

  if (error) return { error: error.message }

  redirect('/projects')
}

/** 编辑项目：只更新名称和描述 */
export async function updateProject(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const id = String(formData.get('id') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()

  if (!id) return { error: '缺少项目 ID' }
  if (!name) return { error: '项目名称不能为空' }
  if (name.length > 100) return { error: '项目名称不能超过 100 个字' }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: '未登录，请先登录' }

  const { error } = await supabase
    .from('projects')
    .update({
      name,
      description: description || null,
      updated_at: new Date().toISOString(),
    })
    // 双重条件：id 必须匹配，且 user_id 必须是当前用户
    // （即便 RLS 有漏洞，这里也拦一道）
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  redirect(`/projects/${id}`)
}

/**
 * 删除项目
 *
 * 不需要 useActionState：没有错误要显示，成功直接跳转。
 * 注意：数据库里外键是 ON DELETE CASCADE —— 删除项目时，
 * 该项目下的所有任务会由数据库自动连带删除，不用我们写代码
 */
export async function deleteProject(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  if (!id) return

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id)

  redirect('/projects')
}
