'use client'

import { useState, useActionState } from 'react'
import { createTask, updateTask } from '@/app/actions/tasks'

type TaskFormProps = {
  projectId: string
  /** 传入 task 就是"编辑模式"，不传就是"新建模式" */
  task?: {
    id: string
    title: string
    description: string | null
    due_date: string | null
  } | null
}

/**
 * 新建 / 编辑任务表单（一个组件两种模式）
 *
 * - 新建模式：task = null → 用 createTask，表单收起，点"+ 新建任务"展开
 * - 编辑模式：task 有值 → 用 updateTask，表单直接展开并预填旧数据
 *
 * 用同一个组件干两件事，避免复制两份几乎一样的表单
 */
export default function TaskForm({ projectId, task = null }: TaskFormProps) {
  const isEditing = task !== null

  // 编辑模式初始就是展开的（useState(isEditing)）
  const [open, setOpen] = useState(isEditing)
  const [state, formAction, pending] = useActionState(
    isEditing ? updateTask : createTask,
    { error: '' }
  )

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
    <form action={formAction} className="rounded-2xl border border-zinc-200 bg-white p-4">
      <input type="hidden" name="projectId" value={projectId} />
      {isEditing && <input type="hidden" name="id" value={task.id} />}

      {isEditing && (
        <div className="mb-3 text-sm font-semibold text-zinc-900">编辑任务</div>
      )}

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
        defaultValue={isEditing ? task.title : ''}
        placeholder="任务标题（必填）"
        className="w-full rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
      />
      <textarea
        name="description"
        rows={2}
        defaultValue={isEditing ? (task.description ?? '') : ''}
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
          // 数据库存的是完整时间戳，取前 10 位就是 YYYY-MM-DD，正好填进 date 输入框
          defaultValue={isEditing ? (task.due_date ? task.due_date.slice(0, 10) : '') : ''}
          className="mt-1 rounded-lg border border-zinc-400 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-600"
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending
            ? isEditing
              ? '保存中…'
              : '创建中…'
            : isEditing
              ? '保存修改'
              : '创建任务'}
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
