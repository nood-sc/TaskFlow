'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createProject } from '@/app/actions/projects'

const initialState = { error: '' }

/**
 * 新建项目页（路由：/projects/new）
 *
 * 和注册页一模一样的"配方"：
 * 1. 'use client' —— 需要交互状态（错误提示、按钮转圈）
 * 2. useActionState(createProject, initialState) —— 接上文件 1 写的 Server Action
 * 3. 表单里 input 的 name 要和 Action 里 formData.get('name') 对上
 */
export default function NewProjectPage() {
  const [state, formAction, pending] = useActionState(createProject, initialState)

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-semibold text-zinc-900">新建项目</h1>
      <p className="mt-1 text-sm text-zinc-600">一个项目可以包含多个任务</p>

      <form action={formAction} className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700">
            项目名称 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="例如：学习计划"
            className="mt-1 w-full rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
            项目描述
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="这个项目是做什么的？（选填）"
            className="mt-1 w-full resize-none rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {pending ? '创建中…' : '创建项目'}
          </button>
          <Link
            href="/projects"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
