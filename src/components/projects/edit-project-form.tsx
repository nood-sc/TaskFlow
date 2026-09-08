'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateProject } from '@/app/actions/projects'

type ProjectForEdit = {
  id: string
  name: string
  description: string | null
}

/**
 * 编辑项目表单（客户端组件）
 *
 * 讲解要点 —— 表单预填：
 * 用 defaultValue 而不是 value！
 * - value={...}：受控组件，React 接管输入框的值，必须配 onChange 和 state，很繁琐
 * - defaultValue={...}：非受控组件，只在"首次渲染"时用这个值填充输入框，
 *   之后用户随便改，React 不管 —— 正好满足"编辑页预填旧数据"的需求
 *
 * 数据流：服务端页面查出项目 → 通过 props 传进这个组件 → 渲染成表单
 */
export default function EditProjectForm({ project }: { project: ProjectForEdit }) {
  const [state, formAction, pending] = useActionState(updateProject, { error: '' })

  return (
    <form
      action={formAction}
      className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6"
    >
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {/* 隐藏字段：把项目 ID 带给 updateProject */}
      <input type="hidden" name="id" value={project.id} />

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
          defaultValue={project.name}
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
          defaultValue={project.description ?? ''}
          className="mt-1 w-full resize-none rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? '保存中…' : '保存修改'}
        </button>
        <Link
          href={`/projects/${project.id}`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          取消
        </Link>
      </div>
    </form>
  )
}
