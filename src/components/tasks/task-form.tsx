'use client'

import { useState, useActionState } from 'react'
import { createTask } from '@/app/actions/tasks'

/**
 * 新建任务表单（客户端组件）
 *
 * 新知识点：useState —— React 最基础的"状态"钩子
 * const [open, setOpen] = useState(false)
 *  - open：当前值（是否展开表单）
 *  - setOpen：改这个值的函数
 *  - useState(false)：初始值 = 收起
 * 点"新建任务"按钮 → setOpen(true) → 表单展开；点"取消"→ setOpen(false) 收起
 */
export default function TaskForm({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createTask, { error: '' })

  // 收起状态：只显示一个按钮
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        + 新建任务
      </button>
    )
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-zinc-200 bg-white p-4"
    >
      {/* 项目 ID：隐藏字段，告诉服务器任务属于哪个项目 */}
      <input type="hidden" name="projectId" value={projectId} />

      {state.error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <input
        name="title"
        type="text"
        required
        maxLength={200}
        placeholder="任务标题（必填）"
        className="w-full rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
      />
      <textarea
        name="description"
        rows={2}
        placeholder="任务描述（选填）"
        className="mt-2 w-full resize-none rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
      />
      <div className="mt-2">
        <label htmlFor="dueDate" className="text-xs text-zinc-500">
          截止时间
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          className="mt-1 rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-600"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? '创建中…' : '创建任务'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
        >
          取消
        </button>
      </div>
    </form>
  )
}
