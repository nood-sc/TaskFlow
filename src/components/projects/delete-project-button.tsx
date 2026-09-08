'use client'

import { deleteProject } from '@/app/actions/projects'

/**
 * 删除项目按钮（客户端组件）
 *
 * 为什么要单独做成一个小客户端组件？
 * - 详情页主体是服务端组件（读数据），但"删除前确认弹窗"需要浏览器能力
 * - 所以把最小的交互部分抽出来做成客户端组件，嵌进服务端页面里
 * - 模式叫"最小客户端岛"：能用服务端就用服务端，只有交互才用客户端
 */
export default function DeleteProjectButton({ projectId }: { projectId: string }) {
  return (
    <form
      action={deleteProject}
      onSubmit={(event) => {
        // confirm()：浏览器原生确认弹窗，点"取消"就阻止表单提交
        if (!window.confirm('确定要删除这个项目吗？项目下的所有任务也会一起删除。')) {
          event.preventDefault()
        }
      }}
    >
      {/* 隐藏字段：把项目 ID 带给服务器，用户看不到 */}
      <input type="hidden" name="id" value={projectId} />
      <button
        type="submit"
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
      >
        删除项目
      </button>
    </form>
  )
}
