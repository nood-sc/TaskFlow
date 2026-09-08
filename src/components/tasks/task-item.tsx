'use client'

import Link from 'next/link'
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from '@/lib/tasks'
import { updateTaskStatus, deleteTask } from '@/app/actions/tasks'

/** 每种状态对应的徽章配色 */
const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-zinc-100 text-zinc-600',
  doing: 'bg-blue-50 text-blue-600',
  done: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
}

type TaskItemProps = {
  task: {
    id: string
    title: string
    description: string | null
    status: TaskStatus
    due_date: string | null
  }
  projectId: string
}

/**
 * 单条任务：徽章 + 标题 + 描述 + 截止时间 + 状态切换 + 删除
 *
 * 状态切换的小技巧：
 * <select> 的 onChange 触发 requestSubmit() —— 用户一选完，
 * 表单立刻自动提交给 updateTaskStatus 服务器动作，改完状态自动跳回本页。
 * 不用"保存按钮"，交互更顺手。
 */
export default function TaskItem({ task, projectId }: TaskItemProps) {
  return (
    <li className="rounded-2xl border border-zinc-200 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}
            >
              {TASK_STATUS_LABELS[task.status]}
            </span>
            <span className="font-medium text-zinc-900">{task.title}</span>
          </div>

          {task.description && (
            <p className="mt-1 text-sm text-zinc-600">{task.description}</p>
          )}

          {task.due_date && (
            <p className="mt-1 text-xs text-zinc-400">
              截止：{new Date(task.due_date).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {/* 编辑：跳到 ?edit=任务ID，详情页会展开编辑表单 */}
          <Link
            href={`/projects/${projectId}?edit=${task.id}`}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            编辑
          </Link>

          {/* 状态切换：下拉框，选择即提交 */}
          <form action={updateTaskStatus}>
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="projectId" value={projectId} />
            <select
              name="status"
              defaultValue={task.status}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-700 outline-none"
            >
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {TASK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </form>

          {/* 删除任务（带确认弹窗） */}
          <form
            action={deleteTask}
            onSubmit={(event) => {
              if (!window.confirm('确定要删除这个任务吗？')) {
                event.preventDefault()
              }
            }}
          >
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="projectId" value={projectId} />
            <button
              type="submit"
              className="text-sm text-red-500 hover:text-red-600"
            >
              删除
            </button>
          </form>
        </div>
      </div>
    </li>
  )
}
