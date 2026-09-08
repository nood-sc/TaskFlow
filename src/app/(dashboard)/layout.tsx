import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'

/**
 * (dashboard) 路由组的共享布局（路由：所有 /projects、/projects/xxx 页面都会套这个外壳）
 *
 * 讲解要点：
 * 1. 布局（layout）= 页面共用的"外壳"：顶部导航 + 内容区。写在 layout 里的内容，
 *    该目录下所有页面自动共享，不用每个页面重复写
 * 2. 这是 Server Component（没有 'use client'），可以直接查数据库/读会话
 * 3. 双重防护：proxy 守卫在前面拦了一道，这里再次检查"是否登录"，
 *    未登录直接重定向 —— 即使未来 proxy 配置改了，布局这道防线还在
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未登录 → 踢回登录页（第二道防线）
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="text-lg font-semibold text-zinc-900">TaskFlow</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600">{user.email}</span>
            {/* 复用认证模块的 logout Server Action：表单提交即退出 */}
            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
              >
                退出登录
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  )
}
