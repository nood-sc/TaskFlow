'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

const initialState = { error: '', message: '' }

/**
 * 登录页面（路由：/login）
 *
 * 和注册页几乎一样，只有两处不同：
 * 1. 调用的是 login Action（校验密码、建立会话）
 * 2. 底部链接指向 /register（"没有账号？去注册"）
 */
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8">
        <h1 className="text-2xl font-semibold text-zinc-900">登录 TaskFlow</h1>
        <p className="mt-1 text-sm text-zinc-600">欢迎回来，继续管理你的任务</p>

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
              placeholder="输入你的密码"
              className="mt-1 w-full rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {pending ? '登录中…' : '登录'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          没有账号？
          <Link href="/register" className="ml-1 font-medium text-zinc-900 hover:underline">
            去注册
          </Link>
        </p>
      </div>
    </div>
  )
}
