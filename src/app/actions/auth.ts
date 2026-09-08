'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * ============ 认证三件套：注册 / 登录 / 退出 ============
 *
 * 这里的三个函数叫 Server Action（服务端动作）：
 * - 文件顶部 'use server' 标记：这些函数只允许在服务器上运行
 * - 页面里的 <form action={...}> 可以直接调用它们，表单提交即触发
 * - 它们运行在服务器上，天然持有用户的登录会话（Cookie），
 *   浏览器端代码永远看不到会话密钥，这是安全的关键
 */

/** 表单状态：页面用它显示错误或提示信息 */
export type AuthState = {
  error?: string
  message?: string
}

/** 注册：用邮箱 + 密码创建账号，成功后自动登录并跳转项目列表 */
export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  // 第一道校验（友好提示）；Supabase 服务端还会再校验一次
  if (!email || !email.includes('@')) return { error: '请输入正确的邮箱地址' }
  if (password.length < 6) return { error: '密码至少需要 6 位' }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  // 若 Supabase 项目开启了"邮箱确认"，注册后 session 为 null，需先去邮箱点确认
  if (!data.session) {
    return { message: '注册成功！请前往邮箱点击确认链接，然后再登录' }
  }

  // redirect 会抛出内部跳转信号，不要放进 try/catch 里
  redirect('/projects')
}

/** 登录：校验邮箱密码，成功后跳转项目列表 */
export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: '请输入邮箱和密码' }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  redirect('/projects')
}

/** 退出登录：清除服务器端会话，跳回登录页 */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
