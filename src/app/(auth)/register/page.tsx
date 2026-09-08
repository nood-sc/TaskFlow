'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'

const initialState = { error: '', message: '' }

/**
 * 注册页面（路由：/register）
 *
 * 讲解要点：
 * 1. 'use client' —— 这个组件需要"交互状态"（显示错误、按钮转圈），所以是客户端组件
 * 2. useActionState(signUp, initialState) —— React 19 的表单状态钩子：
 *    - 把 Server Action（signUp）"包"一层交给 <form action>
 *    - Action 返回的 { error / message } 会自动回到第一个变量 state 里，页面直接渲染
 *    - pending：提交过程中为 true，用来让按钮显示"注册中…"并禁用防重复提交
 * 3. 表单里每个输入框的 name 属性（email / password），就是 Server Action 里
 *    formData.get('email') 取值的依据 —— 前后端靠 name 对上号
 */
export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signUp, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-zinc-900">注册 TaskFlow</h1>
        <p className="mt-1 text-sm text-zinc-600">创建你的个人任务管理账号</p>

        <form action={formAction} className="mt-6 space-y-4">
          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}
          {state.message && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-600">
              {state.message}
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              邮箱
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="至少 6 位"
              className="mt-1 w-full rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {pending ? '注册中…' : '注册'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          已有账号？
          <Link href="/login" className="ml-1 font-medium text-zinc-900 hover:underline">
            去登录
          </Link>
        </p>
      </div>
    </div>
  )
}
