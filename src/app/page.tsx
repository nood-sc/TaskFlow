import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * 首页（路由：/）
 *
 * 它不再展示任何内容，只做一件事：根据登录状态跳转
 * - 已登录 → /projects（你的项目列表）
 * - 未登录 → /login（登录页）
 *
 * 这是入口页的常见做法：把用户引导到"属于他的页面"。
 */
export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  redirect(user ? '/projects' : '/login')
}
