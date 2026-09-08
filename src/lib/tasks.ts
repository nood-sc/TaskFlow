/**
 * 任务状态常量（客户端 + 服务端共用）
 *
 * 为什么单独放一个文件、不放进 actions/tasks.ts？
 * 因为标记了 'use server' 的文件【只能导出 async 函数】，
 * 常量、类型放进去会直接报错。所以共享常量放在 lib 下，两端都能 import。
 */
export const TASK_STATUSES = ['todo', 'doing', 'done', 'cancelled'] as const

/** 任务状态类型：只能是这四种之一 */
export type TaskStatus = (typeof TASK_STATUSES)[number]

/** 状态的中文显示名（数据库存英文，界面显示中文） */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待办',
  doing: '进行中',
  done: '已完成',
  cancelled: '已取消',
}
